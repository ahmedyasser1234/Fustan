import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import api from "@/lib/api";
import { Loader2, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion } from "framer-motion";

export default function VerifyEmail() {
    const { language } = useLanguage();
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [, setLocation] = useLocation();
    const { refresh } = useAuth();
    
    // Get email from search params or localStorage
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email") || localStorage.getItem("pending_verification_email");

    useEffect(() => {
        if (!email) {
            toast.error(language === 'ar' ? 'البريد الإلكتروني غير موجود' : 'Email not found');
            setLocation("/login");
        }
    }, [email, setLocation, language]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error(language === 'ar' ? 'يرجى إدخال كود التحقق المكون من 6 أرقام' : 'Please enter 6-digit verification code');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post("/auth/verify-otp", {
                email,
                otp,
                type: 'verification'
            });

            if (response.data.success) {
                if (response.data.token) {
                    // Token is handled by httpOnly cookie
                }
                localStorage.removeItem("pending_verification_email");
                await refresh();
                toast.success(language === 'ar' ? 'تم تفعيل الحساب بنجاح' : 'Account verified successfully');
                setLocation("/");
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || (language === 'ar' ? 'كود التحقق غير صحيح أو منتهي الصلاحية' : 'Invalid or expired verification code');
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            await api.post("/auth/resend-otp", { email });
            toast.success(language === 'ar' ? 'تم إعادة إرسال الكود' : 'Verification code resent');
        } catch (error: any) {
            toast.error(language === 'ar' ? 'فشل إعادة إرسال الكود' : 'Failed to resend code');
        } finally {
            setIsResending(false);
        }
    };

    if (!email) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
                    <CardHeader className="space-y-4 text-center pt-10">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-rose-100 ring-8 ring-rose-50/50">
                            <Mail className="w-10 h-10 text-rose-600" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                                {language === 'ar' ? 'تأكيد الحساب' : 'Verify Your Account'}
                            </CardTitle>
                            <p className="text-sm text-gray-500 px-6 leading-relaxed">
                                {language === 'ar' 
                                    ? `لقد أرسلنا كود التحقق إلى البريد الإلكتروني:` 
                                    : `We've sent a verification code to:`}
                                <br />
                                <span className="font-bold text-gray-900">{email}</span>
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="h-16 text-center text-3xl font-bold tracking-[0.5em] rounded-2xl border-gray-200 focus:border-rose-500 focus:ring-rose-500 transition-all"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={isResending}
                                        className="text-sm font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50 transition-colors"
                                    >
                                        {isResending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                {language === 'ar' ? 'جاري الإرسال...' : 'Resending...'}
                                            </span>
                                        ) : (
                                            language === 'ar' ? 'إعادة إرسال الكود؟' : "Didn't get the code? Resend"
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-xl shadow-rose-100 transition-all flex items-center justify-center gap-2 group"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>{language === 'ar' ? 'تأكيد الحساب' : 'Verify Account'}</span>
                                        <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center pb-10">
                        <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-2">
                            {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                            <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                        </Link>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
