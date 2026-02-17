import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/lib/api";
import api from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Layers,
  Loader2,
  ArrowRight,
  Clock,
  Truck,
  User,
  MessageSquare,
  Star,
  Zap,
  CreditCard
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CouponsTab } from "@/components/dashboard/CouponsTab";
import ShippingTab from "@/components/dashboard/ShippingTab";
import OffersTab from "@/components/dashboard/OffersTab";
import CustomersTab from "@/components/dashboard/CustomersTab";
import MessagesTab from "@/components/dashboard/MessagesTab";
import { useChatNotifications } from "@/hooks/useChatNotifications";

// Modular Dashboard Components
import OverviewTab from "@/components/dashboard/OverviewTab";
import ProductsTab from "@/components/dashboard/ProductsTab";
import OrdersTab from "@/components/dashboard/OrdersTab";
import CollectionsTab from "@/components/dashboard/CollectionsTab";
import CategoriesTab from "@/components/dashboard/CategoriesTab";
import ProductPreviewView from "@/components/dashboard/ProductPreviewView";
import CollectionProductsView from "@/components/dashboard/CollectionProductsView";
import NotificationBell from "@/components/dashboard/NotificationBell";
import WalletTab from "@/components/dashboard/WalletTab";

export default function VendorDashboard() {
  const { language, t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { unreadCount } = useChatNotifications();

  // Navigation & Selection State
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get("tab") as any) || "overview";
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Modal States
  const [customerInfoOpen, setCustomerInfoOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    title: "",
    description: "",
    onConfirm: () => { },
  });

  const showConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmConfig({ title, description, onConfirm });
    setConfirmOpen(true);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
    setSelectedCategoryId(null);
    setSelectedCollectionId(null);
    setSelectedProductId(null);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("tab", tabId);
    window.history.pushState({}, "", newUrl.toString());
  };

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['vendor', 'dashboard'],
    queryFn: async () => await endpoints.vendors.dashboard(),
    staleTime: 1000 * 60 * 2,
  });

  if (authLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-28">
      <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
    </div>
  );

  if (!user || user.role !== "vendor") return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-4">
          {t('unauthorizedAccess')}
        </h1>
        <Link href="/">
          <Button className="w-full h-12 rounded-2xl bg-slate-900 font-bold">{t('returnHome')}</Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 text-right pb-20" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Enhanced Dynamic Header */}
      <header className="bg-gradient-to-r from-white via-white to-purple-50/50 backdrop-blur-xl sticky top-0 md:top-20 z-40 border-b border-slate-200/60 shadow-sm transition-all">
        <div className="container mx-auto px-4 py-3 md:px-6 md:py-4">
          {/* Top Section: Vendor Info + Quick Stats */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
            {/* Vendor Info */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden border-4 border-white shadow-lg">
                  {dashboard?.vendor.logo ? (
                    <img src={dashboard.vendor.logo} className="w-full h-full object-cover" alt="Vendor Logo" />
                  ) : <User className="w-full h-full p-5 text-purple-400" />}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1 bg-gradient-to-l from-slate-900 to-purple-900 bg-clip-text text-transparent">
                  {t('dashboardTitle')}
                </h1>
                <p className="text-slate-500 font-bold flex items-center gap-2 text-lg">
                  {t('welcomeBack')}
                  <span className="text-purple-600 font-black">{language === 'ar' ? (dashboard?.vendor?.storeNameAr || user?.name) : (dashboard?.vendor?.storeNameEn || user?.name)}</span>
                </p>
              </div>
              <div className="h-12 w-px bg-slate-200 mx-2" />
              <NotificationBell />
            </div>

            {/* Quick Stats */}
            {dashboard && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">{dashboard.stats?.totalProducts || 0}</p>
                      <p className="text-xs font-bold text-slate-400">{t('statsProducts')}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">{dashboard.stats?.totalOrders || 0}</p>
                      <p className="text-xs font-bold text-slate-400">{t('statsOrders')}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">{dashboard.stats?.totalRevenue ? `${Math.round(dashboard.stats.totalRevenue)}` : '0'}</p>
                      <p className="text-xs font-bold text-slate-400">{t('currency')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 lg:flex-wrap lg:overflow-visible lg:pb-0">
              {[
                { id: "overview", icon: TrendingUp, color: "from-purple-500 to-pink-500" },
                { id: "products", icon: Package, color: "from-blue-500 to-cyan-500" },
                { id: "orders", icon: ShoppingCart, color: "from-emerald-500 to-teal-500" },
                { id: "collections", icon: Layers, color: "from-amber-500 to-orange-500" },
                { id: "categories", icon: Star, color: "from-pink-500 to-rose-500" },
                { id: "offers", icon: Zap, color: "from-orange-500 to-red-500" },
                { id: "coupons", icon: Plus, color: "from-violet-500 to-purple-500" },
                { id: "shipping", icon: Truck, color: "from-cyan-500 to-blue-500" },
                { id: "wallet", icon: CreditCard, color: "from-emerald-500 to-teal-500" },
                { id: "customers", icon: User, color: "from-teal-500 to-green-500" },
                { id: "messages", icon: MessageSquare, badge: unreadCount, color: "from-indigo-500 to-purple-500" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`group h-14 px-7 rounded-[20px] font-black text-sm flex items-center gap-3 transition-all duration-300 relative overflow-hidden ${activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-300/50 scale-105"
                    : "bg-white/60 backdrop-blur-sm text-slate-500 hover:bg-white hover:text-slate-900 border border-slate-200/60 hover:border-slate-300 hover:shadow-lg hover:scale-102"
                    }`}
                >
                  {activeTab === tab.id && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-90`} />
                  )}
                  <tab.icon className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                  <span className="relative z-10">{t(`tab${tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}` as any)}</span>
                  {tab.badge > 0 && (
                    <span className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[11px] font-black rounded-full flex items-center justify-center animate-bounce shadow-lg z-20">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-6 mt-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "overview" && (
            <OverviewTab
              dashboard={dashboard}
              onCategoryClick={(id) => { setSelectedCategoryId(id); handleTabChange("collections"); }}
              onProductClick={(id) => setSelectedProductId(id)}
              onOrderClick={(order) => { setSelectedCustomer(order); setCustomerInfoOpen(true); }}
            />
          )}

          {activeTab === "products" && (
            selectedProductId ? (
              <ProductPreviewView productId={selectedProductId} onBack={() => setSelectedProductId(null)} />
            ) : (
              dashboard?.vendor?.id && (
                <ProductsTab
                  vendorId={dashboard.vendor.id}
                  collectionId={selectedCollectionId}
                  onProductClick={(id) => setSelectedProductId(id)}
                  onPreview={(id) => setSelectedProductId(id)}
                  showConfirm={showConfirm}
                />
              )
            )
          )}

          {activeTab === "collections" && (
            dashboard?.vendor?.id && (
              selectedCollectionId ? (
                <CollectionProductsView
                  vendorId={dashboard.vendor.id}
                  collectionId={selectedCollectionId}
                  onBack={() => setSelectedCollectionId(null)}
                  onProductClick={(id) => setSelectedProductId(id)}
                  onPreview={(id) => setSelectedProductId(id)}
                />
              ) : (
                <CollectionsTab
                  vendorId={dashboard.vendor.id}
                  categoryId={selectedCategoryId}
                  onCollectionClick={(id) => setSelectedCollectionId(id)}
                  showConfirm={showConfirm}
                />
              )
            )
          )}

          {activeTab === "categories" && (
            <CategoriesTab
              onCategoryClick={(id) => { setSelectedCategoryId(id); handleTabChange("collections"); }}
            />
          )}

          {activeTab === "orders" && dashboard?.vendor?.id && (
            <OrdersTab
              vendorId={dashboard.vendor.id}
              onCustomerClick={(order) => { setSelectedCustomer(order); setCustomerInfoOpen(true); }}
            />
          )}

          {activeTab === "messages" && <MessagesTab />}
          {activeTab === "offers" && dashboard?.vendor?.id && <OffersTab vendorId={dashboard.vendor.id} />}
          {activeTab === "coupons" && dashboard?.vendor?.id && <CouponsTab vendorId={dashboard.vendor.id} />}
          {activeTab === "shipping" && dashboard?.vendor?.id && <ShippingTab vendorId={dashboard.vendor.id} />}
          {activeTab === "wallet" && <WalletTab />}
          {activeTab === "customers" && dashboard?.vendor?.id && <CustomersTab vendorId={dashboard.vendor.id} />}
        </div>
      </main>

      {/* Global Modals */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-md rounded-[32px] border-0 shadow-2xl p-8 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-slate-900">{confirmConfig.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-bold text-base mt-2">
              {confirmConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-4 mt-8">
            <AlertDialogCancel className="flex-1 h-14 rounded-2xl border-slate-100 font-black text-slate-400 hover:bg-slate-50">
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmConfig.onConfirm}
              className="bg-red-500 hover:bg-red-600 text-white flex-1 h-14 rounded-2xl font-black shadow-lg shadow-red-100 border-0"
            >
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={customerInfoOpen} onOpenChange={setCustomerInfoOpen}>
        <DialogContent className="max-w-md rounded-[40px] border-0 shadow-2xl p-10 bg-white overflow-hidden">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-right text-2xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-2 h-8 bg-purple-600 rounded-full" />
              {t('customerProfile')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 text-right relative">
            <User className="absolute -left-10 -bottom-10 w-48 h-48 text-slate-50 -rotate-12 pointer-events-none" />

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('fullName')}</p>
              <p className="font-black text-lg text-slate-900">
                {selectedCustomer?.name || selectedCustomer?.shippingAddress?.name || t('guestAccount')}
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('emailContact')}</p>
              <p className="font-black text-lg text-slate-900">
                {selectedCustomer?.email || selectedCustomer?.shippingAddress?.email || t('notAvailable')}
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('mobileNumber')}</p>
              <p className="font-black text-lg text-slate-900" dir="ltr">
                {selectedCustomer?.phone || selectedCustomer?.shippingAddress?.phone || t('notAvailable')}
              </p>
            </div>

            <Button onClick={() => setCustomerInfoOpen(false)} className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black font-black text-white mt-4 relative z-10">
              {t('close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
