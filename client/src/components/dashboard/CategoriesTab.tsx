import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Layers, Search, ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { endpoints } from "../../lib/api";
import { useLanguage } from "../../lib/i18n";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { toast } from "sonner";
import { Textarea } from "../../components/ui/textarea";
import React from "react";

interface CategoriesTabProps {
    onCategoryClick?: (id: number) => void;
}

export default function CategoriesTab({ onCategoryClick }: CategoriesTabProps) {
    const { language } = useLanguage();
    const [search, setSearch] = useState("");
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestNameAr, setRequestNameAr] = useState("");
    const [requestNameEn, setRequestNameEn] = useState("");
    const [requestDescAr, setRequestDescAr] = useState("");
    const [requestDescEn, setRequestDescEn] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const submitRequest = useMutation({
        mutationFn: (data: any) => endpoints.vendorRequests.create(data),
        onSuccess: () => {
            toast.success(language === 'ar' ? "تم إرسال طلبك بنجاح" : "Request sent successfully");
            setIsRequestModalOpen(false);
            resetForm();
        },
        onError: () => {
            toast.error(language === 'ar' ? "فشل إرسال الطلب" : "Failed to send request");
        }
    });

    const resetForm = () => {
        setRequestNameAr("");
        setRequestNameEn("");
        setRequestDescAr("");
        setRequestDescEn("");
        setImageUrl("");
        setImageFile(null);
        setUploadMode("file");
    };

    const handleRequestSubmit = () => {
        if (!requestNameAr || !requestNameEn) {
            return toast.error(language === 'ar' ? "يرجى إدخال اسم القسم بالعربية والإنجليزية" : "Please enter category name in both Arabic and English");
        }

        if (uploadMode === 'url' && !imageUrl) {
            return toast.error(language === 'ar' ? "يرجى إدخال رابط الصورة" : "Please enter image URL");
        }

        if (uploadMode === 'file' && !imageFile) {
            return toast.error(language === 'ar' ? "يرجى تحميل صورة" : "Please upload an image");
        }

        if (uploadMode === 'file' && imageFile) {
            const formData = new FormData();
            formData.append("type", "category_request");
            formData.append("data", JSON.stringify({
                nameAr: requestNameAr,
                nameEn: requestNameEn,
                descriptionAr: requestDescAr,
                descriptionEn: requestDescEn
            }));
            formData.append("image", imageFile);
            submitRequest.mutate(formData);
        } else {
            submitRequest.mutate({
                type: 'category_request',
                data: {
                    nameAr: requestNameAr,
                    nameEn: requestNameEn,
                    descriptionAr: requestDescAr,
                    descriptionEn: requestDescEn,
                    imageUrl
                }
            });
        }
    };

    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => endpoints.categories.list(),
    });

    const filteredCategories = categories?.filter((cat: any) =>
        (language === 'ar' ? cat.nameAr : cat.nameEn).toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            <p className="text-slate-400 font-black">{language === 'ar' ? "تحميل الأقسام..." : "Loading categories..."}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{language === 'ar' ? "الأقسام والموضة" : "Style Categories"}</h2>
                    <p className="text-slate-400 font-bold">{language === 'ar' ? "تصفح الأقسام العالمية ونظم مجموعاتك بناءً عليها" : "Browse global categories and organize your collections"}</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300`} />
                    <Input
                        placeholder={language === 'ar' ? "ابحث عن قسم..." : "Search categories..."}
                        className={`h-14 ${language === 'ar' ? 'pr-12' : 'pl-12'} rounded-2xl border-slate-100 bg-white shadow-sm font-bold focus:ring-4 focus:ring-purple-50`}
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCategories?.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 italic font-bold text-slate-300">
                        {language === 'ar' ? "لا توجد أقسام تطابق بحثك" : "No categories match your search"}
                    </div>
                ) : (
                    filteredCategories?.map((category: any) => (
                        <Card
                            key={category.id}
                            className={cn(
                                "group border-0 shadow-xl shadow-slate-100/50 rounded-[40px] overflow-hidden bg-white transition-all duration-500",
                                onCategoryClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl' : ''
                            )}
                            onClick={() => onCategoryClick?.(category.id)}
                        >
                            <CardContent className="p-10 relative">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-50 rounded-full -ml-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="flex flex-col items-center text-center space-y-6">
                                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:bg-purple-600 group-hover:rotate-12 group-hover:scale-110 overflow-hidden">
                                        {category.image ? (
                                            <img src={category.image} alt={language === 'ar' ? category.nameAr : category.nameEn} className="w-full h-full object-cover" />
                                        ) : (
                                            <Layers className="w-10 h-10 text-slate-200 group-hover:text-white transition-colors" />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-black text-2xl text-slate-800 mb-2">
                                            {language === 'ar' ? category.nameAr : category.nameEn}
                                        </h3>
                                        <p className="text-sm font-bold text-slate-400 line-clamp-2">
                                            {language === 'ar' ? category.descriptionAr : category.descriptionEn}
                                        </p>
                                    </div>

                                    {onCategoryClick && (
                                        <div className="pt-4 flex items-center gap-2 text-[#e91e63] font-black text-xs uppercase tracking-widest opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                            {language === 'ar' ? "تصفح المجموعات" : "Browse Collections"}
                                            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="bg-slate-900 rounded-[24px] md:rounded-[40px] p-6 md:p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                <div className={`relative z-10 max-w-lg ${language === 'ar' ? 'text-center md:text-right' : 'text-center md:text-left'}`}>
                    <h4 className="text-xl md:text-2xl font-black mb-2">{language === 'ar' ? "ملحوظة للبائعين" : "Vendor Notice"}</h4>
                    <p className="text-slate-400 font-bold text-sm md:text-base leading-relaxed">{language === 'ar' ? "الأقسام يتم إدارتها من قبل إدارة المنصة لضمان تجربة مستخدم موحدة. يمكنك إنشاء مجموعاتك الخاصة داخل هذه الأقسام." : "Categories are managed by the platform administration to ensure a unified user experience. You can create your own collections within these categories."}</p>
                </div>
                <div className="relative z-10 w-full md:w-auto">
                    <Button 
                        variant="outline" 
                        className="w-full md:w-auto h-12 md:h-14 px-8 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 font-black"
                        onClick={() => setIsRequestModalOpen(true)}
                    >
                        {language === 'ar' ? "طلب قسم جديد" : "Request New Category"}
                    </Button>
                </div>

                <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
                    <DialogContent className="max-w-2xl rounded-[32px] p-0 overflow-hidden border-0 bg-white">
                        <DialogHeader className="p-8 pb-4 bg-slate-50 border-b border-slate-100">
                            <DialogTitle className="text-2xl font-black text-slate-900">
                                {language === 'ar' ? "طلب قسم جديد" : "Request New Category"}
                            </DialogTitle>
                            <p className="text-sm font-bold text-slate-400 mt-2">
                                {language === 'ar' ? "سيتم مراجعة طلبك من قبل المشرفين وإضافته في أقرب وقت" : "Your request will be reviewed by admins and added soon"}
                            </p>
                        </DialogHeader>
                        <div className="p-0 overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "اسم القسم (بالعربية)" : "NAME (ARABIC)"}</label>
                                        <Input 
                                            className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-purple-50 font-bold"
                                            placeholder="مثال: فساتين دانتيل"
                                            value={requestNameAr}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequestNameAr(e.target.value)}
                                            dir="rtl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "NAME (ENGLISH)" : "NAME (ENGLISH)"}</label>
                                        <Input 
                                            className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-purple-50 font-bold"
                                            placeholder="Example: Lace Dresses"
                                            value={requestNameEn}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequestNameEn(e.target.value)}
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "وصف القسم (بالعربية)" : "DESCRIPTION (ARABIC)"}</label>
                                        <Textarea 
                                            className="min-h-[100px] rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-purple-50 font-bold p-4"
                                            placeholder="صِف هذا القسم وكيف يساعد المتسوقين..."
                                            value={requestDescAr}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequestDescAr(e.target.value)}
                                            dir="rtl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "DESCRIPTION (ENGLISH)" : "DESCRIPTION (ENGLISH)"}</label>
                                        <Textarea 
                                            className="min-h-[100px] rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-purple-50 font-bold p-4"
                                            placeholder="Describe this category and how it helps shoppers..."
                                            value={requestDescEn}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequestDescEn(e.target.value)}
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                {/* Image Input Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                            {language === 'ar' ? "صورة القسم" : "CATEGORY IMAGE"}
                                        </label>
                                        <div className="flex bg-slate-100 p-1 rounded-xl">
                                            <button 
                                                onClick={() => setUploadMode("file")}
                                                className={cn("px-3 py-1 rounded-lg text-[10px] font-black transition-all", uploadMode === 'file' ? "bg-white text-purple-600 shadow-sm" : "text-slate-400")}
                                            >
                                                {language === 'ar' ? "تحميل ملف" : "UPLOAD"}
                                            </button>
                                            <button 
                                                onClick={() => setUploadMode("url")}
                                                className={cn("px-3 py-1 rounded-lg text-[10px] font-black transition-all", uploadMode === 'url' ? "bg-white text-purple-600 shadow-sm" : "text-slate-400")}
                                            >
                                                {language === 'ar' ? "رابط خارجي" : "URL"}
                                            </button>
                                        </div>
                                    </div>

                                    {uploadMode === 'file' ? (
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-video bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group transition-all duration-500 hover:border-purple-300 cursor-pointer"
                                        >
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                            />
                                            {imageFile ? (
                                                <div className="relative w-full h-full">
                                                    <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Upload className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center p-8 space-y-4">
                                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto transition-transform group-hover:translate-y-[-4px]">
                                                        <Upload className="w-6 h-6 text-purple-600" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-black text-slate-900 text-sm">{language === 'ar' ? "اضغط لتحميل الصورة" : "Click to upload image"}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{language === 'ar' ? "PNG, JPG حتى 5 ميجابايت" : "PNG, JPG up to 5MB"}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                            <Input 
                                                className="h-12 pl-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-purple-50 font-bold"
                                                placeholder="https://example.com/category.jpg"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button variant="ghost" onClick={() => setIsRequestModalOpen(false)} className="h-12 px-8 rounded-xl font-bold text-slate-400">
                                        {language === 'ar' ? "تراجع" : "Cancel"}
                                    </Button>
                                    <Button 
                                        className="h-12 px-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black shadow-lg shadow-purple-100"
                                        onClick={handleRequestSubmit}
                                        disabled={submitRequest.isPending}
                                    >
                                        {submitRequest.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (language === 'ar' ? "إرسال الطلب" : "Send Request")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                <Layers className="absolute -right-16 -bottom-16 w-48 h-48 md:w-64 md:h-64 text-white/5 -rotate-12" />
            </div>
        </div>
    );
}
