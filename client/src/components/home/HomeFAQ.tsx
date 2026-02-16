import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/lib/i18n";
import { HelpCircle } from "lucide-react";

export function HomeFAQ() {
    const { language, t } = useLanguage();

    const faqs = [
        {
            qAr: "كم يستغرق الشحن والتوصيل؟",
            qEn: "How long does shipping take?",
            aAr: "يتم التوصيل داخل الرياض خلال 24 ساعة، ولباقي مدن المملكة خلال 3-5 أيام عمل.",
            aEn: "Delivery within Riyadh takes 24 hours, and 3-5 business days for other cities in the Kingdom."
        },
        {
            qAr: "هل يمكنني استبدال أو استرجاع الفستان؟",
            qEn: "Can I exchange or return the dress?",
            aAr: "نعم، يمكنك الاستبدال أو الاسترجاع مجاناً خلال 7 أيام من استلام الطلب، بشرط أن يكون المنتج بحالته الأصلية.",
            aEn: "Yes, you can exchange or return for free within 7 days of receiving the order, provided the product is in its original condition."
        },
        {
            qAr: "كيف أتأكد من المقاس المناسب؟",
            qEn: "How do I ensure the right size?",
            aAr: "نفر لك جدول مقاسات مفصل لكل منتج، كما يمكنك استخدام خدمة 'جربي الفستان' بالذكاء الاصطناعي لرؤية الشكل التقريبي.",
            aEn: "We provide a detailed size chart for each product, and you can use our AI 'Virtual Try-On' feature to see how it looks."
        },
        {
            qAr: "ما هي طرق الدفع المتاحة؟",
            qEn: "What payment methods are available?",
            aAr: "نقبل الدفع عبر مدى، فيزا، ماستركارد، Apple Pay، بالإضافة لخدمات التقسيط عبر تابي وتمارا.",
            aEn: "We accept Mada, Visa, Mastercard, Apple Pay, as well as installment services via Tabby and Tamara."
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-600 mb-6">
                        <HelpCircle size={24} />
                    </span>
                    <h2 className="text-4xl font-black text-gray-900 mb-4">
                        {t('faqTitle')}
                    </h2>
                    <p className="text-gray-500 font-bold">
                        {t('faqDesc')}
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border border-gray-100 rounded-3xl px-6 bg-gray-50/50 data-[state=open]:bg-white data-[state=open]:shadow-xl transition-all duration-300">
                            <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline text-gray-900">
                                {language === 'ar' ? faq.qAr : faq.qEn}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-500 text-base leading-relaxed pb-6 font-medium">
                                {language === 'ar' ? faq.aAr : faq.aEn}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
