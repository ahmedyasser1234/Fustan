import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2, Package, ShoppingCart, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { endpoints } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import OrderDetailsView from "./OrderDetailsView";

interface OrdersTabProps {
    vendorId: number;
    onCustomerClick: (customer: any) => void;
}

export default function OrdersTab({ vendorId, onCustomerClick }: OrdersTabProps) {
    const queryClient = useQueryClient();
    const { t, language } = useLanguage();
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['vendor', 'orders', vendorId],
        queryFn: async () => await endpoints.vendors.orders({ page: 1 }),
        enabled: !!vendorId,
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
            return (await api.patch(`/orders/${orderId}/status`, { status })).data;
        },
        onSuccess: () => {
            toast.success(language === 'ar' ? "تم تحديث حالة الطلب" : "Order status updated");
            queryClient.invalidateQueries({ queryKey: ['vendor', 'orders'] });
        },
        onError: () => {
            toast.error(language === 'ar' ? "فشل تحديث الحالة" : "Failed to update status");
        }
    });

    const orders = ordersData?.data || [];

    const STATUS_LABELS: Record<string, { label: string, color: string }> = {
        pending: { label: language === 'ar' ? "قيد الانتظار" : "Pending", color: "bg-amber-100 text-amber-700 shadow-sm shadow-amber-100/50" },
        confirmed: { label: language === 'ar' ? "تم التأكيد" : "Confirmed", color: "bg-blue-100 text-blue-700 shadow-sm shadow-blue-100/50" },
        shipped: { label: language === 'ar' ? "تم الشحن" : "Shipped", color: "bg-purple-100 text-purple-700 shadow-sm shadow-purple-100/50" },
        delivered: { label: language === 'ar' ? "تم التسليم" : "Delivered", color: "bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100/50" },
        cancelled: { label: language === 'ar' ? "ملغى" : "Cancelled", color: "bg-red-100 text-red-700 shadow-sm shadow-red-100/50" },
    };

    if (isLoading) return (
        <div className="space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
            </div>
            <div className="space-y-8">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden border-0 shadow-xl shadow-slate-100/50 rounded-[40px] bg-white">
                        <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                            <Skeleton className="h-12 w-48 rounded-2xl" />
                        </div>
                        <CardContent className="p-8">
                            <div className="space-y-4">
                                <Skeleton className="h-20 w-full rounded-2xl" />
                                <Skeleton className="h-20 w-full rounded-2xl" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between">
                <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{language === 'ar' ? "إدارة الطلبات" : "Order Management"}</h2>
                    <p className="text-slate-400 font-bold">{language === 'ar' ? "تابع وحمل وأدر طلبات عملائك بكل سهولة" : "Track and manage your customer orders easily"}</p>
                </div>
            </div>

            {orders.length === 0 ? (
                <Card className="border-0 shadow-xl shadow-slate-100/50 rounded-[40px] p-16 text-center bg-white">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="w-12 h-12 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">{language === 'ar' ? "لا توجد طلبات حتى الآن" : "No orders yet"}</h3>
                    <p className="text-slate-400 font-bold max-w-xs mx-auto">
                        {language === 'ar' ? "بمجرد أن يبدأ العملاء في طلب منتجاتك، ستظهر هنا" : "Once customers start ordering your products, they will appear here"}
                    </p>
                </Card>
            ) : (
                <div className="space-y-8">
                    {orders.map((order: any) => (
                        <Card key={order.id} className="overflow-hidden border-0 shadow-xl shadow-slate-100/50 rounded-[40px] bg-white group hover:scale-[1.01] transition-transform duration-300">
                            <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100">
                                {/* Top Row: Order Number + Date */}
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "رقم الطلب" : "Order Number"}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-xl text-slate-900">#{order.orderNumber}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                                    onClick={() => setSelectedOrderId(order.id)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="h-10 w-px bg-slate-200" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "التاريخ" : "Date"}</span>
                                            <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Row: Customer + Status */}
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <button
                                        className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-300 group/customer"
                                        onClick={() => onCustomerClick({ ...order.customer, shippingAddress: order.shippingAddress })}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center group-hover/customer:scale-110 transition-transform">
                                            <span className="text-xs font-black text-purple-600">{(order.customer?.name?.[0] || 'G').toUpperCase()}</span>
                                        </div>
                                        <div className={`flex flex-col ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            <span className="text-[10px] font-black text-slate-400">{language === 'ar' ? "العميل" : "Customer"}</span>
                                            <span className="text-sm font-black text-slate-900 leading-tight">
                                                {order.customer?.name || order.shippingAddress?.name || (language === 'ar' ? "ضيف" : "Guest")}
                                            </span>
                                        </div>
                                    </button>

                                    <div className="relative">
                                        <select
                                            className={cn(
                                                "text-xs font-black px-6 py-3 rounded-2xl border-none outline-none cursor-pointer appearance-none transition-all duration-300 ring-4 ring-transparent hover:ring-slate-100",
                                                STATUS_LABELS[order.status]?.color || "bg-slate-100 text-slate-700"
                                            )}
                                            value={order.status}
                                            onChange={(e) => updateStatusMutation.mutate({ orderId: order.id, status: e.target.value })}
                                            disabled={updateStatusMutation.isPending}
                                        >
                                            {Object.entries(STATUS_LABELS).map(([key, config]) => (
                                                <option key={key} value={key} className="bg-white text-slate-900 font-bold">
                                                    {config.label} {updateStatusMutation.isPending && key === order.status ? "..." : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                        <thead className="hidden md:table-header-group bg-white border-b border-slate-50">
                                            <tr>
                                                <th className={`py-5 px-8 font-black text-slate-400 text-[10px] uppercase tracking-wider w-[45%] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                    {language === 'ar' ? "المنتج" : "Product"}
                                                </th>
                                                <th className="text-center py-5 px-4 font-black text-slate-400 text-[10px] uppercase tracking-wider w-[15%]">
                                                    {language === 'ar' ? "المقاس" : "Size"}
                                                </th>
                                                <th className="text-center py-5 px-4 font-black text-slate-400 text-[10px] uppercase tracking-wider w-[15%]">
                                                    {language === 'ar' ? "الكمية" : "Qty"}
                                                </th>
                                                <th className={`py-5 px-8 font-black text-slate-400 text-[10px] uppercase tracking-wider w-[25%] ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                                                    {language === 'ar' ? "السعر" : "Price"}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 block md:table-row-group">
                                            {order.items?.map((item: any, idx: number) => (
                                                <tr key={idx} className="block md:table-row hover:bg-slate-50/30 transition-colors p-4 md:p-0 border-b md:border-none last:border-0 relative">
                                                    <td className="block md:table-cell py-2 md:py-6 px-0 md:px-8">
                                                        {/* Mobile Label */}
                                                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{language === 'ar' ? "المنتج" : "Product"}</span>
                                                        <div className={`flex items-center gap-4 md:gap-6 ${language === 'ar' ? 'flex-row' : 'flex-row'}`}>
                                                            <div className="w-16 h-20 rounded-2xl bg-slate-50 flex-shrink-0 overflow-hidden shadow-sm border border-slate-100">
                                                                {item.product?.images?.[0] ? (
                                                                    <img src={item.product.images[0]} className="w-full h-full object-cover" alt="product" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Package className="w-6 h-6 text-slate-200" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                <p className="font-black text-slate-900 text-base md:text-lg leading-tight mb-1">
                                                                    {language === 'ar' ? item.product?.nameAr : item.product?.nameEn}
                                                                </p>
                                                                <p className="text-xs font-bold text-slate-400">
                                                                    {Number(item.price).toFixed(2)} {t('currency')} {language === 'ar' ? 'للقطعة' : 'per item'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="block md:table-cell py-2 md:py-6 px-0 md:px-4 text-start md:text-center flex justify-between md:table-cell items-center border-b border-dashed border-slate-100 md:border-none">
                                                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "المقاس" : "Size"}</span>
                                                        {item.size ? (
                                                            <span className="inline-flex bg-slate-100 text-slate-600 px-3 py-1 rounded-xl text-xs font-black ring-4 ring-slate-50">
                                                                {item.size}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 font-bold">-</span>
                                                        )}
                                                    </td>
                                                    <td className="block md:table-cell py-2 md:py-6 px-0 md:px-4 text-start md:text-center flex justify-between md:table-cell items-center border-b border-dashed border-slate-100 md:border-none">
                                                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "الكمية" : "Qty"}</span>
                                                        <span className="font-black text-slate-900">{item.quantity}</span>
                                                    </td>
                                                    <td className={`block md:table-cell py-2 md:py-6 px-0 md:px-8 ${language === 'ar' ? 'text-left' : 'text-right'} flex justify-between md:table-cell items-center`}>
                                                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "السعر" : "Price"}</span>
                                                        <span className="font-black text-lg text-[#e91e63]">
                                                            {(item.price * item.quantity).toFixed(2)} {t('currency')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50/50 block md:table-footer-group">
                                            <tr className="block md:table-row">
                                                <td colSpan={2} className={`block md:table-cell py-4 md:py-8 px-4 md:px-8 ${language === 'ar' ? 'text-right' : 'text-left'} border-b md:border-none border-slate-100`}>
                                                    <div className="flex justify-between md:block items-center">
                                                        <span className="font-black text-slate-400 text-sm">{language === 'ar' ? "إجمالي الطلب" : "Order Total"}</span>
                                                        <p className="md:hidden font-black text-xl text-slate-900">
                                                            {Number(order.total).toFixed(2)} <span className="text-sm">{t('currency')}</span>
                                                        </p>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1 italic hidden md:block">{language === 'ar' ? "* شامل ضريبة القيمة المضافة والشحن" : "* Incl. VAT & Shipping"}</p>
                                                </td>
                                                <td colSpan={2} className={`hidden md:table-cell py-8 px-8 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                                                    <span className="font-black text-3xl text-slate-900">
                                                        {Number(order.total).toFixed(2)} <span className="text-sm">{t('currency')}</span>
                                                    </span>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {selectedOrderId && (
                <OrderDetailsView orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
            )}
        </div>
    );
}
