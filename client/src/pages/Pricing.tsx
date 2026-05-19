import { useQuery, useMutation } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles, Zap, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function Pricing() {
    const { language, t, formatPrice } = useLanguage();
    const { user } = useAuth();
    const [, setLocation] = useLocation();

    const { data: plans, isLoading: plansLoading } = useQuery({
        queryKey: ["ai-plans"],
        queryFn: () => endpoints.aiSubscriptions.getPlans(),
    });

    const { data: credits, isLoading: creditsLoading } = useQuery({
        queryKey: ["ai-credits"],
        queryFn: () => endpoints.aiSubscriptions.getMyCredits(),
        enabled: !!user,
    });

    const purchaseMutation = useMutation({
        mutationFn: (planId: number) => endpoints.aiSubscriptions.purchasePlan(planId),
        onSuccess: () => {
            toast.success(language === 'ar' ? "تم شحن الرصيد بنجاح!" : "Credits purchased successfully!");
            // Invalidate credits query
            window.dispatchEvent(new Event('ai-credits-updated'));
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || (language === 'ar' ? "فشل شحن الرصيد" : "Failed to purchase credits"));
        },
    });

    if (plansLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
            </div>
        );
    }

    const getPlanIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('pro') || n.includes('بريميوم')) return <Zap className="w-6 h-6 text-amber-500" />;
        if (n.includes('premium') || n.includes('ملكي')) return <Crown className="w-6 h-6 text-purple-500" />;
        return <Sparkles className="w-6 h-6 text-rose-500" />;
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-600 text-sm font-bold mb-6"
                    >
                        <Sparkles size={16} />
                        {language === 'ar' ? "اشتراكات الذكاء الاصطناعي" : "AI Subscriptions"}
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-medium text-gray-900 mb-6 tracking-tight">
                        {language === 'ar' ? "جربي فستانك قبل الشراء" : "Try Your Dress Before You Buy"}
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
                        {language === 'ar' 
                            ? "اشتركي الآن لتتمكني من استخدام ميزة القياس الافتراضي وتجربة الفساتين باستخدام أحدث تقنيات الذكاء الاصطناعي." 
                            : "Subscribe now to use our virtual measurement and try-on features powered by state-of-the-art AI."}
                    </p>

                    {user && !creditsLoading && credits && (
                        <div className="mt-8 inline-block bg-white px-8 py-4 rounded-3xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">
                                {language === 'ar' ? "رصيدك الحالي" : "Current Balance"}
                            </p>
                            <p className="text-3xl font-medium text-gray-900">
                                {credits.remainingCredits} <span className="text-rose-600 text-lg">{language === 'ar' ? "كريديت" : "Credits"}</span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans?.filter((plan: any) => plan.price > 0).map((plan: any, i: number) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className={`relative h-full flex flex-col rounded-[2.5rem] border-0 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden ${plan.isPopular ? 'ring-2 ring-rose-500' : ''}`}>
                                {plan.isPopular && (
                                    <div className="absolute top-0 right-0 left-0 bg-rose-500 text-white text-center py-1.5 text-xs font-bold uppercase tracking-widest">
                                        {language === 'ar' ? "الأكثر طلباً" : "Most Popular"}
                                    </div>
                                )}
                                <CardHeader className={`pt-12 pb-8 px-8 ${plan.isPopular ? 'bg-rose-50/30' : ''}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-2xl ${plan.isPopular ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {getPlanIcon(language === 'ar' ? plan.nameAr : plan.nameEn)}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-medium text-gray-900">
                                                {formatPrice(plan.price)}
                                            </p>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">
                                                {plan.durationDays} {language === 'ar' ? "يوم" : "Days"}
                                            </p>
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-medium text-gray-900">
                                        {language === 'ar' ? plan.nameAr : plan.nameEn}
                                    </CardTitle>
                                    <p className="text-gray-500 text-sm mt-2 font-medium">
                                        {language === 'ar' ? plan.descriptionAr : plan.descriptionEn}
                                    </p>
                                </CardHeader>
                                <CardContent className="flex-1 p-8 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                            <Check size={12} />
                                        </div>
                                        <span className="text-gray-700 font-medium">
                                            {plan.credits} {language === 'ar' ? "محاولات تجربة ذكية" : "AI Try-On Credits"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                            <Check size={12} />
                                        </div>
                                        <span className="text-gray-700 font-medium">
                                            {language === 'ar' ? "توليد صور بدقة عالية" : "High-resolution Generation"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                            <Check size={12} />
                                        </div>
                                        <span className="text-gray-700 font-medium">
                                            {language === 'ar' ? "دعم فني متميز" : "Priority Support"}
                                        </span>
                                    </div>
                                    {plan.credits > 20 && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                                <Check size={12} />
                                            </div>
                                            <span className="text-gray-700 font-medium">
                                                {language === 'ar' ? "تحميل الصور بدون علامة مائية" : "No Watermark Downloads"}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="p-8 pt-0">
                                    <Button
                                        onClick={() => {
                                            if (!user) {
                                                setLocation("/login");
                                                return;
                                            }
                                            purchaseMutation.mutate(plan.id);
                                        }}
                                        disabled={purchaseMutation.isPending}
                                        className={`w-full h-14 rounded-2xl font-bold transition-all shadow-lg ${plan.isPopular 
                                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200' 
                                            : 'bg-gray-900 hover:bg-gray-800 text-white shadow-gray-200'}`}
                                    >
                                        {purchaseMutation.isPending && purchaseMutation.variables === plan.id ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <>
                                                {language === 'ar' ? "اشتركي الآن" : "Subscribe Now"}
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 p-10 bg-white rounded-[3rem] shadow-sm border border-gray-100 text-center max-w-3xl mx-auto">
                    <h3 className="text-2xl font-medium text-gray-900 mb-4">
                        {language === 'ar' ? "كيف تعمل ميزة التجربة الافتراضية؟" : "How does Virtual Try-On work?"}
                    </h3>
                    <p className="text-gray-500 font-medium leading-relaxed mb-8">
                        {language === 'ar' 
                            ? "قومي برفع صورتك الشخصية وصورة الفستان المختار، وسيقوم نظامنا الذكي بدمجهما معاً لتري كيف سيبدو الفستان عليكي تماماً قبل أن تتخذي قرار الشراء أو الحجز." 
                            : "Upload your personal photo and the chosen dress photo, and our AI system will merge them together so you can see exactly how the dress will look on you before making a purchase or reservation."}
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold shadow-sm">1</div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{language === 'ar' ? "ارفعي صورتك" : "Upload Photo"}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold shadow-sm">2</div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{language === 'ar' ? "اختاري الفستان" : "Pick Dress"}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold shadow-sm">3</div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{language === 'ar' ? "شاهدي السحر" : "See Magic"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
