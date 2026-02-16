
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    User,
    Phone,
    MapPin,
    Search,
    Loader2,
    Calendar,
    ShoppingBag,
    ArrowRight,
    Mail
} from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomersTabProps {
    vendorId: number;
}

export default function CustomersTab({ vendorId }: CustomersTabProps) {
    const { t, language } = useLanguage();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const { data: customers, isLoading } = useQuery({
        queryKey: ['vendor', 'customers', vendorId],
        queryFn: async () => await endpoints.vendors.customers(),
        enabled: !!vendorId,
    });

    const filteredCustomers = customers?.filter((c: any) =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCustomerId) {
        return (
            <CustomerProfileView
                customerId={selectedCustomerId}
                onBack={() => setSelectedCustomerId(null)}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    {language === 'ar' ? "العملاء" : "Customers"}
                </h2>
                <div className="relative w-72">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        className="pr-10"
                        placeholder={language === 'ar' ? "بحث باسم العميل أو الهاتف..." : "Search by name or phone..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="text-right w-[300px]">
                                    {language === 'ar' ? "العميل" : "Customer"}
                                </TableHead>
                                <TableHead className="text-right">
                                    {language === 'ar' ? "رقم الهاتف" : "Phone"}
                                </TableHead>
                                <TableHead className="text-center">
                                    {language === 'ar' ? "عدد الطلبات" : "Orders"}
                                </TableHead>
                                <TableHead className="text-center">
                                    {language === 'ar' ? "إجمالي المشتريات" : "Total Spent"}
                                </TableHead>
                                <TableHead className="text-right py-4 px-6">
                                    {language === 'ar' ? "آخر طلب" : "Last Order"}
                                </TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredCustomers?.length > 0 ? (
                                filteredCustomers.map((customer: any) => (
                                    <TableRow
                                        key={customer.id}
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => setSelectedCustomerId(customer.id)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                                    {customer.name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{customer.name || (language === 'ar' ? "بدون اسم" : "Unnamed")}</p>
                                                    <p className="text-xs text-gray-500">{customer.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm" dir="ltr">
                                            {customer.phone || "-"}
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {customer.totalOrders}
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-green-600">
                                            {Number(customer.totalSpent).toFixed(2)} {t('currency')}
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {new Date(customer.lastOrderDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon">
                                                {language === 'ar' ? <ArrowRight className="w-4 h-4 rotate-180" /> : <ArrowRight className="w-4 h-4" />}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                        {language === 'ar' ? "لا يوجد عملاء حتى الآن" : "No customers found"}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function CustomerProfileView({ customerId, onBack }: { customerId: number; onBack: () => void }) {
    const { t, language } = useLanguage();
    const { data: details, isLoading } = useQuery({
        queryKey: ['vendor', 'customer-details', customerId],
        queryFn: async () => await endpoints.vendors.customerDetails(customerId),
    });

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!details) return null;

    const { customer, stats, orders } = details;

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowRight className="w-5 h-5" />
                </Button>
                <h2 className="text-2xl font-bold text-gray-900">
                    {language === 'ar' ? "ملف العميل" : "Customer Profile"}
                </h2>
            </div>

            {/* Customer Info Card */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-2xl">
                                {customer.name?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{customer.name}</h3>
                                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                                        <Mail className="w-4 h-4" />
                                        {customer.email}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                                        </p>
                                        <p className="font-medium" dir="ltr">{customer.phone || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {language === 'ar' ? 'العنوان' : 'Address'}
                                        </p>
                                        <p className="font-medium line-clamp-1">
                                            {customer.shippingAddress?.address || customer.shippingAddress?.city || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="bg-purple-50 border-purple-100 shadow-sm">
                    <CardContent className="p-6 space-y-6">
                        <div>
                            <p className="text-sm text-purple-600 font-medium mb-1">
                                {language === 'ar' ? "إجمالي المشتريات" : "Total Spent"}
                            </p>
                            <p className="text-3xl font-bold text-purple-900">
                                {Number(stats.totalSpent).toFixed(2)} <span className="text-sm font-normal">{t('currency')}</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-purple-600 font-medium mb-1">
                                {language === 'ar' ? "عدد الطلبات" : "Total Orders"}
                            </p>
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-purple-600" />
                                <p className="text-2xl font-bold text-purple-900">{stats.totalOrders}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Order History */}
            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">
                {language === 'ar' ? "سجل الطلبات" : "Order History"}
            </h3>
            <div className="space-y-4">
                {orders.map((order: any) => (
                    <Card key={order.id} className="border border-gray-100 shadow-sm hover:shadow-md transition">
                        <CardContent className="p-5">
                            <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 mb-4 border-b border-gray-50 pb-4">
                                <div>
                                    <p className="font-bold text-gray-900">
                                        #{order.orderNumber}
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                    <p className="text-lg font-bold text-gray-900">
                                        {Number(order.total).toFixed(2)} {t('currency')}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {order.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 text-sm">
                                        <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                                            {item.product?.images?.[0] && <img src={item.product.images[0]} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {language === 'ar' ? item.product?.nameAr : item.product?.nameEn}
                                            </p>
                                            <div className="flex gap-2 text-xs text-gray-500">
                                                <span>{item.quantity}x</span>
                                                {item.size && <span>{language === 'ar' ? 'المقاس:' : 'Size:'} {item.size}</span>}
                                            </div>
                                        </div>
                                        <p className="font-mono text-gray-600">
                                            {Number(item.price).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
