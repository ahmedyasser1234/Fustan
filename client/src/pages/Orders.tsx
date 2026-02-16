import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Package, Clock, CheckCircle, Truck, ArrowRight, Eye, Download, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useState } from "react";

interface OrderStatus {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const ORDER_STATUSES: Record<string, OrderStatus> = {
  pending: {
    id: "pending",
    label: "قيد الانتظار",
    icon: <Clock className="w-5 h-5" />,
    color: "yellow",
  },
  confirmed: {
    id: "confirmed",
    label: "تم التأكيد",
    icon: <CheckCircle className="w-5 h-5" />,
    color: "blue",
  },
  shipped: {
    id: "shipped",
    label: "تم الشحن",
    icon: <Truck className="w-5 h-5" />,
    color: "purple",
  },
  delivered: {
    id: "delivered",
    label: "تم التسليم",
    icon: <CheckCircle className="w-5 h-5" />,
    color: "green",
  },
  cancelled: {
    id: "cancelled",
    label: "ملغى",
    icon: <AlertCircle className="w-5 h-5" />,
    color: "red",
  },
};

export default function Orders() {
  const { language, formatPrice } = useLanguage();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => await endpoints.orders.list(),
  });

  const getStatusColorClass = (color: string) => {
    switch (color) {
      case "yellow": return "bg-yellow-100 text-yellow-700";
      case "blue": return "bg-blue-100 text-blue-700";
      case "purple": return "bg-purple-100 text-purple-700";
      case "green": return "bg-green-100 text-green-700";
      case "red": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredOrders = orders?.filter((order: any) => {
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    const matchesSearch = !searchQuery || order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{language === 'ar' ? 'الطلبات' : 'Orders'}</h1>
              <p className="text-gray-600 mt-1">{language === 'ar' ? 'عرض وإدارة جميع طلباتك' : 'View and manage all your orders'}</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2 rotate-180'}`} />
                {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {language === 'ar' ? 'ابحث عن الطلب' : 'Search Order'}
              </label>
              <Input
                type="text"
                placeholder={language === 'ar' ? 'رقم الطلب...' : 'Order Number...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {language === 'ar' ? 'حالة الطلب' : 'Order Status'}
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedStatus === null ? "default" : "outline"}
                onClick={() => setSelectedStatus(null)}
                className={selectedStatus === null ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {language === 'ar' ? 'الكل' : 'All'}
              </Button>
              {Object.values(ORDER_STATUSES).map((status) => (
                <Button
                  key={status.id}
                  variant={selectedStatus === status.id ? "default" : "outline"}
                  onClick={() => setSelectedStatus(status.id)}
                  className={selectedStatus === status.id ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {language === 'ar' ? status.label : status.id.charAt(0).toUpperCase() + status.id.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">{language === 'ar' ? 'جاري تحميل الطلبات...' : 'Loading orders...'}</p>
          </div>
        ) : !filteredOrders || filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}</h3>
            <p className="text-gray-600 mb-6">{language === 'ar' ? 'لم تقم بأي طلبات حتى الآن' : 'You haven\'t made any orders yet'}</p>
            <Link href="/products">
              <Button className="bg-blue-600 hover:bg-blue-700">{language === 'ar' ? 'ابدأ التسوق' : 'Start Shopping'}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order: any) => {
              const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
              return (
                <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{language === 'ar' ? 'رقم الطلب' : 'Order Number'}</p>
                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? "ar-SA" : "en-US")}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">{language === 'ar' ? 'الحالة' : 'Status'}</p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColorClass(status.color)}`}>
                          {status.icon}
                          <span className="font-semibold text-sm">{language === 'ar' ? status.label : status.id.charAt(0).toUpperCase() + status.id.slice(1)}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">{language === 'ar' ? 'الإجمالي' : 'Total'}</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(order.total)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 justify-center">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                            {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                          {language === 'ar' ? 'تحميل الفاتورة' : 'Download Invoice'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

