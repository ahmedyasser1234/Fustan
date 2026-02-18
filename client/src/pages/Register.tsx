import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import api from "@/lib/api";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

export default function Register() {
    const { language } = useLanguage();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();
    const { refresh } = useAuth();

    // Core state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post("/auth/register", {
                name,
                email: email.toLowerCase(),
                password,
                role: 'customer',
                phone,
                address
            });
            if (response.data.token) {
                localStorage.setItem('app_token', response.data.token);
            }

            await refresh(); // Refresh auth state
            toast.success(language === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully');
            setLocation("/");
        } catch (error: any) {
            const msg = error.response?.data?.message || (language === 'ar' ? 'فشل إنشاء الحساب. قد يكون البريد مستخدم مسبقاً' : 'Registration failed. Email might be in use.');
            toast.error(msg);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-xl overflow-hidden focus-within:ring-2 ring-rose-500/20 transition-all">
                <div className="flex w-full border-b border-gray-100">
                    <Link href="/register" className="flex-1 py-4 text-center text-sm font-bold bg-white text-rose-600 border-b-2 border-rose-600 transition-all">
                        {language === 'ar' ? 'حساب العميل' : 'Customer Account'}
                    </Link>
                    <Link href="/vendor/register" className="flex-1 py-4 text-center text-sm font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 transition-all">
                        {language === 'ar' ? 'حساب التاجر' : 'Vendor Account'}
                    </Link>
                </div>
                <CardHeader className="space-y-1 text-center pt-8">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-rose-100 ring-8 ring-rose-50/50">
                        <UserPlus className="w-8 h-8 text-rose-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                        {language === 'ar' ? 'إنشاء حساب جديد' : 'Create an account'}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                        {language === 'ar' ? 'أهلاً بكِ في عائلة فستان' : 'Join the Fustan family today'}
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className={`space-y-2 text-${language === 'ar' ? 'right' : 'left'}`}>
                            <Label htmlFor="name">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-12 rounded-xl"
                            />
                        </div>

                        <div className={`space-y-2 text-${language === 'ar' ? 'right' : 'left'}`}>
                            <Label htmlFor="email">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                required
                                className="h-12 rounded-xl"
                            />
                        </div>

                        <div className={`space-y-2 text-${language === 'ar' ? 'right' : 'left'}`}>
                            <Label htmlFor="password">{language === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-12 rounded-xl"
                            />
                        </div>

                        <div className={`space-y-2 text-${language === 'ar' ? 'right' : 'left'}`}>
                            <Label htmlFor="phone">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="h-12 rounded-xl"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg transition-all mt-6"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (language === 'ar' ? 'إنشاء الحساب' : 'Create Account')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center flex-col gap-4 pb-8">
                    <div className="text-sm text-center">
                        <span className="text-gray-500">{language === 'ar' ? 'لديك حساب بالفعل؟' : "Already have an account?"} </span>
                        <Link href="/login" className="font-bold text-rose-600 hover:text-rose-500">
                            {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
