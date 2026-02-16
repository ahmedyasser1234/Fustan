import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicy() {
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
                        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">
                                {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
                            </h1>
                            <p className="text-gray-500 font-bold mt-2">
                                {isAr ? 'آخر تحديث: فبراير 2026' : 'Last Updated: February 2026'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-12 text-gray-600 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                                <Eye className="text-rose-500" size={24} />
                                {isAr ? '1. المعلومات التي نجمعها' : '1. Information We Collect'}
                            </h2>
                            <p className="mb-4">
                                {isAr
                                    ? 'نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند التسجيل، مثل الاسم، البريد الإلكتروني، ورقم الهاتف. كما نجمع بيانات تلقائية حول جهازك وكيفية استخدامك للموقع لتحسين تجربتك، بما في ذلك ملفات تعريف الارتباط (Cookies).'
                                    : 'We collect information you provide directly to us upon registration, such as name, email, and phone number. We also automatically collect data about your device and how you use the site to improve your experience, including cookies.'}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                                <Lock className="text-rose-500" size={24} />
                                {isAr ? '2. كيف نستخدم معلوماتك' : '2. How We Use Your Information'}
                            </h2>
                            <ul className={`space-y-3 list-disc ${isAr ? 'pr-6' : 'pl-6'}`}>
                                <li>{isAr ? 'لإتمام طلبات الشراء وتوصيل المنتجات وتقديم خدمات الدعم الفني.' : 'To process orders, deliver products, and provide technical support.'}</li>
                                <li>{isAr ? 'لتخصيص تجربتك وعرض المنتجات التي قد تهمك بناءً على تفضيلاتك.' : 'To personalize your experience and show products that may interest you based on your preferences.'}</li>
                                <li>{isAr ? 'لإرسال تحديثات حالة الطلب والعروض الترويجية (يمكنك إلغاء الاشتراك في أي وقت).' : 'To send order status updates and promotional offers (you can unsubscribe at any time).'}</li>
                                <li>{isAr ? 'لحماية المنصة من الاحتيال والأنشطة غير القانونية.' : 'To protect the platform from fraud and illegal activities.'}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                                <FileText className="text-rose-500" size={24} />
                                {isAr ? '3. مشاركة وحماية البيانات' : '3. Data Sharing & Protection'}
                            </h2>
                            <p className="mb-4">
                                {isAr
                                    ? 'نحن نلتزم بأعلى معايير الأمان لحماية بياناتك. لا نبيع معلوماتك الشخصية لأطراف ثالثة. يتم مشاركة البيانات فقط مع شركات الشحن لإيصال طلبك، وبوابات الدفع لإتمام المعاملات المالية بشكل آمن.'
                                    : 'We adhere to the highest security standards to protect your data. We do not sell your personal information to third parties. Data is only shared with shipping companies to deliver your order and payment gateways to securely process financial transactions.'}
                            </p>
                        </section>

                        <section className="bg-rose-50/50 p-6 rounded-3xl">
                            <h2 className="text-xl font-black text-gray-900 mb-4">
                                {isAr ? 'حقوقك كعضوة في فستان' : 'Your Rights as a Fustan Member'}
                            </h2>
                            <p className="text-sm font-bold text-gray-600">
                                {isAr
                                    ? 'لك الحق في الوصول إلى بياناتك، تعديلها، أو طلب مسحها نهائياً من أنظمتنا في أي وقت عبر إرسال بريد إلكتروني لخدمة العملاء.'
                                    : 'You have the right to access, edit, or request the permanent deletion of your data from our systems at any time by emailing our customer support.'}
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
