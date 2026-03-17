import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Store, Mail, Phone, Calendar, Layers, Share2, Instagram, Globe, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function VendorRequestsTab() {
    const { t, language } = useLanguage();
    const queryClient = useQueryClient();
    const [activeSection, setActiveSection] = useState<'stores' | 'content'>('stores');

    const { data: pendingVendors, isLoading: vendorsLoading } = useQuery({
        queryKey: ['admin', 'vendors', 'pending'],
        queryFn: endpoints.admin.vendors.listPending,
    });

    const { data: allRequests, isLoading: requestsLoading } = useQuery({
        queryKey: ['admin', 'vendor-requests'],
        queryFn: endpoints.vendorRequests.listAll,
    });

    const pendingRequests = allRequests?.filter((r: any) => r.status === 'pending') || [];

    const updateVendorStatus = useMutation({
        mutationFn: ({ id, status }: { id: number, status: string }) =>
            endpoints.admin.vendors.updateStatus(id, status),
        onSuccess: () => {
            toast.success(t('storeStatusUpdated'));
            queryClient.invalidateQueries({ queryKey: ['admin', 'vendors', 'pending'] });
        },
        onError: () => toast.error(t('errorUpdatingStatus')),
    });

    const updateRequestStatus = useMutation({
        mutationFn: ({ id, status }: { id: number, status: string }) =>
            endpoints.vendorRequests.updateStatus(id, { status }),
        onSuccess: () => {
            toast.success(language === 'ar' ? "تم تحديث حالة الطلب" : "Request status updated");
            queryClient.invalidateQueries({ queryKey: ['admin', 'vendor-requests'] });
        },
        onError: () => toast.error(t('errorUpdatingStatus')),
    });

    if (vendorsLoading || requestsLoading) {
        return <div className="p-8 text-center">{t('loadingRequests')}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{language === 'ar' ? "إدارة طلبات المتاجر" : "Vendor Request Center"}</h2>
                    <p className="text-slate-400 font-bold">{language === 'ar' ? "راجع طلبات الانضمام، الأقسام، وبوستات السوشيال ميديا" : "Review join requests, categories, and social media posts"}</p>
                </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit mb-8">
                <button 
                    onClick={() => setActiveSection('stores')}
                    className={`px-8 py-3 rounded-xl font-black text-sm transition-all duration-300 ${activeSection === 'stores' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {language === 'ar' ? "طلبات الانضمام" : "Join Requests"} ({pendingVendors?.length || 0})
                </button>
                <button 
                    onClick={() => setActiveSection('content')}
                    className={`px-8 py-3 rounded-xl font-black text-sm transition-all duration-300 ${activeSection === 'content' ? 'bg-white text-purple-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {language === 'ar' ? "طلبات المحتوى" : "Content Requests"} ({pendingRequests?.length || 0})
                </button>
            </div>

            <div className="grid gap-4">
                {activeSection === 'stores' ? (
                    pendingVendors?.length === 0 ? (
                        <EmptyState icon={Store} text={t('noPendingRequests')} />
                    ) : (
                        pendingVendors?.map((vendor: any) => (
                            <VendorCard 
                                key={vendor.id} 
                                vendor={vendor} 
                                onApprove={() => updateVendorStatus.mutate({ id: vendor.id, status: 'approved' })}
                                onReject={() => updateVendorStatus.mutate({ id: vendor.id, status: 'rejected' })}
                                isPending={updateVendorStatus.isPending}
                            />
                        ))
                    )
                ) : (
                    pendingRequests?.length === 0 ? (
                        <EmptyState icon={MessageSquare} text={language === 'ar' ? "لا توجد طلبات محتوى معلقة" : "No pending content requests"} />
                    ) : (
                        pendingRequests?.map((request: any) => (
                            <RequestCard 
                                key={request.id} 
                                request={request}
                                onApprove={() => updateRequestStatus.mutate({ id: request.id, status: 'approved' })}
                                onReject={() => updateRequestStatus.mutate({ id: request.id, status: 'rejected' })}
                                isPending={updateRequestStatus.isPending}
                            />
                        ))
                    )
                )}
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, text }: { icon: any, text: string }) {
    return (
        <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100 italic font-bold text-slate-300">
            <Icon className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p>{text}</p>
        </div>
    );
}

function VendorCard({ vendor, onApprove, onReject, isPending }: any) {
    const { language, t } = useLanguage();
    return (
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-[32px] overflow-hidden group">
            <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className="w-20 h-20 rounded-[24px] bg-amber-50 flex items-center justify-center text-amber-500 font-black text-3xl group-hover:scale-110 transition-transform">
                            {(vendor.storeNameAr || 'S').substring(0, 1)}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">
                                {language === 'ar' ? (vendor.storeNameAr || vendor.storeNameEn) : (vendor.storeNameEn || vendor.storeNameAr)}
                            </h3>
                            <div className="flex flex-wrap gap-5 text-sm text-slate-400 font-bold">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {vendor.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {vendor.phone || t('notAvailable')}
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(vendor.createdAt), "dd MMM yyyy", { locale: language === 'ar' ? ar : undefined })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                        <Button
                            variant="outline"
                            className="h-12 px-6 rounded-xl border-red-50 text-red-500 hover:bg-red-50 font-black"
                            onClick={onReject}
                            disabled={isPending}
                        >
                            <X className="w-4 h-4 mr-2" />
                            {t('rejectStore')}
                        </Button>
                        <Button
                            className="h-12 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black shadow-lg shadow-green-100"
                            onClick={onApprove}
                            disabled={isPending}
                        >
                            <Check className="w-4 h-4 mr-2" />
                            {t('approveStore')}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function RequestCard({ request, onApprove, onReject, isPending }: any) {
    const { language } = useLanguage();
    const isSocial = request.type === 'social_post_request';
    const isCollection = request.type === 'collection_request';
    
    return (
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-[32px] overflow-hidden group">
            <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Visual Preview */}
                    <div className="w-full md:w-64 h-40 rounded-3xl bg-slate-50 overflow-hidden relative border-4 border-white shadow-sm">
                        {isSocial ? (
                            request.data.mediaUrls?.[0] ? (
                                <img src={request.data.mediaUrls[0]} alt="Post" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center"><Instagram className="w-10 h-10 text-slate-200" /></div>
                            )
                        ) : isCollection ? (
                            request.data.imageUrl ? (
                                <img src={request.data.imageUrl} alt="Collection" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-50"><Layers className="w-10 h-10 text-indigo-200" /></div>
                            )
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-purple-50"><Layers className="w-10 h-10 text-purple-200" /></div>
                        )}
                        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                {isSocial ? "SOCIAL POST" : isCollection ? "COLLECTION" : "CATEGORY"}
                            </span>
                        </div>
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black uppercase mb-1">
                                    <Store className="w-3 h-3" />
                                    <span>Vendor ID: {request.vendorId}</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-800">
                                    {isSocial 
                                        ? (language === 'ar' ? "منشور ترويجي جديد" : "New Promotional Post") 
                                        : isCollection 
                                            ? (language === 'ar' ? `طلب مجموعة: ${request.data.nameAr}` : `Collection: ${request.data.nameEn}`)
                                            : (request.data.nameAr || request.data.nameEn)}
                                </h3>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    className="h-10 px-4 rounded-xl border-red-50 text-red-500 hover:bg-red-50 font-black text-xs"
                                    onClick={onReject}
                                    disabled={isPending}
                                >
                                    {language === 'ar' ? "رفض" : "Reject"}
                                </Button>
                                <Button
                                    className={cn(
                                        "h-10 px-6 rounded-xl text-white font-black shadow-lg text-xs",
                                        isCollection ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100" : "bg-purple-600 hover:bg-purple-700 shadow-purple-100"
                                    )}
                                    onClick={onApprove}
                                    disabled={isPending}
                                >
                                    {language === 'ar' ? "موافقة" : "Approve"}
                                </Button>
                            </div>
                        </div>

                        <p className="text-slate-500 font-bold text-sm bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                            {isSocial 
                                ? request.data.caption 
                                : isCollection 
                                    ? (language === 'ar' ? request.data.descriptionAr : request.data.descriptionEn)
                                    : (request.data.descriptionAr || request.data.descriptionEn)}
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs font-black text-slate-400">
                            {isSocial && request.data.platforms?.map((p: string) => (
                                <div key={p} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg">
                                    {p === 'instagram' && <Instagram className="w-3.5 h-3.5 text-pink-500" />}
                                    <span className="uppercase">{p}</span>
                                </div>
                            ))}
                            {request.scheduledAt && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{language === 'ar' ? "مجدول بتاريخ: " : "SCHEDULED: "}{format(new Date(request.scheduledAt), "dd/MM/yyyy HH:mm")}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
