import { useLanguage } from "@/lib/i18n";
import { endpoints } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    CreditCard,
    History
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletTab() {
    const { t, language, formatPrice } = useLanguage();

    const { data, isLoading } = useQuery({
        queryKey: ['vendor', 'wallet'],
        queryFn: () => endpoints.wallets.getMyWallet(),
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-40 rounded-3xl" />
                    <Skeleton className="h-40 rounded-3xl" />
                </div>
                <Skeleton className="h-80 rounded-3xl" />
            </div>
        );
    }

    const { wallet, transactions } = data || { wallet: null, transactions: [] };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                        {language === 'ar' ? 'المحفظة المالية' : 'Financial Wallet'}
                    </h2>
                    <p className="text-slate-500 font-bold">
                        {language === 'ar' ? 'تتبع أرباحك وعمليات السحب الخاصة بك' : 'Track your earnings and withdrawals'}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-black text-emerald-700 capitalize">
                        {language === 'ar' ? 'محدثة الآن' : 'Updated now'}
                    </span>
                </div>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-[32px] border-emerald-100 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-200/50 overflow-hidden relative group">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
                    <CardContent className="p-8 relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Wallet className="w-7 h-7" />
                            </div>
                            <TrendingUp className="w-6 h-6 text-emerald-200 opacity-50" />
                        </div>
                        <p className="text-emerald-100 font-bold text-sm mb-1 uppercase tracking-widest">
                            {language === 'ar' ? 'الرصيد المتاح للسحب' : 'Available Balance'}
                        </p>
                        <h3 className="text-4xl font-black mb-4 tabular-nums">
                            {formatPrice(wallet?.availableBalance || 0)}
                        </h3>
                        <div className="flex gap-3">
                            <button className="flex-1 h-12 bg-white text-emerald-700 font-black rounded-xl hover:bg-emerald-50 transition-colors shadow-lg">
                                {language === 'ar' ? 'طلب سحب' : 'Request Payout'}
                            </button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[32px] border-slate-200 bg-white shadow-xl shadow-slate-100 overflow-hidden relative group">
                    <CardContent className="p-8 relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <Clock className="w-7 h-7 text-blue-600" />
                            </div>
                            <ArrowUpRight className="w-6 h-6 text-blue-300 opacity-50" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm mb-1 uppercase tracking-widest">
                            {language === 'ar' ? 'أرباح معلقة (تحت المراجعة)' : 'Pending Balance'}
                        </p>
                        <h3 className="text-4xl font-black text-slate-900 tabular-nums">
                            {formatPrice(wallet?.pendingBalance || 0)}
                        </h3>
                        <p className="text-xs text-slate-400 font-bold mt-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {language === 'ar' ? 'تصبح الأرباح متاحة بعد تأكيد العميل للاستلام' : 'Earnings become available after customer confirms delivery'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions History */}
            <Card className="rounded-[40px] border-slate-100 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                        {language === 'ar' ? 'سجل العمليات' : 'Transaction History'}
                    </h3>
                    <History className="w-6 h-6 text-slate-300" />
                </div>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? 'العملية' : 'Transaction'}</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold italic">
                                            {language === 'ar' ? 'لا توجد عمليات مسجلة حتى الآن' : 'No transactions recorded yet'}
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx: any) => (
                                        <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                                        }`}>
                                                        {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-sm leading-tight">{tx.description}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: #{tx.relatedId || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`text-lg font-black tabular-nums ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
                                                    }`}>
                                                    {tx.type === 'credit' ? '+' : '-'}{formatPrice(Math.abs(tx.amount))}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black tracking-wide uppercase ${tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        tx.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {tx.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                                                    {tx.status === 'pending' && <Clock className="w-3 h-3" />}
                                                    {tx.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                                                    {language === 'ar' ? (
                                                        tx.status === 'completed' ? 'مكتملة' :
                                                            tx.status === 'pending' ? 'معلقة' : 'فشلت'
                                                    ) : tx.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-slate-500 text-sm">
                                                    {new Date(tx.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                                </p>
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
