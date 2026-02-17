import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Upload, X, Image as ImageIcon, Save } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";

interface TryOnSectionProps {
    productName: string;
    productImage: string;
    productDescription?: string;
}

export function TryOnSection({ productName, productImage, productDescription }: TryOnSectionProps) {
    const { language } = useLanguage();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingMeasurements, setIsSavingMeasurements] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    // Image uploads
    const [dressImage, setDressImage] = useState<File | null>(null);
    const [dressPreview, setDressPreview] = useState<string>('');
    const [userImage, setUserImage] = useState<File | null>(null);
    const [userPreview, setUserPreview] = useState<string>('');

    // Comprehensive Tailor Measurements
    const [measurements, setMeasurements] = useState({
        // Basic Info
        height: '',
        weight: '',

        // Upper Body
        neck: '',
        shoulders: '',
        bust: '',
        underBust: '',

        // Core Body
        waist: '',
        hips: '',

        // Arm Measurements
        armLength: '',
        armCircumference: '',
        wrist: '',

        // Dress Lengths
        dressLength: '',
        kneeLength: '',

        // Back Measurements
        backWidth: '',
        frontLength: ''
    });

    // Pre-fill measurements from user profile
    useEffect(() => {
        if (user?.measurements) {
            setMeasurements(prev => ({
                ...prev,
                ...user.measurements
            }));
        }
    }, [user]);

    // Sync dressPreview with productImage prop if no manual file is selected
    useEffect(() => {
        if (!dressImage && productImage) {
            setDressPreview(productImage);
        }
    }, [productImage, dressImage]);

    const handleSaveMeasurements = async () => {
        if (!user) {
            toast.error(language === 'ar' ? "يرجى تسجيل الدخول لحفظ المقاسات" : "Please login to save measurements");
            return;
        }

        setIsSavingMeasurements(true);
        try {
            await api.patch(`/users/${user.id}`, { measurements });
            toast.success(language === 'ar' ? "تم حفظ المقاسات بنجاح" : "Measurements saved successfully");
            // Optionally update local storage/auth state if needed, but the patch should be enough for next visit
        } catch (err) {
            console.error(err);
            toast.error(language === 'ar' ? "فشل حفظ المقاسات" : "Failed to save measurements");
        } finally {
            setIsSavingMeasurements(false);
        }
    };

    const handleDressImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(language === 'ar' ? 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجا)' : 'Image too large (max 5MB)');
                return;
            }
            setDressImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setDressPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

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

    const removeDressImage = () => {
        setDressImage(null);
        setDressPreview('');
    };

    const removeUserImage = () => {
        setUserImage(null);
        setUserPreview('');
    };

    const handleGenerate = async () => {
        if (!dressPreview || !userImage) {
            toast.error(language === 'ar' ? 'يرجى اختيار صورة الفستان وصورتك' : 'Please select both dress and your photo');
            return;
        }

        // Validate all measurements
        const requiredFields = [
            'height', 'weight', 'neck', 'shoulders', 'bust', 'underBust',
            'waist', 'hips', 'armLength', 'armCircumference', 'wrist',
            'dressLength', 'kneeLength', 'backWidth', 'frontLength'
        ];
        const missingFields = requiredFields.filter(field => !measurements[field as keyof typeof measurements]);

        if (missingFields.length > 0) {
            toast.error(language === 'ar' ? 'يرجى إدخال جميع المقاسات' : 'Please enter all measurements');
            return;
        }

        setIsLoading(true);
        setGeneratedImage(null);

        try {
            const formData = new FormData();
            if (dressImage) {
                formData.append('dressImage', dressImage);
            } else if (dressPreview) {
                formData.append('productImage', dressPreview);
            }

            formData.append('userImage', userImage);
            formData.append('productName', productName);
            formData.append('productDescription', productDescription || '');

            // Add all measurements
            Object.entries(measurements).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const response = await api.post('/ai/try-on', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data && response.data.imageUrl) {
                setGeneratedImage(response.data.imageUrl);
                toast.success(language === 'ar' ? 'تم إنشاء الصورة بنجاح!' : 'Image generated successfully!');

                if (response.data.mock) {
                    toast.info(language === 'ar' ? 'هذه صورة تجريبية (لا يوجد مفتاح API)' : 'This is a mock image (No API Key)');
                }
            }
        } catch (error) {
            console.error('Try-On Error:', error);
            toast.error(language === 'ar' ? 'فشل إنشاء الصورة. حاول مرة أخرى' : 'Failed to generate image. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="pt-0 pb-24 relative z-20">
            <div className="absolute inset-x-0 top-0 bottom-0 bg-[#f2f2f2] -z-10" />
            <div className="mx-auto px-4 relative z-10 w-full">

                {/* Section Header */}
                <div className="text-center mb-16 pt-20">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Sparkles className="w-8 h-8 text-[oklch(58.6%_0.253_17.585)]" />
                        <h2 className="text-4xl md:text-5xl font-bold">
                            {language === 'ar' ? 'جربي الفستان بالذكاء الاصطناعي' : 'AI Virtual Try-On'}
                        </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                        {language === 'ar'
                            ? 'ارفعي صورة الفستان وصورتك، ودعي الذكاء الاصطناعي يريكِ كيف ستبدين به'
                            : 'Upload a dress photo and your photo, let AI show you how you\'ll look'}
                    </p>
                </div>

                <div className="w-[90%] mx-auto">
                    <Card className="overflow-hidden shadow-2xl border-0">
                        {/* Single wide column layout */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50">
                            {/* Upload Section - Horizontal Layout */}
                            <div className="p-8 md:p-12">
                                <h3 className="text-2xl font-bold mb-8 text-gray-900 text-center">
                                    {language === 'ar' ? 'ارفعي الصور' : 'Upload Images'}
                                </h3>

                                {/* Images Side by Side */}
                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    {/* Dress Image Upload */}
                                    <div>
                                        <Label className="text-lg font-bold mb-4 block text-gray-900 flex items-center gap-2">
                                            <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                            {language === 'ar' ? 'صورة الفستان' : 'Dress Photo'}
                                        </Label>
                                        {!dressPreview ? (
                                            <label className="block cursor-pointer">
                                                <div className="border-2 border-dashed border-purple-300 rounded-2xl p-8 hover:border-purple-500 transition-all bg-white/70 hover:bg-white hover:shadow-lg h-64 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <Upload className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                                                        <p className="font-bold text-gray-800 text-base mb-1">
                                                            {language === 'ar' ? 'اضغطي لرفع صورة الفستان' : 'Click to upload dress photo'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {language === 'ar' ? 'PNG, JPG (حتى 5 ميجا)' : 'PNG, JPG (up to 5MB)'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleDressImageChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        ) : (
                                            <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl border-2 border-purple-200 h-64">
                                                <img src={dressPreview} alt="Dress" className="w-full h-full object-cover" />
                                                {!dressImage && (
                                                    <div className="absolute bottom-3 left-3 bg-purple-600/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                                        <ImageIcon size={12} />
                                                        {language === 'ar' ? 'صورة المنتج المختارة' : 'Selected Product Image'}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={removeDressImage}
                                                    className="absolute top-3 right-3 bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Image Upload */}
                                    <div>
                                        <Label className="text-lg font-bold mb-4 block text-gray-900 flex items-center gap-2">
                                            <span className="bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                            {language === 'ar' ? 'صورتك' : 'Your Photo'}
                                        </Label>
                                        {!userPreview ? (
                                            <label className="block cursor-pointer">
                                                <div className="border-2 border-dashed border-pink-300 rounded-2xl p-8 hover:border-pink-500 transition-all bg-white/70 hover:bg-white hover:shadow-lg h-64 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-pink-400" />
                                                        <p className="font-bold text-gray-800 text-base mb-1">
                                                            {language === 'ar' ? 'اضغطي لرفع صورتك' : 'Click to upload your photo'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {language === 'ar' ? 'PNG, JPG (حتى 5 ميجا)' : 'PNG, JPG (up to 5MB)'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleUserImageChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        ) : (
                                            <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl border-2 border-pink-200 h-64">
                                                <img src={userPreview} alt="You" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={removeUserImage}
                                                    className="absolute top-3 right-3 bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Measurements Section */}
                                <div className="mb-6">
                                    <Label className="text-xl font-bold mb-6 block text-gray-900 flex items-center gap-2 justify-center">
                                        <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                                        {language === 'ar' ? 'مقاساتك الكاملة ' : 'Complete Measurements '}
                                    </Label>

                                    {/* Basic Info */}
                                    <div className="mb-5">
                                        <p className="text-xs font-semibold text-purple-600 mb-3 uppercase tracking-wide">
                                            {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Info'}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-purple-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'الطول' : 'Height'}
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="165"
                                                        value={measurements.height}
                                                        onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-xs md:text-sm font-semibold text-gray-400">سم</span>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-purple-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'الوزن' : 'Weight'}
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="60"
                                                        value={measurements.weight}
                                                        onChange={(e) => setMeasurements({ ...measurements, weight: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-xs md:text-sm font-semibold text-gray-400">كجم</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Upper Body */}
                                    <div className="mb-5">
                                        <p className="text-xs font-semibold text-pink-600 mb-3 uppercase tracking-wide">
                                            {language === 'ar' ? 'الجزء العلوي' : 'Upper Body'}
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-pink-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'محيط الرقبة' : 'Neck'}
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="36"
                                                        value={measurements.neck}
                                                        onChange={(e) => setMeasurements({ ...measurements, neck: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-[10px] md:text-xs font-semibold text-gray-400">سم</span>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-pink-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'عرض الأكتاف' : 'Shoulders'}
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="38"
                                                        value={measurements.shoulders}
                                                        onChange={(e) => setMeasurements({ ...measurements, shoulders: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-[10px] md:text-xs font-semibold text-gray-400">سم</span>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-pink-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'محيط الصدر' : 'Bust'}
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="90"
                                                        value={measurements.bust}
                                                        onChange={(e) => setMeasurements({ ...measurements, bust: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-[10px] md:text-xs font-semibold text-gray-400">سم</span>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-pink-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'تحت الصدر' : 'Under Bust'}
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="75"
                                                        value={measurements.underBust}
                                                        onChange={(e) => setMeasurements({ ...measurements, underBust: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-[10px] md:text-xs font-semibold text-gray-400">سم</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Core Body */}
                                    <div className="mb-5">
                                        <p className="text-xs font-semibold text-purple-600 mb-3 uppercase tracking-wide">
                                            {language === 'ar' ? 'الجسم الأوسط' : 'Core Body'}
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-purple-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'محيط الخصر' : 'Waist'}
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="70"
                                                        value={measurements.waist}
                                                        onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-[10px] md:text-xs font-semibold text-gray-400">سم</span>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-purple-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'محيط الأرداف' : 'Hips'}
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="95"
                                                        value={measurements.hips}
                                                        onChange={(e) => setMeasurements({ ...measurements, hips: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-[10px] md:text-xs font-semibold text-gray-400">سم</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Arm Measurements */}
                                    <div className="mb-5">
                                        <p className="text-xs font-semibold text-pink-600 mb-3 uppercase tracking-wide">
                                            {language === 'ar' ? 'قياسات الذراع' : 'Arm Measurements'}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-pink-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'طول الذراع' : 'Arm Length'}
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="58"
                                                        value={measurements.armLength}
                                                        onChange={(e) => setMeasurements({ ...measurements, armLength: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-[10px] md:text-xs font-semibold text-gray-400">سم</span>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-pink-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'محيط الذراع' : 'Arm Circle'}
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="28"
                                                        value={measurements.armCircumference}
                                                        onChange={(e) => setMeasurements({ ...measurements, armCircumference: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-[10px] md:text-xs font-semibold text-gray-400">سم</span>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-pink-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'محيط الرسغ' : 'Wrist'}
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="16"
                                                        value={measurements.wrist}
                                                        onChange={(e) => setMeasurements({ ...measurements, wrist: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-[10px] md:text-xs font-semibold text-gray-400">سم</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dress Lengths */}
                                    <div className="mb-5">
                                        <p className="text-xs font-semibold text-purple-600 mb-3 uppercase tracking-wide">
                                            {language === 'ar' ? 'أطوال الفستان' : 'Dress Lengths'}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-purple-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'طول الفستان الكامل' : 'Full Dress Length'}
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="100"
                                                        value={measurements.dressLength}
                                                        onChange={(e) => setMeasurements({ ...measurements, dressLength: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-[10px] md:text-xs font-semibold text-gray-400">سم</span>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-purple-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'طول حتى الركبة' : 'Knee Length'}
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="60"
                                                        value={measurements.kneeLength}
                                                        onChange={(e) => setMeasurements({ ...measurements, kneeLength: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-[10px] md:text-xs font-semibold text-gray-400">سم</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Back Measurements */}
                                    <div>
                                        <p className="text-xs font-semibold text-pink-600 mb-3 uppercase tracking-wide">
                                            {language === 'ar' ? 'قياسات الظهر' : 'Back Measurements'}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-pink-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'عرض الظهر' : 'Back Width'}
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="35"
                                                        value={measurements.backWidth}
                                                        onChange={(e) => setMeasurements({ ...measurements, backWidth: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-[10px] md:text-xs font-semibold text-gray-400">سم</span>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-gray-100 hover:border-pink-200 transition-colors">
                                                <Label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 md:2 block">
                                                    {language === 'ar' ? 'طول الأمام' : 'Front Length'}
                                                </Label>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="42"
                                                        value={measurements.frontLength}
                                                        onChange={(e) => setMeasurements({ ...measurements, frontLength: e.target.value })}
                                                        className="h-8 md:h-10 text-center text-sm md:text-base font-bold border-0 bg-gray-50 focus:bg-white"
                                                    />
                                                    <span className="text-[10px] md:text-xs font-semibold text-gray-400">سم</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Measurement Persistence */}
                                {user && (
                                    <Button
                                        variant="outline"
                                        onClick={handleSaveMeasurements}
                                        disabled={isSavingMeasurements}
                                        className="w-full border-2 border-purple-100 text-purple-600 font-bold h-12 rounded-2xl flex items-center justify-center gap-2 hover:bg-purple-50 transition-all mb-4"
                                    >
                                        {isSavingMeasurements ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {language === 'ar' ? "حفظ هذه القياسات لملفي الشخصي" : "Save these measurements to my profile"}
                                    </Button>
                                )}

                                {/* Generate Button */}
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isLoading || !dressImage || !userImage ||
                                        !measurements.height || !measurements.weight ||
                                        !measurements.bust || !measurements.waist || !measurements.hips ||
                                        !measurements.shoulders || !measurements.armLength || !measurements.dressLength}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-14 text-lg font-bold rounded-full shadow-lg transition-all disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-5 w-5" />
                                            {language === 'ar' ? 'اصنعي السحر!' : 'Create Magic!'}
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-center text-gray-500 mt-3">
                                    {language === 'ar'
                                        ? 'قد تستغرق العملية 10-30 ثانية'
                                        : 'Process may take 10-30 seconds'}
                                </p>
                            </div>

                            {/* Result Section - Below the form */}
                            {(generatedImage || isLoading) && (
                                <div className="p-8 md:p-12 bg-white border-t-4 border-purple-200">
                                    {generatedImage && (
                                        <div className="max-w-5xl mx-auto">
                                            <h3 className="text-2xl font-bold mb-6 text-gray-900 text-center flex items-center justify-center gap-2">
                                                <Sparkles className="w-7 h-7 text-purple-600" />
                                                {language === 'ar' ? 'النتيجة السحرية' : 'Magic Result'}
                                            </h3>
                                            <div className="rounded-2xl overflow-hidden shadow-2xl bg-white border-2 border-purple-200">
                                                <img
                                                    src={generatedImage}
                                                    alt="AI Try-On Result"
                                                    className="w-full h-auto object-contain"
                                                    referrerPolicy="no-referrer"
                                                />
                                            </div>
                                            <a
                                                href={generatedImage}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-6 inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all font-bold text-lg shadow-lg"
                                            >
                                                <Sparkles size={20} />
                                                {language === 'ar' ? 'افتحي بحجم كامل' : 'Open Full Size'}
                                            </a>
                                        </div>
                                    )}

                                    {isLoading && (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
                                            <p className="text-purple-700 font-bold text-xl animate-pulse">
                                                {language === 'ar' ? 'جاري صنع السحر...' : 'Creating magic...'}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {language === 'ar' ? 'يرجى الانتظار...' : 'Please wait...'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Info Alert */}
                    <div className="mt-8 bg-purple-50 border border-purple-200 rounded-2xl p-6 text-center">
                        <p className="text-purple-800 font-medium">
                            {language === 'ar'
                                ? '💡 نصيحة: استخدمي صوراً واضحة بإضاءة جيدة للحصول على أفضل النتائج'
                                : '💡 Tip: Use clear photos with good lighting for best results'}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
