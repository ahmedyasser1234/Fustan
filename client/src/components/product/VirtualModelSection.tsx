import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Upload, X, Download, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import api from "@/lib/api";
import { toast } from "sonner";

// ─── Data ─────────────────────────────────────────────────────────────────────

const MODEL_PRESETS = [
  { id: 'avery',    label: 'Avery',   emoji: '👩' },
  { id: 'sam',      label: 'Sam',     emoji: '🧑' },
  { id: 'taylor',   label: 'Taylor',  emoji: '👩‍🦰' },
  { id: 'kendall',  label: 'Kendall', emoji: '👱‍♀️' },
  { id: 'jordan',   label: 'Jordan',  emoji: '🧑‍🦱' },
  { id: 'casey',    label: 'Casey',   emoji: '👩‍🦳' },
  { id: 'maya',     label: 'Maya',    emoji: '👩🏽' },
  { id: 'reece',    label: 'Reece',   emoji: '🧑🏻' },
  { id: 'lena',     label: 'Lena',    emoji: '👩🏼' },
  { id: 'julia',    label: 'Julia',   emoji: '👩🏾' },
  { id: 'jackson',  label: 'Jackson', emoji: '🧔' },
  { id: 'sophia',   label: 'Sophia',  emoji: '👸' },
  { id: 'emma',     label: 'Emma',    emoji: '👩‍🦱' },
  { id: 'ava',      label: 'Ava',     emoji: '👩🏿' },
  { id: 'zoe',      label: 'Zoe',     emoji: '💁‍♀️' },
  { id: 'fiona',    label: 'Fiona',   emoji: '🙆‍♀️' },
];

const SCENE_PRESETS = [
  { id: 'random',          labelAr: 'عشوائي',        labelEn: 'Random',           emoji: '🎲' },
  { id: 'street',          labelAr: 'شارع',           labelEn: 'Street',           emoji: '🏙️' },
  { id: 'bedroom',         labelAr: 'غرفة نوم',       labelEn: 'Bedroom',          emoji: '🛏️' },
  { id: 'sunset',          labelAr: 'غروب',           labelEn: 'Sunset',           emoji: '🌅' },
  { id: 'beach',           labelAr: 'شاطئ',           labelEn: 'Beach',            emoji: '🏖️' },
  { id: 'studio',          labelAr: 'استوديو',        labelEn: 'Studio',           emoji: '📸' },
  { id: 'coloredstudio',   labelAr: 'استوديو ملون',   labelEn: 'Colored Studio',   emoji: '🎨' },
  { id: 'concretestudio',  labelAr: 'استوديو خرساني', labelEn: 'Concrete Studio',  emoji: '🏗️' },
  { id: 'tropical',        labelAr: 'استوائي',        labelEn: 'Tropical',         emoji: '🌴' },
  { id: 'library',         labelAr: 'مكتبة',          labelEn: 'Library',          emoji: '📚' },
  { id: 'forest',          labelAr: 'غابة',           labelEn: 'Forest',           emoji: '🌲' },
  { id: 'businessdistrict',labelAr: 'حي تجاري',       labelEn: 'Business District',emoji: '🏢' },
  { id: 'countryside',     labelAr: 'ريف',            labelEn: 'Countryside',      emoji: '🌾' },
  { id: 'flowers',         labelAr: 'زهور',           labelEn: 'Flowers',          emoji: '🌸' },
  { id: 'goldenlight',     labelAr: 'ضوء ذهبي',       labelEn: 'Golden Light',     emoji: '✨' },
  { id: 'mountain',        labelAr: 'جبل',            labelEn: 'Mountain',         emoji: '⛰️' },
  { id: 'pool',            labelAr: 'حمام سباحة',     labelEn: 'Pool',             emoji: '🏊' },
  { id: 'cafe',            labelAr: 'مقهى',           labelEn: 'Cafe',             emoji: '☕' },
  { id: 'nightlights',     labelAr: 'أضواء ليلية',    labelEn: 'Night Lights',     emoji: '🌃' },
  { id: 'desert',          labelAr: 'صحراء',          labelEn: 'Desert',           emoji: '🏜️' },
];

const POSE_PRESETS = [
  { id: 'random',            labelAr: 'عشوائي',          labelEn: 'Random',              emoji: '🎲' },
  { id: 'standing',          labelAr: 'وقوف',            labelEn: 'Standing',            emoji: '🧍' },
  { id: '34turn',            labelAr: 'التفاتة ¾',        labelEn: '¾ Turn',              emoji: '💃' },
  { id: 'powerstance',       labelAr: 'وقفة قوة',         labelEn: 'Power Stance',        emoji: '🦸' },
  { id: 'walkingforward',    labelAr: 'مشي للأمام',       labelEn: 'Walking Forward',     emoji: '🚶‍♀️' },
  { id: 'handinpocket',      labelAr: 'يد في الجيب',      labelEn: 'Hand in Pocket',      emoji: '🤷' },
  { id: 'crossedarms',       labelAr: 'ذراعان متقاطعتان','labelEn': 'Crossed Arms',       emoji: '🙆' },
  { id: 'back',              labelAr: 'من الخلف',         labelEn: 'Back',                emoji: '🔙' },
  { id: 'overtheshoulder',   labelAr: 'التفاتة',          labelEn: 'Over the Shoulder',   emoji: '👀' },
  { id: 'seated',            labelAr: 'جلوس',             labelEn: 'Seated',              emoji: '🪑' },
  { id: 'adjustingclothing', labelAr: 'تعديل الملابس',    labelEn: 'Adjusting Clothing',  emoji: '👗' },
  { id: 'playfulspin',       labelAr: 'دوران مرح',        labelEn: 'Playful Spin',        emoji: '🌀' },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface VirtualModelSectionProps {
  productImage?: string;
}

export function VirtualModelSection({ productImage }: VirtualModelSectionProps) {
  const { language } = useLanguage();

  const [image, setImage]           = useState<File | null>(null);
  const [preview, setPreview]       = useState<string>(productImage || '');
  const [modelPreset, setModelPreset] = useState('avery');
  const [scenePreset, setScenePreset] = useState('random');
  const [pose, setPose]             = useState('random');
  const [isLoading, setIsLoading]   = useState(false);
  const [result, setResult]         = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error(language === 'ar' ? 'حجم الصورة كبير جداً (الحد الأقصى 10 ميجا)' : 'Image too large (max 10MB)');
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handleGenerate = async () => {
    if (!image && !productImage) {
      toast.error(language === 'ar' ? 'يرجى رفع صورة الملابس أولاً' : 'Please upload a clothing image first');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      if (image) {
        formData.append('image', image);
      } else if (productImage) {
        // Fetch product image as blob and append
        const res = await fetch(productImage);
        const blob = await res.blob();
        formData.append('image', blob, 'product.jpg');
      }
      formData.append('modelPreset', modelPreset);
      formData.append('scenePreset', scenePreset);
      formData.append('pose', pose);

      const response = await api.post('/ai/virtual-model', formData);
      if (response.data?.imageUrl) {
        setResult(response.data.imageUrl);
        toast.success(language === 'ar' ? '✨ تم إنشاء الصورة بنجاح!' : '✨ Image generated successfully!');
      }
    } catch (error: any) {
      console.error('Virtual Model Error:', error);
      const msg = error?.response?.data?.message || (language === 'ar' ? 'فشل في إنشاء الصورة' : 'Failed to generate image');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 relative z-20 bg-gradient-to-b from-[#f8f4ff] to-white">
      <div className="mx-auto px-4 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            {language === 'ar' ? 'مدعوم بـ PhotoRoom AI' : 'Powered by PhotoRoom AI'}
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            {language === 'ar' ? 'موديل افتراضي بالذكاء الاصطناعي' : 'AI Virtual Model'}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {language === 'ar'
              ? 'ارفع صورة الملابس واختر الموديل والمشهد لإنتاج صورة احترافية فورية'
              : 'Upload a clothing photo, choose a model & scene to produce an instant professional photo'}
          </p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">

          {/* ── Left Panel: Controls ── */}
          <Card className="p-6 shadow-xl border-0 bg-white rounded-3xl space-y-6">

            {/* Upload */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-3 block">
                {language === 'ar' ? '📸 صورة الملابس' : '📸 Clothing Image'}
              </Label>
              {!preview ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-purple-300 rounded-2xl aspect-[3/4] flex flex-col items-center justify-center gap-3 hover:border-purple-500 hover:bg-purple-50 transition-all">
                    <Upload className="w-10 h-10 text-purple-400" />
                    <p className="text-sm text-gray-500 text-center px-4">
                      {language === 'ar' ? 'اضغط لرفع صورة الملابس' : 'Click to upload clothing photo'}
                    </p>
                    <span className="text-xs text-gray-400">PNG, JPG – max 10MB</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-gray-100 border-2 border-purple-200">
                  <img src={preview} alt="Clothing" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setImage(null); setPreview(''); setResult(null); }}
                    className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full shadow-md hover:bg-red-50 transition"
                  >
                    <X size={16} />
                  </button>
                  <label className="absolute bottom-2 left-2 bg-white/90 text-purple-700 px-3 py-1 rounded-full text-xs font-bold cursor-pointer flex items-center gap-1 shadow hover:bg-purple-50 transition">
                    <RefreshCw size={12} />
                    {language === 'ar' ? 'تغيير' : 'Change'}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            {/* Model Preset */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-3 block">
                {language === 'ar' ? '👤 اختر الموديل' : '👤 Choose Model'}
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {MODEL_PRESETS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModelPreset(m.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                      modelPreset === m.id
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-100 text-gray-600 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                  >
                    <span className="text-lg">{m.emoji}</span>
                    <span className="truncate w-full text-center">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scene Preset */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-3 block">
                {language === 'ar' ? '🏞️ المشهد' : '🏞️ Scene'}
              </Label>
              <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1">
                {SCENE_PRESETS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setScenePreset(s.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                      scenePreset === s.id
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-100 text-gray-600 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                  >
                    <span className="text-lg">{s.emoji}</span>
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
              <div className="grid grid-cols-4 gap-2">
                {POSE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPose(p.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                      pose === p.id
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-100 text-gray-600 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                  >
                    <span className="text-lg">{p.emoji}</span>
                    <span className="truncate w-full text-center">{language === 'ar' ? p.labelAr : p.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isLoading || (!image && !productImage)}
              className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-200 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {language === 'ar' ? 'جاري الإنشاء...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  {language === 'ar' ? 'إنشاء الموديل الافتراضي' : 'Generate Virtual Model'}
                </>
              )}
            </Button>
          </Card>

          {/* ── Right Panel: Result ── */}
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            {isLoading ? (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 mb-2">
                    {language === 'ar' ? 'جاري إنشاء صورة احترافية...' : 'Creating professional photo...'}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {language === 'ar' ? 'قد يستغرق الأمر 15-30 ثانية' : 'This may take 15-30 seconds'}
                  </p>
                </div>
                {/* Progress bar animation */}
                <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full animate-pulse" style={{ width: '70%' }} />
                </div>
              </div>
            ) : result ? (
              <div className="w-full max-w-lg">
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                    <Sparkles className="w-4 h-4" />
                    {language === 'ar' ? 'تم الإنشاء بنجاح!' : 'Generated Successfully!'}
                  </span>
                </div>
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-100">
                  <img
                    src={result}
                    alt="Virtual Model Result"
                    className="w-full h-auto object-contain bg-gray-50"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <a
                    href={result}
                    download="virtual-model.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-purple-200"
                  >
                    <Download size={18} />
                    {language === 'ar' ? 'تحميل الصورة' : 'Download Image'}
                  </a>
                  <Button
                    variant="outline"
                    onClick={() => { setResult(null); }}
                    className="px-5 py-3 rounded-2xl border-2 border-purple-200 text-purple-700 font-bold hover:bg-purple-50 transition"
                  >
                    <RefreshCw size={18} className="mr-2" />
                    {language === 'ar' ? 'إنشاء مجدداً' : 'Regenerate'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center opacity-60">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-purple-400" />
                </div>
                <p className="text-gray-500 font-medium text-lg">
                  {language === 'ar'
                    ? 'ارفع صورة واضغط إنشاء لترى النتيجة هنا'
                    : 'Upload an image and click Generate to see the result here'}
                </p>
                <ul className="text-sm text-gray-400 space-y-1 text-start">
                  {(language === 'ar'
                    ? ['✅ صورة الملابس بخلفية واضحة', '✅ اختر الموديل المناسب', '✅ اختر المشهد والوضعية']
                    : ['✅ Clothing image with clear background', '✅ Choose your model', '✅ Pick a scene & pose']
                  ).map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
