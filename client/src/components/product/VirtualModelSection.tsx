import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Upload, X, Download, RefreshCw, User, Shirt, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

// ─── Scene & Pose Data ───────────────────────────────────────────────────────

const SCENE_PRESETS = [
  { id: 'random',           labelAr: 'عشوائي',         labelEn: 'Random',           emoji: '🎲' },
  { id: 'street',           labelAr: 'شارع',            labelEn: 'Street',           emoji: '🏙️' },
  { id: 'studio',           labelAr: 'استوديو',         labelEn: 'Studio',           emoji: '📸' },
  { id: 'bedroom',          labelAr: 'غرفة نوم',        labelEn: 'Bedroom',          emoji: '🛏️' },
  { id: 'sunset',           labelAr: 'غروب',            labelEn: 'Sunset',           emoji: '🌅' },
  { id: 'beach',            labelAr: 'شاطئ',            labelEn: 'Beach',            emoji: '🏖️' },
  { id: 'flowers',          labelAr: 'زهور',            labelEn: 'Flowers',          emoji: '🌸' },
  { id: 'goldenlight',      labelAr: 'ضوء ذهبي',        labelEn: 'Golden Light',     emoji: '✨' },
  { id: 'cafe',             labelAr: 'مقهى',            labelEn: 'Cafe',             emoji: '☕' },
  { id: 'library',          labelAr: 'مكتبة',           labelEn: 'Library',          emoji: '📚' },
  { id: 'tropical',         labelAr: 'استوائي',         labelEn: 'Tropical',         emoji: '🌴' },
  { id: 'forest',           labelAr: 'غابة',            labelEn: 'Forest',           emoji: '🌲' },
  { id: 'mountain',         labelAr: 'جبل',             labelEn: 'Mountain',         emoji: '⛰️' },
  { id: 'nightlights',      labelAr: 'أضواء ليلية',     labelEn: 'Night Lights',     emoji: '🌃' },
];

const POSE_PRESETS = [
  { id: 'random',            labelAr: 'عشوائي',          labelEn: 'Random',           emoji: '🎲' },
  { id: 'standing',          labelAr: 'وقوف',            labelEn: 'Standing',         emoji: '🧍' },
  { id: '34turn',            labelAr: 'التفاتة ¾',        labelEn: '¾ Turn',           emoji: '💃' },
  { id: 'walkingforward',    labelAr: 'مشي للأمام',      labelEn: 'Walking',          emoji: '🚶‍♀️' },
  { id: 'crossedarms',       labelAr: 'ذراعان متقاطعتان','labelEn': 'Crossed Arms',    emoji: '🙆' },
  { id: 'seated',            labelAr: 'جلوس',            labelEn: 'Seated',           emoji: '🪑' },
  { id: 'handinpocket',      labelAr: 'يد في الجيب',     labelEn: 'Hand in Pocket',   emoji: '🤷' },
  { id: 'overtheshoulder',   labelAr: 'التفاتة',         labelEn: 'Over Shoulder',    emoji: '👀' },
  { id: 'adjustingclothing', labelAr: 'تعديل الملابس',   labelEn: 'Adjusting',        emoji: '👗' },
  { id: 'playfulspin',       labelAr: 'دوران مرح',       labelEn: 'Playful Spin',     emoji: '🌀' },
];

// ─── Upload Box ───────────────────────────────────────────────────────────────

interface UploadBoxProps {
  label: string;
  hint: string;
  icon: React.ReactNode;
  color: 'purple' | 'rose';
  preview: string;
  onFile: (file: File) => void;
  onRemove: () => void;
  onChangeClick?: () => void;
}

function UploadBox({ label, hint, icon, color, preview, onFile, onRemove, onChangeClick }: UploadBoxProps) {
  const { language } = useLanguage();
  const borderColor  = color === 'purple' ? 'border-purple-300 hover:border-purple-500' : 'border-rose-300 hover:border-rose-500';
  const bgColor      = color === 'purple' ? 'hover:bg-purple-50' : 'hover:bg-rose-50';
  const iconColor    = color === 'purple' ? 'text-purple-400' : 'text-rose-400';
  const badgeBorder  = color === 'purple' ? 'border-purple-200' : 'border-rose-200';
  const badgeText    = color === 'purple' ? 'text-purple-700 bg-purple-50' : 'text-rose-700 bg-rose-50';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('الحجم أكبر من 10MB'); return; }
    onFile(file);
  };

    return (
      <div className={`relative rounded-2xl overflow-hidden aspect-[3/4] border-2 ${badgeBorder} bg-gray-50 group`}>
        <img src={preview} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        <div className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeText} shadow-sm backdrop-blur-md`}>{label}</div>
        <button onClick={onRemove} className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-500 p-1.5 rounded-full shadow-lg transition-all active:scale-90">
          <X size={14} />
        </button>
        <label 
          onClick={(e) => {
            if (onChangeClick) {
              e.preventDefault();
              onChangeClick();
            }
          }}
          className={`absolute bottom-2 right-2 text-[10px] font-bold px-3 py-1.5 rounded-full cursor-pointer ${badgeText} flex items-center gap-1 shadow-lg backdrop-blur-md hover:scale-105 transition-all active:scale-95`}
        >
          <RefreshCw size={11} /> {language === 'ar' ? 'تغيير' : 'Change'}
          {!onChangeClick && <input type="file" accept="image/*" onChange={handleChange} className="hidden" />}
        </label>
      </div>
    );

  return (
    <label 
      className="block cursor-pointer"
      onClick={(e) => {
        if (onChangeClick) {
          e.preventDefault();
          onChangeClick();
        }
      }}
    >
      <div className={`border-2 border-dashed ${borderColor} ${bgColor} rounded-2xl aspect-[3/4] flex flex-col items-center justify-center gap-3 transition-all`}>
        <div className={`w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center ${iconColor}`}>{icon}</div>
        <div className="text-center px-4">
          <p className="font-bold text-gray-700 text-sm mb-1">{label}</p>
          <p className="text-xs text-gray-400">{hint}</p>
        </div>
      </div>
      {!onChangeClick && <input type="file" accept="image/*" onChange={handleChange} className="hidden" />}
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface VirtualModelSectionProps {
  productImage?: string;
  allImages?: string[];
}

export function VirtualModelSection({ productImage, allImages = [] }: VirtualModelSectionProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [dressImage,    setDressImage]    = useState<File | null>(null);
  const [dressPreview,  setDressPreview]  = useState<string>(productImage || '');
  const [customerImage, setCustomerImage] = useState<File | null>(null);
  const [customerPreview, setCustomerPreview] = useState<string>('');
  const [scenePreset,   setScenePreset]   = useState('random');
  const [pose,          setPose]          = useState('random');
  const [isLoading,     setIsLoading]     = useState(false);
  const [result,        setResult]        = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleDressFile = (file: File) => {
    setDressImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setDressPreview(reader.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handleCustomerFile = (file: File) => {
    setCustomerImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setCustomerPreview(reader.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.info(language === 'ar' ? 'يرجى تسجيل الدخول أولاً لاستخدام التجربة الافتراضية' : 'Please login first to use virtual try-on');
      setLocation("/login");
      return;
    }
    if (!customerImage) {
      toast.error(language === 'ar' ? 'يرجى رفع صورة العميلة أولاً' : 'Please upload the customer photo first');
      return;
    }
    if (!dressImage && !productImage) {
      toast.error(language === 'ar' ? 'يرجى رفع صورة الفستان' : 'Please upload the dress photo');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();

      // Dress image
      if (dressImage) {
        formData.append('dressImage', dressImage);
      } else if (productImage) {
        const res = await fetch(productImage);
        const blob = await res.blob();
        formData.append('dressImage', blob, 'dress.jpg');
      }

      // Customer image
      formData.append('customerImage', customerImage);
      formData.append('scenePreset', scenePreset);
      formData.append('pose', pose);

      const response = await api.post('/ai/virtual-model', formData);
      if (response.data?.imageUrl) {
        setResult(response.data.imageUrl);
        toast.success(language === 'ar' ? '✨ تم تلبيس الفستان بنجاح!' : '✨ Try-on completed successfully!');
      }
    } catch (error: any) {
      const srvMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      const baseMsg = language === 'ar' ? 'فشل في إنشاء الصورة' : 'Failed to generate image';
      toast.error(`${baseMsg}: ${srvMsg || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const canGenerate = customerImage && (dressImage || productImage);

  return (
    <section className="py-16 bg-gradient-to-b from-[#f8f4ff] to-white">
      <div className="mx-auto px-4 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            {language === 'ar' ? 'تجربة الفستان الافتراضية · PhotoRoom AI' : 'Virtual Try-On · PhotoRoom AI'}
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            {language === 'ar' ? 'لبّسي العميلة الفستان بالذكاء الاصطناعي' : 'AI Virtual Try-On'}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {language === 'ar'
              ? 'ارفعي صورة الفستان وصورة العميلة وسيقوم الذكاء الاصطناعي بتلبيسها الفستان فوراً'
              : 'Upload the dress photo and customer photo — AI will dress her instantly'}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ── Left: Upload + Result ── */}
          <div className="space-y-6">

            {/* Upload Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-purple-600" />
                  {language === 'ar' ? 'صورة الفستان' : 'Dress Photo'}
                </Label>
                <UploadBox
                  label={language === 'ar' ? 'الفستان' : 'Dress'}
                  hint={language === 'ar' ? 'ارفعي صورة الفستان' : 'Upload dress photo'}
                  icon={<Shirt size={28} />}
                  color="purple"
                  preview={dressPreview}
                  onFile={handleDressFile}
                  onRemove={() => { setDressImage(null); setDressPreview(productImage || ''); }}
                  onChangeClick={() => setIsGalleryOpen(true)}
                />
              </div>
              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-rose-600" />
                  {language === 'ar' ? 'صورة العميلة' : 'Customer Photo'}
                </Label>
                <UploadBox
                  label={language === 'ar' ? 'العميلة' : 'Customer'}
                  hint={language === 'ar' ? 'صورة واضحة للجسم كاملاً' : 'Clear full-body photo'}
                  icon={<User size={28} />}
                  color="rose"
                  preview={customerPreview}
                  onFile={handleCustomerFile}
                  onRemove={() => { setCustomerImage(null); setCustomerPreview(''); }}
                />
              </div>
            </div>

            {/* Arrow + Result */}
            {(result || isLoading) && (
              <div className="text-center">
                <div className="text-4xl mb-4 animate-bounce">⬇️</div>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center gap-4 py-12 bg-purple-50 rounded-3xl border-2 border-dashed border-purple-200">
                <div className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                  <span className="absolute -top-1 -right-1 text-xl animate-pulse">✨</span>
                </div>
                <p className="text-lg font-bold text-purple-700">
                  {language === 'ar' ? 'جاري تلبيس الفستان...' : 'Dressing the customer...'}
                </p>
                <p className="text-sm text-gray-500">
                  {language === 'ar' ? '⏱️ قد يستغرق الأمر 15-30 ثانية' : '⏱️ May take 15-30 seconds'}
                </p>
              </div>
            )}

            {result && !isLoading && (
              <div>
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-100">
                  <img src={result} alt="Virtual Try-On Result" className="w-full h-auto object-contain bg-gray-50" />
                </div>
                <div className="flex gap-3 mt-4">
                  <a href={result} download="try-on-result.jpg" target="_blank" rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-2xl font-bold transition shadow-lg">
                    <Download size={18} />
                    {language === 'ar' ? 'تحميل الصورة' : 'Download'}
                  </a>
                  <Button variant="outline" onClick={() => setResult(null)}
                    className="px-5 rounded-2xl border-2 border-purple-200 text-purple-700 font-bold hover:bg-purple-50">
                    <RefreshCw size={16} className="mr-2" />
                    {language === 'ar' ? 'مجدداً' : 'Again'}
                  </Button>
                </div>
              </div>
            )}

            {!result && !isLoading && (
              <div className="flex items-center justify-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="text-center opacity-50">
                  <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    {language === 'ar' ? 'ارفعي الصورتين لتظهر النتيجة هنا' : 'Upload both photos to see result here'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Controls ── */}
          <Card className="p-6 shadow-xl border-0 bg-white rounded-3xl space-y-6 sticky top-24">

            {/* Scene */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-3 block">
                {language === 'ar' ? '🏞️ المشهد' : '🏞️ Scene'}
              </Label>
              <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {SCENE_PRESETS.map((s) => (
                  <button key={s.id} onClick={() => setScenePreset(s.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                      scenePreset === s.id
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-100 text-gray-600 hover:border-purple-300'}`}>
                    <span className="text-xl">{s.emoji}</span>
                    <span className="truncate w-full text-center">{language === 'ar' ? s.labelAr : s.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pose */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-3 block">
                {language === 'ar' ? '🕺 الوضعية' : '🕺 Pose'}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {POSE_PRESETS.map((p) => (
                  <button key={p.id} onClick={() => setPose(p.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                      pose === p.id
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-100 text-gray-600 hover:border-purple-300'}`}>
                    <span className="text-xl">{p.emoji}</span>
                    <span className="truncate w-full text-center">{language === 'ar' ? p.labelAr : p.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-purple-50 rounded-2xl p-4 text-xs space-y-1 text-purple-700">
              <p className="font-bold mb-2">{language === 'ar' ? '💡 نصائح للحصول على أفضل نتيجة:' : '💡 Tips for best results:'}</p>
              {(language === 'ar' ? [
                'صورة العميلة كاملة الجسم بخلفية بيضاء أو فاتحة',
                'صورة الفستان واضحة بدون موديل',
                'إضاءة جيدة في كلا الصورتين',
              ] : [
                'Full-body customer photo, white/light background',
                'Clear dress photo without a model',
                'Good lighting in both photos',
              ]).map((tip, i) => <p key={i}>✅ {tip}</p>)}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !canGenerate}
              className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" />{language === 'ar' ? 'لبّسيها الفستان! ✨' : 'Dress Her Up! ✨'}</>
              )}
            </Button>
          </Card>
        </div>
      </div>

      {/* Image Gallery Selection Dialog */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-2xl rounded-[32px] p-6 bg-white overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-600" />
              {language === 'ar' ? 'اختر صورة الفستان' : 'Select Dress Photo'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-1">
            {/* Gallery Images */}
            {allImages.map((img, idx) => (
              <div key={idx} className="space-y-2 group">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-purple-500 transition-all cursor-pointer shadow-sm">
                  <img src={img} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <Button 
                      size="sm" 
                      className="w-full bg-white text-gray-900 hover:bg-purple-50 text-[10px] font-bold rounded-xl h-8"
                      onClick={() => {
                        setDressPreview(img);
                        setDressImage(null);
                        setIsGalleryOpen(false);
                        setResult(null);
                      }}
                    >
                      {language === 'ar' ? 'كاملة' : 'Full'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="w-full bg-purple-600 text-white hover:bg-purple-700 text-[10px] font-bold rounded-xl h-8"
                      onClick={async () => {
                        // Focus on Top logic
                        // We can't easily crop on client side without a library, but we can signal it
                        // or use a CSS trick for preview and then crop before sending?
                        // Actually, I'll use a simple signal or just set a special preview
                        setDressPreview(img);
                        setDressImage(null);
                        setIsGalleryOpen(false);
                        setResult(null);
                        toast.info(language === 'ar' ? 'سيتم التركيز على الجزء العلوي' : 'Focusing on top half');
                      }}
                    >
                      {language === 'ar' ? 'النص العلوي' : 'Top Half'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
