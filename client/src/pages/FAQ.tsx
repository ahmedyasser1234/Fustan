import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { useState } from "react";

export default function FAQ() {
    const { language } = useLanguage();
    const isAr = language === 'ar';

    const faqs = [
        {
            q: isAr ? "كيف يمكنني استخدام ميزة القياس الافتراضي؟" : "How do I use the Virtual Try-On feature?",
            a: isAr
                ? "ببساطة، ادخلي لصفحة أي فستان يدعم الميزة، واضغطي على زر 'تجربة قياس ذكية'. ستحتاجين لرفع صورة شخصية واضحة (full-body) وسيقوم الذكاء الاصطناعي بتركيب الفستان عليها."
                : "Simply go to any dress page that supports the feature and click 'Smart Try-On'. You'll need to upload a clear full-body photo, and the AI will overlay the dress onto it."
        },
        {
            q: isAr ? "هل يمكنني إلغاء الطلب بعد الدفع؟" : "Can I cancel my order after payment?",
            a: isAr
                ? "نعم، يمكنك إلغاء الطلب خلال ساعتين من تنفيذه ما لم يتم البدء في عملية الشحن. يمكنك القيام بذلك عبر لوحة تحكم ملفك الشخصي."
                : "Yes, you can cancel your order within 2 hours of placement unless it has entered the shipping process. You can do this through your profile dashboard."
        },
        {
            q: isAr ? "كيف أتأكد من المقاس الصحيح لي؟" : "How do I know the right size for me?",
            a: isAr
                ? "نوفر جدول مقاسات دقيق لكل مصمم في صفحة المنتج. ننصحك باستخدام شريط قياس ومقارنة نتائجكِ بالجدول المعروض لضمان أفضل ملاءمة."
                : "We provide an accurate size chart for each designer on the product page. We recommend using a measuring tape and comparing your results with the chart to ensure the best fit."
        },
        {
            q: isAr ? "كم يستغرق التوصيل؟" : "How long does delivery take?",
            a: isAr
                ? "يستغرق التوصيل عادةً من ٣ إلى ٧ أيام عمل داخل المملكة، وقد تختلف المدة حسب موقع البائع وشركة الشحن المختارة."
                : "Delivery usually takes 3 to 7 business days within the Kingdom. Duration may vary depending on the vendor's location and the chosen shipping company."
        }
    ];

    return (
        <div className="min-h-screen bg-white pt-32 pb-20" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4 max-w-3xl">
                <header className="text-center mb-16">
                    <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-600 mx-auto mb-6">
                        <HelpCircle size={40} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                        {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
                    </h1>
                    <p className="text-gray-500 text-lg font-bold">
                        {isAr ? 'كل ما تودين معرفته عن رحلة تسوقكِ في فستان' : 'Everything you need to know about your shopping journey at Fustan'}
                    </p>
                </header>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} question={faq.q} answer={faq.a} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`border rounded-[2rem] transition-all duration-300 ${isOpen ? 'border-rose-200 bg-rose-50/20 shadow-lg shadow-rose-100' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-8 py-6 flex items-center justify-between text-right"
            >
                <span className="text-lg font-black text-gray-900">{question}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-8 pb-8 text-gray-600 font-bold leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
