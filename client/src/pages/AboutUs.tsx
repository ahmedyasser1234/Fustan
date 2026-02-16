import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function AboutUs() {
    const { language } = useLanguage();

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] pb-20">
            {/* Hero Section */}
            <section className="relative h-[60vh] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0">
                    <img
                        src="/about.png"
                        className="w-full h-full object-cover object-top"
                        alt="Atelier Background"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex flex-col items-center space-y-6">
                            <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md mb-6 border-white/30 px-6 py-2 text-sm font-bold uppercase tracking-[0.2em]">
                                {language === 'ar' ? "قصتنا" : "Our Story"}
                            </Badge>
                            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                                {language === 'ar' ? "حيث تلتقي الفخامة" : "Where Luxury Meets"} <br />
                                <span className="text-rose-200">{language === 'ar' ? "بالتقاليد العريقة" : "Timeless Traditions"}</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed font-bold">
                                {language === 'ar'
                                    ? "رحلة في عالم الأزياء الراقية، ننسج فيها خيوط الإبداع لنصنع لكِ إطلالة تخلد في الذاكرة."
                                    : "A journey into the world of haute couture, weaving threads of creativity to craft a look preserved in memory."}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="container mx-auto px-4 -mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Text Content */}
                    <motion.div
                        className="bg-white p-10 md:p-14 rounded-[3rem] shadow-xl border border-gray-100"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 leading-tight">
                            {language === 'ar' ? "أتيليه فستان: رؤية جديدة للأناقة" : "Atelier Fustan: A New Vision of Elegance"}
                        </h2>
                        <div className="space-y-6 text-gray-500 text-lg leading-relaxed font-medium text-justify" dir={language === 'ar' ? "rtl" : "ltr"}>
                            <p>
                                {language === 'ar'
                                    ? "منذ تأسيسنا، ونحن نؤمن بأن فستان الزفاف أو السهرة ليس مجرد قطعة قماش، بل هو تعبير عن شخصية المرأة ولحظاتها الأكثر تميزاً. في 'فستان'، نجمع بين الحرفية اليدوية الدقيقة وأحدث صيحات الموضة العالمية."
                                    : "Since our inception, we have believed that a wedding or evening dress is not just a piece of fabric, but an expression of a woman's personality and her most distinctive moments. At 'Fustan', we combine precise craftsmanship with the latest global fashion trends."}
                            </p>
                            <p>
                                {language === 'ar'
                                    ? "فريقنا من المصممين المحترفين يعمل بشغف لتحويل أحلامك إلى واقع ملموس، مستخدمين أرقى أنواع الأقمشة والتطريزات التي تليق بليلة العمر."
                                    : "Our team of professional designers works passionately to turn your dreams into tangible reality, using the finest fabrics and embroideries worthy of your big night."}
                            </p>
                        </div>

                        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { icon: Sparkles, textAr: "تصاميم حصرية", textEn: "Exclusive Designs" },
                                { icon: ShieldCheck, textAr: "جودة مضمونة", textEn: "Guaranteed Quality" },
                                { icon: CheckCircle2, textAr: "خامات فاخرة", textEn: "Luxury Fabrics" },
                                { icon: ArrowLeft, textAr: "خدمة ما بعد البيع", textEn: "After-Sales Service" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                        <item.icon size={20} />
                                    </div>
                                    <span className="font-bold text-gray-800">{language === 'ar' ? item.textAr : item.textEn}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Image Grid */}
                    <motion.div
                        className="grid grid-cols-2 gap-6"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="space-y-6 mt-12">
                            <img
                                src="https://images.unsplash.com/photo-1546193430-c2d207739ed7?q=80&w=1966&auto=format&fit=crop"
                                className="w-full aspect-[3/4] object-cover rounded-[2.5rem] shadow-lg hover:scale-[1.02] transition-transform duration-500"
                                alt="Detail 1"
                            />
                            <div className="bg-rose-600 p-8 rounded-[2.5rem] text-white text-center shadow-lg shadow-rose-200">
                                <span className="block text-4xl font-black mb-1">+15</span>
                                <span className="text-sm font-bold opacity-90">{language === 'ar' ? "عاماً من الخبرة" : "Years Experience"}</span>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white text-center shadow-xl">
                                <span className="block text-4xl font-black mb-1">5000+</span>
                                <span className="text-sm font-bold opacity-90">{language === 'ar' ? "عميلة سعيدة" : "Happy Clients"}</span>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1908&auto=format&fit=crop"
                                className="w-full aspect-[3/4] object-cover rounded-[2.5rem] shadow-lg hover:scale-[1.02] transition-transform duration-500"
                                alt="Detail 2"
                            />
                        </div>
                    </motion.div>

                </div>
            </section>
        </div>
    );
}
