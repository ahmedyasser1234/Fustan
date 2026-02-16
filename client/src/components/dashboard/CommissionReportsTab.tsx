import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

import { useLanguage } from "@/lib/i18n";

export default function CommissionReportsTab() {
    const { t, language } = useLanguage();
    // @ts-ignore
    const { data: reports, isLoading } = useQuery({
        queryKey: ['admin', 'reports', 'commissions'],
        queryFn: endpoints.admin.reports.getCommissions,
    });

    const totalPlatformEarnings = reports?.reduce((sum: number, item: any) => sum + Number(item.totalCommission), 0) || 0;

    if (isLoading) return <div className="p-8 text-center text-gray-500">{t('loadingReports')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    {t('commissionReports')}
                </h2>
                <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                    <span className="text-sm font-bold text-emerald-700">{t('totalPlatformProfits')}:</span>
                    <span className="text-xl font-black text-emerald-600">{totalPlatformEarnings.toFixed(2)} {t('currency')}</span>
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto text-start" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-slate-50/50">
                                    <th className="py-4 px-6 font-black text-slate-900 text-start">{t('store')}</th>
                                    <th className="py-4 px-6 font-black text-slate-900 text-start">{t('totalOrders')}</th>
                                    <th className="py-4 px-6 font-black text-slate-900 text-start">{t('totalSales')}</th>
                                    <th className="py-4 px-6 font-black text-slate-900 text-emerald-600 text-start">{t('platformCommission')}</th>
                                    <th className="py-4 px-6 font-black text-slate-900 text-blue-600 text-start">{t('vendorNetProfit')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">{t('noDataAvailable')}</td>
                                    </tr>
                                ) : (
                                    reports?.map((item: any) => (
                                        <tr key={item.vendorId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-900">{language === 'ar' ? (item.storeNameAr || item.storeNameEn) : (item.storeNameEn || item.storeNameAr)}</div>
                                                <div className="text-xs text-slate-400">@{item.storeSlug}</div>
                                            </td>
                                            <td className="py-4 px-6 font-medium text-slate-700">{item.totalOrders}</td>
                                            <td className="py-4 px-6 font-medium text-slate-700">{Number(item.totalSales).toFixed(2)} {t('currency')}</td>
                                            <td className="py-4 px-6 font-black text-emerald-600">
                                                {Number(item.totalCommission).toFixed(2)} {t('currency')}
                                            </td>
                                            <td className="py-4 px-6 font-black text-blue-600">
                                                {Number(item.netEarnings).toFixed(2)} {t('currency')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
