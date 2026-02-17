import { useState, useEffect, useMemo } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Share2,
  Ruler,
  Store,
  ZoomIn,
  User,
  Plus,
  Minus,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Sparkles,
  Tag,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAddToCart } from "@/hooks/useAddToCart";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useChat } from "@/contexts/ChatContext";
import { ProductCard } from "@/components/ProductCard";
import { TryOnSection } from "@/components/product/TryOnSection";
import { SEO } from "@/components/SEO";
import { QuickViewModal } from "@/components/home/QuickViewModal";

function RelatedProducts({ collectionId, currentProductId, language }: { collectionId?: number, currentProductId: number, language: string }) {
  const { t } = useLanguage();
  const { data: relatedProducts, isLoading } = useQuery({
    queryKey: ['products', 'related', collectionId],
    queryFn: () => endpoints.products.list({ collectionId }),
    enabled: !!collectionId
  });

  if (isLoading || !relatedProducts || !Array.isArray(relatedProducts) || relatedProducts.length <= 1) return null;

  // Filter out the current product
  const productsToShow = relatedProducts.filter((p: any) => p.id !== currentProductId).slice(0, 4);

  if (productsToShow.length === 0) return null;

  return (
    <div className="mt-32 border-t border-gray-100 pt-20">
      <div className="flex items-center justify-between mb-12" dir="rtl">
        <h2 className="text-3xl font-black text-gray-900">{language === 'ar' ? "منتجات قد تعجبك" : "Products You May Like"}</h2>
        <Link href="/products">
          <Button variant="ghost" className="text-rose-600 font-bold hover:bg-rose-50 rounded-full">
            {t('viewAll')} <ChevronRight className={`mr-2 w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {productsToShow.map((product: any, idx: number) => (
          <ProductCard key={product.id} product={product} index={idx} />
        ))}
      </div>
    </div>
  );
}

function OffersDisplay({ vendorId, productId, language }: { vendorId?: number, productId: number, language: string }) {
  const { data: offers } = useQuery({
    queryKey: ['offers', 'product', productId],
    queryFn: async () => {
      if (!vendorId) return [];
      // Fetch all vendor offers and filter for this product
      const res = await api.get(`/offers?vendorId=${vendorId}`);
      const allOffers = res.data;
      const now = new Date();

      // Filter offers that include this product and are active
      // Note: We need to know if offer applies to this product. 
      // Since backend return format might verify, let's assume we filter by productIds if available 
      // OR if backend response includes productIds. 
      // My previous update to OffersService.findAll included productIds.

      return allOffers.filter((o: any) => {
        const now = new Date();
        const startDate = new Date(o.startDate);
        const endDate = new Date(o.endDate);
        // Set end date to end of day to be inclusive
        endDate.setHours(23, 59, 59, 999);

        return o.isActive &&
          startDate <= now &&
          endDate >= now &&
          (!o.productIds || o.productIds.length === 0 || o.productIds.includes(productId));
      });
    },
    enabled: !!vendorId
  });

  if (!offers || offers.length === 0) return null;

  return (
    <div className="container mx-auto px-4 mt-6">
      <div className="grid gap-4">
        {offers.map((offer: any) => (
          <div key={offer.id} className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 p-4 rounded-xl flex items-center justify-between shadow-sm animate-pulse" dir="rtl">
            <div className="flex items-center gap-3">
              <div className="bg-rose-500 text-white p-2 rounded-full">
                <Tag size={20} />
              </div>
              <div>
                <h3 className="font-bold text-rose-700 text-lg">
                  {language === 'ar' ? offer.nameAr : offer.nameEn}
                </h3>
                <p className="text-rose-600 text-sm font-medium">
                  {language === 'ar' ? "خصم " : "OFF "} <span className="font-black text-xl">{offer.discountPercent}%</span>
                  {offer.minQuantity > 1 ? (language === 'ar' ? ` عند شراء ${offer.minQuantity} قطع فأكثر` : ` for ${offer.minQuantity} items or more`) : ''}
                </p>
              </div>
            </div>
            <div className="text-center bg-white/50 p-2 rounded-lg">
              <span className="block text-xs text-gray-500 font-bold">{language === 'ar' ? "ينتهي في" : "Ends on"}</span>
              <span className="font-mono text-rose-600 font-bold">{new Date(offer.endDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const [match, params] = useRoute("/products/:id");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<any>(null);

  // Multi-size quantity state: { "M": 2, "L": 1 }
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [vendorReviewRating, setVendorReviewRating] = useState(5);
  const [vendorReviewComment, setVendorReviewComment] = useState("");
  const queryClient = useQueryClient();
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { openChat } = useChat();

  const productId = params?.id ? parseInt(params.id) : 0;

  const { data: productData, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => endpoints.products.get(productId),
    enabled: !!productId,
  });

  // Automatically set selected color if available
  useEffect(() => {
    if (productData?.colors?.length > 0 && !selectedColor) {
      // Don't auto-select to keep default images first
    }
  }, [productData]);

  const { data: reviews } = useQuery({
    queryKey: ["reviews", "product", productId],
    queryFn: () => endpoints.reviews.product.list(productId),
    enabled: !!productId,
  });

  const addToCartMutation = useAddToCart();

  const submitReviewMutation = useMutation({
    mutationFn: (data: { productId: number; rating: number; comment?: string }) =>
      endpoints.reviews.product.create(data),
    onSuccess: () => {
      toast.success("تم إضافة تقييمك بنجاح");
      queryClient.invalidateQueries({ queryKey: ["reviews", "product", productId] });
      setReviewComment("");
      setReviewRating(5);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "حدث خطأ. تأكد من تسجيل الدخول");
    },
  });

  const submitVendorReviewMutation = useMutation({
    mutationFn: (data: { vendorId: number; rating: number; comment?: string }) =>
      endpoints.reviews.vendor.create(data),
    onSuccess: () => {
      toast.success("تم تقييم المتجر بنجاح");
      setVendorReviewComment("");
      setVendorReviewRating(5);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "حدث خطأ. تأكد من تسجيل الدخول");
    },
  });

  const { data: navData } = useQuery({
    queryKey: ['products', 'navigation', productData?.collectionId, productData?.categoryId],
    queryFn: async () => {
      let result;
      if (productData?.collectionId) {
        result = await endpoints.products.list({ collectionId: productData.collectionId });
      } else if (productData?.categoryId) {
        result = await endpoints.products.list({ categoryId: productData.categoryId });
      } else {
        result = await endpoints.products.list();
      }
      // Handle potential { products: [], total: 0 } structure or direct array
      return Array.isArray(result) ? result : (result?.products || []);
    },
    enabled: !!productData
  });

  const navigation = useMemo(() => {
    if (!navData || !Array.isArray(navData) || navData.length <= 1) return null;
    const currentIndex = navData.findIndex((p: any) => String(p.id) === String(productId));
    if (currentIndex === -1) return null;

    const prevIndex = (currentIndex - 1 + navData.length) % navData.length;
    const nextIndex = (currentIndex + 1) % navData.length;

    return {
      prevId: navData[prevIndex].id,
      nextId: navData[nextIndex].id,
    };
  }, [navData, productId]);

  const handleSizeQtyChange = (size: string, delta: number) => {
    setSizeQuantities(prev => {
      const current = prev[size] || 0;
      const maxStock = product.sizes?.find((s: any) => s.size === size)?.quantity || 0;
      const next = Math.max(0, Math.min(maxStock, current + delta));
      return { ...prev, [size]: next };
    });
  };

  const totalSelectedItems = Object.values(sizeQuantities).reduce((a, b) => a + b, 0);

  const handleAddToCartMulti = async () => {
    // Check if user is vendor or admin
    if (user && (user.role === 'vendor' || user.role === 'admin')) {
      toast.error(language === 'ar' ? "لا يمكن للمسؤول أو التاجر إضافة منتجات للسلة" : "Vendors and Admins cannot add items to cart");
      return;
    }

    if (product.sizes && product.sizes.length > 0) {
      if (totalSelectedItems === 0) {
        toast.error(language === 'ar' ? "الرجاء اختيار الكمية والمقاس" : "Please select quantity and size");
        return;
      }

      const promises = Object.entries(sizeQuantities).map(async ([size, qty]) => {
        if (qty > 0) {
          return addToCartMutation.mutateAsync({
            productId,
            quantity: qty,
            size,
            color: selectedColor?.colorName,
            product: {
              id: product.id,
              nameAr: product.nameAr,
              nameEn: product.nameEn,
              price: product.price,
              images: product.images,
              discount: product.discount,
              category: product.category
            }
          });
        }
      });

      await Promise.all(promises);
      setSizeQuantities({});
      setSelectedSize(null);
    } else {
      addToCartMutation.mutate({
        productId,
        quantity,
        size: undefined,
        color: selectedColor?.colorName,
        product: {
          id: product.id,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          price: product.price,
          images: product.images,
          discount: product.discount,
          category: product.category
        }
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = language === 'ar' ? product.nameAr : product.nameEn;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        // Silently fail or fallback
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(language === 'ar' ? "تم نسخ الرابط" : "Link copied to clipboard");
    }
  };

  const { data: wishlistStatus } = useQuery({
    queryKey: ['wishlist-status', productId],
    queryFn: () => endpoints.wishlist.check(productId),
    enabled: !!user && !!productId && productId > 0,
  });

  const isFavorite = wishlistStatus?.isFavorite;

  const toggleWishlistMutation = useMutation({
    mutationFn: () => isFavorite
      ? endpoints.wishlist.remove(productId)
      : endpoints.wishlist.add(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-status', productId] });
      toast.success(isFavorite
        ? (language === 'ar' ? "تمت الإزالة من المفضلة" : "Removed from wishlist")
        : (language === 'ar' ? "تمت الإضافة للمفضلة" : "Added to wishlist")
      );
    }
  });

  const handleToggleWishlist = () => {
    if (!user) return toast.error(language === 'ar' ? "يرجى تسجيل الدخول أولاً" : "Please login first");
    toggleWishlistMutation.mutate();
  };

  const handleToggleFavorite = handleToggleWishlist;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">المنتج غير موجود</h1>
          <Link href="/products">
            <Button size="lg" className="rounded-full bg-rose-600">العودة للمنتجات</Button>
          </Link>
        </div>
      </div>
    );
  }

  const product = productData.product;
  const vendor = productData.vendor;
  const collection = productData.collection;
  const category = productData.category;
  const colors = productData.colors || [];

  // Image selection logic
  const galleryImages = (selectedColor && selectedColor.images && selectedColor.images.length > 0)
    ? selectedColor.images
    : (product.images?.slice(1) || []); // Treat images[0] as cover only, excluding from detail gallery

  const displayImage = galleryImages[selectedImage] || galleryImages[0] || (product.images?.[0]) || "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?w=1200&h=1500&fit=crop";

  return (
    <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
      <section className="pt-4">
        <OffersDisplay vendorId={vendor?.id} productId={product.id} language={language} />
      </section>

      <section className="container mx-auto px-4 mt-4">
        <div className="grid lg:grid-cols-[1fr_550px] gap-12 relative items-start">
          {/* Left: Product Media */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="lg:sticky lg:top-20 h-fit"
            >
              <div
                className="aspect-[3/4] md:aspect-[3/4] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] md:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] mb-6 md:mb-10 relative group cursor-zoom-in max-w-2xl mx-auto"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={displayImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    src={displayImage}
                    alt={language === 'ar' ? product.nameAr : product.nameEn}
                    className="w-full h-full object-cover"
                    style={isZoomed ? {
                      transform: `scale(2.2)`,
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                    } : {}}
                  />
                </AnimatePresence>

                {product.discount > 0 && (
                  <div className="absolute top-10 right-10 z-20">
                    <div className="bg-rose-600 text-white px-8 py-3 rounded-full text-2xl font-black shadow-[0_15px_30px_rgba(225,29,72,0.4)] transform rotate-3">
                      -{product.discount}%
                    </div>
                  </div>
                )}

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2 rounded-full text-sm font-black flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ZoomIn className="w-5 h-5" />
                  {t('scrollZoom')}
                </div>

                {/* Gallery Navigation Arrows */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev > 0 ? prev - 1 : galleryImages.length - 1); }}
                    variant="ghost" size="icon" className="w-14 h-14 rounded-full bg-white/50 backdrop-blur-md hover:bg-white text-gray-900 pointer-events-auto shadow-lg"
                  >
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </Button>
                  <Button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev < galleryImages.length - 1 ? prev + 1 : 0); }}
                    variant="ghost" size="icon" className="w-14 h-14 rounded-full bg-white/50 backdrop-blur-md hover:bg-white text-gray-900 pointer-events-auto shadow-lg"
                  >
                    <ChevronLeft className="w-6 h-6 rotate-180" />
                  </Button>
                </div>
              </div>

              {/* Enhanced Thumbnails */}
              <div className="flex gap-3 md:gap-6 justify-start md:justify-center overflow-x-auto py-4 md:py-6 px-4 no-scrollbar scroll-pl-4">
                {galleryImages.map((img: string, idx: number) => (
                  <button
                    key={`thumb-${idx}`}
                    onClick={() => {
                      setSelectedImage(idx);
                    }}
                    className={`relative w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-3xl overflow-hidden border-2 md:border-4 transition-all duration-500 shrink-0 ${selectedImage === idx ? "border-rose-500 scale-105 md:scale-110 shadow-lg md:shadow-2xl shadow-rose-100" : "border-transparent opacity-50 hover:opacity-100 scale-100 hover:scale-105"
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}

                {/* Independent Color Quick-Switchers (If not already selected) */}
                {!selectedColor && colors.map((color: any, idx: number) => (
                  <button
                    key={`color-thumb-${idx}`}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedImage(0);
                    }}
                    className="relative w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-3xl overflow-hidden border-2 md:border-4 border-transparent opacity-50 hover:opacity-100 scale-100 hover:scale-105 transition-all duration-500 shrink-0"
                  >
                    <img src={color.images?.[0] || product.images?.[0]} alt={color.colorName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color.colorCode }} />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Product Details */}
          <div className="space-y-6 md:space-y-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-right"
            >
              <div className="flex items-center justify-between gap-4 mb-4 md:mb-6" dir="rtl">
                <div className="flex bg-gray-50/50 backdrop-blur-sm px-3 py-1.5 rounded-full items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-gray-500 border border-gray-100/50 overflow-x-auto max-w-[200px] md:max-w-none no-scrollbar whitespace-nowrap">
                  <Link href="/">
                    <span className="hover:text-rose-600 transition-colors">الرئيسية</span>
                  </Link>
                  <ChevronRight className="w-3 h-3 translate-y-[1px]" />
                  {category && (
                    <>
                      <span className="truncate max-w-[80px] md:max-w-none">{language === 'ar' ? category.nameAr : category.nameEn}</span>
                      <ChevronRight className="w-3 h-3 translate-y-[1px]" />
                    </>
                  )}
                  <span className="text-rose-600 truncate max-w-[100px] md:max-w-none">{language === 'ar' ? product.nameAr : product.nameEn}</span>
                </div>

                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!navigation?.prevId}
                    onClick={() => navigation?.prevId && setLocation(`/products/${navigation.prevId}`)}
                    className="w-8 h-8 rounded-full hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!navigation?.nextId}
                    onClick={() => navigation?.nextId && setLocation(`/products/${navigation.nextId}`)}
                    className="w-8 h-8 rounded-full hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="flex gap-3 md:gap-4 self-end md:self-auto">
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border-gray-100 hover:border-rose-200 hover:text-rose-600 transition-all shadow-sm"
                  >
                    <Share2 size={20} className="md:w-6 md:h-6" />
                  </Button>
                  {user?.role !== 'admin' && user?.role !== 'vendor' && (
                    <Button
                      onClick={handleToggleFavorite}
                      variant="outline"
                      size="icon"
                      className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border-gray-100 hover:border-rose-200 hover:text-red-500 transition-all shadow-sm ${isFavorite ? 'bg-red-50 text-red-500 border-red-100' : ''}`}
                    >
                      <Heart size={20} className={`md:w-6 md:h-6 ${isFavorite ? "fill-current" : ""}`} />
                    </Button>
                  )}
                </div>
                {vendor && (
                  <Link href={`/vendor/${vendor.storeSlug}`}>
                    <div className="flex items-center gap-3 md:gap-4 group cursor-pointer bg-white/50 p-1.5 md:p-0 rounded-2xl md:bg-transparent">
                      <div className="text-right">
                        <p className="font-black text-sm md:text-base text-gray-900 group-hover:text-rose-600 transition-colors">{language === 'ar' ? vendor.storeNameAr : vendor.storeNameEn}</p>
                        <div className="flex items-center gap-2 justify-end mt-0.5 md:mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs md:text-sm font-black text-gray-900">{Number(vendor.rating || 0).toFixed(1)}</span>
                          </div>
                          <span className="text-[10px] md:text-xs text-gray-400">({vendor.totalReviews})</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-white border border-gray-100 p-0.5 overflow-hidden shadow-sm group-hover:shadow-md transition-all shrink-0">
                        {vendor.logo ? (
                          <img
                            src={vendor.logo}
                            className="w-full h-full object-cover rounded-md md:rounded-xl"
                            alt={language === 'ar' ? vendor.storeNameAr : vendor.storeNameEn}
                          />
                        ) : (
                          <Store className="w-6 h-6 md:w-8 md:h-8 text-gray-300" />
                        )}
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              <div className="inline-block bg-rose-50 text-rose-600 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[10px] md:text-sm font-black tracking-widest uppercase mb-4 md:mb-6 border border-rose-100/50">
                {collection ? (language === 'ar' ? collection.nameAr : collection.nameEn) : 'Exclusive Edition'}
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-gray-900 mb-4 md:mb-6 leading-[1.2] md:leading-[1.1] tracking-tighter text-right">
                {language === 'ar' ? product.nameAr : product.nameEn}
              </h1>

              <div className="flex flex-wrap items-center justify-start gap-3 md:gap-6 mb-8 md:mb-12" dir="rtl">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 px-3 md:px-4 py-1 md:py-1.5 rounded-full font-black text-[10px] md:text-xs shrink-0">
                  {t('inStock')}
                </Badge>
                <div className="hidden md:block h-4 w-px bg-gray-200"></div>
                <span className="text-gray-500 font-bold text-xs md:text-sm lg:text-lg shrink-0">
                  {product.reviewCount} {t('verifiedReviews')}
                </span>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-1 direction-ltr">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 md:w-6 md:h-6 ${i < Math.round(Number(product.rating)) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 md:p-10 rounded-[2rem] md:rounded-[3.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] md:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] border border-gray-50 mb-8 md:mb-12 relative overflow-hidden ring-1 ring-gray-100 md:ring-0">
                <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-rose-50/50 blur-2xl md:blur-3xl -mr-10 -mt-10 rounded-full"></div>

                <div className="flex flex-wrap items-end justify-between gap-4 mb-6 md:mb-10 relative z-10" dir="rtl">
                  <div className="text-right">
                    <p className="text-gray-400 font-bold text-sm md:text-lg mb-1 md:mb-2">{t('currentPrice')}</p>
                    <div className="flex items-center gap-2 md:gap-4">
                      <span className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
                        {language === 'ar' ? Number(product.price).toLocaleString('ar-SA') : Number(product.price).toLocaleString()}
                      </span>
                      <span className="text-lg md:text-2xl font-black text-rose-600 mt-2 md:mt-4 uppercase">{t('currency')}</span>
                    </div>
                  </div>
                  {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                    <div className="bg-gray-50 px-3 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl border border-gray-100">
                      <p className="text-[10px] md:text-xs text-gray-400 font-bold mb-0.5 md:mb-1">{t('originalPrice')}</p>
                      <span className="text-base md:text-xl text-gray-400 line-through font-bold">
                        {language === 'ar' ? Number(product.originalPrice).toLocaleString('ar-SA') : Number(product.originalPrice).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {colors && colors.length > 0 && (
                  <div className="mb-6 md:mb-10 relative z-10" dir="rtl">
                    <p className="text-base md:text-lg font-black text-gray-900 mb-3 md:mb-5">{language === 'ar' ? "اللون:" : "Color:"} <span className="text-rose-600">{selectedColor?.colorName || (language === 'ar' ? "الكل" : "All")}</span></p>
                    <div className="flex flex-wrap gap-3 md:gap-4">
                      {/* Optional: Add a "Show All" or "Reset" button if desired, or just allow toggling */}
                      {colors.map((color: any) => (
                        <button
                          key={color.id}
                          onClick={() => {
                            if (selectedColor?.id === color.id) {
                              setSelectedColor(null);
                              setSelectedImage(0);
                            } else {
                              setSelectedColor(color);
                              setSelectedImage(0);
                            }
                          }}
                          className={`group relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedColor?.id === color.id ? "border-rose-500 scale-110 shadow-lg" : "border-gray-100 hover:border-gray-300"}`}
                        >
                          <img src={color.images?.[0] || product.images?.[0]} className="w-full h-full object-cover" alt={color.colorName} />
                          {/* Color indicator dot */}
                          <div className="absolute top-1 left-1 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: color.colorCode }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
                  <div className="mb-6 md:mb-10 relative z-10" dir="rtl">
                    <p className="text-base md:text-lg font-black text-gray-900 mb-3 md:mb-5">{language === 'ar' ? "المقاس:" : "Size:"}</p>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {product.sizes.map((sizeObj: any, idx: number) => {
                        const qty = sizeQuantities[sizeObj.size] || 0;
                        const isSelected = selectedSize === sizeObj.size;
                        return (
                          <div key={idx} className="relative">
                            <button
                              onClick={() => setSelectedSize(sizeObj.size)}
                              className={`min-w-12 h-12 md:min-w-14 md:h-14 px-3 md:px-4 rounded-xl font-black text-base md:text-lg transition-all border-2 ${isSelected ? "border-rose-600 bg-rose-50 text-rose-600" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"}`}
                            >
                              {sizeObj.size}
                            </button>
                            {qty > 0 && (
                              <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-gray-900 text-white text-[10px] font-black w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                {qty}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {user?.role !== 'admin' && user?.role !== 'vendor' && (
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 mb-0 md:mb-12" dir="rtl">
                    <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-1 border border-gray-100 h-14 md:h-16">
                      <button
                        onClick={() => {
                          if (product.sizes?.length > 0) {
                            if (selectedSize) handleSizeQtyChange(selectedSize, -1);
                            else toast.error(language === 'ar' ? "اختر المقاس أولاً" : "Select size first");
                          } else {
                            setQuantity(q => Math.max(1, q - 1));
                          }
                        }}
                        className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-rose-600 transition-colors"
                      >
                        <Minus size={18} strokeWidth={3} />
                      </button>
                      <span className="flex-1 w-10 text-center font-black text-xl text-gray-900">
                        {product.sizes?.length > 0 ? (selectedSize ? (sizeQuantities[selectedSize] || 0) : 0) : quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (product.sizes?.length > 0) {
                            if (selectedSize) handleSizeQtyChange(selectedSize, 1);
                            else toast.error(language === 'ar' ? "اختر المقاس أولاً" : "Select size first");
                          } else {
                            setQuantity(q => q + 1);
                          }
                        }}
                        className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-rose-600 transition-colors"
                      >
                        <Plus size={18} strokeWidth={3} />
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        onClick={handleAddToCartMulti}
                        disabled={addToCartMutation.isPending}
                        className="flex-1 h-14 md:h-16 rounded-[2rem] md:rounded-[4rem] bg-gray-800 hover:bg-black text-white text-lg md:text-xl font-black shadow-xl shadow-gray-200 gap-3 md:gap-4 w-full md:w-auto"
                      >
                        {addToCartMutation.isPending ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ShoppingCart size={20} strokeWidth={2.5} />
                        )}
                        {t('addToCart')}
                      </Button>

                      <Button
                        onClick={() => {
                          const element = document.getElementById('ai-try-on-section');
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="flex-1 h-14 md:h-16 rounded-[2rem] md:rounded-[4rem] bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white text-lg md:text-xl font-black shadow-xl shadow-purple-200 gap-3 md:gap-4 w-full md:w-auto"
                      >
                        <Sparkles size={20} />
                        {language === 'ar' ? 'تجربة ذكية' : 'Magic Try-On'}
                      </Button>

                      <Button
                        onClick={handleToggleWishlist}
                        variant="outline"
                        className={cn(
                          "w-14 h-14 md:w-16 md:h-16 rounded-full border-2 transition-all flex items-center justify-center p-0 md:hidden shrink-0",
                          isFavorite ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white border-gray-100 text-gray-400 hover:text-rose-600 hover:border-rose-100"
                        )}
                      >
                        <Heart size={24} className={isFavorite ? "fill-current" : ""} />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-8 space-y-4" dir="rtl">
                  {product.sku && (
                    <p className="text-sm font-bold text-gray-500">
                      <span className="text-gray-900 ml-2 uppercase">SKU:</span>
                      {product.sku}
                    </p>
                  )}
                  {category && (
                    <p className="text-sm font-bold text-gray-500">
                      <span className="text-gray-900 ml-2 uppercase">Categories:</span>
                      {language === 'ar' ? category.nameAr : category.nameEn}
                    </p>
                  )}
                  {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                      <span className="text-gray-900 ml-2 uppercase">Tags:</span>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600 border-0 rounded-lg px-3 py-1 transition-colors">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-4">
                    <span className="text-sm font-bold text-gray-900 uppercase">Share:</span>
                    <div className="flex gap-3">
                      {[
                        { Icon: Facebook, color: "hover:text-blue-600" },
                        { Icon: Twitter, color: "hover:text-sky-400" },
                        { Icon: Instagram, color: "hover:text-pink-600" },
                        { Icon: Linkedin, color: "hover:text-blue-700" }
                      ].map((social, i) => (
                        <button key={i} className={`w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 transition-colors ${social.color}`}>
                          <social.Icon size={16} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div id="ai-try-on-section">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-20 md:mt-32"
            >
              <TryOnSection
                productName={language === 'ar' ? product.nameAr : product.nameEn}
                productImage={displayImage}
                productDescription={language === 'ar' ? product.descriptionAr : product.descriptionEn}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tabs System */}
        <div className="mt-16">
          <div className="flex items-center justify-center gap-12 mb-16 border-b border-gray-100 pb-8">
            <button
              onClick={() => setActiveTab("details")}
              className={`text-2xl font-bold transition-colors relative ${activeTab === "details"
                ? "text-rose-600 font-black after:absolute after:bottom-[-33px] after:left-0 after:w-full after:h-1.5 after:bg-rose-600 after:rounded-full"
                : "text-gray-400 hover:text-gray-900"
                }`}
            >
              {t('details')}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`text-2xl font-bold transition-colors relative ${activeTab === "reviews"
                ? "text-rose-600 font-black after:absolute after:bottom-[-33px] after:left-0 after:w-full after:h-1.5 after:bg-rose-600 after:rounded-full"
                : "text-gray-400 hover:text-gray-900"
                }`}
            >
              {t('reviews')} ({reviews?.length || 0})
            </button>
          </div>

          <div className="max-w-4xl mx-auto text-right">
            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-50 leading-[2.2]">
                <p className="text-xl text-gray-700 whitespace-pre-wrap">
                  {language === 'ar' ? product.descriptionAr : product.descriptionEn}
                </p>

                {product.specifications && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
                    {Object.entries(product.specifications).map(([key, val]: any) => (
                      <div key={key} className="flex justify-between items-center border-b border-gray-50 py-4">
                        <span className="text-gray-900 font-bold">{val}</span>
                        <span className="text-gray-400 font-medium">{key}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">{language === 'ar' ? "تقييمات العملاء" : "Customer Reviews"}</h3>

                {/* Submit Review */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">{language === 'ar' ? "أضف تقييمك" : "Add Your Review"}</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium">{language === 'ar' ? "التقييم" : "Rating"}</label>
                        <div className="flex gap-2 justify-end">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setReviewRating(rating)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-6 h-6 ${rating <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium">{language === 'ar' ? "التعليق" : "Comment"}</label>
                        <Textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder={language === 'ar' ? "شاركنا تجربتك مع المنتج..." : "Share your experience..."}
                          className="resize-none"
                          rows={3}
                        />
                      </div>
                      <Button
                        onClick={() => submitReviewMutation.mutate({
                          productId,
                          rating: reviewRating,
                          comment: reviewComment || undefined,
                        })}
                        disabled={submitReviewMutation.isPending}
                        className="bg-rose-600 hover:bg-rose-700"
                      >
                        إرسال التقييم
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews List */}
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <Card key={review.id} className="border-0 shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <User className="w-8 h-8 text-gray-400" />
                              <div>
                                <p className="font-semibold">{review.customerName || 'عميل'}</p>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700">{review.comment}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      <section className="container mx-auto px-4 mt-10 border-t border-gray-100 pt-12">
        <RelatedProducts
          collectionId={product.collectionId}
          currentProductId={product.id}
          language={language}
        />
      </section>
    </div>
  );
}

