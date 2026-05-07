import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import api from "@/lib/api";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ResetPassword() {
    const { language } = useLanguage();
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();

    const email = localStorage.getItem("reset_password_email");

    useEffect(() => {
        if (!email) {
            setLocation("/forgot-password");
        }
    }, [email, setLocation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await api.post("/auth/reset-password", {
                email,
                otp,
                password
            });
            toast.success(language === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password reset successfully');
            localStorage.removeItem("reset_password_email");
            setLocation("/login");
        } catch (error: any) {
            const msg = error.response?.data?.message || (language === 'ar' ? 'كود التحقق غير صحيح أو منتهي الصلاحية' : 'Invalid or expired code');
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
                    <CardHeader className="space-y-4 text-center pt-10">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-rose-100 ring-8 ring-rose-50/50">
                            <Lock className="w-10 h-10 text-rose-600" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                                {language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                            </CardTitle>
                            <p className="text-sm text-gray-500 px-6">
                                {language === 'ar' 
                                    ? `لقد أرسلنا كود التحقق إلى ${email}` 
                                    : `We've sent a code to ${email}`}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className={`space-y-2 text-${language === 'ar' ? 'right' : 'left'}`}>
                                <Label htmlFor="otp">{language === 'ar' ? 'كود التحقق' : 'Verification Code'}</Label>
                                <Input
                                    id="otp"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="h-14 rounded-2xl text-center text-2xl font-bold tracking-widest border-gray-200"
                                    maxLength={6}
                                />
                            </div>

                            <div className={`space-y-2 text-${language === 'ar' ? 'right' : 'left'}`}>
                                <Label htmlFor="password">{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-14 rounded-2xl border-gray-200 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute inset-y-0 ${language === 'ar' ? 'left-4' : 'right-4'} flex items-center text-gray-400 hover:text-gray-600`}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className={`space-y-2 text-${language === 'ar' ? 'right' : 'left'}`}>
                                <Label htmlFor="confirmPassword">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="h-14 rounded-2xl border-gray-200"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-xl shadow-rose-100 transition-all flex items-center justify-center gap-2 mt-4"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>{language === 'ar' ? 'حفظ كلمة المرور' : 'Save Password'}</span>
                                        <CheckCircle2 size={20} />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center pb-10">
                        <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                            {language === 'ar' ? 'إلغاء والعودة للرئيسية' : 'Cancel and go back'}
                        </Link>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
