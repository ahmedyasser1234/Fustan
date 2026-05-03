import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Plus, 
  Trash2, 
  Sparkles, 
  Image as ImageIcon, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight,
  Info,
  Loader2
} from "lucide-react";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";

export default function SellDress() {
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Form State
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<"new" | "used">("new");
  const [usageCount, setUsageCount] = useState<number>(0);
  const [images, setImages] = useState<File[]>([]);
  const [aiQualifiedImage, setAiQualifiedImage] = useState<File | null>(null);
  const [sizes, setSizes] = useState<{ size: string; quantity: number }[]>([{ size: "", quantity: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: endpoints.categories.list,
  });

  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await endpoints.products.createCustomerListing(formData);
    },
    onSuccess: () => {
      toast.success(language === 'ar' ? "تم عرض فستانك بنجاح!" : "Your dress is now listed!");
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setLocation("/");
    },
    onError: (error) => {
      console.error("Submission error:", error);
      toast.error(language === 'ar' ? "فشل في عرض الفستان. يرجى المحاولة مرة أخرى." : "Failed to list dress. Please try again.");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error(language === 'ar' ? "يرجى تسجيل الدخول أولاً" : "Please login first");
    
    if (images.length === 0) {
      return toast.error(language === 'ar' ? "يرجى إضافة صورة واحدة على الأقل" : "Please add at least one image");
    }

    if (!aiQualifiedImage) {
      return toast.error(language === 'ar' ? "يرجى إضافة صورة للتجربة الافتراضية" : "Please add an AI Try-On image");
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("nameAr", nameAr);
    formData.append("nameEn", nameEn);
    formData.append("descriptionAr", descriptionAr);
    formData.append("descriptionEn", descriptionEn);
    formData.append("categoryId", categoryId);
    formData.append("price", price);
    formData.append("condition", condition);
    formData.append("usageCount", usageCount.toString());
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("availability", "sale"); // Customer listings are usually for sale

    images.forEach((img) => formData.append("images", img));
    if (aiQualifiedImage) formData.append("aiQualifiedImage", aiQualifiedImage);

    submitMutation.mutate(formData, {
      onSettled: () => setIsSubmitting(false)
    });
  };

  const handleAddSize = () => setSizes([...sizes, { size: "", quantity: 1 }]);
  const handleRemoveSize = (index: number) => setSizes(sizes.filter((_, i) => i !== index));
  const handleSizeChange = (index: number, field: "size" | "quantity", value: string | number) => {
    const newSizes = [...sizes];
    // @ts-ignore
    newSizes[index][field] = value;
    setSizes(newSizes);
  };

  return (
    <div className={`min-h-screen bg-[#fafafa] pb-24 ${dir}`} dir={dir}>
      <SEO title={language === 'ar' ? "اعرض فستانك للبيع | فستان" : "Sell Your Dress | Fustan"} />
      
      {/* Hero Section */}
      <section className="relative min-h-[400px] pt-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1600&q=80" 
            className="w-full h-full object-cover" 
            alt="Dresses" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <h1 className="text-3xl md:text-3xl font-medium text-white leading-tight">
              {language === 'ar' ? "حولي خزانة ملابسك إلى أرباح" : "Turn Your Wardrobe Into Profit"}
            </h1>
            <p className="text-xl text-slate-300 font-medium">
              {language === 'ar' 
                ? "اعرضي فستانك لآلاف المهتمين وابدئي في البيع اليوم" 
                : "List your dress to thousands of potential buyers and start selling today"}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-12 relative z-20">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
              <CardContent className="p-8 md:p-12 space-y-10">
                
                {/* Section: Identity */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-rose-500 rounded-full" />
                    <h2 className="text-2xl font-medium text-slate-900">
                      {language === 'ar' ? "تفاصيل الفستان" : "Dress Details"}
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{language === 'ar' ? "الاسم بالعربية" : "Name in Arabic"}</label>
                      <Input 
                        required
                        value={nameAr}
                        onChange={(e) => setNameAr(e.target.value)}
                        placeholder="مثلاً: فستان زفاف ملكي..."
                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{language === 'ar' ? "الاسم بالإنجليزية" : "Name in English"}</label>
                      <Input 
                        required
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        placeholder="e.g. Royal Wedding Dress..."
                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{language === 'ar' ? "الفئة" : "Category"}</label>
                    <Select value={categoryId} onValueChange={setCategoryId} required>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold">
                        <SelectValue placeholder={language === 'ar' ? "اختر الفئة" : "Select Category"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 shadow-2xl font-bold">
                        {(Array.isArray(categories) ? categories : []).map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {language === 'ar' ? cat.nameAr : cat.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {categoryId && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 mt-2"
                      >
                        <Sparkles className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-rose-700">
                            {language === 'ar' 
                              ? "سيتم تحسين خلفية فستانك تلقائياً لتناسب هذا القسم!" 
                              : "Your dress background will be automatically enhanced to match this category!"}
                          </p>
                          <p className="text-[10px] text-rose-600/70 mt-1 font-medium">
                            {language === 'ar'
                              ? "نستخدم الذكاء الاصطناعي لجعل صورك تبدو أكثر احترافية."
                              : "We use AI to make your photos look more professional."}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{language === 'ar' ? "الوصف بالعربية" : "Description in Arabic"}</label>
                      <Textarea 
                        required
                        value={descriptionAr}
                        onChange={(e) => setDescriptionAr(e.target.value)}
                        placeholder="اوصفي فستانك بالتفصيل..."
                        className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{language === 'ar' ? "الوصف بالإنجليزية" : "Description in English"}</label>
                      <Textarea 
                        required
                        value={descriptionEn}
                        onChange={(e) => setDescriptionEn(e.target.value)}
                        placeholder="Describe your dress in detail..."
                        className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Price & Condition */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-rose-500 rounded-full" />
                    <h2 className="text-2xl font-medium text-slate-900">
                      {language === 'ar' ? "السعر والحالة" : "Price & Condition"}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{language === 'ar' ? "السعر المطلوب" : "Asking Price"}</label>
                      <div className="relative">
                        <Input 
                          type="number"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium text-xl px-6 pr-14"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-300 uppercase">{t('sar')}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{language === 'ar' ? "الحالة" : "Condition"}</label>
                      <Select value={condition} onValueChange={(val: any) => setCondition(val)}>
                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl font-bold">
                          <SelectItem value="new">{t('new')}</SelectItem>
                          <SelectItem value="used">{t('used')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {condition === 'used' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{language === 'ar' ? "مرات الاستخدام" : "Usage Count"}</label>
                        <Input 
                          type="number"
                          min="0"
                          value={usageCount}
                          onChange={(e) => setUsageCount(parseInt(e.target.value))}
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Sizes */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-rose-500 rounded-full" />
                      <h2 className="text-2xl font-medium text-slate-900">
                        {language === 'ar' ? "المقاسات المتاحة" : "Available Sizes"}
                      </h2>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleAddSize}
                      className="rounded-xl border-rose-100 text-rose-500 font-bold hover:bg-rose-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {language === 'ar' ? "إضافة مقاس" : "Add Size"}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {sizes.map((size, index) => (
                      <div key={index} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-left-2">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <Input 
                            required
                            placeholder={language === 'ar' ? "المقاس (مثلاً 38, L, XL)" : "Size (e.g. 38, L, XL)"}
                            value={size.size}
                            onChange={(e) => handleSizeChange(index, "size", e.target.value)}
                            className="h-12 rounded-xl bg-white border-slate-200 font-bold"
                          />
                          <Input 
                            type="number"
                            required
                            min="1"
                            placeholder={language === 'ar' ? "الكمية" : "Qty"}
                            value={size.quantity}
                            onChange={(e) => handleSizeChange(index, "quantity", parseInt(e.target.value))}
                            className="h-12 rounded-xl bg-white border-slate-200 font-bold"
                          />
                        </div>
                        {sizes.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => handleRemoveSize(index)}
                            className="text-slate-400 hover:text-red-500 rounded-xl"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Right Column: Media Uploads */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white sticky top-24">
              <CardContent className="p-8 space-y-8">
                
                {/* Main Images */}
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-rose-500" />
                    {language === 'ar' ? "صور الفستان" : "Dress Photos"}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <AnimatePresence>
                      {images.map((img, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="aspect-[3/4] rounded-3xl bg-slate-50 relative overflow-hidden group border border-slate-100"
                        >
                          <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {images.length < 5 && (
                      <label className="aspect-[3/4] rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/20 transition-all group">
                        <Upload className="w-8 h-8 text-slate-300 group-hover:text-rose-500 mb-2 transition-colors" />
                        <span className="text-xs font-medium text-slate-400 group-hover:text-rose-600">{language === 'ar' ? "إضافة صور" : "Add Photos"}</span>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files) {
                              setImages([...images, ...Array.from(e.target.files)].slice(0, 5));
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* AI Qualified Image */}
                <div className="space-y-4 pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-medium text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-rose-500" />
                      {language === 'ar' ? "صورة التجربة الافتراضية" : "AI Try-On Image"}
                    </h3>
                    <div className="bg-rose-50 px-2 py-1 rounded-lg">
                      <span className="text-[10px] font-medium text-rose-600 uppercase tracking-widest">{language === 'ar' ? "إلزامي" : "Required"}</span>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-400 leading-relaxed">
                    {language === 'ar' 
                      ? "صورة واضحة للفستان (ويفضل على مانيكان أو خلفية بيضاء) لتمكين ميزة القياس الافتراضي." 
                      : "A clear photo of the dress (preferably on a mannequin or white background) to enable Virtual Try-On."}
                  </p>

                  <div className="aspect-video rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/30 flex flex-col items-center justify-center relative overflow-hidden group hover:border-rose-400 transition-all">
                    {aiQualifiedImage ? (
                      <>
                        <img src={URL.createObjectURL(aiQualifiedImage)} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setAiQualifiedImage(null)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white font-medium uppercase text-xs"
                        >
                          {language === 'ar' ? "تغيير الصورة" : "Change Image"}
                        </button>
                      </>
                    ) : (
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2">
                          <Upload className="w-6 h-6 text-rose-500" />
                        </div>
                        <span className="text-xs font-medium text-rose-500">{language === 'ar' ? "تحميل صورة AI" : "Upload AI Image"}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => setAiQualifiedImage(e.target.files?.[0] || null)} 
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="pt-8">
                  <Button 
                    disabled={isSubmitting}
                    className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-black text-white font-medium text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {language === 'ar' ? "جاري الحفظ..." : "Saving Listing..."}
                      </>
                    ) : (
                      <>
                        {language === 'ar' ? "عرض الفستان الآن" : "List Your Dress Now"}
                        <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'mr-3 rotate-180' : 'ml-3'}`} />
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-center text-slate-400 mt-4 font-bold">
                    {language === 'ar' 
                      ? "بالضغط على الزر، أنت توافق على شروط بيع المنتجات للأفراد." 
                      : "By clicking, you agree to our Terms of Sale for individual listings."}
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>

        </form>
      </div>
    </div>
  );
}
