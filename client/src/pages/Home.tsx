import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, ChevronRight, ChevronLeft, ShieldCheck, Zap, CreditCard, Truck, RefreshCw, Headset, Instagram } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { ProductCard } from "@/components/ProductCard";
import { TryOnSection } from "@/components/product/TryOnSection";
import { VendorsSection } from "@/components/home/VendorsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewModal } from "@/components/home/ReviewModal";
import { QuickViewModal } from "@/components/home/QuickViewModal";
import { FlashSalesSection } from "@/components/home/FlashSalesSection";
import { AppointmentSection } from "@/components/home/AppointmentSection";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { SEO } from "@/components/SEO";
import { BackToTop } from "@/components/ui/BackToTop";

import { useRef } from "react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const { user } = useAuth();
  const { t, language, formatPrice, dir } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [currentFlowerIndex, setCurrentFlowerIndex] = useState(0);
  const [currentArchedIndex, setCurrentArchedIndex] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const productsPerPage = 4;

  const videos = ["/123.mp4", "/12345.mp4", "/1234.mp4"];

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => endpoints.categories.list()
  });

  // Fetch Collections
  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => endpoints.collections.list()
  });

  // Fetch Featured Products (Limited to 4)
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => endpoints.products.list({ limit: 4 })
  });

  // Fetch New Arrivals (Latest products)
  const { data: newArrivals, isLoading: newArrivalsLoading } = useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => endpoints.products.list({ limit: 6, orderBy: 'createdAt' })
  });

  // Fetch Best Sellers (Most viewed/popular products)
  const { data: bestSellers, isLoading: bestSellersLoading } = useQuery({
    queryKey: ['products', 'bestsellers'],
    queryFn: () => endpoints.products.list({ limit: 6 })
  });

  // Fetch All/Filtered Products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => endpoints.products.list({ collectionId: selectedCategory ?? undefined, limit: 12 })
  });

  // Fetch Store Reviews
  const { data: storeReviews, isLoading: storeReviewsLoading } = useQuery({
    queryKey: ['storeReviews'],
    queryFn: endpoints.storeReviews.list
  });

  const { data: socialFeedData, isLoading: socialLoading } = useQuery({
    queryKey: ['content', 'social_feed'],
    queryFn: () => endpoints.content.list('social_feed')
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 10000);
    return () => clearTimeout(timer);
  }, [currentVideo, videos.length]);

  const handleNextProduct = () => {
    if (!featuredProducts) return;
    setCurrentProductIndex((prev) => (prev + 1) % Math.ceil((featuredProducts.length || 1) / productsPerPage));
  };

  const handlePrevProduct = () => {
    if (!featuredProducts) return;
    setCurrentProductIndex((prev) => (prev - 1 + Math.ceil((featuredProducts.length || 1) / productsPerPage)) % Math.ceil((featuredProducts.length || 1) / productsPerPage));
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      const currentScroll = tabsRef.current.scrollLeft;
      // For RTL, scroll direction might be inverted depending on browser implementation,
      // but standard scrollTo handles this if dir="rtl" is set on parent.
      // We use a safe approach for both LTR/RTL.
      const isRTL = language === 'ar';
      let offset = direction === 'right' ? scrollAmount : -scrollAmount;
      if (isRTL) offset = -offset;

      tabsRef.current.scrollBy({
        left: offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`min-h-screen bg-[#fafafa] pb-24 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={dir}>
      <SEO />
      {/* Ultra-Premium Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Main Background Video */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.video
              key={videos[currentVideo]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-center absolute inset-0"
            >
              <source src={videos[currentVideo]} type="video/mp4" />
            </motion.video>
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/40"></div>
        </div >


        {/* Logo at Bottom Side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className={`absolute bottom-12 ${language === 'ar' ? 'right-12 lg:right-24' : 'left-12 lg:left-24'} lg:bottom-24 z-30 hidden lg:block`}
        >
          <img
            src="/logo-white.png"
            alt="Fustan Logo"
            className="w-48 lg:w-64 object-contain drop-shadow-xl"
          />
        </motion.div>

        {/* Content Container */}
        <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, x: language === 'ar' ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className={`max-w-3xl ${language === 'ar'
              ? 'mr-auto lg:mr-[40%] text-right lg:-translate-x-[300px]'
              : 'ml-auto lg:ml-[40%] text-left lg:translate-x-[300px]'
              }`}
          >
            <div className="flex flex-col items-start space-y-6">
              <h2 className="text-white leading-tight drop-shadow-2xl font-black w-full">
                <span className="text-2xl sm:text-4xl lg:text-6xl block mb-1 lg:mb-2">{t('heroTitlePart1')}</span>
                <span className="text-4xl sm:text-6xl lg:text-8xl text-white/90 leading-[1.1] sm:leading-tight">{t('heroTitlePart2')}</span>
              </h2>

              <p className="hidden sm:block text-xl lg:text-2xl text-white/95 max-w-xl leading-relaxed font-bold drop-shadow-md">
                {t('heroDesc')}
              </p>

              <div className="flex gap-4 sm:gap-6 flex-wrap justify-start pt-4 sm:pt-8 w-full">
                <Link href="/products">
                  <Button size="lg" className="h-12 sm:h-16 px-8 sm:px-12 rounded-full bg-[oklch(58.6%_0.253_17.585)] hover:bg-[oklch(58.6%_0.253_17.585)]/90 text-white text-base sm:text-xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95">
                    {t('shopNow')}
                  </Button>
                </Link>
                <Link href="/products?sort=newest">
                  <Button size="lg" variant="outline" className="h-12 sm:h-16 px-8 sm:px-12 rounded-full border-2 border-white/30 text-white backdrop-blur-md text-base sm:text-xl font-black hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
                    {t('newCollection')}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section >

      {/* Features / Trust Signals Section */}
      < section className="bg-white py-12 border-b border-gray-50 relative z-20" >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, titleAr: "شحن سريع ومجاني", titleEn: "Fast & Free Shipping", descAr: "للطلبات فوق 500 ر.س", descEn: "Orders over 500 SAR" },
              { icon: ShieldCheck, titleAr: "ضمان الجودة", titleEn: "Quality Guarantee", descAr: "منتجات أصلية 100%", descEn: "100% Authentic" },
              { icon: RefreshCw, titleAr: "استبدال سهل", titleEn: "Easy Returns", descAr: "خلال 14 يوم", descEn: "Within 14 days" },
              { icon: Headset, titleAr: "دعم 24/7", titleEn: "24/7 Support", descAr: "نحن هنا لمساعدتك", descEn: "Here to help you" },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <feature.icon size={28} />
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">{language === 'ar' ? feature.titleAr : feature.titleEn}</h3>
                <p className="text-gray-500 font-bold text-sm">{language === 'ar' ? feature.descAr : feature.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Featured Products */}
      < section className="pt-20 pb-0 relative z-20" >
        <div className="absolute inset-x-0 top-0 bottom-[200px] bg-white -z-10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 pt-20"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">{t('mostFeatured')}</h2>
            <p className="text-slate-500 text-lg font-bold">{t('mostFeaturedDesc')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {(featuredLoading ? Array(4).fill({}) : (featuredProducts as any[] || [])).map((product: any, i: number) => (
              featuredLoading ? (
                <div key={i} className="space-y-6">
                  <Skeleton className="aspect-[2/3] w-full rounded-[40px]" />
                  <div className="space-y-3 px-4">
                    <Skeleton className="h-6 w-3/4 mr-auto" />
                    <Skeleton className="h-4 w-1/2 mr-auto" />
                  </div>
                </div>
              ) : (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group relative w-full aspect-[2/3]"
                >

                  {/* Product Content 'Capsule' */}
                  <Link href={`/products/${product.id}`}>
                    <div className="relative z-10 h-full w-full rounded-[30px] overflow-hidden shadow-2xl hover:shadow-purple-200/50 transition-all duration-500">
                      <div className="h-full w-full relative flex flex-col">
                        {/* Product Image - Full Height */}
                        <div className="flex-grow w-full relative h-full overflow-hidden bg-white">
                          <img
                            src={product.images?.[0] || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"}
                            alt={language === 'ar' ? product.nameAr : product.nameEn}
                            className="w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>

                        {/* Purple Bottom Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-0 opacity-0 bg-[oklch(58.6%_0.253_17.585)]/10 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 transition-all duration-300 group-hover:h-[40%] group-hover:opacity-100 overflow-hidden">
                          {/* Product Name */}
                          <h3 className="text-2xl font-bold text-white mb-2 leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                            {language === 'ar' ? product.nameAr : product.nameEn}
                          </h3>

                          {/* Price */}
                          <p className="text-white/90 text-lg font-medium mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                            {formatPrice(product.price)}
                          </p>

                          {/* More Button */}
                          <Button className="bg-[oklch(58.6%_0.253_17.585)] text-white hover:bg-[oklch(58.6%_0.253_17.585)]/90 rounded-full px-8 py-1 h-8 text-sm font-bold shadow-sm transition-transform hover:scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                            {t('more')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            ))}
          </div>
        </div>
      </section >

      {/* Collections Section */}
      < section className="pt-0 pb-24 relative z-20" >
        <div className="absolute inset-x-0 top-0 bottom-0 bg-[#f2f2f2] -z-10" />
        <div className="container mx-auto px-4 relative z-10">

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 pt-20"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">{t('shopByOccasion')}</h2>
            <p className="text-slate-500 text-lg font-bold">{t('shopByOccasionDesc')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {(collectionsLoading ? Array(3).fill({}) : (collections as any[] || [])).map((collection: any, i: number) => (
              collectionsLoading ? (
                <Skeleton key={i} className="aspect-[2/3] w-full rounded-[40px]" />
              ) : (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group relative w-full aspect-[2/3]"
                >
                  {/* Collection Card */}
                  <Link href={`/products?collection=${collection.id}`}>
                    <div className="relative z-10 h-full w-full rounded-[40px] overflow-hidden shadow-2xl hover:shadow-purple-200/50 transition-all duration-500 bg-white">
                      <div className="h-full w-full relative flex flex-col">
                        {/* Collection Image */}
                        <div className="flex-grow w-full relative h-full overflow-hidden">
                          <img
                            src={collection.coverImage || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"}
                            alt={language === 'ar' ? collection.nameAr : collection.nameEn}
                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>

                        {/* Purple Bottom Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-0 opacity-0 bg-[oklch(58.6%_0.253_17.585)]/10 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 transition-all duration-300 group-hover:h-[45%] group-hover:opacity-100 overflow-hidden">
                          <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                            {language === 'ar' ? collection.nameAr : collection.nameEn}
                          </h3>

                          <div className="flex items-center gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                            <div className="h-1 w-12 bg-white rounded-full" />
                            <p className="text-white/90 text-lg font-bold">
                              {collection.productsCount || 0} {language === 'ar' ? 'منتج' : 'Products'}
                            </p>
                          </div>

                          <Button className="bg-white text-[oklch(58.6%_0.253_17.585)] hover:bg-white/90 rounded-full px-8 py-1 h-8 text-sm font-black shadow-sm transition-transform hover:scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                            {t('shopNow')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            ))}
          </div>
        </div>
      </section >

      {/* Split Banner Section (Classic Stocking Styles) */}
      < section className="py-24 bg-[#FDF8F6] relative overflow-hidden" >
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2 relative"
            >
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden relative shadow-2xl">
                <img
                  src="https://res.cloudinary.com/dk3wwuy5d/image/upload/v1771351298/Gemini_Generated_Image_mcjdegmcjdegmcjd_aipe9g.png"
                  alt="Classic Stocking Styles"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Floating Element */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 hidden lg:block">
                <img
                  src="https://res.cloudinary.com/dk3wwuy5d/image/upload/v1771283205/bx7ynzjvphc5luwc9ore.png"
                  alt="Detail"
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl"
                />
              </div>
            </motion.div>

            {/* Text Side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2 text-center lg:text-left rtl:lg:text-right"
            >
              <span className="font-serif italic text-3xl text-rose-500 mb-4 block">Timeless Charm</span>
              <h2 className="text-5xl lg:text-7xl font-serif text-gray-900 mb-6 leading-tight">
                {t('classicStyles')}
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                {t('classicStylesDesc')}
              </p>
              <Link href="/products">
                <Button className="bg-rose-900 text-white px-10 py-6 rounded-full text-lg font-bold hover:bg-rose-800 transition-all hover:scale-105 shadow-xl">
                  {t('shopNow')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section >

      {/* Trending Products Tabbed Section */}
      < section className="py-24 bg-white" >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="font-serif italic text-2xl text-rose-500 mb-2 block">Shop the Latest</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">{t('trendingProducts')}</h2>
          </div>

          <Tabs defaultValue="all" value={selectedCategory === null ? "all" : selectedCategory.toString()} onValueChange={(val) => setSelectedCategory(val === 'all' ? null : Number(val))} className="w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="relative group/tabs flex items-center">
              <button
                onClick={() => scrollTabs('left')}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100 md:hidden hover:bg-rose-50 transition-colors text-gray-600"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="w-full overflow-hidden relative">
                <TabsList
                  ref={tabsRef}
                  className="w-full flex justify-start md:justify-center bg-transparent border-b border-gray-100 mb-12 h-auto p-0 gap-4 md:gap-8 flex-nowrap overflow-x-auto no-scrollbar scroll-smooth"
                >
                  <TabsTrigger
                    value="all"
                    className="bg-transparent border-b-4 border-transparent data-[state=active]:border-rose-500 data-[state=active]:text-rose-600 rounded-none px-4 py-4 text-base md:text-lg font-bold text-gray-400 hover:text-rose-400 transition-all uppercase tracking-wider whitespace-nowrap"
                  >
                    {t('all')}
                  </TabsTrigger>
                  {collections?.map((col: any) => (
                    <TabsTrigger
                      key={col.id}
                      value={col.id.toString()}
                      className="bg-transparent border-b-4 border-transparent data-[state=active]:border-rose-500 data-[state=active]:text-rose-600 rounded-none px-4 py-4 text-base md:text-lg font-bold text-gray-400 hover:text-rose-400 transition-all uppercase tracking-wider whitespace-nowrap"
                    >
                      {language === 'ar' ? col.nameAr : col.nameEn}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <button
                onClick={() => scrollTabs('right')}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100 md:hidden hover:bg-rose-50 transition-colors text-gray-600"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <TabsContent value={selectedCategory === null ? "all" : selectedCategory.toString()} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {(productsLoading ? Array(8).fill({}) : (products as any[] || [])).map((product: any, i: number) => (
                  <ProductCard key={i} product={product} loading={productsLoading} onQuickView={setQuickViewProduct} />
                ))}
              </div>
              {!productsLoading && (!products || products.length === 0) && (
                <div className="w-full py-20 text-center text-gray-400 bg-gray-50 rounded-[3rem]">
                  <p className="text-xl font-bold">{t('noProductsInCollection')}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section >

      {/* Flash Sales Section */}
      <FlashSalesSection onQuickView={setQuickViewProduct} />

      {/* Vendors Section (Already a component, will check later) */}
      < VendorsSection />

      {/* Appointment Booking Section */}
      <AppointmentSection />

      {/* New Arrivals Section */}
      < section className="bg-white relative overflow-hidden pb-32 z-10 pt-0" >
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">{t('newArrivals')}</h2>
            <p className="text-slate-500 text-lg font-bold">{t('newArrivalsDesc')}</p>
          </motion.div>

          {/* New Arrivals Grid / Slider */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {newArrivalsLoading ? (
                Array(3).fill({}).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] w-full rounded-[45px]" />
                ))
              ) : (
                (() => {
                  const items = newArrivals as any[] || [];
                  if (items.length === 0) return null;
                  const visible = [];
                  for (let i = 0; i < 3; i++) {
                    if (items.length > 0) visible.push(items[(currentFlowerIndex + i) % items.length]);
                  }
                  return visible.map((product: any, i: number) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="flex flex-col drop-shadow-2xl"
                    >
                      <Link href={`/products/${product.id}`}>
                        <div className="relative group cursor-pointer h-full flex flex-col shadow-2xl rounded-[45px] overflow-hidden">
                          <div className="bg-white aspect-[3/4] overflow-hidden">
                            <img
                              src={product.images?.[0]}
                              alt={product.nameAr}
                              className="w-full h-full object-contain object-bottom transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-0 opacity-0 bg-[oklch(58.6%_0.253_17.585)]/20 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 transition-all duration-300 group-hover:h-[40%] group-hover:opacity-100 overflow-hidden z-20">
                            <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                              {language === 'ar' ? product.nameAr : product.nameEn}
                            </h3>
                            <p className="text-white/90 text-lg font-bold mb-4">
                              {formatPrice(product.price)}
                            </p>
                            <Button className="bg-[oklch(58.6%_0.253_17.585)] text-white hover:bg-[oklch(58.6%_0.253_17.585)]/90 rounded-full px-8 py-2 h-10 text-base font-black shadow-lg transition-transform hover:scale-105">
                              {t('more')}
                            </Button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ));
                })()
              )}
            </div>
          </div>
        </div>
      </section >

      {/* Best Sellers Section */}
      < section className="pt-0 pb-24 relative z-20" >
        <div className="absolute inset-0 bg-white -z-10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 pt-20"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">{t('bestSellers')}</h2>
            <p className="text-slate-500 text-lg font-bold">{t('bestSellersDesc')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {(bestSellersLoading ? Array(3).fill({}) : (bestSellers as any[] || []).slice(0, 3)).map((product: any, i: number) => (
              bestSellersLoading ? (
                <Skeleton key={i} className="aspect-[2/3] w-full rounded-[40px]" />
              ) : (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group relative w-full aspect-[2/3]"
                >
                  <Link href={`/products/${product.id}`}>
                    <div className="relative z-10 h-full w-full rounded-[40px] overflow-hidden shadow-2xl hover:shadow-purple-200/50 transition-all duration-500 bg-white">
                      <div className="h-full w-full relative flex flex-col">
                        <div className="flex-grow w-full relative h-full overflow-hidden">
                          <img
                            src={product.images?.[0]}
                            alt={language === 'ar' ? product.nameAr : product.nameEn}
                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-0 opacity-0 bg-[oklch(58.6%_0.253_17.585)]/10 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 transition-all duration-300 group-hover:h-[45%] group-hover:opacity-100 overflow-hidden">
                          <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
                            {language === 'ar' ? product.nameAr : product.nameEn}
                          </h3>
                          <p className="text-white/90 text-lg font-bold mb-4">
                            {formatPrice(product.price)}
                          </p>
                          <Button className="bg-white text-[oklch(58.6%_0.253_17.585)] hover:bg-white/90 rounded-full px-8 py-1 h-8 text-sm font-black shadow-sm transition-transform hover:scale-105">
                            {t('more')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            ))}
          </div>
        </div>
      </section >

      {/* AI Try-On Teaser Section */}
      < section className="py-16 bg-[#f2f2f2] w-full" >
        <div className="w-full">
          <TryOnSection
            productName={language === 'ar' ? "فستان سهرة فاخر" : "Luxury Evening Dress"}
            productImage="https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=60"
            productDescription={language === 'ar' ? "فستان سهرة أنيق باللون الأحمر" : "Elegant red evening dress"}
          />
        </div>
      </section >

      {/* Luxury Collection Banner */}
      <section className="py-12 md:py-24 bg-white container mx-auto px-4 max-w-7xl">
        <div className="relative h-[400px] md:h-[600px] rounded-3xl md:rounded-[4rem] overflow-hidden group shadow-2xl transition-all duration-500">
          <img
            src="https://juliafashionshop.com/cdn/shop/files/O1CN01lYXWFs1FtCW6vFVYK__3175780544-0-cib_d79e31c8-2930-4724-b59b-bcd2aea4846a_1000x.jpg?v=1760439331"
            alt="Exclusive"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ${language === 'ar' ? 'object-left' : 'object-right'
              }`}
          />
          <div className={`absolute inset-0 ${language === 'ar'
            ? 'bg-gradient-to-l from-white/95 via-white/40 to-transparent md:via-white/20 md:to-black/60 justify-start'
            : 'bg-gradient-to-r from-white/95 via-white/40 to-transparent md:via-white/20 md:to-black/60 justify-start'
            } flex items-center p-6 sm:p-12 md:p-24`}>
            <div className={`max-w-2xl ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <motion.h2
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 sm:mb-8 leading-tight"
              >
                {t('exclusiveExperience')}
              </motion.h2>
              <p className="text-base sm:text-xl text-gray-800 mb-6 sm:mb-10 leading-relaxed font-medium max-w-md md:max-w-xl">
                {t('exclusiveExperienceDesc')}
              </p>
              <Button size="lg" className="h-12 sm:h-16 px-8 sm:px-12 rounded-full bg-white text-gray-900 border-2 border-gray-100 hover:bg-rose-50 hover:text-rose-600 text-base sm:text-xl font-bold shadow-xl md:shadow-2xl transition-all">
                {t('discoverExclusive')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="font-serif italic text-2xl text-rose-500 mb-2 block">
              {language === 'ar' ? "آراء عملائنا" : "Customer Reviews"}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              {language === 'ar' ? "تجارب التسوق" : "Shopping Experiences"}
            </h2>
          </div>

          <div className="flex justify-center mb-12">
            <ReviewModal />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 px-4">
            {storeReviewsLoading ? (
              Array(3).fill({}).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-[3rem] bg-white/10 backdrop-blur-sm" />
              ))
            ) : (storeReviews?.length === 0 ? (
              <div className="col-span-3 text-center text-white/80 text-xl py-12 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/10">
                {language === 'ar' ? "كن أول من يقيمنا!" : "Be the first to review us!"}
              </div>
            ) : (
              (storeReviews as any[])?.slice(0, 3).map((review: any, i: number) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[3rem] p-10 shadow-xl relative group hover:-translate-y-2 transition-transform duration-300"
                >
                  <div className="absolute top-10 right-10 text-6xl text-rose-100 font-serif opacity-50">"</div>

                  <div className="flex gap-1 mb-6 text-yellow-400">
                    {Array(review.rating).fill(0).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>

                  <p className="text-gray-600 text-lg leading-relaxed mb-8 font-medium line-clamp-4">
                    {review.comment}
                  </p>

                  <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-xl font-bold text-rose-500">
                      {review.guestName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{review.guestName}</h4>
                      <p className="text-sm text-gray-400 font-medium">{review.city}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ))}
          </div>
        </div>
      </section >

      {/* Social Feed Section */}
      < section className="py-12 relative z-20" >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                <Instagram className="text-rose-600" size={32} />
                @ahmedyasser1456
              </h2>
              <p className="text-gray-500 font-bold">{language === 'ar' ? "تابعينا على انستقرام" : "Follow us on Instagram"}</p>
            </div>
            <a href="https://www.instagram.com/ahmedyasser1456/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-full px-8 h-12 border-2 border-gray-200 hover:border-rose-600 hover:text-rose-600 font-bold">
                {language === 'ar' ? "مشاهدة الكل" : "View All"}
              </Button>
            </a>
          </div>

          {socialLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-[2rem]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(socialFeedData as any[] || []).map((item: any, i: number) => (
                <a
                  key={i}
                  href={item.data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square rounded-[2rem] overflow-hidden group relative cursor-pointer block"
                >
                  <img src={item.data.imageUrl} alt="Instagram" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Instagram size={28} />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section >

      {/* Professional Newsletter */}
      < section className="py-24 bg-[#f2f2f2]" >
        <div className="container mx-auto px-4 max-w-5xl rounded-[3rem] bg-gray-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full" />
          <div className="relative z-10 py-20 px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6 underline decoration-rose-600 underline-offset-[12px]">{t('joinElite')}</h2>
            <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto">
              {t('joinEliteDesc')}
            </p>
            <div className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="flex-1 px-8 py-5 rounded-full bg-white/10 border border-white/20 text-white focus:outline-none focus:border-rose-500 backdrop-blur-md text-lg"
              />
              <Button className="h-full py-5 px-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg">
                {t('subscribe')}
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <HomeFAQ />

      <BackToTop />

      <QuickViewModal
        initialProduct={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
