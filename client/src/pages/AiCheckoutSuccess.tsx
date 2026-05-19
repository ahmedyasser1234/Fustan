import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import confetti from "canvas-confetti";

export default function AiCheckoutSuccess() {
    const { language } = useLanguage();
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");

        if (!sessionId) {
            setStatus("error");
            setErrorMessage(language === "ar" ? "رمز جلسة الدفع غير موجود" : "Checkout session ID is missing");
            return;
        }

        let isMounted = true;

        endpoints.aiSubscriptions
            .verifyCheckoutSession(sessionId)
            .then(() => {
                if (!isMounted) return;
                setStatus("success");
                queryClient.invalidateQueries({ queryKey: ["ai-credits"] });
                window.dispatchEvent(new Event("ai-credits-updated"));

                // Fire confetti
                const duration = 3 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                function randomInRange(min: number, max: number) {
                    return Math.random() * (max - min) + min;
                }

                const interval: any = setInterval(function () {
                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }

                    const particleCount = 50 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                }, 250);

                return () => clearInterval(interval);
            })
            .catch((err: any) => {
                if (!isMounted) return;
                setStatus("error");
                setErrorMessage(err.response?.data?.message || (language === "ar" ? "فشل تأكيد عملية الدفع. يرجى مراجعة الدعم الفني." : "Failed to verify payment session. Please contact support."));
            });

        return () => {
            isMounted = false;
        };
    }, [queryClient, language]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center pt-20 pb-32 overflow-hidden relative">
            {/* Decorative Orbs */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-50 rounded-full blur-3xl opacity-50" />

            <div className="container mx-auto px-4 max-w-2xl text-center relative z-10">
                {status === "loading" && (
                    <div className="flex flex-col items-center justify-center">
                        <Loader2 className="w-16 h-16 text-rose-600 animate-spin mb-8" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-4 font-sans">
                            {language === "ar" ? "جاري تأكيد عملية الدفع..." : "Confirming your payment..."}
                        </h1>
                        <p className="text-gray-500 font-medium">
                            {language === "ar" ? "يرجى الانتظار لحين تفعيل خطة الذكاء الاصطناعي الخاصة بكِ." : "Please wait while we activate your AI plan."}
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <>
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200 }}
                            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl shadow-green-100"
                        >
                            <CheckCircle2 size={48} className="text-white" />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-bold text-gray-900 mb-6 font-sans"
                        >
                            {language === "ar" ? "تم تفعيل الاشتراك بنجاح!" : "Subscription Activated Successfully!"}
                        </motion.h1>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl text-gray-500 mb-12 font-medium"
                        >
                            {language === "ar" ? "تم شحن رصيد الذكاء الاصطناعي وتفعيل خطتكِ. يمكنكِ الآن البدء بتجربة الفساتين فوراً." : "Your AI credits have been charged and plan is active. You can start trying on dresses now."}
                        </motion.p>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="grid gap-4"
                        >
                            <Link href="/products">
                                <Button className="w-full h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-xl font-bold shadow-xl shadow-rose-100 gap-3">
                                    <Sparkles size={24} />
                                    {language === "ar" ? "اكتشفي الفساتين وجربيها" : "Explore and Try Dresses"}
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline" className="w-full h-16 rounded-full border-2 text-xl font-bold gap-3 group">
                                    <ArrowLeft size={24} className={language === 'ar' ? 'rotate-180 group-hover:translate-x-2 transition-transform' : 'group-hover:-translate-x-2 transition-transform'} />
                                    {language === "ar" ? "العودة للرئيسية" : "Back to Home"}
                                </Button>
                            </Link>
                        </motion.div>
                    </>
                )}

                {status === "error" && (
                    <>
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200 }}
                            className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl shadow-red-100"
                        >
                            <XCircle size={48} className="text-white" />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-bold text-gray-900 mb-6 font-sans"
                        >
                            {language === "ar" ? "حدث خطأ أثناء تفعيل الاشتراك" : "Verification Failed"}
                        </motion.h1>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl text-red-500 mb-12 font-medium"
                        >
                            {errorMessage}
                        </motion.p>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="grid gap-4"
                        >
                            <Link href="/pricing">
                                <Button className="w-full h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-xl font-bold shadow-xl shadow-rose-100 gap-3">
                                    {language === "ar" ? "العودة لباقات الاشتراك" : "Back to Pricing Plans"}
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline" className="w-full h-16 rounded-full border-2 text-xl font-bold gap-3 group">
                                    <ArrowLeft size={24} className={language === 'ar' ? 'rotate-180 group-hover:translate-x-2 transition-transform' : 'group-hover:-translate-x-2 transition-transform'} />
                                    {language === "ar" ? "العودة للرئيسية" : "Back to Home"}
                                </Button>
                            </Link>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
