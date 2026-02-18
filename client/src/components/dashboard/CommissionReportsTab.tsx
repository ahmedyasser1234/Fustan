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

    if (isLoading) return <div className="p-8 text-center text-gray-500 animate-pulse">{t('loadingReports')}</div>;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                        <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                    </div>
                    {t('commissionReports')}
                </h2>
                <div className="bg-emerald-50 px-4 py-3 md:py-2 rounded-xl border border-emerald-100 flex items-center justify-between md:justify-start gap-3 w-full md:w-auto shadow-sm">
                    <span className="text-sm font-bold text-emerald-700">{t('totalPlatformProfits')}:</span>
                    <span className="text-lg md:text-xl font-black text-emerald-600">{totalPlatformEarnings.toFixed(2)} {t('currency')}</span>
                </div>
            </div>

            {/* Content Section */}
            <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {/* Desktop/Tablet Table View */}
                <Card className="hidden md:block border-0 shadow-sm overflow-hidden rounded-2xl">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-slate-50/80 backdrop-blur-sm">
                                        <th className="py-4 px-6 font-black text-slate-900 text-start whitespace-nowrap">{t('store')}</th>
                                        <th className="py-4 px-6 font-black text-slate-900 text-start whitespace-nowrap">{t('totalOrders')}</th>
                                        <th className="py-4 px-6 font-black text-slate-900 text-start whitespace-nowrap">{t('totalSales')}</th>
                                        <th className="py-4 px-6 font-black text-slate-900 text-emerald-600 text-start whitespace-nowrap">{t('platformCommission')}</th>
                                        <th className="py-4 px-6 font-black text-slate-900 text-blue-600 text-start whitespace-nowrap">{t('vendorNetProfit')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports?.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">{t('noDataAvailable')}</td>
                                        </tr>
                                    ) : (
                                        reports?.map((item: any) => (
                                            <tr key={item.vendorId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                                                        {language === 'ar' ? (item.storeNameAr || item.storeNameEn) : (item.storeNameEn || item.storeNameAr)}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-medium">@{item.storeSlug}</div>
                                                </td>
                                                <td className="py-4 px-6 font-bold text-slate-700">{item.totalOrders}</td>
                                                <td className="py-4 px-6 font-bold text-slate-700">{Number(item.totalSales).toFixed(2)} {t('currency')}</td>
                                                <td className="py-4 px-6 font-black text-emerald-600 bg-emerald-50/30">
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

                {/* Mobile Card View */}
                <div className="md:hidden grid grid-cols-1 gap-3">
                    {reports?.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            {t('noDataAvailable')}
                        </div>
                    ) : (
                        reports?.map((item: any) => (
                            <div key={item.vendorId} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                                {/* Card Header */}
                                <div className="flex items-start justify-between border-b border-gray-50 pb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-base mb-0.5">
                                            {language === 'ar' ? (item.storeNameAr || item.storeNameEn) : (item.storeNameEn || item.storeNameAr)}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium">@{item.storeSlug}</p>
                                    </div>
                                    <div className="bg-gray-100 px-2 py-1 rounded-lg text-xs font-bold text-gray-600">
                                        {item.totalOrders} {t('orders')}
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-center">
                                        <span className="block text-xs text-gray-400 font-semibold mb-1">{t('totalSales')}</span>
                                        <span className="block font-bold text-gray-700">{Number(item.totalSales).toFixed(2)}</span>
                                    </div>
                                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-center">
                                        <span className="block text-xs text-emerald-600/80 font-bold mb-1">{t('platformCommission')}</span>
                                        <span className="block font-black text-emerald-600 text-lg">{Number(item.totalCommission).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-1">
                                    <span className="text-xs text-gray-400 font-medium">{t('vendorNetProfit')}:</span>
                                    <span className="font-black text-blue-600 text-base">{Number(item.netEarnings).toFixed(2)} {t('currency')}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
