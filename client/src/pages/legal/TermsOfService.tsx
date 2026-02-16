import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { FileSignature, AlertCircle, Scale, CreditCard } from "lucide-react";

export default function TermsOfService() {
    const { language } = useLanguage();
    const isAr = language === 'ar';

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12"
                >
                    <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-8">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <FileSignature size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">
                                {isAr ? 'الشروط والأحكام' : 'Terms of Service'}
                            </h1>
                            <p className="text-gray-500 font-bold mt-2">
                                {isAr ? 'آخر تحديث: فبراير 2026' : 'Last Updated: February 2026'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-12 text-gray-600 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                                <Scale className="text-indigo-500" size={24} />
                                {isAr ? '1. شروط الاستخدام' : '1. Terms of Use'}
                            </h2>
                            <p className="mb-4">
                                {isAr
                                    ? 'باستخدامك لمنصة "فستان"، فإنك توافق على الالتزام بهذه الشروط. يجب ألا يقل عمر المستخدم عن 18 عاماً أو استخدام الموقع تحت إشراف ولي الأمر.'
                                    : 'By using the "Fustan" platform, you agree to follow these terms. Users must be at least 18 years old or use the site under parental supervision.'}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                                <CreditCard className="text-indigo-500" size={24} />
                                {isAr ? '2. الأسعار والمدفوعات' : '2. Pricing & Payments'}
                            </h2>
                            <p className="mb-4">
                                {isAr
                                    ? 'جميع الأسعار معروضة بالريال السعودي. نحن نسعى لتوفير أدق المعلومات السعرية، ولكن في حال وجود خطأ تقني في السعر، نحتفظ بالحق في إلغاء الطلب والتواصل معك.'
                                    : 'All prices are in SAR. We strive to provide accurate pricing, but in case of a technical error, we reserve the right to cancel the order and contact you.'}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                                <AlertCircle className="text-indigo-500" size={24} />
                                {isAr ? '3. سياسة الاستبدال والاسترجاع' : '3. Returns & Refunds Policy'}
                            </h2>
                            <p className="mb-4">
                                {isAr
                                    ? 'نظرًا لطبيعة فساتين السهرة والزفاف، يجب الحفاظ على المنتج في حالته الأصلية مع كافة التاغات. الاسترجاع متاح خلال 14 يوم عمل، مع تحملك لتكاليف الشحن إلا إذا كان الخطأ من طرفنا.'
                                    : 'Due to the nature of wedding and evening dresses, the product must be in its original condition with all tags. Returns are available within 14 business days, with the customer covering shipping costs unless the error is ours.'}
                            </p>
                        </section>

                        <section className="border-t border-gray-100 pt-8 font-black text-sm">
                            <p>{isAr ? 'ملاحظة: يحق لإدارة "فستان" تحديث هذه الشروط في أي وقت لتتواكب مع القوانين المحلية وتطور الخدمة.' : 'Note: Fustan moderation reserves the right to update these terms at any time to comply with local laws and service evolution.'}</p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
