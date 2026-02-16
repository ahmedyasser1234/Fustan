import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Link } from "wouter";
import { ChevronRight, Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function VendorsSection() {
    const { language } = useLanguage();
    const { data: vendors, isLoading } = useQuery({
        queryKey: ['vendors'],
        queryFn: () => endpoints.vendors.list()
    });

    const activeVendors = vendors?.filter((v: any) =>
        v.isActive &&
        !v.storeSlug?.toLowerCase().includes('admin') &&
        !v.storeSlug?.toLowerCase().includes('support') &&
        !v.storeNameAr?.includes('دعم')
    ) || [];

    // if (!isLoading && activeVendors.length === 0) return null; // Force render for now to debug visibility

    return (
        <section className="pt-20 pb-0 bg-white relative overflow-hidden">
            {/* Elegant Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-10 md:mb-16">
                    <span className="font-serif italic text-xl md:text-2xl text-rose-500 mb-2 block">{language === 'ar' ? "شركاؤنا" : "Our Partners"}</span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900">{language === 'ar' ? "بيوت الأزياء" : "Fashion Houses"}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {isLoading ? (
                        Array(4).fill({}).map((_, i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 h-full flex flex-col items-center">
                                <Skeleton className="w-24 h-24 rounded-full mb-6" />
                                <Skeleton className="h-6 w-3/4 mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3 mt-auto" />
                            </div>
                        ))
                    ) : activeVendors.length > 0 ? (
                        activeVendors.map((vendor: any) => (
                            <Link href={`/vendor/${vendor.storeSlug}`} key={vendor.id}>
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 cursor-pointer h-full flex flex-col items-center text-center group transition-all hover:shadow-2xl hover:border-rose-100"
                                >
                                    <div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-gray-100 mb-6 overflow-hidden relative group-hover:border-rose-200 transition-colors">
                                        {vendor.logo ? (
                                            <img src={vendor.logo} alt={language === 'ar' ? vendor.storeNameAr : vendor.storeNameEn} className="w-full h-full object-cover" />
                                        ) : (
                                            <Store className="w-10 h-10 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        )}
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2">{language === 'ar' ? vendor.storeNameAr : vendor.storeNameEn}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{language === 'ar' ? vendor.descriptionAr : vendor.descriptionEn}</p>
                                    <div className="mt-auto flex items-center gap-2 text-rose-600 font-bold group-hover:gap-3 transition-all">
                                        <span>{language === 'ar' ? 'زيارة المتجر' : 'Visit Store'}</span>
                                        <ChevronRight size={16} className={language === 'ar' ? "rotate-180" : ""} />
                                    </div>
                                </motion.div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-1 md:col-span-2 lg:col-span-4 py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-xl font-bold text-gray-400">
                                {language === 'ar' ? "لا توجد بيوت أزياء متاحة حالياً" : "No fashion houses available right now"}
                            </p>
                        </div>
                    )}
                </div>

                {/* View All Button - Luxury Minimalist Style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 text-center"
                >
                    <Link href="/vendors">
                        <Button variant="outline" className="rounded-full px-8 md:px-12 h-12 md:h-16 border-2 border-gray-200 hover:border-[oklch(58.6%_0.253_17.585)] text-gray-900 hover:bg-transparent hover:text-[oklch(58.6%_0.253_17.585)] transition-all duration-500 text-base md:text-lg font-bold group">
                            {language === 'ar' ? 'عرض جميع بيوت الأزياء' : 'Explore All Fashion Houses'}
                            <ArrowRight className={`ml-2 md:ml-3 group-hover:translate-x-2 transition-transform ${language === 'ar' ? 'rotate-180 mr-2 md:mr-3 ml-0' : ''}`} size={18} />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
