import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import api from "@/lib/api";
import { Loader2, KeyRound, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ForgotPassword() {
    const { language } = useLanguage();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post("/auth/forgot-password", { email: email.toLowerCase() });
            toast.success(language === 'ar' ? 'تم إرسال كود استعادة كلمة المرور' : 'Password reset code sent');
            // Save email to localStorage for the next step
            localStorage.setItem("reset_password_email", email.toLowerCase());
            setLocation("/reset-password");
        } catch (error: any) {
            toast.error(language === 'ar' ? 'فشل إرسال الكود. يرجى المحاولة لاحقاً' : 'Failed to send code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
                    <CardHeader className="space-y-4 text-center pt-10">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-rose-100 ring-8 ring-rose-50/50">
                            <KeyRound className="w-10 h-10 text-rose-600" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                                {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                            </CardTitle>
                            <p className="text-sm text-gray-500 px-6">
                                {language === 'ar' 
                                    ? 'لا تقلقي! أدخلي بريدك الإلكتروني وسنرسل لكِ كود لإعادة تعيين كلمة المرور.' 
                                    : "No worries! Enter your email and we'll send you a code to reset your password."}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className={`space-y-2 text-${language === 'ar' ? 'right' : 'left'}`}>
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mx-1">
                                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-14 rounded-2xl border-gray-200 focus:border-rose-500 focus:ring-rose-500 transition-all px-6"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-xl shadow-rose-100 transition-all flex items-center justify-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    language === 'ar' ? 'إرسال الكود' : 'Send Reset Code'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center pb-10">
                        <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-2 transition-colors">
                            {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                            <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                        </Link>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
