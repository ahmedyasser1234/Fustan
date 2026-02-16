import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import api from "@/lib/api";
import { Loader2, Store, Upload } from "lucide-react";
import { toast } from "sonner";

export default function VendorRegister() {
    const { language } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();
    const { refresh } = useAuth();

    // Core state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Vendor specific state
    const [storeNameAr, setStoreNameAr] = useState("");
    const [storeNameEn, setStoreNameEn] = useState("");
    const [descriptionAr, setDescriptionAr] = useState("");
    const [descriptionEn, setDescriptionEn] = useState("");
    const [cityAr, setCityAr] = useState("");
    const [cityEn, setCityEn] = useState("");
    const [countryAr, setCountryAr] = useState("");
    const [countryEn, setCountryEn] = useState("");
    const [phone, setPhone] = useState("");
    const [logo, setLogo] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email.toLowerCase());
            formData.append("password", password);
            formData.append("role", "vendor");
            formData.append("storeNameAr", storeNameAr);
            formData.append("storeNameEn", storeNameEn);
            formData.append("descriptionAr", descriptionAr);
            formData.append("descriptionEn", descriptionEn);
            formData.append("cityAr", cityAr);
            formData.append("cityEn", cityEn);
            formData.append("countryAr", countryAr);
            formData.append("countryEn", countryEn);
            formData.append("phone", phone);
            if (logo) formData.append("logo", logo);

            await api.post("/auth/register", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await refresh();
            toast.success(language === 'ar' ? 'تم إنشاء متجركِ بنجاح! أهلاً بكِ في عائلة فستان' : 'Store created successfully! Welcome to Fustan family');
            setLocation("/vendor-dashboard");
        } catch (error: any) {
            const msg = error.response?.data?.message || (language === 'ar' ? 'فشل التسجيل. يرجى مراجعة البيانات' : 'Registration failed. Please check your data.');
            toast.error(msg);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-xl overflow-hidden focus-within:ring-2 ring-rose-500/20 transition-all">
                <div className="flex w-full border-b border-gray-100">
                    <Link href="/register" className="flex-1 py-4 text-center text-sm font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 transition-all">
                        {language === 'ar' ? 'حساب العميل' : 'Customer Account'}
                    </Link>
                    <Link href="/vendor/register" className="flex-1 py-4 text-center text-sm font-bold bg-white text-rose-600 border-b-2 border-rose-600 transition-all">
                        {language === 'ar' ? 'حساب التاجر' : 'Vendor Account'}
                    </Link>
                </div>
                <CardHeader className="space-y-2 text-center pt-10">
                    <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-rose-100 rotate-3 shadow-inner">
                        <Store className="w-10 h-10 text-rose-600 -rotate-3" />
                    </div>
                    <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">
                        {language === 'ar' ? 'انضمي كمصممة أو متجر' : 'Join as Designer Or Store'}
                    </CardTitle>
                    <p className="text-base font-bold text-gray-500 max-w-md mx-auto">
                        {language === 'ar' ? 'ابدئي رحلتكِ معنا واعرضي مجموعاتكِ لآلاف المهتمات' : 'Start your journey with us and showcase your collections to thousands'}
                    </p>
                </CardHeader>
                <CardContent className="px-8 pb-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Info */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className={`space-y-2 text-${language === 'ar' ? 'right' : 'left'}`}>
                                <Label className="font-bold text-gray-700">{language === 'ar' ? 'اسمكِ الكامل' : 'Full Name'}</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" className="h-12 rounded-xl bg-gray-50/50" />
                            </div>
                            <div className={`space-y-2 text-${language === 'ar' ? 'right' : 'left'}`}>
                                <Label className="font-bold text-gray-700">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} required placeholder="design@fustan.com" className="h-12 rounded-xl bg-gray-50/50" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className={`space-y-2 text-${language === 'ar' ? 'right' : 'left'}`}>
                                <Label className="font-bold text-gray-700">{language === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
                                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="h-12 rounded-xl bg-gray-50/50" />
                            </div>
                            <div className={`space-y-2 text-${language === 'ar' ? 'right' : 'left'}`}>
                                <Label className="font-bold text-gray-700">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</Label>
                                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+966..." className="h-12 rounded-xl bg-gray-50/50" />
                            </div>
                        </div>

                        {/* Store Details Section */}
                        <div className="pt-8 border-t border-gray-100 flex flex-col gap-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black">2</div>
                                <h3 className="font-black text-xl text-gray-900">
                                    {language === 'ar' ? 'بيانات المتجر الاحترافية' : 'Professional Store Details'}
                                </h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-bold text-gray-700">{language === 'ar' ? 'اسم المتجر (بالعربي)' : 'Store Name (Arabic)'}</Label>
                                    <Input value={storeNameAr} onChange={(e) => setStoreNameAr(e.target.value)} required placeholder="أتيليه فستان" className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-gray-700">{language === 'ar' ? 'اسم المتجر (بالإنجليزي)' : 'Store Name (English)'}</Label>
                                    <Input value={storeNameEn} onChange={(e) => setStoreNameEn(e.target.value)} required placeholder="Atelier Fustan" className="h-12 rounded-xl" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-bold text-gray-700">{language === 'ar' ? 'وصف المتجر (بالعربي)' : 'Description (Arabic)'}</Label>
                                    <textarea
                                        className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all font-medium text-sm"
                                        rows={3}
                                        value={descriptionAr}
                                        onChange={(e) => setDescriptionAr(e.target.value)}
                                        placeholder="تحدثي عن هويتكِ وتصاميمكِ..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-gray-700">{language === 'ar' ? 'وصف المتجر (بالإنجليزي)' : 'Description (English)'}</Label>
                                    <textarea
                                        className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all font-medium text-sm"
                                        rows={3}
                                        value={descriptionEn}
                                        onChange={(e) => setDescriptionEn(e.target.value)}
                                        placeholder="Tell us about your brand and style..."
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-bold text-gray-700">{language === 'ar' ? 'المدينة' : 'City'}</Label>
                                    <Input value={language === 'ar' ? cityAr : cityEn} onChange={(e) => {
                                        if (language === 'ar') setCityAr(e.target.value);
                                        else setCityEn(e.target.value);
                                    }} required className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-gray-700">{language === 'ar' ? 'صورة المتجر (Logo)' : 'Store Logo'}</Label>
                                    <div className="relative h-12 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:border-rose-300 transition-colors group cursor-pointer bg-gray-50/30">
                                        <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 group-hover:text-rose-600 transition-colors">
                                            <Upload size={16} />
                                            {logo ? logo.name : (language === 'ar' ? 'ارفعي شعار المتجر' : 'Upload Store Logo')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-rose-200 transition-all hover:scale-[1.01]"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (language === 'ar' ? 'إنشاء متجري الآن' : 'Create My Store Now')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t border-gray-50 pt-6 pb-10">
                    <div className="text-sm text-center">
                        <span className="text-gray-500 font-medium">{language === 'ar' ? 'لديكِ حساب متجر بالفعل؟' : "Already have a store account?"} </span>
                        <Link href="/vendor/login" className="font-black text-rose-600 hover:text-rose-800 underline underline-offset-4">
                            {language === 'ar' ? 'دخول التجار' : 'Vendor Sign In'}
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
