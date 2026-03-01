import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { endpoints } from "@/lib/api";
import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Trash2, ShoppingCart, ArrowRight, Minus, Plus, ShieldCheck, Truck, RotateCcw, ChevronLeft, Tag } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useState, useMemo, useEffect } from "react";

import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function Cart() {
  const queryClient = useQueryClient();
  const { language, formatPrice } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [guestCartTrigger, setGuestCartTrigger] = useState(0);

  useEffect(() => {
    const handleCartUpdate = () => {
      setGuestCartTrigger(prev => prev + 1);
    };
    window.addEventListener('fustan-cart-updated', handleCartUpdate);
    return () => window.removeEventListener('fustan-cart-updated', handleCartUpdate);
  }, []);

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => endpoints.cart.get(),
    enabled: !!user,
    retry: false
  });

  /*
   - [x] Audit & Fix Legal & Static Content (Privacy/Terms/FAQ) [DONE]
   - [x] Final Verification & Push [DONE]

   # Deliverables
   - Fully responsive e-commerce platform
   - Consistent typography (Cairo/Inter)
   - Optimized mobile navigation and layouts
   - Stabilized JSX structure in complex pages
   */
  const cartItems = useMemo(() => {
    let finalItems: any[] = [];
    if (cartData && Array.isArray(cartData)) {
      finalItems = [...cartData];
    }
    if (typeof window !== "undefined") {
      const guestItemsRaw = localStorage.getItem('fustan-guest-items');
      if (guestItemsRaw) {
        try {
          const guestItems = JSON.parse(guestItemsRaw);
          if (Array.isArray(guestItems)) {
            finalItems = [...finalItems, ...guestItems.map(item => ({ ...item, isGuestItem: true }))];
          }
        } catch (e) {
          console.error("Failed to parse guest cart", e);
        }
      }
    }
    return finalItems;
  }, [cartData, user, guestCartTrigger]);

  const items = (cartItems as any[]) || [];

  const removeItemMutation = useMutation({
    mutationFn: async (cartItemId: any) => {
      const item = items.find((i: any) => i.id === cartItemId);
      if (item?.isGuestItem) {
        const guestItemsRaw = localStorage.getItem('fustan-guest-items');
        if (guestItemsRaw) {
          const guestItems = JSON.parse(guestItemsRaw);
          const filtered = guestItems.filter((i: any) => i.id !== cartItemId);
          localStorage.setItem('fustan-guest-items', JSON.stringify(filtered));
          window.dispatchEvent(new CustomEvent('fustan-cart-updated'));
        }
        return Promise.resolve();
      }
      return endpoints.cart.remove(cartItemId);
    },
    onSuccess: () => {
      toast.success(language === 'ar' ? "تم حذف المنتج من السلة" : "Product removed from cart");
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: any, quantity: number }) => {
      const item = items.find((i: any) => i.id === cartItemId);
      if (item?.isGuestItem) {
        const guestItemsRaw = localStorage.getItem('fustan-guest-items');
        if (guestItemsRaw) {
          const guestItems = JSON.parse(guestItemsRaw);
          const updated = guestItems.map((i: any) => i.id === cartItemId ? { ...i, quantity } : i);
          localStorage.setItem('fustan-guest-items', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('fustan-cart-updated'));
        }
        return Promise.resolve();
      }
      return endpoints.cart.update(cartItemId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const validateCoupon = useMutation({
    mutationFn: (code: string) => endpoints.coupons.validate(code),
    onSuccess: (data) => {
      setAppliedCoupon(data);
      toast.success(language === 'ar' ? "تم تطبيق كود الخصم بنجاح" : "Coupon applied successfully");
    },
    onError: (err: any) => {
      setAppliedCoupon(null);
      toast.error(err.response?.data?.message || (language === 'ar' ? "كود الخصم غير صالح" : "Invalid coupon code"));
    }
  });

  const subtotal = items.reduce((total: number, item: any) => {
    return total + (Number(item.quantity) * Number(item.product?.price || 0));
  }, 0);

  const uniqueVendorIds = Array.from(new Set(items.map((item: any) => item.product?.vendorId).filter(Boolean)));

  const { data: activeOffers } = useQuery({
    queryKey: ['vendors', 'offers', uniqueVendorIds],
    queryFn: async () => {
      if (uniqueVendorIds.length === 0) return [];
      const responses = await Promise.all(uniqueVendorIds.map(id =>
        api.get(`/offers?vendorId=${id}`).then(res => res.data)
      ));
      return responses.flat();
    },
    enabled: uniqueVendorIds.length > 0
  });

  let automaticDiscount = 0;
  let appliedOffers: any[] = [];

  if (activeOffers) {
    const now = new Date();
    activeOffers.forEach((offer: any) => {
      const startDate = new Date(offer.startDate);
      const endDate = new Date(offer.endDate);
      if (!offer.isActive || now < startDate || now > endDate) return;
      const offerProductIds = offer.productIds || [];
      const matchingItems = items.filter((item: any) => offerProductIds.includes(item.productId));
      if (matchingItems.length > 0) {
        const totalQuantity = matchingItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const minQty = offer.minQuantity || 1;
        if (totalQuantity >= minQty) {
          const matchingSubtotal = matchingItems.reduce((sum: number, item: any) => sum + (item.quantity * Number(item.product.price)), 0);
          const discount = (matchingSubtotal * offer.discountPercent) / 100;
          automaticDiscount += discount;
          appliedOffers.push(offer);
        }
      }
    });
  }

  let couponDiscount = 0;
  if (appliedCoupon) {
    const vendorItems = items.filter((item: any) => item.product?.vendorId === appliedCoupon.vendorId);
    const vendorSubtotal = vendorItems.reduce((total: number, item: any) => {
      return total + (Number(item.quantity) * Number(item.product?.price || 0));
    }, 0);
    couponDiscount = (vendorSubtotal * appliedCoupon.discountPercent) / 100;
  }

  const totalDiscount = automaticDiscount + couponDiscount;

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors', 'shipping', uniqueVendorIds],
    queryFn: async () => {
      if (uniqueVendorIds.length === 0) return [];
      const responses = await Promise.all(uniqueVendorIds.map(id => api.get(`/vendors/${id}`).catch(() => ({ data: { shippingCost: 0 } }))));
      return responses.map(r => r.data);
    },
    enabled: uniqueVendorIds.length > 0
  });

  const shipping = vendorsData?.reduce((sum: number, v: any) => sum + (Number(v.shippingCost) || 0), 0) || 0;
  const total = subtotal + shipping - totalDiscount;

  const handleCheckoutClick = () => {
    if (!user) {
      toast.info(language === 'ar' ? "يرجى تسجيل الدخول لإتمام عملية الشراء" : "Please login to complete checkout");
      setLocation("/login?redirect=/checkout");
      return;
    }
    setLocation(`/checkout${appliedCoupon ? `?coupon=${appliedCoupon.code}` : ''}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`min-h-screen bg-[#fafafa] flex flex-col items-center justify-center py-20 px-4 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-50 border border-rose-50">
            <ShoppingCart size={48} className="text-rose-600" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">{language === 'ar' ? 'سلّتك مشتاقة إليك' : 'Your cart is missing you'}</h1>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">{language === 'ar' ? 'بإمكانكِ إضافة أجمل التصاميم الحصرية من مجموعتنا الجديدة الآن.' : 'You can add the most beautiful exclusive designs from our new collection now.'}</p>
          <Link href="/products">
            <Button size="lg" className="h-16 px-12 rounded-full bg-rose-600 hover:bg-rose-700 text-xl font-bold">{language === 'ar' ? 'ابدئي التسوق' : 'Start Shopping'}</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#fafafa] pb-32 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <header className="bg-white border-b border-gray-100 pt-8 md:pt-12 pb-10 md:pb-16">
        <div className={`container mx-auto px-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 md:mb-4">{language === 'ar' ? 'حقيبة التسوق' : 'Shopping Cart'}</h1>
          <p className="text-base md:text-xl text-gray-500">{language === 'ar' ? `لديكِ ${items.length} قطع مختارة بعناية` : `You have ${items.length} carefully selected pieces`}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">{language === 'ar' ? 'محتويات الحقيبة' : 'Cart Contents'}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.removeItem('fustan-guest-items');
              queryClient.invalidateQueries({ queryKey: ['cart'] });
              window.dispatchEvent(new CustomEvent('fustan-cart-updated'));
              toast.success(language === 'ar' ? "تم إفراغ السلة" : "Cart cleared successfully");
            }}
            className="text-gray-500 hover:text-rose-600 rounded-xl border-gray-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'إفراغ سلة الزوار' : 'Clear Guest Cart'}
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8">
            <div className="space-y-6">
              <AnimatePresence mode='popLayout'>
                {items.map((item: any) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 md:gap-8 relative group"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 grow w-full">
                      <img
                        src={(item.product?.images && item.product.images[0]) || (item.product?.image) || "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?w=200&h=200&fit=crop"}
                        alt={language === 'ar' ? (item.product?.nameAr || 'منتج مميز') : (item.product?.nameEn || 'Premium Product')}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl object-cover shadow-lg shrink-0"
                      />

                      <div className={`grow w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1 md:mb-2">
                          {language === 'ar' ? (item.product?.nameAr || 'منتج مميز') : (item.product?.nameEn || 'Premium Product')}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
                          <span className="text-xs md:text-base text-gray-500 font-bold">
                            {language === 'ar' ? (item.product?.category?.nameAr || 'تصميم حصري') : (item.product?.category?.nameEn || 'Exclusive Design')}
                          </span>
                          {item.size && (
                            <span className="bg-gray-100 px-2 md:px-3 py-0.5 md:py-1 rounded-lg text-[10px] md:text-sm font-bold text-gray-700 border border-gray-200">
                              {language === 'ar' ? 'المقاس' : 'Size'}: {item.size}
                            </span>
                          )}
                        </div>

                        {appliedOffers.some((o: any) => o.productIds?.includes(item.productId)) && (
                          <div className="mb-2 inline-flex items-center bg-green-50 text-green-700 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold border border-green-100">
                            <Tag className="w-3 h-3 ml-1" />
                            {language === 'ar' ? 'عرض مطبق' : 'Offer Applied'}
                          </div>
                        )}

                        <div className={`flex items-center ${language === 'ar' ? 'justify-end md:justify-start' : 'justify-start'} gap-2 md:gap-3 text-lg md:text-2xl font-black text-rose-600`}>
                          {formatPrice(item.product?.price)}
                        </div>
                      </div>
                    </div>

                    <div className={`flex flex-row md:flex-col ${language === 'ar' ? 'items-end' : 'items-start'} gap-6 shrink-0 w-full md:w-auto justify-between md:justify-center`}>
                      <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                        <Button variant="ghost" size="icon" onClick={() => updateQuantityMutation.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })} className="text-rose-600 hover:bg-white rounded-xl w-8 h-8 md:w-10 md:h-10"><Plus size={16} /></Button>
                        <span className="w-8 md:w-12 text-center text-lg md:text-xl font-black text-gray-900">{item.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => item.quantity > 1 ? updateQuantityMutation.mutate({ cartItemId: item.id, quantity: item.quantity - 1 }) : removeItemMutation.mutate(item.id)} className="text-gray-400 hover:bg-white rounded-xl w-8 h-8 md:w-10 md:h-10"><Minus size={16} /></Button>
                      </div>

                      <button onClick={() => removeItemMutation.mutate(item.id)} className="text-gray-300 hover:text-red-500 transition-colors font-bold flex items-center gap-2 text-sm">
                        {language === 'ar' ? 'إزالة' : 'Remove'} <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className={`bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border border-gray-50 ${language === 'ar' ? 'text-right' : 'text-left'} sticky top-24`}>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 md:mb-10">{language === 'ar' ? 'ملخص الحقيبة' : 'Bag Summary'}</h2>
              <div className="space-y-4 md:space-y-6 mb-8 md:mb-10 border-b border-gray-50 pb-8 md:pb-10">
                <div className="flex justify-between items-center text-lg md:text-xl">
                  <span className="font-black text-rose-600">{formatPrice(subtotal)}</span>
                  <span className="text-gray-500 font-bold">{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                </div>
                <div className="flex justify-between items-center text-lg md:text-xl">
                  <span className={`font-black ${shipping === 0 ? 'text-green-500' : 'text-gray-900'}`}>{shipping === 0 ? (language === 'ar' ? 'مجانـاً' : 'Free') : formatPrice(shipping)}</span>
                  <span className="text-gray-500 font-bold">{language === 'ar' ? 'تكلفة الشحن' : 'Shipping Cost'}</span>
                </div>

                <div className="pt-4">
                  <div className="flex gap-2">
                    <Button onClick={() => validateCoupon.mutate(couponCode)} disabled={!couponCode || validateCoupon.isPending || !!appliedCoupon} className="shrink-0 bg-gray-900 text-white rounded-xl">{language === 'ar' ? "تطبيق" : "Apply"}</Button>
                    <input type="text" placeholder={language === 'ar' ? "كود الخصم" : "Promo Code"} value={appliedCoupon ? appliedCoupon.code : couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} disabled={!!appliedCoupon} className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-right focus:outline-none`} />
                  </div>
                  {(appliedCoupon || automaticDiscount > 0) && (
                    <div className="space-y-1 mt-2">
                      {appliedCoupon && <div className="flex justify-between items-center text-green-600 text-sm md:text-base"><span className="font-bold">-{formatPrice(couponDiscount)}</span><span>{language === 'ar' ? `خصم الكوبون (${appliedCoupon.discountPercent}%)` : `Coupon Discount (${appliedCoupon.discountPercent}%)`}</span></div>}
                      {automaticDiscount > 0 && <div className="flex justify-between items-center text-blue-600 text-sm md:text-base"><span className="font-bold">-{formatPrice(automaticDiscount)}</span><span>{language === 'ar' ? 'خصم العروض التلقائي' : 'Automatic Offer Discount'}</span></div>}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mb-10 md:mb-12">
                <span className="text-3xl md:text-4xl font-black text-rose-600">{formatPrice(total)}</span>
                <span className="text-xl md:text-2xl font-black text-gray-900">{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
              </div>

              <Button onClick={handleCheckoutClick} className="w-full h-16 md:h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-xl md:text-2xl font-black shadow-xl">
                {language === 'ar' ? 'إتمام الشراء' : 'Checkout'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
