import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import api from "@/lib/api";
import { Loader2, Store } from "lucide-react";
import { toast } from "sonner";

export default function VendorLogin() {
    const { t, language } = useLanguage();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();
    const { refresh } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Pass the expected role to the backend
            const response = await api.post("/auth/login", {
                email: email.toLowerCase(),
                password,
                role: 'vendor'
            });
            await refresh();
            toast.success(language === 'ar' ? 'أهلاً بك في بوابة التجار' : 'Welcome to the Vendor Portal');
            setLocation("/vendor-dashboard");
        } catch (error: any) {
            const message = error.response?.data?.message || (language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed');
            toast.error(message);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-xl overflow-hidden focus-within:ring-2 ring-rose-500/20 transition-all">
                <div className="flex w-full border-b border-gray-100">
                    <Link href="/login" className="flex-1 py-4 text-center text-sm font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 transition-all">
                        {language === 'ar' ? 'حساب العميل' : 'Customer Account'}
                    </Link>
                    <Link href="/vendor/login" className="flex-1 py-4 text-center text-sm font-bold bg-white text-rose-600 border-b-2 border-rose-600 transition-all">
                        {language === 'ar' ? 'حساب التاجر' : 'Vendor Account'}
                    </Link>
                </div>
                <CardHeader className="space-y-2 text-center pt-8">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-rose-100 ring-8 ring-rose-50/50">
                        <Store className="w-8 h-8 text-rose-600" />
                    </div>
                    <CardTitle className="text-2xl font-black text-gray-900">
                        {language === 'ar' ? 'بوابة التجار' : 'Vendor Portal'}
                    </CardTitle>
                    <p className="text-sm font-bold text-gray-500">
                        {language === 'ar' ? 'سجلي الدخول لإدارة متجركِ ومجموعاتكِ' : 'Sign in to manage your store and collections'}
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className={`space-y-2 text-${language === 'ar' ? 'right' : 'left'}`}>
                            <Label htmlFor="email" className="font-bold text-gray-700">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="vendor@fustan.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                required
                                className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all"
                            />
                        </div>
                        <div className={`space-y-2 text-${language === 'ar' ? 'right' : 'left'}`}>
                            <Label htmlFor="password font-bold text-gray-700">{language === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (language === 'ar' ? 'دخول التجار' : 'Access Dashboard')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center flex-col gap-4 pb-8">
                    <div className="text-sm text-center">
                        <span className="text-gray-500 font-medium">{language === 'ar' ? 'تريدين الانضمام لنا؟' : "Want to join us?"} </span>
                        <Link href="/vendor/register" className="font-bold text-rose-600 hover:text-rose-700 underline underline-offset-4">
                            {language === 'ar' ? 'افتحي متجركِ الآن' : 'Create Vendor Account'}
                        </Link>
                    </div>
                    <Link href="/login" className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                        {language === 'ar' ? 'تسجيل دخول العملاء' : 'Customer Login'}
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
