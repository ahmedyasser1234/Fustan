import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  productImage: string;
  productName: string;
}

export function TryOnModal({ isOpen, onClose, productImage, productName }: TryOnModalProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [userImage, setUserImage] = useState<File | null>(null);
  const [userPreview, setUserPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: credits, isLoading: creditsLoading } = useQuery({
    queryKey: ["ai-credits"],
    queryFn: () => endpoints.aiSubscriptions.getMyCredits(),
    enabled: !!user && isOpen,
  });

  const hasCredits = credits && credits.remainingCredits > 0;

  const handleUserImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(language === 'ar' ? 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجا)' : 'Image too large (max 5MB)');
        return;
      }
      setUserImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async () => {
    if (!user) {
      toast.info(language === 'ar' ? 'يرجى تسجيل الدخول أولاً لاستخدام التجربة الافتراضية' : 'Please login first to use virtual try-on');
      onClose();
      setLocation("/login");
      return;
    }
    if (!userPreview || !userImage) {
      toast.error(language === 'ar' ? 'يرجى رفع صورتك أولاً' : 'Please upload your photo first');
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const formData = new FormData();
      
      // Fetch product image and convert to blob
      const res = await fetch(productImage);
      const blob = await res.blob();
      formData.append('dressImage', blob, 'dress.jpg');
      
      // User image
      formData.append('customerImage', userImage);
      
      // Defaults
      formData.append('scenePreset', 'random');
      formData.append('pose', 'random');

      const response = await api.post('/ai/virtual-model', formData);

      if (response.data?.imageUrl) {
        setGeneratedImage(response.data.imageUrl);
        toast.success(language === 'ar' ? 'تمت معالجة التجربة بنجاح!' : 'Try-on processed successfully!');
        // Update credits
        queryClient.invalidateQueries({ queryKey: ["ai-credits"] });
      } else {
        throw new Error('No image URL received');
      }
    } catch (error: any) {
      const srvMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      const baseMsg = language === 'ar' ? 'فشلت عملية التجربة' : 'Try-on failed';
      toast.error(`${baseMsg}: ${srvMsg || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-rose-500" />
            {language === 'ar' ? 'جربي الفستان افتراضياً' : 'Virtual Try-On'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {!generatedImage ? (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Product Preview */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-500 text-center">{language === 'ar' ? 'فستانك المختار' : 'Selected Dress'}</p>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-50">
                  <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* User Upload */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-500 text-center">{language === 'ar' ? 'صورتك الشخصية' : 'Your Photo'}</p>
                {!userPreview ? (
                  <label className="block aspect-[3/4] cursor-pointer">
                    <div className="h-full border-2 border-dashed border-rose-200 rounded-2xl flex flex-col items-center justify-center bg-rose-50/30 hover:bg-rose-50 transition-all group">
                      <div className="bg-white p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform mb-4">
                        <Upload className="w-8 h-8 text-rose-500" />
                      </div>
                      <p className="text-sm font-bold text-gray-700">{language === 'ar' ? 'ارفعي صورتك' : 'Upload Your Photo'}</p>
                      <p className="text-[10px] text-gray-400 mt-2">{language === 'ar' ? 'صورة كاملة للجسم أفضل' : 'Full body photo works best'}</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleUserImageChange} />
                  </label>
                ) : (
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-rose-100 shadow-sm">
                    <img src={userPreview} alt="User" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => { setUserImage(null); setUserPreview(''); }}
                      className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-rose-600 hover:bg-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-center font-bold text-rose-600">{language === 'ar' ? '✨ إليكِ كيف ستبدين بالفستان!' : '✨ Here is how you look in the dress!'}</p>
              <div className="aspect-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-rose-50 bg-white">
                <img src={generatedImage} alt="Result" className="w-full h-auto" />
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setGeneratedImage(null)}>
                  {language === 'ar' ? 'تجربة أخرى' : 'Try Again'}
                </Button>
                <a href={generatedImage} download="fustan-tryon.png" className="flex-1">
                  <Button className="w-full h-12 rounded-xl bg-gray-900">
                    {language === 'ar' ? 'تحميل الصورة' : 'Download Image'}
                  </Button>
                </a>
              </div>
            </div>
          )}

          {!generatedImage && (
            <div className="pt-4 flex flex-col gap-4">
              {!hasCredits && !creditsLoading && user ? (
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-center space-y-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-900">{language === 'ar' ? "نفذ رصيدك" : "Out of Credits"}</p>
                    <p className="text-xs text-amber-700 mt-1">{language === 'ar' ? "يرجى شحن رصيدك لتتمكن من استخدام ميزة التجربة الذكية" : "Please purchase credits to continue using AI features"}</p>
                  </div>
                  <Button 
                    onClick={() => { onClose(); setLocation("/pricing"); }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-12 font-bold"
                  >
                    {language === 'ar' ? "شحن الرصيد" : "Purchase Credits"}
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    onClick={handleTryOn} 
                    disabled={isLoading || !userPreview || creditsLoading} 
                    className="h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white font-bold text-lg shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        {language === 'ar' ? 'ابدئي التجربة الآن' : 'Start Try-On Now'}
                      </>
                    )}
                  </Button>
                  <div className="text-center space-y-2">
                    <p className="text-[10px] text-gray-400 px-8">
                      {language === 'ar' 
                        ? 'سيتم خصم 1 كريديت من رصيدك عند بدء التجربة.' 
                        : '1 credit will be deducted from your balance for this try-on.'}
                    </p>
                    {credits && (
                      <p className="text-xs font-bold text-rose-600">
                        {language === 'ar' ? `رصيدك المتبقي: ${credits.remainingCredits}` : `Remaining Credits: ${credits.remainingCredits}`}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
