import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Store, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

import { useLanguage } from "@/lib/i18n";

export default function VendorRequestsTab() {
    const { t, language } = useLanguage();
    const queryClient = useQueryClient();

    // @ts-ignore
    const { data: pendingVendors, isLoading } = useQuery({
        queryKey: ['admin', 'vendors', 'pending'],
        queryFn: endpoints.admin.vendors.listPending,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number, status: string }) =>
            endpoints.admin.vendors.updateStatus(id, status),
        onSuccess: () => {
            toast.success(t('storeStatusUpdated'));
            queryClient.invalidateQueries({ queryKey: ['admin', 'vendors', 'pending'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
        },
        onError: () => toast.error(t('errorUpdatingStatus')),
    });

    if (isLoading) return <div className="p-8 text-center">{t('loadingRequests')}</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-orange-600" />
                </div>
                {t('newJoinRequests')}
            </h2>

            <div className="grid gap-4">
                {pendingVendors?.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                        <Store className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">{t('noPendingRequests')}</p>
                    </div>
                ) : (
                    pendingVendors?.map((item: any) => (
                        <Card key={item.vendor.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xl">
                                            {(item.vendor.storeNameAr || 'S').substring(0, 1)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 mb-1">{language === 'ar' ? (item.vendor.storeNameAr || item.vendor.storeNameEn) : (item.vendor.storeNameEn || item.vendor.storeNameAr)}</h3>
                                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-4 h-4" />
                                                    {item.vendor.email}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-4 h-4" />
                                                    {item.vendor.phone || item.user.phone || t('notAvailable')}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {format(new Date(item.vendor.createdAt), "dd MMMM yyyy", { locale: language === 'ar' ? ar : undefined })}
                                                </div>
                                            </div>
                                            <div className="mt-2 text-sm text-slate-600">
                                                <span className="font-bold">{t('applicant')}:</span> {item.user.name}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 self-end md:self-center">
                                        <Button
                                            variant="outline"
                                            className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700 font-bold gap-2"
                                            onClick={() => updateStatusMutation.mutate({ id: item.vendor.id, status: 'rejected' })}
                                            disabled={updateStatusMutation.isPending}
                                        >
                                            <X className="w-4 h-4" />
                                            {t('rejectStore')}
                                        </Button>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2 shadow-lg shadow-green-200"
                                            onClick={() => updateStatusMutation.mutate({ id: item.vendor.id, status: 'approved' })}
                                            disabled={updateStatusMutation.isPending}
                                        >
                                            <Check className="w-4 h-4" />
                                            {t('approveStore')}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
