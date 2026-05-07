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
  AlertTriangle,
  Check
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
import { SEO } from "@/components/SEO";
import { TryOnSection } from "@/components/product/TryOnSection";
import { TryOnModal } from "@/components/product/TryOnModal";
import { Breadcrumbs } from "@/components/Breadcrumbs";

function RelatedProducts({ collectionId, categoryId, currentProductId, language }: { collectionId?: number, categoryId?: number, currentProductId: number, language: string }) {
  const { t } = useLanguage();
  const { data: relatedProducts, isLoading } = useQuery({
    queryKey: ['products', 'related', collectionId, categoryId],
    queryFn: () => endpoints.products.list(collectionId ? { collectionId } : { categoryId }),
    enabled: !!collectionId || !!categoryId
  });

  if (isLoading || !relatedProducts || !Array.isArray(relatedProducts) || relatedProducts.length <= 1) return null;

  const productsToShow = relatedProducts.filter((p: any) => p.id !== currentProductId).slice(0, 4);

  if (productsToShow.length === 0) return null;

  return (
    <div className="mt-32 border-t border-gray-100 pt-20">
      <div className="flex items-center justify-between mb-12" dir="rtl">
        <h2 className="text-3xl font-medium text-gray-900">{language === 'ar' ? "منتجات قد تعجبك" : "Products You May Like"}</h2>
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
      const res = await api.get(`/offers?vendorId=${vendorId}`);
      const allOffers = res.data;
      return allOffers.filter((o: any) => {
        const now = new Date();
        const startDate = new Date(o.startDate);
        const endDate = new Date(o.endDate);
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
                  {language === 'ar' ? "خصم " : "OFF "} <span className="font-medium text-xl">{offer.discountPercent}%</span>
                  {offer.minQuantity > 1 ? (language === 'ar' ? ` عند شراء ${offer.minQuantity} قطع فأكثر` : ` for ${offer.minQuantity} items or more`) : ''}
                </p>
              </div>
            </div>
            <div className="text-center bg-white/50 p-2 rounded-lg">
              <span className="block text-xs text-gray-500 font-bold">{language === 'ar' ? "ينتهي في" : "Ends on"}</span>
              <span className="font-mono text-rose-600 font-bold">
                {(() => {
                  try {
                    const date = new Date(offer.endDate);
                    if (isNaN(date.getTime())) return '';
                    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB');
                  } catch (e) {
                    return '';
                  }
                })()}
              </span>
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isCustomSizeOpen, setIsCustomSizeOpen] = useState(false);
  const [customMeasurements, setCustomMeasurements] = useState({
    height: "",
    weight: "",
    neck: "",
    shoulders: "",
    bust: "",
    underBust: "",
    waist: "",
    hips: "",
    armLength: "",
    armCircumference: "",
    wrist: ""
  });
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState(false);
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
    return { prevId: navData[prevIndex].id, nextId: navData[nextIndex].id };
  }, [navData, productId]);

  const product = productData?.product || productData;
  const vendor = productData?.vendor;
  const category = productData?.category;
  const colors = productData?.colors || [];

  const galleryImages = useMemo(() => {
    if (selectedColor && selectedColor.images && selectedColor.images.length > 0) {
      return selectedColor.images;
    }
    return product?.images || [];
  }, [selectedColor, product?.images]);

  const handleSizeQtyChange = (size: string, delta: number) => {
    setSizeQuantities(prev => {
      const current = prev[size] || 0;
      const maxStock = Array.isArray(product?.sizes) ? product.sizes.find((s: any) => s.size === size)?.quantity || 0 : 0;
      const next = Math.max(0, Math.min(maxStock, current + delta));
      return { ...prev, [size]: next };
    });
  };

  const totalSelectedItems = Object.values(sizeQuantities).reduce((a, b) => a + b, 0);

  const handleCustomMeasurementChange = (field: string, value: string) => {
    setCustomMeasurements(prev => ({ ...prev, [field]: value }));
  };

  const handleAddToCartMulti = async () => {
    if (user && (user.role === 'vendor' || user.role === 'admin')) {
      toast.error(language === 'ar' ? "لا يمكن للمسؤول أو التاجر إضافة منتجات للسلة" : "Vendors and Admins cannot add items to cart");
      return;
    }

    if (product?.sizes && product.sizes.length > 0) {
      if (totalSelectedItems === 0) {
        toast.error(language === 'ar' ? "الرجاء اختيار الكمية والمقاس" : "Please select quantity and size");
        return;
      }
      const promises = Object.entries(sizeQuantities).map(([size, qty]) => {
        if (qty > 0) {
          return addToCartMutation.mutateAsync({
            productId,
            quantity: qty,
            size: selectedSize || undefined,
            customMeasurements: selectedSize === 'Custom' ? customMeasurements : undefined,
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
        size: selectedSize || undefined,
        customMeasurements: selectedSize === 'Custom' ? customMeasurements : undefined,
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
      try { await navigator.share({ title, url }); } catch (err) { }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(language === 'ar' ? "تم نسخ الرابط" : "Link copied to clipboard");
    }
  };

  const token = localStorage.getItem('app_token');
  const hasValidToken = !!token && token !== 'undefined' && token !== 'null';

  const { data: wishlistStatus } = useQuery({
    queryKey: ['wishlist-status', productId],
    queryFn: () => endpoints.wishlist.check(productId),
    enabled: !!user && !!productId && hasValidToken,
    retry: false,
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

  if (!productData) return null;

  const displayImage = galleryImages[selectedImage] || galleryImages[0] || (product?.images?.[0]);

  return (
    <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
      {(() => {
        const breadcrumbs = [
          { name: language === 'ar' ? 'المنتجات' : 'Products', href: '/products' },
          ...(category ? [{ name: language === 'ar' ? category.nameAr : category.nameEn, href: `/products?category=${category.id}` }] : []),
          { name: language === 'ar' ? product.nameAr : product.nameEn, href: `/products/${product.id}` }
        ];

        return (
          <>
            <SEO 
              title={language === 'ar' ? product.nameAr : product.nameEn}
              description={language === 'ar' ? product.descriptionAr : product.descriptionEn}
              image={product.images?.[0]}
              url={`/products/${product.id}`}
              type="product"
              productData={{
                name: language === 'ar' ? product.nameAr : product.nameEn,
                price: product.price.toString(),
                currency: 'EGP',
                image: product.images?.[0],
                availability: product.stock > 0 ? 'in_stock' : 'out_of_stock',
                description: language === 'ar' ? product.descriptionAr : product.descriptionEn,
              }}
              breadcrumbs={breadcrumbs.map(b => ({ name: b.name, item: b.href }))}
            />
            <div className="container mx-auto px-4 py-4">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          </>
        );
      })()}
      <section className="pt-4">
        <OffersDisplay vendorId={vendor?.id} productId={product.id} language={language} />
      </section>

      <section className="container mx-auto px-4 mt-4">
        <div className="grid lg:grid-cols-[1fr_480px] gap-8 relative items-start">
          {/* Left: Product Media */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="lg:sticky lg:top-20 h-fit"
            >
            <div
                className="aspect-[3/4] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white shadow-xl mb-6 relative group cursor-zoom-in max-w-md mx-auto"
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
                    className="w-full h-full object-cover"
                    style={isZoomed ? {
                      transform: `scale(2.2)`,
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                    } : {}}
                  />
                </AnimatePresence>

                {product.discount > 0 && (
                  <div className="absolute top-4 md:top-10 right-4 md:right-10 z-20">
                    <div className="bg-rose-600 text-white px-4 md:px-8 py-1.5 md:py-3 rounded-full text-base md:text-2xl font-medium shadow-lg transform rotate-3">
                      -{product.discount}%
                    </div>
                  </div>
                )}

                <div className="absolute inset-x-2 md:inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev > 0 ? prev - 1 : galleryImages.length - 1); }}
                    variant="ghost" size="icon" className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/50 backdrop-blur-md hover:bg-white pointer-events-auto"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 rotate-180" />
                  </Button>
                  <Button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev < galleryImages.length - 1 ? prev + 1 : 0); }}
                    variant="ghost" size="icon" className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/50 backdrop-blur-md hover:bg-white pointer-events-auto"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 rotate-180" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 md:gap-6 justify-start md:justify-center overflow-x-auto py-4 no-scrollbar">
                {galleryImages.map((img: string, idx: number) => (
                  <button
                    key={`thumb-${idx}`}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${selectedImage === idx ? "border-rose-500 scale-105 shadow-lg" : "border-transparent opacity-50"}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Product Details */}
          <div className="space-y-6 md:space-y-12 relative z-10 text-right">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between gap-4 mb-6" dir="rtl">
                <div className="flex bg-gray-50/50 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full items-center gap-2 text-[10px] md:text-sm font-bold text-gray-500 border border-gray-100/50">
                  <Link href="/">الرئيسية</Link>
                  <ChevronRight className="w-3 h-3" />
                  {category && (
                    <>
                      <span>{language === 'ar' ? category.nameAr : category.nameEn}</span>
                      <ChevronRight className="w-3 h-3" />
                    </>
                  )}
                  <span className="text-rose-600">{language === 'ar' ? product.nameAr : product.nameEn}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" disabled={!navigation?.prevId} onClick={() => setLocation(`/products/${navigation?.prevId}`)} className="w-8 h-8 rounded-full"><ChevronRight size={16} /></Button>
                  <Button variant="ghost" size="icon" disabled={!navigation?.nextId} onClick={() => setLocation(`/products/${navigation?.nextId}`)} className="w-8 h-8 rounded-full"><ChevronLeft size={16} /></Button>
                </div>
              </div>

              <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                <div className="flex gap-3">
                  <Button onClick={handleShare} variant="outline" size="icon" className="w-10 h-10 md:w-14 md:h-14 rounded-xl border-gray-100"><Share2 size={20} /></Button>
                  {user?.role !== 'admin' && user?.role !== 'vendor' && (
                    <Button onClick={handleToggleWishlist} variant="outline" size="icon" className={cn("w-10 h-10 md:w-14 md:h-14 rounded-xl border-gray-100", isFavorite && "bg-rose-50 text-rose-600 border-rose-100")}>
                      <Heart size={20} className={isFavorite ? "fill-current" : ""} />
                    </Button>
                  )}
                </div>
                {vendor && (
                  <Link href={`/vendor/${vendor.storeSlug}`}>
                    <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="text-right">
                        <p className="font-medium text-gray-900 group-hover:text-rose-600">{language === 'ar' ? vendor.storeNameAr : vendor.storeNameEn}</p>
                        <div className="flex items-center gap-2 justify-end">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-900">{Number(vendor.rating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl border border-gray-100 overflow-hidden shadow-sm shrink-0">
                        {vendor.logo ? <img src={vendor.logo} className="w-full h-full object-cover" /> : <Store className="w-6 h-6 text-gray-300" />}
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              <h1 className="text-xl md:text-3xl lg:text-2xl font-medium text-gray-900 mb-4 leading-tight select-none">
                {language === 'ar' ? product.nameAr : product.nameEn}
              </h1>

              <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-lg border border-gray-50 mb-8">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-10" dir="rtl">
                  <div>
                    <p className="text-gray-400 font-bold mb-2">{t('currentPrice')}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl md:text-3xl font-medium text-gray-900">
                        {language === 'ar' ? Number(product.price).toLocaleString('ar-SA') : Number(product.price).toLocaleString()}
                      </span>
                      <span className="text-base md:text-xl font-medium text-rose-600 uppercase">{t('currency')}</span>
                    </div>
                  </div>
                </div>

                {colors && colors.length > 0 && (
                  <div className="mb-8" dir="rtl">
                    <p className="text-lg font-medium text-gray-900 mb-4">{language === 'ar' ? "اللون:" : "Color:"}</p>
                    <div className="flex flex-wrap gap-4">
                      {colors.map((colorObj: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedColor(colorObj);
                            setSelectedImage(0);
                          }}
                          className={`group relative w-12 h-12 rounded-2xl border-2 transition-all p-1.5 ${selectedColor?.id === colorObj.id ? "border-rose-600 bg-rose-50" : "border-gray-100 bg-white hover:border-gray-200 shadow-sm"}`}
                        >
                          <div 
                            className="w-full h-full rounded-xl shadow-inner border border-black/5" 
                            style={{ backgroundColor: colorObj.colorCode || '#ddd' }}
                          />
                          {selectedColor?.id === colorObj.id && (
                             <div className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md border-2 border-white">
                               <Check size={12} strokeWidth={3} />
                             </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-10" dir="rtl">
                    <p className="text-lg font-medium text-gray-900 mb-5">{language === 'ar' ? "المقاس:" : "Size:"}</p>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map((sizeObj: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSize(sizeObj.size)}
                          className={`min-w-12 h-12 rounded-xl font-medium border-2 transition-all ${selectedSize === sizeObj.size ? "border-rose-600 bg-rose-50 text-rose-600" : "bg-white text-gray-500 border-gray-100"}`}
                        >
                          {sizeObj.size}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => {
                          setSelectedSize("Custom");
                          setIsCustomSizeOpen(true);
                        }}
                        className={`min-w-[100px] px-4 h-12 rounded-xl font-medium border-2 transition-all flex items-center justify-center gap-2 ${selectedSize === "Custom" ? "border-rose-600 bg-rose-50 text-rose-600" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"}`}
                      >
                        <Ruler size={16} />
                        {language === 'ar' ? "مقاس خاص" : "Custom Size"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Measurements Display Summary */}
                {selectedSize === "Custom" && (
                  <div className="mb-8 p-4 bg-rose-50/50 rounded-2xl border border-rose-100" dir="rtl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-rose-600 flex items-center gap-2">
                        <Check size={14} />
                        {language === 'ar' ? "تم تحديد مقاس خاص" : "Custom size selected"}
                      </p>
                      <button 
                        onClick={() => setIsCustomSizeOpen(true)}
                        className="text-xs text-rose-500 hover:underline font-medium"
                      >
                        {language === 'ar' ? "تعديل المقاسات" : "Edit measurements"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {language === 'ar' 
                        ? "سيتم إرسال قياساتك الدقيقة للتاجر لتفصيل الفستان خصيصاً لكِ." 
                        : "Your exact measurements will be sent to the vendor for a custom fit."}
                    </p>
                  </div>
                )}

                {user?.role !== 'admin' && user?.role !== 'vendor' && (
                  <div className="flex flex-col md:flex-row gap-4" dir="rtl">
                    <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-1 h-14 md:h-16 w-full md:w-40 shrink-0">
                      <button onClick={() => { if (product.sizes?.length > 0) { if (selectedSize) handleSizeQtyChange(selectedSize, -1); else toast.error("اختر المقاس"); } else setQuantity(q => Math.max(1, q - 1)); }} className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-rose-600"><Minus size={18} /></button>
                      <span className="font-medium text-xl">{product.sizes?.length > 0 ? (selectedSize ? (sizeQuantities[selectedSize] || 0) : 0) : quantity}</span>
                      <button onClick={() => { if (product.sizes?.length > 0) { if (selectedSize) handleSizeQtyChange(selectedSize, 1); else toast.error("اختر المقاس"); } else setQuantity(q => q + 1); }} className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-rose-600"><Plus size={18} /></button>
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button onClick={handleAddToCartMulti} disabled={addToCartMutation.isPending} className="h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-medium w-full text-lg shadow-sm">
                          {t('addToCart')}
                        </Button>
                        <Button onClick={() => {
                          if (!user) {
                            toast.error(language === 'ar' ? "يرجى تسجيل الدخول للتواصل مع المصمم" : "Please login to contact the designer");
                            setLocation("/login?redirect=" + window.location.pathname);
                            return;
                          }
                          if (!vendor || !vendor.userId) {
                            toast.error(language === 'ar' ? "بيانات المصمم غير متوفرة حالياً" : "Designer information is currently unavailable");
                            return;
                          }
                          openChat({
                            vendorId: vendor.id,
                            vendorName: language === 'ar' ? vendor.storeNameAr : vendor.storeNameEn,
                            vendorLogo: vendor.logo,
                            recipientId: vendor.userId
                          });
                        }} className="h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 font-medium w-full flex items-center justify-center gap-2 text-sm md:text-base px-2">
                          <MessageSquare size={18} className="shrink-0" />
                          <span className="truncate">{language === 'ar' ? 'تواصل مع المصمم' : 'Contact Designer'}</span>
                        </Button>
                      </div>
                      <Button onClick={() => setIsTryOnModalOpen(true)} className="h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-rose-600 text-white font-medium w-full text-lg shadow-lg shadow-rose-100">
                        {language === 'ar' ? '✨ جربي الفستان' : '✨ Try It On'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div id="ai-try-on-section" className="mt-20">
        <TryOnSection
          productName={language === 'ar' ? product.nameAr : product.nameEn}
          productImage={displayImage}
          productDescription={language === 'ar' ? product.descriptionAr : product.descriptionEn}
        />
      </div>

      <div className="container mx-auto px-4 mt-20">
        <div className="flex items-center justify-center gap-12 mb-16 border-b border-gray-100 pb-8">
          <button onClick={() => setActiveTab("details")} className={`text-2xl font-bold transition-all relative ${activeTab === "details" ? "text-rose-600 after:absolute after:bottom-[-33px] after:left-0 after:w-full after:h-1.5 after:bg-rose-600 rounded-full" : "text-gray-400"}`}>{t('details')}</button>
          <button onClick={() => setActiveTab("reviews")} className={`text-2xl font-bold transition-all relative ${activeTab === "reviews" ? "text-rose-600 after:absolute after:bottom-[-33px] after:left-0 after:w-full after:h-1.5 after:bg-rose-600 rounded-full" : "text-gray-400"}`}>{t('reviews')} ({reviews?.length || 0})</button>
        </div>

        <div className="max-w-4xl mx-auto text-right">
          {activeTab === "details" && (
            <div className="space-y-12">
              <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-sm border border-gray-50 leading-relaxed text-xl text-gray-700 whitespace-pre-wrap">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </h3>
                {language === 'ar' ? product.descriptionAr : product.descriptionEn}
              </div>

              {/* Product Attributes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: language === 'ar' ? 'نوع القصة' : 'Cut Type', value: product.cutType },
                  { label: language === 'ar' ? 'شكل الجسم' : 'Body Shape', value: product.bodyShape },
                  { label: language === 'ar' ? 'المناسبة' : 'Occasion', value: product.occasion },
                  { label: language === 'ar' ? 'الانطباع' : 'Impression', value: product.impression },
                  { label: language === 'ar' ? 'الخيال' : 'Silhouette', value: product.silhouette },
                  { label: language === 'ar' ? 'الحالة' : 'Condition', value: product.condition === 'new' ? (language === 'ar' ? 'جديد' : 'New') : (language === 'ar' ? 'مستعمل' : 'Used') },
                ].map((attr, idx) => attr.value && (
                  <div key={idx} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                    <p className="text-gray-400 text-sm font-bold mb-1">{attr.label}</p>
                    <p className="text-gray-900 font-medium text-lg">{attr.value}</p>
                  </div>
                ))}
              </div>

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-sm border border-gray-50">
                   <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">
                    {language === 'ar' ? 'المواصفات الإضافية' : 'Additional Specifications'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    {Object.entries(product.specifications).map(([key, val]: any) => (
                      <div key={key} className="flex justify-between items-center border-b border-gray-50 py-4">
                        <span className="text-gray-900 font-bold">{val}</span>
                        <span className="text-gray-400 font-medium">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">

                  <h4 className="font-semibold mb-4">{language === 'ar' ? "أضف تقييمك" : "Add Your Review"}</h4>
                  <div className="space-y-4">
                    <div className="flex gap-2 justify-end">
                      {[1, 2, 3, 4, 5].map(r => <button key={r} onClick={() => setReviewRating(r)}><Star className={`w-6 h-6 ${r <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} /></button>)}
                    </div>
                    <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="رأيك يهمنا..." rows={3} />
                    <Button onClick={() => submitReviewMutation.mutate({ productId, rating: reviewRating, comment: reviewComment })} disabled={submitReviewMutation.isPending} className="bg-rose-600 hover:bg-rose-700">إرسال</Button>
                  </div>
                </CardContent>
              </Card>
              {reviews?.map((review: any) => (
                <Card key={review.id} className="border-0 shadow-sm">
                  <CardContent className="p-6 text-right">
                    <div className="flex items-center gap-4 justify-end mb-4">
                      <div>
                        <p className="font-bold">{review.customerName || 'عميل'}</p>
                        <div className="flex gap-1 justify-end">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                        </div>
                      </div>
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <RelatedProducts 
          collectionId={product.collectionId} 
          categoryId={product.categoryId} 
          currentProductId={product.id} 
          language={language} 
        />
      </div>

      <TryOnModal
        isOpen={isTryOnModalOpen}
        onClose={() => setIsTryOnModalOpen(false)}
        productImage={displayImage}
        productName={language === 'ar' ? product.nameAr : product.nameEn}
      />

      {/* Custom Size Modal */}
      <Dialog open={isCustomSizeOpen} onOpenChange={setIsCustomSizeOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-rose-600">
              <Ruler className="w-6 h-6" />
              {language === 'ar' ? 'أدخلي مقاساتكِ الخاصة' : 'Enter Your Custom Measurements'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <p className="text-sm text-rose-700 leading-relaxed text-center">
                {language === 'ar' 
                  ? "يرجى إدخال قياساتكِ بدقة بالسنتيمتر (cm) لضمان أفضل ملاءمة للفستان." 
                  : "Please enter your measurements accurately in centimeters (cm) for the best fit."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'height', labelAr: 'الطول', labelEn: 'Height', icon: '📏' },
                { id: 'weight', labelAr: 'الوزن (كجم)', labelEn: 'Weight (kg)', icon: '⚖️' },
                { id: 'neck', labelAr: 'محيط الرقبة', labelEn: 'Neck', icon: '🧣' },
                { id: 'shoulders', labelAr: 'عرض الأكتاف', labelEn: 'Shoulders', icon: '📏' },
                { id: 'bust', labelAr: 'محيط الصدر', labelEn: 'Bust', icon: '👗' },
                { id: 'underBust', labelAr: 'تحت الصدر', labelEn: 'Under Bust', icon: '📏' },
                { id: 'waist', labelAr: 'محيط الخصر', labelEn: 'Waist', icon: '⌛' },
                { id: 'hips', labelAr: 'محيط الأرداف', labelEn: 'Hips', icon: '📏' },
                { id: 'armLength', labelAr: 'طول الذراع', labelEn: 'Arm Length', icon: '📏' },
                { id: 'armCircumference', labelAr: 'محيط الذراع', labelEn: 'Arm Circumference', icon: '💪' },
                { id: 'wrist', labelAr: 'محيط الرسغ', labelEn: 'Wrist', icon: '⌚' },
              ].map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span>{field.icon}</span>
                    {language === 'ar' ? field.labelAr : field.labelEn}
                  </label>
                  <input
                    type="number"
                    value={customMeasurements[field.id as keyof typeof customMeasurements]}
                    onChange={(e) => handleCustomMeasurementChange(field.id, e.target.value)}
                    placeholder="0"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all text-lg font-medium"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => setIsCustomSizeOpen(false)}
                className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-lg shadow-xl"
              >
                {language === 'ar' ? 'حفظ المقاسات' : 'Save Measurements'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
