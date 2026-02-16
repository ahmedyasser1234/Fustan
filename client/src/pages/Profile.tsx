import { useAuth } from "@/_core/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import api, { endpoints } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    User, ShoppingBag, Heart, LogOut, Settings, Bell, ChevronLeft,
    Loader2, Eye, EyeOff, Plus, Camera, Store, MapPin,
    Share2, Truck, Image as ImageIcon, X, Package, Award, ChevronRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import UserPointsView from "@/components/account/UserPointsView";

export default function Profile() {
    const { user, loading, logout } = useAuth();
    const { language, formatPrice, t } = useLanguage();
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data: vendorData } = useQuery({
        queryKey: ["vendor-dashboard"],
        queryFn: () => endpoints.vendors.dashboard(),
        enabled: !!user && user.role === 'vendor',
    });

    const { data: orders } = useQuery({
        queryKey: ["orders"],
        queryFn: () => endpoints.orders.list(),
        enabled: !!user,
    });

    const { data: wishlist } = useQuery({
        queryKey: ["wishlist"],
        queryFn: () => endpoints.wishlist.list(),
        enabled: !!user,
    });

    const { data: unreadNotifications } = useQuery({
        queryKey: ["notifications", "unread-count"],
        queryFn: () => endpoints.notifications.getUnreadCount(),
        enabled: !!user,
    });

    const { data: adminVendors } = useQuery({
        queryKey: ['admin', 'vendors', 'count'],
        queryFn: async () => (await api.get('/admin/vendors')).data,
        enabled: !!user && user.role === 'admin',
    });

    const { data: adminProducts } = useQuery({
        queryKey: ['admin', 'products', 'count'],
        queryFn: async () => (await api.get('/admin/products')).data,
        enabled: !!user && user.role === 'admin',
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
            </div>
        );
    }

    if (!user) {
        setLocation("/login");
        return null;
    }

    const orderStatusTranslations: Record<string, string> = {
        pending: language === 'ar' ? "قيد الانتظار" : "Pending",
        confirmed: language === 'ar' ? "تم التأكيد" : "Confirmed",
        shipped: language === 'ar' ? "جاري الشحن" : "Shipped",
        delivered: language === 'ar' ? "تم التوصيل" : "Delivered",
        cancelled: language === 'ar' ? "ملغي" : "Cancelled",
    };

    const stats = user.role === 'admin' ? [
        { label: language === 'ar' ? "المتاجر" : "Vendors", value: adminVendors?.length || 0, icon: Store, color: "text-blue-600", bg: "bg-blue-50" },
        { label: language === 'ar' ? "المنتجات" : "Products", value: adminProducts?.length || 0, icon: Package, color: "text-rose-600", bg: "bg-rose-50" },
        { label: language === 'ar' ? "التنبيهات" : "Notifications", value: unreadNotifications?.count || 0, icon: Bell, color: "text-amber-600", bg: "bg-amber-50" },
    ] : user.role === 'vendor' ? [
        { label: language === 'ar' ? "طلبات المتجر" : "Store Orders", value: vendorData?.stats?.totalOrders || 0, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
        { label: language === 'ar' ? "المنتجات" : "Products", value: vendorData?.stats?.totalProducts || 0, icon: Store, color: "text-rose-600", bg: "bg-rose-50" },
        { label: language === 'ar' ? "التنبيهات" : "Notifications", value: unreadNotifications?.count || 0, icon: Bell, color: "text-amber-600", bg: "bg-amber-50" },
    ] : [
        { label: language === 'ar' ? "الطلبات" : "Orders", value: orders?.length || 0, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
        { label: language === 'ar' ? "المفضلة" : "Wishlist", value: wishlist?.length || 0, icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
        { label: language === 'ar' ? "النقاط" : "Points", value: user.points || 0, icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
        { label: language === 'ar' ? "التنبيهات" : "Notifications", value: unreadNotifications?.count || 0, icon: Bell, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className={`mb-12 flex flex-col md:flex-row items-center gap-8 ${language === 'ar' ? 'md:text-right text-center' : 'md:text-left text-center'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={60} className="text-gray-400" />
                            )}
                        </div>
                        <div
                            onClick={() => setIsEditModalOpen(true)}
                            className={`absolute -bottom-2 ${language === 'ar' ? '-right-2' : '-left-2'} w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-50 text-gray-400 hover:text-rose-500 cursor-pointer transition-colors z-10`}
                        >
                            {user.role === 'admin' ? <Settings size={20} /> : <Camera size={20} />}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight">{user.name}</h1>
                        <p className="text-gray-500 text-lg font-medium">{user.email}</p>
                        <div className={`mt-6 flex flex-wrap justify-center md:justify-start gap-3`}>
                            <Button
                                variant="outline"
                                className="rounded-full h-12 px-6 font-bold border-gray-200 hover:bg-gray-100 transition-all"
                                onClick={() => logout()}
                            >
                                <LogOut size={18} className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                                {t('logout')}
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between hover:shadow-md transition-all cursor-default text-center md:text-start"
                        >
                            <div className="order-2 md:order-1 mt-3 md:mt-0">
                                <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-xl md:text-3xl font-black text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 md:w-14 md:h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center order-1 md:order-2`}>
                                <stat.icon size={24} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Sections */}
                <div className="space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {/* Admin Workspace - Only for Admins */}
                    {user.role === 'admin' && (
                        <section>
                            <div className="flex items-center justify-between mb-6 px-4">
                                <h2 className="text-2xl font-black text-gray-900">{t('adminDashboard')}</h2>
                            </div>
                            <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="text-center space-y-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-rose-200">
                                            <Settings size={40} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 mb-2">
                                                {language === 'ar' ? "مرحباً بك في لوحة التحكم" : "Welcome to Admin Dashboard"}
                                            </h3>
                                            <p className="text-gray-500 font-medium">
                                                {language === 'ar' ? "إدارة البائعين، المنتجات، الطلبات والمزيد" : "Manage vendors, products, orders and more"}
                                            </p>
                                        </div>
                                        <Link href="/admin">
                                            <Button className="bg-rose-600 hover:bg-rose-700 text-white rounded-full h-12 px-8 font-bold shadow-lg shadow-rose-200">
                                                {language === 'ar' ? "الذهاب للوحة التحكم" : "Go to Admin Dashboard"}
                                                <ChevronLeft size={18} className={`${language === 'ar' ? 'mr-2' : 'ml-2'} ${language === 'en' ? 'rotate-180' : ''}`} />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    )}

                    {/* Recent Orders Preview - Only for Non-Admins */}
                    {user.role !== 'admin' && (
                        <section>
                            <div className="flex items-center justify-between mb-6 px-4">
                                <h2 className="text-2xl font-black text-gray-900">
                                    {user.role === 'vendor'
                                        ? (language === 'ar' ? "آخر طلبات المتجر" : "Recent Store Orders")
                                        : (language === 'ar' ? "آخر الطلبات" : "Recent Orders")}
                                </h2>
                                <Link href={user.role === 'vendor' ? "/vendor?tab=orders" : "/orders"}>
                                    <Button variant="link" className="text-rose-600 font-black flex items-center gap-2">
                                        {language === 'ar' ? "عرض الكل" : "View All"}
                                        <ChevronLeft size={16} className={language === 'en' ? 'rotate-180' : ''} />
                                    </Button>
                                </Link>
                            </div>
                            <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden">
                                <CardContent className="p-0">
                                    {(!orders || orders.length === 0) && user.role !== 'vendor' ? (
                                        <div className="p-12 text-center text-gray-400 font-bold">
                                            {language === 'ar' ? "لا توجد طلبات سابقة" : "No previous orders"}
                                        </div>
                                    ) : user.role === 'vendor' && (!vendorData?.recentOrders || vendorData.recentOrders.length === 0) ? (
                                        <div className="p-12 text-center text-gray-400 font-bold">
                                            {language === 'ar' ? "لا توجد طلبات للمتجر حتى الآن" : "No store orders yet"}
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {(user.role === 'vendor' ? vendorData.recentOrders : orders).slice(0, 3).map((order: any) => {
                                                const statusKey = order.status?.toLowerCase();
                                                const translatedStatus = orderStatusTranslations[statusKey] || order.status;
                                                const statusColors: Record<string, string> = {
                                                    pending: "bg-amber-100 text-amber-600",
                                                    confirmed: "bg-green-100 text-green-600",
                                                    shipped: "bg-blue-100 text-blue-600",
                                                    delivered: "bg-purple-100 text-purple-600",
                                                    cancelled: "bg-rose-100 text-rose-600",
                                                };

                                                return (
                                                    <div key={order.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                        <div>
                                                            <p className="font-black text-gray-900">#{order.id}</p>
                                                            <p className="text-sm text-gray-500 font-bold">{new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                                                        </div>
                                                        <div className="text-left text-end">
                                                            <p className="font-black text-rose-600">{formatPrice(order.total)}</p>
                                                            <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[statusKey] || 'bg-gray-100 text-gray-600'}`}>
                                                                {translatedStatus}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>
                    )}

                    {/* Reward Points Section - Only for Customers */}
                    {user.role === 'customer' && (
                        <section>
                            <UserPointsView />
                        </section>
                    )}

                    {/* Quick Settings */}
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 px-4">{t('settings')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                onClick={() => setIsEditModalOpen(true)}
                                className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-rose-100 hover:shadow-md transition-all h-24"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                                        <User size={20} />
                                    </div>
                                    <div className="text-start">
                                        <p className="font-black text-gray-900 leading-none mb-1">{t('personalInfo')}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('updateNameEmail')}</p>
                                    </div>
                                </div>
                                <ChevronLeft size={16} className={`text-gray-300 group-hover:text-rose-500 transition-all ${language === 'en' ? 'rotate-180' : ''}`} />
                            </div>
                            <div
                                onClick={() => setLocation("/notifications")}
                                className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-rose-100 hover:shadow-md transition-all h-24"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                        <Bell size={20} />
                                    </div>
                                    <div className="text-start">
                                        <p className="font-black text-gray-900 leading-none mb-1">{language === 'ar' ? "تنبيهات النظام" : "System Notifications"}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{language === 'ar' ? "إدارة الإشعارات" : "Manage notifications"}</p>
                                    </div>
                                </div>
                                <ChevronLeft size={16} className={`text-gray-300 group-hover:text-rose-500 transition-all ${language === 'en' ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {isEditModalOpen && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={user}
                    vendor={vendorData?.vendor}
                    language={language}
                    queryClient={queryClient}
                />
            )}
        </div>
    );
}

function EditProfileModal({ isOpen, onClose, user, vendor, language, queryClient }: any) {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState("personal");

    // User State
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

    // Vendor State
    const [vendorFields, setVendorFields] = useState<any>({
        storeNameAr: vendor?.storeNameAr || "",
        storeNameEn: vendor?.storeNameEn || "",
        descriptionAr: vendor?.descriptionAr || "",
        descriptionEn: vendor?.descriptionEn || "",
        phone: vendor?.phone || "",
        website: vendor?.website || "",
        cityAr: vendor?.cityAr || "",
        cityEn: vendor?.cityEn || "",
        countryAr: vendor?.countryAr || "",
        countryEn: vendor?.countryEn || "",
        addressAr: vendor?.addressAr || "",
        addressEn: vendor?.addressEn || "",
        zipCode: vendor?.zipCode || "",
        shippingCost: vendor?.shippingCost || 0,
        hasFreeShipping: vendor?.hasFreeShipping || false,
        freeShippingThreshold: vendor?.freeShippingThreshold || 0,
        socialLinks: vendor?.socialLinks || {
            facebook: "",
            instagram: "",
            twitter: "",
            tiktok: "",
            whatsapp: ""
        }
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);

    const fileInputRefs = {
        avatar: useRef<HTMLInputElement>(null),
        logo: useRef<HTMLInputElement>(null),
        banner: useRef<HTMLInputElement>(null),
        cover: useRef<HTMLInputElement>(null),
    };

    // Robust state update when vendor data arrives
    useEffect(() => {
        if (vendor) {
            setVendorFields({
                storeNameAr: vendor.storeNameAr || "",
                storeNameEn: vendor.storeNameEn || "",
                descriptionAr: vendor.descriptionAr || "",
                descriptionEn: vendor.descriptionEn || "",
                phone: vendor.phone || "",
                website: vendor.website || "",
                cityAr: vendor.cityAr || "",
                cityEn: vendor.cityEn || "",
                countryAr: vendor.countryAr || "",
                countryEn: vendor.countryEn || "",
                addressAr: vendor.addressAr || "",
                addressEn: vendor.addressEn || "",
                zipCode: vendor.zipCode || "",
                shippingCost: vendor.shippingCost || 0,
                hasFreeShipping: vendor.hasFreeShipping || false,
                freeShippingThreshold: vendor.freeShippingThreshold || 0,
                socialLinks: vendor.socialLinks || {
                    facebook: "",
                    instagram: "",
                    twitter: "",
                    tiktok: "",
                    whatsapp: ""
                }
            });
        }
    }, [vendor]);

    const updateProfileMutation = useMutation({
        mutationFn: async ({ userData, vendorData }: any) => {
            if (userData) {
                await endpoints.auth.updateProfile(userData);
            }
            if (vendorData && vendor) {
                await endpoints.vendors.update(vendor.id, vendorData);
            }
        },
        onSuccess: () => {
            toast.success(language === 'ar' ? "تم تحديث البيانات بنجاح" : "Information updated successfully");
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || (language === 'ar' ? "فشل التحديث" : "Update failed"));
        }
    });

    const handleFileChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'avatar') setAvatarFile(file);
        if (type === 'logo') setLogoFile(file);
        if (type === 'banner') setBannerFile(file);
        if (type === 'cover') setCoverFile(file);

        if (type === 'avatar') {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const userFormData = new FormData();
        userFormData.append('name', name);
        userFormData.append('email', email);
        if (password) userFormData.append('password', password);
        if (avatarFile) userFormData.append('avatar', avatarFile);

        let vendorFormData: FormData | null = null;
        if (user.role === 'vendor' && vendor) {
            vendorFormData = new FormData();
            Object.entries(vendorFields).forEach(([key, value]) => {
                if (key === 'socialLinks') {
                    vendorFormData!.append(key, JSON.stringify(value));
                } else {
                    vendorFormData!.append(key, String(value));
                }
            });
            if (logoFile) vendorFormData.append('logo', logoFile);
            if (bannerFile) vendorFormData.append('banner', bannerFile);
            if (coverFile) vendorFormData.append('coverImage', coverFile);
        }

        updateProfileMutation.mutate({ userData: userFormData, vendorData: vendorFormData });
    };

    const tabs = [
        { id: "personal", label: t('personalInfo'), icon: User },
        ...(user.role === 'vendor' ? [
            { id: "store", label: t('storeDetails'), icon: Store },
            { id: "contact", label: t('locationContact'), icon: MapPin },
            { id: "social", label: t('socialLinks'), icon: Share2 },
            { id: "branding", label: language === 'ar' ? "صور الهوية" : "Brand Identity", icon: ImageIcon },
        ] : [])
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-6xl w-[95vw] md:w-full bg-white rounded-[2.5rem] overflow-hidden p-0 h-[85vh] flex flex-col border-0 shadow-2xl"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
                showCloseButton={false}
            >
                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className={`w-full md:w-80 bg-gray-50/50 p-8 border-e border-gray-100 overflow-y-auto`}>
                        <DialogHeader className="mb-10 text-start">
                            <DialogTitle className="text-3xl font-black text-gray-900 tracking-tight">
                                {language === 'ar' ? "إعدادات الحساب" : "Account Settings"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-3">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black transition-all text-start group ${activeTab === tab.id
                                        ? "bg-rose-600 text-white shadow-xl shadow-rose-200 scale-[1.02]"
                                        : "text-gray-500 hover:bg-white hover:text-gray-900"
                                        }`}
                                >
                                    <tab.icon size={22} className={`${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-rose-500'} transition-colors`} />
                                    <span className="text-lg">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-12 bg-white scrollbar-hide">
                        <form id="profile-form" onSubmit={handleSubmit} className="space-y-10 max-w-4xl mx-auto">
                            <AnimatePresence mode="wait">
                                {/* Personal Information Tab */}
                                {activeTab === "personal" && (
                                    <motion.div
                                        key="personal"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex flex-col items-center gap-6 mb-10">
                                            <div
                                                onClick={() => fileInputRefs.avatar.current?.click()}
                                                className="relative w-36 h-36 rounded-[3.5rem] bg-gray-50 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden cursor-pointer group hover:scale-105 transition-all duration-500"
                                            >
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <Camera size={44} className="text-gray-300 group-hover:text-rose-400" />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                    <Plus size={36} />
                                                </div>
                                            </div>
                                            <input type="file" ref={fileInputRefs.avatar} onChange={(e) => handleFileChange('avatar', e)} accept="image/*" className="hidden" />
                                            <div className="text-center">
                                                <p className="text-base font-black text-gray-900 mb-1">{language === 'ar' ? "تغيير الصورة الشخصية" : "Change Profile Picture"}</p>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{language === 'ar' ? "يفضل صورة مربعة 500x500" : "Square image 500x500 recommended"}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-4">
                                            <div className="text-start space-y-2">
                                                <label className="text-xs font-black text-gray-700 px-1 uppercase tracking-wider">{language === 'ar' ? "الاسم الكامل" : "Full Name"}</label>
                                                <Input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 border-0 rounded-2xl h-14 px-6 font-bold focus:ring-2 focus:ring-rose-500 transition-all text-gray-900" required />
                                            </div>
                                            <div className="text-start space-y-2">
                                                <label className="text-xs font-black text-gray-700 px-1 uppercase tracking-wider">{language === 'ar' ? "البريد الإلكتروني" : "Email Address"}</label>
                                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 border-0 rounded-2xl h-14 px-6 font-bold focus:ring-2 focus:ring-rose-500 transition-all text-gray-900" required dir="ltr" />
                                            </div>
                                            <div className="text-start md:col-span-2 space-y-2">
                                                <label className="text-xs font-black text-gray-700 px-1 uppercase tracking-wider">{language === 'ar' ? "كلمة المرور الجديدة" : "New Password"}</label>
                                                <div className="relative">
                                                    <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border-0 rounded-2xl h-14 px-6 font-bold focus:ring-2 focus:ring-rose-500 transition-all text-gray-900" dir="ltr" />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors p-2">
                                                        {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold px-2 uppercase tracking-wide">{language === 'ar' ? "اتركه فارغاً للحفاظ على كلمة المرور الحالية" : "Leave blank to keep current password"}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Store Details Tab */}
                                {activeTab === "store" && (
                                    <motion.div
                                        key="store"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                            <span className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center"><Store size={20} /></span>
                                            {t('storeDetails')}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="text-start space-y-2">
                                                <label className="text-xs font-black text-gray-700 px-1 uppercase tracking-wider">{t('storeNameAr')}</label>
                                                <Input value={vendorFields.storeNameAr} onChange={(e) => setVendorFields({ ...vendorFields, storeNameAr: e.target.value })} className="w-full bg-gray-50 border-0 rounded-2xl h-14 px-6 font-bold" />
                                            </div>
                                            <div className="text-start space-y-2">
                                                <label className="text-xs font-black text-gray-700 px-1 uppercase tracking-wider">{t('storeNameEn')}</label>
                                                <Input value={vendorFields.storeNameEn} onChange={(e) => setVendorFields({ ...vendorFields, storeNameEn: e.target.value })} className="w-full bg-gray-50 border-0 rounded-2xl h-14 px-6 font-bold" dir="ltr" />
                                            </div>
                                            <div className="text-start md:col-span-2 space-y-2">
                                                <label className="text-xs font-black text-gray-700 px-1 uppercase tracking-wider">{t('descriptionAr')}</label>
                                                <Textarea value={vendorFields.descriptionAr} onChange={(e) => setVendorFields({ ...vendorFields, descriptionAr: e.target.value })} className="w-full bg-gray-50 border-0 rounded-3xl p-6 min-h-[140px] font-bold resize-none leading-relaxed" />
                                            </div>
                                            <div className="text-start md:col-span-2 space-y-2">
                                                <label className="text-xs font-black text-gray-700 px-1 uppercase tracking-wider">{t('descriptionEn')}</label>
                                                <Textarea value={vendorFields.descriptionEn} onChange={(e) => setVendorFields({ ...vendorFields, descriptionEn: e.target.value })} className="w-full bg-gray-50 border-0 rounded-3xl p-6 min-h-[140px] font-bold resize-none leading-relaxed" dir="ltr" />
                                            </div>
                                            <div className="text-start md:col-span-2 space-y-2">
                                                <label className="text-xs font-black text-gray-700 px-1 uppercase tracking-wider">{t('website')}</label>
                                                <Input value={vendorFields.website} onChange={(e) => setVendorFields({ ...vendorFields, website: e.target.value })} className="w-full bg-gray-50 border-0 rounded-2xl h-14 px-6 font-bold" placeholder="https://example.com" dir="ltr" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Contact & Location Tab */}
                                {activeTab === "contact" && (
                                    <motion.div
                                        key="contact"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                            <span className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center"><MapPin size={20} /></span>
                                            {t('locationContact')}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="text-start space-y-2">
                                                <label className="text-xs font-black text-gray-700 px-1 uppercase tracking-wider">{language === 'ar' ? "رقم الهاتف" : "Phone Number"}</label>
                                                <Input value={vendorFields.phone} onChange={(e) => setVendorFields({ ...vendorFields, phone: e.target.value })} className="w-full bg-gray-50 border-0 rounded-2xl h-14 px-6 font-bold text-gray-900" dir="ltr" />
                                            </div>
                                            <div className="text-start space-y-2">
                                                <label className="text-xs font-black text-gray-700 px-1 uppercase tracking-wider">{t('zipCode')}</label>
                                                <Input value={vendorFields.zipCode} onChange={(e) => setVendorFields({ ...vendorFields, zipCode: e.target.value })} className="w-full bg-gray-50 border-0 rounded-2xl h-14 px-6 font-bold text-gray-900" />
                                            </div>
                                            <div className="text-start space-y-2">
                                                <label className="text-xs font-black text-gray-700 px-1 uppercase tracking-wider">{t('cityAr')}</label>
                                                <Input value={vendorFields.cityAr} onChange={(e) => setVendorFields({ ...vendorFields, cityAr: e.target.value })} className="w-full bg-gray-50 border-0 rounded-2xl h-14 px-6 font-bold text-gray-900" />
                                            </div>
                                            <div className="text-start space-y-2">
                                                <label className="text-xs font-black text-gray-700 px-1 uppercase tracking-wider">{t('cityEn')}</label>
                                                <Input value={vendorFields.cityEn} onChange={(e) => setVendorFields({ ...vendorFields, cityEn: e.target.value })} className="w-full bg-gray-50 border-0 rounded-2xl h-14 px-6 font-bold text-gray-900" dir="ltr" />
                                            </div>
                                            <div className="text-start space-y-2 px-1 md:col-span-2">
                                                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">{t('addressAr')}</label>
                                                <Input value={vendorFields.addressAr} onChange={(e) => setVendorFields({ ...vendorFields, addressAr: e.target.value })} className="w-full bg-gray-50 border-0 rounded-2xl h-14 px-6 font-bold text-gray-900" />
                                            </div>
                                            <div className="text-start space-y-2 px-1 md:col-span-2">
                                                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">{t('addressEn')}</label>
                                                <Input value={vendorFields.addressEn} onChange={(e) => setVendorFields({ ...vendorFields, addressEn: e.target.value })} className="w-full bg-gray-50 border-0 rounded-2xl h-14 px-6 font-bold text-gray-900" dir="ltr" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Social Links Tab */}
                                {activeTab === "social" && (
                                    <motion.div
                                        key="social"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                            <span className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center"><Share2 size={20} /></span>
                                            {t('socialLinks')}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-8">
                                            {Object.keys(vendorFields.socialLinks).map((platform) => (
                                                <div key={platform} className="text-start space-y-3 group">
                                                    <label className="text-xs font-black text-gray-700 px-1 capitalize group-focus-within:text-rose-600 transition-colors tracking-widest">{platform}</label>
                                                    <div className="relative">
                                                        <Input
                                                            value={vendorFields.socialLinks[platform]}
                                                            onChange={(e) => setVendorFields({
                                                                ...vendorFields,
                                                                socialLinks: { ...vendorFields.socialLinks, [platform]: e.target.value }
                                                            })}
                                                            className="w-full bg-gray-50 border-0 rounded-2xl h-14 px-6 font-bold focus:ring-2 focus:ring-rose-500 transition-all pl-12 text-gray-900"
                                                            placeholder={platform === 'whatsapp' ? '+966...' : `https://${platform}.com/username`}
                                                            dir="ltr"
                                                        />
                                                        <Share2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Branding Tab */}
                                {activeTab === "branding" && (
                                    <motion.div
                                        key="branding"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-12"
                                    >
                                        {/* Images Section */}
                                        <div className="space-y-8">
                                            <h4 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-3">
                                                <ImageIcon size={26} className="text-rose-600" />
                                                {language === 'ar' ? "صور المتجر والهوية" : "Branding & Images"}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-4 text-start">
                                                    <label className="text-xs font-black text-gray-700 px-1 uppercase tracking-wider">{language === 'ar' ? "شعار المتجر" : "Store Logo"}</label>
                                                    <div
                                                        onClick={() => fileInputRefs.logo.current?.click()}
                                                        className="h-44 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/10 transition-all group overflow-hidden relative shadow-inner"
                                                    >
                                                        {(logoFile || vendor?.logo) ? (
                                                            <img src={logoFile ? URL.createObjectURL(logoFile) : vendor.logo} className="h-full w-full object-contain p-6 group-hover:scale-105 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="text-center">
                                                                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-md border border-gray-50">
                                                                    <Plus size={32} className="text-gray-300 group-hover:text-rose-500 transition-colors" />
                                                                </div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{language === 'ar' ? "رفع الشعار" : "Upload Logo"}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input type="file" ref={fileInputRefs.logo} onChange={(e) => handleFileChange('logo', e)} className="hidden" />
                                                </div>
                                                <div className="space-y-4 text-start">
                                                    <label className="text-xs font-black text-gray-700 px-1 uppercase tracking-wider">{language === 'ar' ? "غلاف المتجر" : "Store Banner"}</label>
                                                    <div
                                                        onClick={() => fileInputRefs.banner.current?.click()}
                                                        className="h-44 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/10 transition-all group overflow-hidden relative shadow-inner"
                                                    >
                                                        {(bannerFile || vendor?.banner) ? (
                                                            <img src={bannerFile ? URL.createObjectURL(bannerFile) : vendor.banner} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="text-center">
                                                                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-md border border-gray-50">
                                                                    <ImageIcon size={32} className="text-gray-300 group-hover:text-rose-500 transition-colors" />
                                                                </div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{language === 'ar' ? "رفع الغلاف" : "Upload Banner"}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input type="file" ref={fileInputRefs.banner} onChange={(e) => handleFileChange('banner', e)} className="hidden" />
                                                </div>
                                            </div>
                                        </div>

                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="p-8 border-t border-gray-50 bg-gray-50/40 flex-shrink-0">
                    <div className="flex w-full gap-5 max-w-4xl mx-auto">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 rounded-[2rem] h-16 font-black text-gray-400 hover:bg-white transition-all border border-transparent hover:border-gray-200 text-lg"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            form="profile-form"
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="flex-[2] bg-rose-600 hover:bg-rose-700 text-white rounded-[2rem] h-16 font-black shadow-2xl shadow-rose-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-lg"
                        >
                            {updateProfileMutation.isPending ? (
                                <Loader2 className="animate-spin w-7 h-7" />
                            ) : (
                                <>
                                    <span>{t('saveChanges')}</span>
                                    <ChevronLeft size={24} className={`hidden md:block ${language === 'en' ? 'rotate-180' : ''}`} />
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>

                {/* Enhanced Custom Close Button */}
                <button
                    onClick={onClose}
                    className={`absolute top-6 ${language === 'ar' ? 'left-6' : 'right-6'} w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-xl shadow-xl shadow-gray-200/50 flex items-center justify-center text-gray-400 hover:text-rose-600 transition-all z-50 group border border-gray-100/50 active:scale-90`}
                    aria-label="Close"
                >
                    <X size={24} className="group-hover:rotate-180 transition-transform duration-500" />
                </button>
            </DialogContent>
        </Dialog>
    );
}
