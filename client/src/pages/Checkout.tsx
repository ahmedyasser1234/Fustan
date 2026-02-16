import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { ChevronRight, Lock, Truck, CreditCard, ShieldCheck, CheckCircle2, MapPin, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { endpoints } from "@/lib/api";
import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { language, t } = useLanguage();
  const [step, setStep] = useState<"shipping" | "payment" | "review">("shipping");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleValidation = (fields: string[]) => {
    const errors = fields.filter(f => !formData[f as keyof typeof formData]);
    setValidationErrors(errors);
    if (errors.length > 0) {
      toast.error(language === 'ar' ? "يرجى ملء كافة الحقول المطلوبة" : "Please fill all required fields");
      return false;
    }
    setValidationErrors([]);
    return true;
  };

  // Extract coupon code from URL
  const couponCode = new URLSearchParams(window.location.search).get('coupon');
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "card" as "card" | "tabby" | "tamara",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
  });

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => endpoints.cart.get()
  });

  // Validate coupon if provided in URL
  const { data: validatedCoupon } = useQuery({
    queryKey: ['coupon', couponCode],
    queryFn: () => couponCode ? endpoints.coupons.validate(couponCode) : null,
    enabled: !!couponCode,
  });

  const placeOrderMutation = useMutation({
    mutationFn: (orderData: any) => endpoints.orders.create(orderData),
    onSuccess: () => {
      toast.success(language === 'ar' ? "تم تقديم الطلب بنجاح! شكراً لثقتك بنا" : "Order placed successfully! Thank you for your trust");
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setLocation("/order-success");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || (language === 'ar' ? "فشل في تقديم الطلب" : "Failed to place order"));
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    if (name === "cardNumber") {
      value = value.replace(/\D/g, "").slice(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    } else if (name === "cardExpiry") {
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length >= 3) {
        value = `${value.slice(0, 2)}/${value.slice(2)}`;
      }
    } else if (name === "cardCVC") {
      value = value.replace(/\D/g, "").slice(0, 3);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const items = (cartItems as any[]) || [];
  const subtotal = items.reduce((total: number, item: any) => total + (item.quantity * Number(item.product?.price || 0)), 0);

  // --- Automatic Discount Logic (Duplicated from Cart.tsx) ---
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
        }
      }
    });
  }
  // -----------------------------------------------------------

  // Calculate discount if coupon is valid
  let couponDiscount = 0;
  if (validatedCoupon) {
    // Only apply coupon to items from that vendor
    const vendorItems = items.filter((item: any) => item.product?.vendorId === validatedCoupon.vendorId);
    const vendorSubtotal = vendorItems.reduce((total: number, item: any) => {
      return total + (Number(item.quantity) * Number(item.product?.price || 0));
    }, 0);
    couponDiscount = (vendorSubtotal * validatedCoupon.discountPercent) / 100;
  }

  const totalDiscount = automaticDiscount + couponDiscount;
  const subtotalAfterDiscount = subtotal - totalDiscount;

  // Calculate Shipping (Sum of shipping costs for all unique vendors in cart)
  const { data: vendorsData } = useQuery({
    queryKey: ['vendors', 'shipping', uniqueVendorIds],
    queryFn: async () => {
      if (uniqueVendorIds.length === 0) return [];
      const promises = uniqueVendorIds.map(id => api.get(`/vendors/${id}`).catch(() => ({ data: { shippingCost: 0 } })));
      const responses = await Promise.all(promises);
      return responses.map(r => r.data);
    },
    enabled: uniqueVendorIds.length > 0
  });

  const shipping = vendorsData?.reduce((sum: number, v: any) => sum + (Number(v.shippingCost) || 0), 0) || 0;
  const total = subtotalAfterDiscount + shipping;

  const steps = [
    { id: "shipping", label: "التوصيل", icon: Truck },
    { id: "payment", label: "الدفع", icon: CreditCard },
    { id: "review", label: "التأكيد", icon: CheckCircle2 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32">
      {/* Premium Header */}
      <header className="bg-white border-b border-gray-100 pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-black text-gray-900 mb-6 font-arabic">إتمام الطلب</h1>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 md:gap-12 mt-12 overflow-x-auto pb-4 scrollbar-hide">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = steps.findIndex(x => x.id === step) > idx;

              return (
                <div key={s.id} className="flex items-center gap-4 shrink-0">
                  <div className={`flex flex-col items-center gap-2 ${isActive || isCompleted ? 'text-rose-600' : 'text-gray-300'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${isActive ? 'bg-rose-600 text-white scale-110 shadow-rose-200' :
                      isCompleted ? 'bg-rose-100 text-rose-600' : 'bg-white text-gray-300 border border-gray-100'
                      }`}>
                      <Icon size={24} />
                    </div>
                    <span className="font-bold text-sm tracking-wide">{s.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 w-12 md:w-24 rounded-full ${isCompleted ? 'bg-rose-600' : 'bg-gray-100'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 mt-16 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Main Form Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {step === "shipping" && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50">
                    <h2 className="text-3xl font-black text-gray-900 mb-8 text-right flex items-center justify-end gap-3">
                      بيانات التوصيل <MapPin className="text-rose-500" />
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 text-right">
                      <div className="space-y-3">
                        <label className="font-bold text-gray-700">الاسم الأول</label>
                        <Input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`h-14 rounded-2xl bg-gray-50 border-none px-6 text-lg transition-all ${validationErrors.includes('firstName') ? 'ring-2 ring-rose-500 animate-wiggle' : ''}`}
                          placeholder="محمد"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="font-bold text-gray-700">العائلة</label>
                        <Input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`h-14 rounded-2xl bg-gray-50 border-none px-6 text-lg transition-all ${validationErrors.includes('lastName') ? 'ring-2 ring-rose-500 animate-wiggle' : ''}`}
                          placeholder="أحمد"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="font-bold text-gray-700">البريد الإلكتروني</label>
                        <Input
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`h-14 rounded-2xl bg-gray-50 border-none px-6 text-lg transition-all ${validationErrors.includes('email') ? 'ring-2 ring-rose-500 animate-wiggle' : ''}`}
                          placeholder="example@mail.com"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="font-bold text-gray-700">رقم الهاتف</label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`h-14 rounded-2xl bg-gray-50 border-none px-6 text-lg transition-all ${validationErrors.includes('phone') ? 'ring-2 ring-rose-500 animate-wiggle' : ''}`}
                          placeholder="0123456789"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-3">
                        <label className="font-bold text-gray-700">العنوان الكامل</label>
                        <Input
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={`h-14 rounded-2xl bg-gray-50 border-none px-6 text-lg transition-all ${validationErrors.includes('address') ? 'ring-2 ring-rose-500 animate-wiggle' : ''}`}
                          placeholder="رقم المبنى، اسم الشارع، المدينة"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        if (handleValidation(['firstName', 'lastName', 'email', 'phone', 'address'])) {
                          setStep("payment");
                        }
                      }}
                      className="w-full h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-xl font-bold shadow-xl shadow-rose-100 mt-12 group"
                    >
                      المتابعة للدفع <ChevronLeft className="mr-3 group-hover:-translate-x-2 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50">
                    <h2 className="text-3xl font-black text-gray-900 mb-8 text-right flex items-center justify-end gap-3">
                      بيانات الدفع <CreditCard className="text-rose-500" />
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${formData.paymentMethod === 'card' ? 'border-rose-600 bg-rose-50/50 shadow-lg shadow-rose-100' : 'border-gray-100 hover:border-rose-200 bg-white'}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.paymentMethod === 'card' ? 'bg-rose-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                          <CreditCard size={24} />
                        </div>
                        <div className="text-center">
                          <p className="font-black text-gray-900">{language === 'ar' ? "بطاقة بنكية" : "Credit Card"}</p>
                          <p className="text-xs text-gray-400 mt-1">Visa / Master Card</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'tabby' }))}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${formData.paymentMethod === 'tabby' ? 'border-[#00D3C3] bg-[#00D3C3]/5 shadow-lg shadow-[#00D3C3]/10' : 'border-gray-100 hover:border-[#00D3C3]/30 bg-white'}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.paymentMethod === 'tabby' ? 'bg-[#00D3C3] text-black' : 'bg-gray-50 text-gray-400'}`}>
                          <span className="font-black italic text-lg">tabby</span>
                        </div>
                        <div className="text-center">
                          <p className="font-black text-gray-900">{language === 'ar' ? "تابي" : "Tabby"}</p>
                          <p className="text-xs text-gray-400 mt-1">{language === 'ar' ? "قسّمها على 4 دفعات" : "Split in 4 payments"}</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'tamara' }))}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${formData.paymentMethod === 'tamara' ? 'border-[#FFB703] bg-[#FFB703]/5 shadow-lg shadow-[#FFB703]/10' : 'border-gray-100 hover:border-[#FFB703]/30 bg-white'}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.paymentMethod === 'tamara' ? 'bg-[#FFB703] text-black' : 'bg-gray-50 text-gray-400'}`}>
                          <span className="font-black italic text-lg">tamara</span>
                        </div>
                        <div className="text-center">
                          <p className="font-black text-gray-900">{language === 'ar' ? "تمارا" : "Tamara"}</p>
                          <p className="text-xs text-gray-400 mt-1">{language === 'ar' ? "اشترِ الآن وادفع لاحقاً" : "Buy now, pay later"}</p>
                        </div>
                      </button>
                    </div>

                    {formData.paymentMethod === 'card' ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                      >
                        <div className="bg-gray-900 rounded-[2.5rem] p-8 mb-10 text-white relative overflow-hidden shadow-2xl">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-16">
                              <div className="w-16 h-12 bg-white/10 rounded-xl" />
                              <span className="text-2xl font-black italic tracking-tighter">PREMIUM</span>
                            </div>
                            <div className="text-2xl mb-8 font-mono tracking-[0.3em]">{formData.cardNumber || '**** **** **** ****'}</div>
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[10px] text-white/40 mb-1">صاحب البطاقة</p>
                                <p className="font-bold uppercase tracking-wider">{formData.cardName || 'YOUR NAME HERE'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-white/40 mb-1">تاريخ الانتهاء</p>
                                <p className="font-bold">{formData.cardExpiry || 'MM/YY'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 text-right">
                          <div className="md:col-span-2 space-y-3">
                            <label className="font-bold text-gray-700">{t('cardName')}</label>
                            <Input name="cardName" value={formData.cardName} onChange={handleInputChange} className="h-14 rounded-2xl bg-gray-50 border-none px-6 text-lg" placeholder={language === 'ar' ? "اسمك كما يظهر على البطاقة" : "Cardholder Name"} />
                          </div>
                          <div className="md:col-span-2 space-y-3">
                            <label className="font-bold text-gray-700">{t('cardNumber')}</label>
                            <Input name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} className="h-14 rounded-2xl bg-gray-50 border-none px-6 text-lg" placeholder="0000 0000 0000 0000" />
                          </div>
                          <div className="space-y-3">
                            <label className="font-bold text-gray-700">{t('cardExpiry')}</label>
                            <Input name="cardExpiry" value={formData.cardExpiry} onChange={handleInputChange} className="h-14 rounded-2xl bg-gray-50 border-none px-6 text-lg" placeholder="MM/YY" />
                          </div>
                          <div className="space-y-3">
                            <label className="font-bold text-gray-700">{t('cardCVC')}</label>
                            <Input name="cardCVC" value={formData.cardCVC} onChange={handleInputChange} className="h-14 rounded-2xl bg-gray-50 border-none px-6 text-lg" placeholder="123" />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-[2rem] p-10 text-center border border-gray-100"
                      >
                        <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${formData.paymentMethod === 'tabby' ? 'bg-[#00D3C3]/10 text-[#00D3C3]' : 'bg-[#FFB703]/10 text-[#FFB703]'}`}>
                          <CheckCircle2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4">
                          {formData.paymentMethod === 'tabby' ? (language === 'ar' ? "الدفع مع تابي" : "Pay with Tabby") : (language === 'ar' ? "الدفع مع تمارا" : "Pay with Tamara")}
                        </h3>
                        <p className="text-gray-500 font-bold leading-relaxed max-w-md mx-auto">
                          {formData.paymentMethod === 'tabby'
                            ? (language === 'ar' ? "سيتم توجيهك إلى تابي لإكمال عملية الدفع بأمان وتقسيمها على 4 دفعات بدون فوائد." : "You will be redirected to Tabby to complete your payment securely in 4 interest-free installments.")
                            : (language === 'ar' ? "سيتم توجيهك إلى تمارا لإكمال عملية الدفع بأمان والاستمتاع بمميزات الشراء الآن والدفع لاحقاً." : "You will be redirected to Tamara to complete your payment securely and enjoy Buy Now, Pay Later features.")
                          }
                        </p>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-12">
                      <Button onClick={() => setStep("shipping")} variant="outline" className="h-16 rounded-full border-2 text-xl font-bold">{language === 'ar' ? "العودة" : "Back"}</Button>
                      <Button
                        onClick={() => {
                          if (formData.paymentMethod === 'card') {
                            if (!formData.cardName || !formData.cardNumber || !formData.cardExpiry || !formData.cardCVC) {
                              toast.error(language === 'ar' ? "يرجى إدخال بيانات البطاقة" : "Please enter card details");
                              return;
                            }
                            if (formData.cardNumber.replace(/\s/g, '').length < 16) {
                              toast.error(language === 'ar' ? "رقم البطاقة يجب أن يتكون من 16 رقم" : "Card number must be 16 digits");
                              return;
                            }
                          }
                          setStep("review");
                        }}
                        className="h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-xl font-bold shadow-xl shadow-rose-100 group"
                      >
                        مراجعة الطلب <ChevronLeft className="mr-3 group-hover:-translate-x-2 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "review" && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50 text-right">
                    <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-gray-900 mb-2 text-center">{t('reviewOrder')}</h2>
                    <p className="text-gray-500 text-center mb-12 text-lg">أنتِ على وشك اقتناء أجمل القطع المختارة</p>

                    <div className="grid md:grid-cols-2 gap-12 border-t border-gray-50 pt-12">
                      <div className="space-y-4">
                        <h3 className="text-xl font-black text-gray-900 border-b border-gray-50 pb-3">{t('shippingInfo')}</h3>
                        <p className="text-gray-600 font-bold">{formData.firstName} {formData.lastName}</p>
                        <p className="text-gray-400">{formData.address}</p>
                        <p className="text-gray-400">{formData.phone}</p>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xl font-black text-gray-900 border-b border-gray-50 pb-3">{t('paymentInfo')}</h3>
                        <div className="flex items-center justify-end gap-3 text-gray-600 font-bold">
                          {formData.paymentMethod === 'card' ? (
                            <>
                              {language === 'ar' ? 'بطاقة بنكية ينتهي رقمها بـ ' : 'Bank card ending in '} {formData.cardNumber.slice(-4) || '****'}
                              <CreditCard className="text-rose-500" />
                            </>
                          ) : (
                            <>
                              {formData.paymentMethod === 'tabby' ? (language === 'ar' ? 'الدفع عبر تابي' : 'Pay via Tabby') : (language === 'ar' ? 'الدفع عبر تمارا' : 'Pay via Tamara')}
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black italic ${formData.paymentMethod === 'tabby' ? 'bg-[#00D3C3] text-black' : 'bg-[#FFB703] text-black'}`}>
                                {formData.paymentMethod}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-16">
                      <Button onClick={() => setStep("payment")} variant="outline" className="h-16 rounded-full border-2 text-xl font-bold">{language === 'ar' ? "العودة" : "Back"}</Button>
                      <Button
                        onClick={() => placeOrderMutation.mutate({
                          shippingAddress: {
                            name: `${formData.firstName} ${formData.lastName}`,
                            phone: formData.phone,
                            address: formData.address,
                          },
                          paymentMethod: formData.paymentMethod,
                          couponCode: couponCode || undefined
                        })}
                        disabled={placeOrderMutation.isPending}
                        className="h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-xl font-bold shadow-xl shadow-rose-100"
                      >
                        {t('placeOrder')}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 text-right sticky top-40">
              <h3 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-4">{t('orderSummary')}</h3>
              <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-end gap-4">
                    <div className="grow text-right">
                      <p className="font-bold text-gray-900 truncate max-w-[150px]">{language === 'ar' ? item.product?.nameAr : item.product?.nameEn}</p>
                      <p className="text-sm text-gray-400">{language === 'ar' ? 'الكمية: ' : 'Qty: '}{item.quantity}</p>
                    </div>
                    <img src={item.product?.images?.[0]} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-black text-rose-600 text-xl">{language === 'ar' ? subtotal.toLocaleString('ar-SA') : subtotal.toLocaleString()} {t('currency')}</span>
                  <span className="text-gray-500 font-bold uppercase text-sm">{language === 'ar' ? "المجموع" : "Subtotal"}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="font-black text-green-600 text-xl">-{language === 'ar' ? totalDiscount.toLocaleString('ar-SA') : totalDiscount.toLocaleString()} {t('currency')}</span>
                    <span className="text-gray-500 font-bold uppercase text-sm">{t('discount')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-black text-gray-900 text-xl">{shipping === 0 ? (language === 'ar' ? 'مجاني' : 'Free') : `${language === 'ar' ? shipping.toLocaleString('ar-SA') : shipping.toLocaleString()} ${t('currency')}`}</span>
                  <span className="text-gray-500 font-bold uppercase text-sm">{language === 'ar' ? "الشحن" : "Shipping"}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                <span className="font-black text-rose-600 text-3xl">{language === 'ar' ? total.toLocaleString('ar-SA') : total.toLocaleString()} {t('currency')}</span>
                <span className="text-gray-900 font-black text-xl">{t('orderTotal')}</span>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center gap-3">
                <Lock size={16} className="text-rose-500" />
                <span className="text-xs font-bold text-gray-500">{language === 'ar' ? 'مشفر وآمن بالكامل (SSL)' : 'Fully Encrypted & Secure (SSL)'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
