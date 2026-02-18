import { useAuth } from "@/_core/hooks/useAuth";
// import { useSocket } from "@/_core/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/lib/api";
import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  CheckCircle,
  ChevronRight,
  DollarSign,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  List,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  MoreVertical,
  Package,
  Pause,
  Phone,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Store,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useChat } from "@/contexts/ChatContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
// Removed rogue code block
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useChatNotifications } from "@/hooks/useChatNotifications";
import VendorRequestsTab from "@/components/dashboard/VendorRequestsTab";
import CommissionReportsTab from "@/components/dashboard/CommissionReportsTab";
import AdminAnalyticsTab from "@/components/dashboard/AdminAnalyticsTab";
import ContentTab from "@/components/dashboard/ContentTab";
import { useLanguage } from "@/lib/i18n";
import AdminSearchModal from "@/components/admin/AdminSearchModal";


interface CardHeaderProps {
  children: React.ReactNode;
}

interface CardTitleProps {
  children: React.ReactNode;
}

const CardHeader = ({ children }: CardHeaderProps) => (
  <div className="border-b border-gray-200 px-6 py-4">{children}</div>
);

const CardTitle = ({ children }: CardTitleProps) => (
  <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
);

function SettingsTab() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: () => endpoints.auth.getProfile(),
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProfilePassword, setShowProfilePassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setAvatarPreview(profile.avatar || null);
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: (formData: FormData) => endpoints.auth.updateProfile(formData),
    onSuccess: () => {
      toast.success(language === 'ar' ? "تم تحديث الملف الشخصي بنجاح" : "Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || (language === 'ar' ? "فشل التحديث" : "Update failed"));
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (password) formData.append('password', password);
    if (avatarFile) formData.append('avatar', avatarFile);

    updateProfile.mutate(formData);
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-purple-600" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-0 shadow-sm overflow-hidden text-start" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <CardHeader>
          <CardTitle>{language === 'ar' ? "إعدادات الحساب" : "Account Settings"}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-[1.5rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer group hover:border-purple-300 transition-all"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={32} className="text-gray-300 group-hover:text-purple-400" />
                )}
                <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex text-white transition-all">
                  <Plus size={24} />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-xs text-gray-400 font-bold">
                {language === 'ar' ? "تغيير الصورة الشخصية" : "Change Profile Picture"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-start">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {language === 'ar' ? "الاسم" : "Name"}
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'ar' ? "ادخل اسمك" : "Enter your name"}
                  className="w-full"
                  required
                />
              </div>

              <div className="text-start">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {language === 'ar' ? "البريد الإلكتروني" : "Email Address"}
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@fustan.com"
                  className="w-full text-left"
                  required
                />
              </div>

              <div className="text-start">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {language === 'ar' ? "كلمة المرور الجديدة (اختياري)" : "New Password (Optional)"}
                </label>
                <div className="relative">
                  <Input
                    type={showProfilePassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-left pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProfilePassword(!showProfilePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 px-2"
                  >
                    {showProfilePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {language === 'ar' ? "اتركه فارغاً للحفاظ على كلمة المرور الحالية" : "Leave blank to keep current password"}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={updateProfile.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {updateProfile.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>{t('saving')}</span>
                </div>
              ) : (
                language === 'ar' ? "حفظ التغييرات" : "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const { language, t } = useLanguage();
  const { unreadCount } = useChatNotifications();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  const [activeTab, setActiveTabInternal] = useState<"overview" | "vendors" | "requests" | "reports" | "analytics" | "products" | "categories" | "orders" | "customers" | "chat" | "content" | "settings">(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get("tab") as any) || "overview";
  });

  /* Define tabs with distinct gradient colors */
  const tabs = useMemo<{ id: string; label: string; icon: any; color?: string; badge?: number }[]>(() => [
    { id: "overview", label: t('overview'), icon: LayoutDashboard },
    { id: "vendors", label: t('vendors'), icon: Store },
    { id: "requests", label: t('vendorRequests'), icon: List },
    { id: "analytics", label: t('analytics'), icon: BarChart3 },
    { id: "reports", label: t('commissionReports'), icon: DollarSign },
    { id: "content", label: t('contentManagement'), icon: Edit },
    { id: "products", label: t('products'), icon: Package },
    { id: "categories", label: t('categories'), icon: Layers },
    { id: "orders", label: t('orders'), icon: ShoppingCart },
    { id: "customers", label: t('customers'), icon: Users },
    { id: "chat", label: t('chat'), icon: MessageSquare, badge: unreadCount },
    { id: "settings", label: t('settings'), icon: Settings },
  ], [t, unreadCount]);

  const setActiveTab = (tab: typeof activeTab) => {
    setActiveTabInternal(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    setLocation(window.location.pathname + "?" + params.toString());
  };

  const [autoOpenAddCategory, setAutoOpenAddCategory] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as any;
    if (tab && tab !== activeTab) {
      setActiveTabInternal(tab);
    }
  }, [window.location.search]);
  const [isAdminEditEmailOpen, setIsAdminEditEmailOpen] = useState(false);
  const [selectedVendorForEdit, setSelectedVendorForEdit] = useState<any>(null);
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
  const [newVendorEmail, setNewVendorEmail] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [isAdminEditCommissionOpen, setIsAdminEditCommissionOpen] = useState(false);
  const [selectedVendorForCommission, setSelectedVendorForCommission] = useState<any>(null);
  const [newCommissionRate, setNewCommissionRate] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isAdminOrderModalOpen, setIsAdminOrderModalOpen] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const { openChat, isUserOnline } = useChat(); // Use global chat context

  // Add Vendor Modal State
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [newVendorData, setNewVendorData] = useState({
    email: "",
    password: "",
    storeNameAr: "",
    storeNameEn: "",
    phone: "",
    city: "",
    commissionRate: 10
  });

  const openAdminChat = (target: { vendorId: number, recipientId: number, name: string, logo?: string }) => {
    openChat({
      vendorId: target.vendorId,
      recipientId: target.recipientId,
      vendorName: target.name,
      vendorLogo: target.logo,
      sessionId: target.recipientId === target.vendorId ? `customer-${target.recipientId}` : `vendor-${target.vendorId}`
    });
  };


  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['admin', 'products', productSearch],
    queryFn: async () => (await api.get('/admin/products', { params: { search: productSearch } })).data,
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['admin', 'vendors'],
    queryFn: async () => (await api.get('/admin/vendors')).data,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await endpoints.categories.list()),
  });

  const { data: adminOrders } = useQuery({
    queryKey: ['admin-orders-full'],
    queryFn: async () => (await api.get('/admin/orders')).data,
  });

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: async () => (await api.get('/admin/customers')).data,
  });

  const { data: adminConversations } = useQuery({
    queryKey: ['admin', 'conversations'],
    queryFn: async () => (await api.get('/admin/conversations')).data,
  });

  const deleteVendor = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/admin/vendors/${id}`)).data,
    onSuccess: () => {
      toast.success("تم حذف البائع بنجاح");
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
    },
    onError: () => toast.error("فشل في حذف البائع"),
  });

  // Socket logic moved to ChatContext
  // const socket = useSocket();
  // const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  const totalRevenue = adminOrders
    ?.filter((o: any) => o.paymentStatus === 'paid')
    .reduce((sum: number, order: any) => sum + Number(order.total), 0) || 0;

  const updateVendorEmail = useMutation({
    mutationFn: async ({ id, email }: { id: number, email: string }) =>
      (await api.patch(`/admin/vendors/${id}/email`, { email })).data,
    onSuccess: () => {
      toast.success("تم تحديث البريد الإلكتروني بنجاح");
      setIsAdminEditEmailOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
    },
    onError: () => toast.error("فشل في تحديث البريد الإلكتروني"),
  });

  const updateVendorCommission = useMutation({
    mutationFn: async ({ id, commissionRate }: { id: number, commissionRate: number }) =>
      (await endpoints.admin.vendors.updateCommission(id, commissionRate)),
    onSuccess: () => {
      toast.success("تم تحديث العمولة بنجاح");
      setIsAdminEditCommissionOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => toast.error("فشل في تحديث العمولة"),
  });

  const createVendorMutation = useMutation({
    mutationFn: async (data: typeof newVendorData) => (await api.post('/admin/vendors', data)).data,
    onSuccess: () => {
      toast.success(language === 'ar' ? "تم إضافة البائع بنجاح" : "Vendor added successfully");
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
      setIsAddVendorModalOpen(false);
      setNewVendorData({
        email: "",
        password: "",
        storeNameAr: "",
        storeNameEn: "",
        phone: "",
        city: "",
        commissionRate: 10
      });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || (language === 'ar' ? "فشل في إضافة البائع" : "Failed to add vendor")),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('mustBeAdmin')}
          </h1>
          <Link href="/">
            <Button>{t('returnHome')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Desktop Navbar */}
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black text-gray-900">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h1>

          {/* Command + K Search Trigger */}
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                ctrlKey: true,
                bubbles: true
              });
              document.dispatchEvent(event);
            }}
            className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all group"
          >
            <Search size={16} className="text-gray-400 group-hover:text-rose-500 transition-colors" />
            <span className="text-sm font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
              {language === 'ar' ? "بحث سريع..." : "Quick search..."}
            </span>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-black text-gray-400">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-black text-gray-400">K</kbd>
            </div>
          </button>
        </div>
        <Link href="/">
          <Button variant="outline" className="rounded-xl border-gray-200 font-bold">
            {language === 'ar' ? "العودة للمتجر" : "Return to Store"}
            <ArrowRight className={`mr-2 h-4 w-4 ${language === 'en' ? 'rotate-180' : ''}`} />
          </Button>
        </Link>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 relative">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 lg:flex-wrap lg:overflow-visible lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all duration-300 relative overflow-hidden whitespace-nowrap min-w-fit ${activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                  : "bg-gray-100 text-gray-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-gray-200 hover:shadow-md"
                  }`}
              >
                <tab.icon className={`w-4 h-4 md:w-5 md:h-5 relative z-10 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                <span className="relative z-10">{tab.label}</span>
                {tab.badge ? (
                  <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-red-600 text-white text-[10px] md:text-xs font-black rounded-full flex items-center justify-center animate-bounce shadow-md z-20 border-2 border-white">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto p-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm border-r-4 border-r-blue-500 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <header className="h-6 mb-1">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{t('totalCustomers')}</p>
                      </header>
                      <p className="text-3xl font-black text-gray-900">{customers?.length || 0}</p>
                    </div>
                    <Users className="w-12 h-12 text-blue-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm border-r-4 border-r-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('totalStores')}</p>
                      <p className="text-3xl font-black text-gray-900">{vendors?.length || 0}</p>
                    </div>
                    <Store className="w-12 h-12 text-green-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm border-r-4 border-r-yellow-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('totalProducts')}</p>
                      <p className="text-3xl font-black text-gray-900">{products?.length || 0}</p>
                    </div>
                    <Package className="w-12 h-12 text-yellow-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm border-r-4 border-r-rose-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('paidOrders')}</p>
                      <p className="text-3xl font-black text-gray-900">{adminOrders?.length || 0}</p>
                    </div>
                    <ShoppingCart className="w-12 h-12 text-rose-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm border-r-4 border-r-emerald-500 bg-emerald-50/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-600 mb-1">{t('totalRevenue')}</p>
                      <p className="text-2xl font-black text-slate-900">{totalRevenue.toFixed(2)} {t('currency')}</p>
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                        <TrendingUp size={10} />
                        <span>{t('fromPaidOrders')}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>{t('systemStatus')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{t('dbServer')}</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{t('emailServer')}</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{t('paymentService')}</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{t('storageService')}</span>
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>{t('quickActions')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
                    onClick={() => {
                      setActiveTab("categories");
                      setAutoOpenAddCategory(true);
                    }}
                  >
                    {t('addCategory')}
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("vendors")}>
                    {t('manageCommissions')}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("reports")}
                  >
                    {t('viewReports')}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("content")}
                  >
                    {t('systemSettings')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === "vendors" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('manageVendors')}</h2>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="relative w-full md:w-64">
                    <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                    <Input
                      type="text"
                      placeholder={t('searchVendor')}
                      className={`${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => setIsAddVendorModalOpen(true)}
                    className="bg-rose-600 hover:bg-rose-700 font-bold gap-2"
                  >
                    <UserPlus size={18} />
                    {language === 'ar' ? "إضافة بائع" : "Add Vendor"}
                  </Button>
                </div>

                <div className="text-start" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-6 font-semibold text-gray-900 text-start">{t('storeName')}</th>
                          <th className="py-3 px-6 font-semibold text-gray-900">{t('city')}</th>
                          <th className="py-3 px-6 font-semibold text-gray-900">{t('emailContact')}</th>
                          <th className="py-3 px-6 font-semibold text-gray-900 text-center">{t('rating')}</th>
                          <th className="py-3 px-6 font-semibold text-gray-900 text-center">{t('commission')}</th>
                          <th className="py-3 px-6 font-semibold text-gray-900 text-end">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendorsLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-gray-100">
                              <td className="py-4 px-4"><div className="flex items-center gap-2"><Skeleton className="w-8 h-8 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div></div></td>
                              <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
                              <td className="py-4 px-4"><Skeleton className="h-4 w-32" /></td>
                              <td className="py-4 px-4"><Skeleton className="h-4 w-12" /></td>
                              <td className="py-4 px-4"><Skeleton className="h-4 w-12" /></td>
                              <td className="py-4 px-4"><div className="flex gap-2"><Skeleton className="h-8 w-8 rounded-lg" /><Skeleton className="h-8 w-8 rounded-lg" /></div></td>
                            </tr>
                          ))
                        ) : (
                          vendors
                            ?.filter((v: any) =>
                              v.storeNameAr?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                              v.storeNameEn?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                              v.email?.toLowerCase().includes(vendorSearch.toLowerCase())
                            )
                            .map((v: any) => (
                              <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-6 text-start">
                                  <div className="flex items-center gap-2">
                                    <div className="relative">
                                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-[10px] uppercase shadow-sm border border-slate-200">
                                        {(v.storeNameAr || v.storeNameEn || 'S').substring(0, 2)}
                                      </div>
                                      {isUserOnline(v.userId) && (
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>
                                      )}
                                    </div>
                                    <div>
                                      <div className="text-slate-900 font-bold">{v.storeNameAr || v.storeNameEn}</div>
                                      <div className="text-[10px] text-slate-400 font-medium">@{v.storeSlug}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-slate-600 font-medium">{v.city}</td>
                                <td className="py-4 px-6 text-slate-600 font-medium">{v.email}</td>
                                <td className="py-4 px-6 text-center">
                                  <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold">
                                    {v.rating} <span className="text-xs">⭐</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-slate-900 font-bold text-center">{v.commissionRate}%</td>
                                <td className="py-4 px-6 text-end">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                      onClick={() => {
                                        setSelectedVendorForEdit(v);
                                        setNewVendorEmail(v.email);
                                        setIsAdminEditEmailOpen(true);
                                      }}
                                    >
                                      <Mail className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                                      onClick={() => {
                                        setSelectedVendorForCommission(v);
                                        setNewCommissionRate(v.commissionRate || 10);
                                        setIsAdminEditCommissionOpen(true);
                                      }}
                                    >
                                      <span className="font-bold text-xs">%</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                                      onClick={() => {
                                        if (confirm(`${t('deleteVendorConfirm')} ${v.storeNameAr || v.storeNameEn}؟`)) {
                                          deleteVendor.mutate(v.id);
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg"
                                      onClick={() => {
                                        openAdminChat({
                                          vendorId: v.id,
                                          recipientId: v.userId,
                                          name: v.storeNameAr || v.storeNameEn,
                                          logo: v.logo
                                        });
                                      }}
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                    </Button>
                                    <Link href={`/vendor/${v.storeSlug}`}>
                                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                                        <ExternalLink className="w-4 h-4" />
                                      </Button>
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden grid grid-cols-1 gap-4 p-4 bg-gray-50">
                    {vendorsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-3 mb-4">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </div>
                      ))
                    ) : (
                      vendors
                        ?.filter((v: any) =>
                          v.storeNameAr?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                          v.storeNameEn?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                          v.email?.toLowerCase().includes(vendorSearch.toLowerCase())
                        )
                        .map((v: any) => (
                          <div key={v.id} className="bg-white rounded-2xl p-5 shadow-sm border border-dashed border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-slate-700 font-black text-sm uppercase shadow-inner border border-white">
                                    {(v.storeNameAr || v.storeNameEn || 'S').substring(0, 2)}
                                  </div>
                                  {isUserOnline(v.userId) && (
                                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>
                                  )}
                                </div>
                                <div>
                                  <h3 className="text-gray-900 font-bold text-lg leading-tight">{v.storeNameAr || v.storeNameEn}</h3>
                                  <p className="text-xs text-gray-400 font-medium mt-0.5">@{v.storeSlug}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-yellow-100">
                                  {v.rating} <span className="text-[10px]">⭐</span>
                                </div>
                                <span className="text-[10px] text-gray-400">{v.city}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                              <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-gray-100">
                                <span className="text-xs text-gray-400 font-bold mb-1">{t('commission')}</span>
                                <span className="font-black text-gray-900 text-lg">{v.commissionRate}%</span>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-gray-100">
                                <span className="text-xs text-gray-400 font-bold mb-1">{t('emailContact')}</span>
                                <span className="font-bold text-gray-700 text-xs truncate w-full">{v.email}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-100 border-dashed">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 rounded-xl border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 font-bold"
                                onClick={() => {
                                  openAdminChat({
                                    vendorId: v.id,
                                    recipientId: v.userId,
                                    name: v.storeNameAr || v.storeNameEn,
                                    logo: v.logo
                                  });
                                }}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {t('chat')}
                              </Button>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-9 h-9 text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-lg"
                                  onClick={() => {
                                    setSelectedVendorForEdit(v);
                                    setNewVendorEmail(v.email);
                                    setIsAdminEditEmailOpen(true);
                                  }}
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-9 h-9 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 rounded-lg"
                                  onClick={() => {
                                    setSelectedVendorForCommission(v);
                                    setNewCommissionRate(v.commissionRate || 10);
                                    setIsAdminEditCommissionOpen(true);
                                  }}
                                >
                                  <span className="font-bold text-xs">%</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-9 h-9 text-rose-600 bg-rose-50/50 hover:bg-rose-100 rounded-lg"
                                  onClick={() => {
                                    if (confirm(`${t('deleteVendorConfirm')} ${v.storeNameAr || v.storeNameEn}؟`)) {
                                      deleteVendor.mutate(v.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div >
              </CardContent >
            </Card >
          </div >
        )
        }

        {/* Vendor Requests Tab */}
        {activeTab === "requests" && <VendorRequestsTab />}

        {/* Analytics Tab */}
        {activeTab === "analytics" && <AdminAnalyticsTab />}

        {/* Reports Tab */}
        {activeTab === "reports" && <CommissionReportsTab />}

        {/* Content Tab */}
        {activeTab === "content" && <ContentTab />}

        {/* Settings Tab */}
        {activeTab === "settings" && <SettingsTab />}

        {/* Products Tab */}
        {
          activeTab === "products" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('manageProducts')}</h2>

              <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder={t('searchProductAdmin')}
                        className="pr-10"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto text-start" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-6 font-semibold text-gray-900 text-start">{t('productName')}</th>
                          <th className="py-3 px-6 font-semibold text-gray-900 text-start">{t('vendor')}</th>
                          <th className="py-3 px-6 font-semibold text-gray-900 text-center">{t('price')}</th>
                          <th className="py-3 px-6 font-semibold text-gray-900 text-center">{t('stock')}</th>
                          <th className="py-3 px-6 font-semibold text-gray-900 text-end">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-gray-100">
                              <td className="py-3 px-6"><Skeleton className="h-4 w-48" /></td>
                              <td className="py-3 px-6"><Skeleton className="h-4 w-32" /></td>
                              <td className="py-3 px-6"><Skeleton className="h-4 w-20" /></td>
                              <td className="py-3 px-6"><Skeleton className="h-4 w-12" /></td>
                              <td className="py-3 px-6"><Skeleton className="h-8 w-16" /></td>
                            </tr>
                          ))
                        ) : (
                          products?.map((product: any) => (
                            <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-3 px-6 text-gray-900 font-medium text-start">
                                {product.nameAr} / {product.nameEn}
                              </td>
                              <td className="py-3 px-6 text-gray-600 text-start">
                                {vendors?.find((v: any) => v.id === product.vendorId)?.storeNameAr || t('never')}
                              </td>
                              <td className="py-3 px-6 text-gray-900 text-center font-bold">{Number(product.price).toFixed(2)} {t('currency')}</td>
                              <td className="py-3 px-6 text-gray-900 text-center font-medium">{product.stock}</td>
                              <td className="py-3 px-6 text-end">
                                <Link href={`/products/${product.id}`}>
                                  <Button variant="outline" size="sm" className="font-bold">{t('viewDetails')}</Button>
                                </Link>
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
          )
        }

        {/* Orders Tab */}
        {
          activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-rose-600" />
                </div>
                {t('adminPaidOrders')}
              </h2>

              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="bg-rose-50/50 px-6 py-3 border-b border-rose-100">
                  <p className="text-xs font-bold text-rose-600">{t('paidOrdersDesc')}</p>
                </div>
                <CardContent className="p-0">
                  <div className="overflow-x-auto text-start" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-slate-50/50">
                          <th className="py-4 px-6 font-black text-slate-900 text-start">{t('orderNumber')}</th>
                          <th className="py-4 px-6 font-black text-slate-900 text-start">{t('customer')}</th>
                          <th className="py-4 px-6 font-black text-slate-900 text-center">{t('amount')}</th>
                          <th className="py-4 px-6 font-black text-slate-900 text-center">{t('deliveryStatus')}</th>
                          <th className="py-4 px-6 font-black text-slate-900 text-end">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminOrders?.filter((o: any) => o.paymentStatus === 'paid').map((order: any) => (
                          <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-6 font-bold text-slate-900 text-start">{order.orderNumber}</td>
                            <td className="py-4 px-6 text-slate-600 font-medium text-start">{order.customerName || `${t('customer')} #${order.customerId}`}</td>
                            <td className="py-4 px-6 font-black text-slate-900 text-center">{Number(order.total).toFixed(2)} {t('currency')}</td>
                            <td className="py-4 px-6 text-center">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {order.status === 'delivered' ? t('delivered') : t('processing')}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-rose-600 font-bold hover:bg-rose-50"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsAdminOrderModalOpen(true);
                                }}
                              >
                                {t('viewDetails')}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        }

        {/* Customers Tab */}
        {
          activeTab === "customers" && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                </div>
                {t('manageCustomers')}
              </h2>

              <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 border-b border-gray-100">
                    <div className="relative w-full max-w-md">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder={t('searchCustomerAdmin')}
                        className="pr-10 border-slate-100 focus:ring-blue-500 rounded-xl h-11"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto text-start" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="py-4 px-6 font-black text-slate-900 text-start">{t('customer')}</th>
                          <th className="py-4 px-6 font-black text-slate-900 text-start">{t('emailContact')}</th>
                          <th className="py-4 px-6 font-black text-slate-900 text-center">{t('lastSeen')}</th>
                          <th className="py-4 px-6 font-black text-slate-900 text-center">{t('mobileNumber')}</th>
                          <th className="py-4 px-6 font-black text-slate-900 text-end">{t('startChat')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customersLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-gray-100">
                              <td className="py-4 px-6"><div className="flex items-center gap-3"><Skeleton className="w-8 h-8 rounded-full" /><Skeleton className="h-4 w-32" /></div></td>
                              <td className="py-4 px-6"><Skeleton className="h-4 w-40" /></td>
                              <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                              <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                              <td className="py-4 px-6"><Skeleton className="h-8 w-8 rounded-lg" /></td>
                            </tr>
                          ))
                        ) : (
                          customers?.filter((c: any) =>
                            c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                            c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                            (c.phone && c.phone.includes(customerSearch))
                          ).map((c: any) => (
                            <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                              <td className="py-4 px-6 font-bold text-slate-900 text-start">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-[10px] uppercase shadow-sm border border-slate-200">
                                      {(c.name || 'C').substring(0, 2)}
                                    </div>
                                    {isUserOnline(c.id) && (
                                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>
                                    )}
                                  </div>
                                  <span>{c.name || t('customerUnknown')}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-slate-600 text-start">{c.email}</td>
                              <td className="py-4 px-6 text-slate-400 text-xs text-center">{c.lastSignedIn ? new Date(c.lastSignedIn).toLocaleDateString() : t('never')}</td>
                              <td className="py-4 px-6 text-slate-600 text-center">{c.phone || '-'}</td>
                              <td className="py-4 px-6 text-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg"
                                  onClick={() => {
                                    openAdminChat({
                                      vendorId: c.id, // Using Customer ID as vendorId key for now (safe if no collision with real vendors, or we need a type)
                                      recipientId: c.id,
                                      name: c.name || t('customer'),
                                      logo: c.avatar
                                    });
                                  }}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
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
          )
        }

        {/* Chat Tab */}
        {
          activeTab === "chat" && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                </div>
                {t('manageConversations')}
              </h2>

              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="bg-indigo-50/50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
                  <p className="text-sm font-bold text-indigo-600">{t('activeConversationsDesc')}</p>
                  <span className="bg-white px-3 py-1 rounded-lg border border-indigo-100 text-indigo-700 text-xs font-black">
                    {adminConversations?.length || 0} {t('conversationCount')}
                  </span>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {adminConversations?.map((conv: any) => (
                      <div key={conv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-3 rtl:space-x-reverse">
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs ring-2 ring-blue-50 overflow-hidden">
                              {conv.customerAvatar ? <img src={conv.customerAvatar} alt="" className="w-full h-full object-cover" /> : (conv.customerName || 'C').substring(0, 1)}
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs ring-2 ring-rose-50 overflow-hidden">
                              {conv.storeLogo ? <img src={conv.storeLogo} alt="" className="w-full h-full object-cover" /> : (conv.storeNameAr || conv.storeNameEn || 'S').substring(0, 1)}
                            </div>
                          </div>
                          <div className="text-right" dir="rtl">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {conv.customerName || t('customer')} <span className="text-slate-400 font-normal mx-1">{t('with')}</span> {conv.storeNameAr || conv.storeNameEn || t('vendor')}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {conv.lastMessage ? conv.lastMessage.substring(0, 50) : t('noMessages')}...
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-600 font-bold gap-2"
                          onClick={() => {
                            // Logic to open chat history or view details
                            // For now, let's trigger the chat history panel with this conversation
                            // We don't have a direct "Open as Admin" for 3rd party chat yet, 
                            // but we can at least show it exists.
                            // Ideally, we'd open a modal reading the messages.
                            toast.info(t('chatDetailsComingSoon'));
                          }}
                        >
                          {t('viewConversationDetails')} <ChevronRight size={14} />
                        </Button>
                      </div>
                    ))}
                    {(!adminConversations || adminConversations.length === 0) && (
                      <div className="p-12 text-center text-slate-400 font-medium">{t('noActiveConversations')}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        }

        {/* Categories Tab */}
        {
          activeTab === "categories" && (
            <CategoriesTab
              showConfirm={showConfirm}
              initialAddOpen={autoOpenAddCategory}
              onModalClose={() => setAutoOpenAddCategory(false)}
            />
          )
        }


        {/* Edit Commission Dialog */}
        <Dialog open={isAdminEditCommissionOpen} onOpenChange={setIsAdminEditCommissionOpen}>
          <DialogContent className="sm:max-w-[400px]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle>{t('editCommission')}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">
                  {t('commissionRateFor')} {selectedVendorForCommission?.storeNameAr || selectedVendorForCommission?.storeNameEn}
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newCommissionRate}
                    onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                    className="rounded-xl border-slate-200"
                  />
                  <span className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 font-bold`}>%</span>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsAdminEditCommissionOpen(false)}>{t('cancel')}</Button>
              <Button onClick={() => updateVendorCommission.mutate({ id: selectedVendorForCommission.id, commissionRate: newCommissionRate })}>
                {t('saveChanges')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Email Dialog */}
        <Dialog open={isAdminEditEmailOpen} onOpenChange={setIsAdminEditEmailOpen}>
          <DialogContent className="sm:max-w-[400px]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle>{t('editEmail')}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">{t('newStoreEmail')} {selectedVendorForEdit?.storeName}</label>
                <Input
                  value={newVendorEmail}
                  onChange={(e) => setNewVendorEmail(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsAdminEditEmailOpen(false)}>{t('cancel')}</Button>
              <Button onClick={() => updateVendorEmail.mutate({ id: selectedVendorForEdit.id, email: newVendorEmail })}>
                {t('saveChanges')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">{confirmConfig.title}</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 text-base">
                {confirmConfig.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-3 mt-4">
              <AlertDialogCancel className="flex-1">
                {t('cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmConfig.onConfirm}
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                {t('confirmDelete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* Admin Order Details Modal */}
        <Dialog open={isAdminOrderModalOpen} onOpenChange={setIsAdminOrderModalOpen}>
          <DialogContent className="sm:max-w-[600px]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle>{t('orderDetails')} #{selectedOrder?.orderNumber}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-slate-600 font-medium">{t('paymentMethod')}: {selectedOrder.paymentMethod === 'stripe' ? t('creditCard') : t('cashOnDelivery')}</p>
                    <p className="text-slate-600 font-medium">{t('paymentStatus')}: {selectedOrder.paymentStatus === 'paid' ? t('paid') : t('pending')}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl">
                  <h4 className="font-black text-slate-900 mb-3 text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-rose-600" /> {t('shippingAddress')}
                  </h4>
                  <div className="space-y-2 text-sm text-slate-600 font-medium">
                    <p>{selectedOrder.shippingAddress?.name}</p>
                    <p>{selectedOrder.shippingAddress?.phone}</p>
                    <p>{selectedOrder.shippingAddress?.city} - {selectedOrder.shippingAddress?.country}</p>
                    <p>{selectedOrder.shippingAddress?.address}</p>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 font-black text-sm">{t('invoiceSummary')}</div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>{t('subtotal')}</span>
                      <span>{Number(selectedOrder.subtotal).toFixed(2)} {t('currency')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>{t('shippingCost')}</span>
                      <span>{Number(selectedOrder.shippingCost).toFixed(2)} {t('currency')}</span>
                    </div>
                    {Number(selectedOrder.discount) > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-bold">
                        <span>{t('discountLabel')}</span>
                        <span>-{Number(selectedOrder.discount).toFixed(2)} {t('currency')}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-slate-900">
                      <span>{t('orderTotal')}</span>
                      <span className="text-lg text-rose-600">{Number(selectedOrder.total).toFixed(2)} {t('currency')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="sm:justify-start gap-2">
              <Button variant="outline" className="rounded-xl font-bold" onClick={() => setIsAdminOrderModalOpen(false)}>
                {t('close')}
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold">
                {t('updateOrderStatus')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Vendor Modal */}
        <Dialog open={isAddVendorModalOpen} onOpenChange={setIsAddVendorModalOpen}>
          <DialogContent className="sm:max-w-[500px]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle>{language === 'ar' ? "إضافة بائع جديد" : "Add New Vendor"}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">
                    {language === 'ar' ? "اسم المتجر (عربي)" : "Store Name (Arabic)"}
                  </label>
                  <Input
                    value={newVendorData.storeNameAr}
                    onChange={(e) => setNewVendorData({ ...newVendorData, storeNameAr: e.target.value })}
                    className="rounded-xl border-slate-200"
                    placeholder={language === 'ar' ? "مثال: متجر الأزياء" : "e.g., Fashion Store"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">
                    {language === 'ar' ? "اسم المتجر (English)" : "Store Name (English)"}
                  </label>
                  <Input
                    value={newVendorData.storeNameEn}
                    onChange={(e) => setNewVendorData({ ...newVendorData, storeNameEn: e.target.value })}
                    className="rounded-xl border-slate-200"
                    placeholder="e.g., Fashion Store"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">
                  {language === 'ar' ? "البريد الإلكتروني" : "Email"}
                </label>
                <Input
                  type="email"
                  value={newVendorData.email}
                  onChange={(e) => setNewVendorData({ ...newVendorData, email: e.target.value })}
                  className="rounded-xl border-slate-200"
                  placeholder="vendor@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">
                  {language === 'ar' ? "كلمة المرور" : "Password"}
                </label>
                <Input
                  type="password"
                  value={newVendorData.password}
                  onChange={(e) => setNewVendorData({ ...newVendorData, password: e.target.value })}
                  className="rounded-xl border-slate-200"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">
                    {language === 'ar' ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <Input
                    value={newVendorData.phone}
                    onChange={(e) => setNewVendorData({ ...newVendorData, phone: e.target.value })}
                    className="rounded-xl border-slate-200"
                    placeholder="+966..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">
                    {language === 'ar' ? "المدينة" : "City"}
                  </label>
                  <Input
                    value={newVendorData.city}
                    onChange={(e) => setNewVendorData({ ...newVendorData, city: e.target.value })}
                    className="rounded-xl border-slate-200"
                    placeholder={language === 'ar' ? "الرياض" : "Riyadh"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">
                  {language === 'ar' ? "نسبة العمولة (%)" : "Commission Rate (%)"}
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newVendorData.commissionRate}
                  onChange={(e) => setNewVendorData({ ...newVendorData, commissionRate: Number(e.target.value) })}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsAddVendorModalOpen(false)}>
                {language === 'ar' ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                onClick={() => createVendorMutation.mutate(newVendorData)}
                disabled={!newVendorData.email || !newVendorData.password || !newVendorData.storeNameEn || !newVendorData.storeNameAr}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {language === 'ar' ? "إضافة البائع" : "Add Vendor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main >
      <AdminSearchModal />
    </div >
  );
}

function CategoriesTab({
  showConfirm,
  initialAddOpen,
  onModalClose
}: {
  showConfirm: (title: string, description: string, onConfirm: () => void) => void;
  initialAddOpen?: boolean;
  onModalClose?: () => void;
}) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (initialAddOpen) {
      setIsModalOpen(true);
      if (onModalClose) onModalClose();
    }
  }, [initialAddOpen]);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const { t, language } = useLanguage();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => endpoints.categories.list(),
  });

  const createCategory = useMutation({
    mutationFn: (data: FormData) => endpoints.categories.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      resetForm();
      toast.success(t('categoryCreated'));
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => endpoints.categories.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      resetForm();
      toast.success(t('categoryUpdated'));
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => endpoints.categories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('categoryDeleted'));
    },
  });

  const resetForm = () => {
    setNameAr("");
    setNameEn("");
    setDescriptionAr("");
    setDescriptionEn("");
    setImage("");
    setImageFile(null);
    setEditingCategory(null);
  };

  const handleSubmit = () => {
    console.log("🚀 [Frontend] Submitting Category Form...");
    const formData = new FormData();
    formData.append("nameAr", nameAr);
    formData.append("nameEn", nameEn);
    formData.append("descriptionAr", descriptionAr);
    formData.append("descriptionEn", descriptionEn);
    formData.append("image", image); // Manual URL fallback
    if (imageFile) {
      formData.append("image", imageFile); // Actual file upload (prioritized by backend)
    }

    // Debug FormData
    formData.forEach((value, key) => {
      console.log(`📦 [FormData] ${key}:`, value);
    });

    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, data: formData });
    } else {
      createCategory.mutate(formData);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImage(url); // For preview (temporary)
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setNameAr(category.nameAr || "");
    setNameEn(category.nameEn || "");
    setDescriptionAr(category.descriptionAr || "");
    setDescriptionEn(category.descriptionEn || "");
    setImage(category.image || "");
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number, category: any) => {
    const displayName = category.nameAr || category.nameEn;
    showConfirm(
      t('deleteCategory'),
      `${t('deleteCategoryConfirm')} "${displayName}"؟`,
      () => deleteCategory.mutate(id)
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('manageCategories')}</h2>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          {t('addNewCategory')}
        </Button>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="relative w-full md:w-64">
              <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
              <Input
                type="text"
                placeholder={t('searchCategory')}
                className={`${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto text-start" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-6 font-semibold text-gray-900 text-start w-16">{t('image')}</th>
                  <th className="py-3 px-6 font-semibold text-gray-900 text-start">{t('categoryName')}</th>
                  <th className="py-3 px-6 font-semibold text-gray-900 text-start">{t('description')}</th>
                  <th className="py-3 px-6 font-semibold text-gray-900 text-end">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-4 px-6"><Skeleton className="h-4 w-32" /></td>
                      <td className="py-4 px-6"><Skeleton className="h-4 w-64" /></td>
                      <td className="py-4 px-6"><div className="flex justify-end gap-2"><Skeleton className="h-8 w-8 rounded-lg" /><Skeleton className="h-8 w-8 rounded-lg" /></div></td>
                    </tr>
                  ))
                ) : (
                  categories
                    ?.filter((c: any) =>
                      (c.nameAr || '').toLowerCase().includes(search.toLowerCase()) ||
                      (c.nameEn || '').toLowerCase().includes(search.toLowerCase())
                    )
                    .map((category: any) => (
                      <tr key={category.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 text-start">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                            {category.image ? (
                              <img src={category.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900 text-start">
                          {language === 'ar' ? (category.nameAr || category.nameEn) : (category.nameEn || category.nameAr)}
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-sm max-w-md truncate text-start">
                          {language === 'ar' ? (category.descriptionAr || category.descriptionEn) : (category.descriptionEn || category.descriptionAr)}
                        </td>
                        <td className="py-4 px-6 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(category)}
                              className="w-10 h-10 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300"
                              title={t('edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category.id, category)}
                              className="w-10 h-10 rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all duration-300"
                              title={t('delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
                {categories && categories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      {t('noCategoriesFound')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Category Modal */}
      {
        isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir={useLanguage().language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 text-right">
                  {editingCategory ? t('editCategory') : t('addNewCategory')}
                </h3>
              </div>

              <div className="p-6 space-y-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="space-y-4">
                  <div className="text-start">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('categoryImage')}
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        id="category-image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="category-image-upload"
                        className="w-24 h-24 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-all"
                      >
                        {image ? (
                          <>
                            <img src={image} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex text-white transition-all">
                              <Plus className="w-6 h-6" />
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-2">
                            <Plus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <span className="text-[10px] text-gray-500 font-bold">{t('uploadImage')}</span>
                            <span className="block text-[8px] text-purple-600 font-bold mt-1 bg-purple-50 rounded-full px-1">
                              1000x1000
                            </span>
                          </div>
                        )}
                      </label>
                      <div className="flex-1">
                        <Input
                          value={imageFile ? t('fileSelected') : image}
                          onChange={(e) => {
                            setImage(e.target.value);
                            setImageFile(null); // Clear file if manually typing URL
                          }}
                          placeholder={t('imageUrlPlaceholder')}
                          className="w-full"
                          readOnly={!!imageFile}
                        />
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-[10px] text-gray-400 font-medium italic">
                            {imageFile ? t('fileWillBeUploaded') : t('imageUploadHint')}
                          </p>
                          {image && (
                            <button
                              onClick={() => {
                                setImage("");
                                setImageFile(null);
                              }}
                              className="text-[10px] text-red-500 font-bold hover:underline"
                            >
                              {t('clearImage')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="text-start">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('categoryNameAr')}
                    </label>
                    <Input
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      placeholder={t('categoryPlaceholderAr')}
                      className="w-full"
                    />
                  </div>
                  <div className="text-start">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('categoryNameEn')}
                    </label>
                    <Input
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder={t('categoryPlaceholderEn')}
                      className="w-full text-left"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="text-start">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('categoryDescAr')}
                    </label>
                    <textarea
                      value={descriptionAr}
                      onChange={(e) => setDescriptionAr(e.target.value)}
                      placeholder={t('categoryDescPlaceholderAr')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                  </div>
                  <div className="text-start">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('categoryDescEn')}
                    </label>
                    <textarea
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      placeholder={t('categoryDescPlaceholderEn')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={(!nameAr && !nameEn) || createCategory.isPending || updateCategory.isPending}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {createCategory.isPending || updateCategory.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin w-4 h-4" />
                      <span>{t('saving')}</span>
                    </div>
                  ) : (
                    editingCategory ? t('saveCategory') : t('createCategoryBtn')
                  )}
                </Button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}


