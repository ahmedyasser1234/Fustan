import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface FlashSalesSectionProps {
    onQuickView: (product: any) => void;
}

export function FlashSalesSection({ onQuickView }: FlashSalesSectionProps) {
    const { language, t, dir } = useLanguage();

    // Fetch Discounted Products
    const { data: products, isLoading } = useQuery({
        queryKey: ['products', 'flash-sale'],
        queryFn: () => endpoints.products.list({ limit: 4 }) // Ideally filter by discount
    });

    const [timeLeft, setTimeLeft] = useState({
        hours: 12,
        minutes: 45,
        seconds: 30
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return prev; // Timer finished
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!isLoading && (!products || products.length === 0)) return null;

    return (
        <section className={`py-24 relative overflow-hidden ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={dir}>
            {/* Dark Luxury Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-0" />

            {/* Decorative Elements */}
            <div className={`absolute top-0 ${language === 'ar' ? 'right-0' : 'left-0'} w-96 h-96 bg-rose-600/20 blur-[100px] rounded-full`} />
            <div className={`absolute bottom-0 ${language === 'ar' ? 'left-0' : 'right-0'} w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full`} />

            <div className="container mx-auto px-4 relative z-10 w-full">
                <div className={`flex flex-col lg:flex-row ${language === 'ar' ? 'items-end' : 'items-start'} justify-between mb-16 gap-8`}>
                    <div className="text-white">
                        <div className={`flex items-center gap-3 mb-4 ${language === 'ar' ? 'justify-start' : 'justify-start'}`}>
                            <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                                {t('endingSoon')}
                            </span>
                            <span className="text-rose-400 text-xl font-bold">{language === 'ar' ? 'عرض مخصص لفترة محدودة' : 'Limited Time Offer'}</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                            {t('flashSaleTitle')}
                        </h2>

                        {/* Countdown Timer */}
                        <div className={`flex gap-4 ${language === 'ar' ? 'justify-start' : 'justify-start'} text-center`}>
                            {['hours', 'minutes', 'seconds'].map((unit, i) => (
                                <div key={unit} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[90px] border border-white/10">
                                    <div className="text-3xl font-black text-white mb-1">
                                        {String(timeLeft[unit as keyof typeof timeLeft]).padStart(2, '0')}
                                    </div>
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                        {t(unit as any)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Link href="/products?filter=offers">
                        <Button variant="outline" className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white hover:text-gray-900 font-bold hidden lg:flex">
                            {t('viewAllFlash')}
                        </Button>
                    </Link>
                </div>

                <div className="relative group/scroll">
                    <button 
                        onClick={() => {
                            const container = document.getElementById('flash-sales-scroll');
                            if (container) {
                                const amount = container.clientWidth * 0.8;
                                container.scrollBy({ left: language === 'ar' ? amount : -amount, behavior: 'smooth' });
                            }
                        }}
                        className={`absolute top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/10 ${language === 'ar' ? '-right-2' : '-left-2'} md:flex hover:bg-white/20 transition-colors text-white`}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button 
                        onClick={() => {
                            const container = document.getElementById('flash-sales-scroll');
                            if (container) {
                                const amount = container.clientWidth * 0.8;
                                container.scrollBy({ left: language === 'ar' ? -amount : amount, behavior: 'smooth' });
                            }
                        }}
                        className={`absolute top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/10 ${language === 'ar' ? '-left-2' : '-right-2'} md:flex hover:bg-white/20 transition-colors text-white`}
                    >
                        <ChevronRight size={16} />
                    </button>

                    <div 
                        id="flash-sales-scroll"
                        className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-8 md:pb-0 px-2 md:px-0 -mx-2 md:mx-0 scroll-smooth"
                    >
                        {isLoading ? (
                            Array(4).fill({}).map((_, i) => (
                                <Skeleton key={i} className="aspect-[2/3] w-[46%] sm:w-72 flex-shrink-0 md:w-auto rounded-[30px] bg-white/5" />
                            ))
                        ) : (
                            products?.map((product: any, i: number) => (
                                <div key={i} className="bg-white rounded-[2rem] p-3 shadow-2xl shadow-black/20 w-[46%] sm:w-72 flex-shrink-0 md:w-auto">
                                    <ProductCard
                                        product={{ ...product, discount: 30 }} // Mocking high discount 
                                        index={i}
                                        onQuickView={onQuickView}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
