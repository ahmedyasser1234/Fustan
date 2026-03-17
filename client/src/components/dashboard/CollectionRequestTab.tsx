import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Layers, Plus, Calendar, Clock, Image as ImageIcon, CheckCircle, XCircle, AlertCircle, Info, Upload } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { endpoints } from "../../lib/api";
import { useLanguage } from "../../lib/i18n";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { toast } from "sonner";
import { Textarea } from "../../components/ui/textarea";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import React from "react";
import { cn } from "../../lib/utils";

export default function CollectionRequestTab() {
    const { language, t } = useLanguage();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Form State
    const [nameAr, setNameAr] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [descriptionAr, setDescriptionAr] = useState("");
    const [descriptionEn, setDescriptionEn] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { data: requests, isLoading } = useQuery({
        queryKey: ['vendor', 'collection-requests'],
        queryFn: () => endpoints.vendorRequests.myRequests(),
    });

    const collectionRequests = requests?.filter((r: any) => r.type === 'collection_request') || [];

    const submitRequest = useMutation({
        mutationFn: (data: any) => endpoints.vendorRequests.create(data),
        onSuccess: () => {
            toast.success(language === 'ar' ? "تم إرسال طلب المجموعة بنجاح" : "Collection request sent successfully");
            setIsCreateModalOpen(false);
            resetForm();
            queryClient.invalidateQueries({ queryKey: ['vendor', 'collection-requests'] });
        },
        onError: () => {
            toast.error(language === 'ar' ? "فشل إرسال الطلب" : "Failed to send request");
        }
    });

    const resetForm = () => {
        setNameAr("");
        setNameEn("");
        setDescriptionAr("");
        setDescriptionEn("");
        setImageUrl("");
        setImageFile(null);
        setUploadMode("file");
    };

    const handleSubmit = () => {
        if (!nameAr || !nameEn) {
            return toast.error(language === 'ar' ? "يرجى ملء البيانات المطلوبة" : "Please fill in all required fields");
        }

        if (uploadMode === 'url' && !imageUrl) {
            return toast.error(language === 'ar' ? "يرجى إدخال رابط الصورة" : "Please enter image URL");
        }

        if (uploadMode === 'file' && !imageFile) {
            return toast.error(language === 'ar' ? "يرجى تحميل صورة" : "Please upload an image");
        }

        if (uploadMode === 'file' && imageFile) {
            const formData = new FormData();
            formData.append("type", "collection_request");
            formData.append("data", JSON.stringify({
                nameAr,
                nameEn,
                descriptionAr,
                descriptionEn
            }));
            formData.append("image", imageFile);
            submitRequest.mutate(formData);
        } else {
            submitRequest.mutate({
                type: 'collection_request',
                data: {
                    nameAr,
                    nameEn,
                    descriptionAr,
                    descriptionEn,
                    imageUrl
                }
            });
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            <p className="text-slate-400 font-bold">{language === 'ar' ? "تحميل الطلبات..." : "Loading requests..."}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{language === 'ar' ? "طلبات المجموعات" : "Collection Requests"}</h2>
                    <p className="text-slate-400 font-bold">{language === 'ar' ? "اطلب إضافة مجموعات جديدة لمنتجاتك وتابع حالة طلباتك" : "Request new collections for your products and track their status"}</p>
                </div>

                <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black shadow-xl shadow-slate-200 gap-3"
                >
                    <Plus className="w-5 h-5" />
                    {language === 'ar' ? "طلب مجموعة جديدة" : "Request New Collection"}
                </Button>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 rounded-[32px] p-8 border border-amber-100 flex items-start gap-6 relative overflow-hidden group">
                <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-200/50 group-hover:rotate-12 transition-transform duration-500">
                    <Info className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-black text-amber-900">{language === 'ar' ? "لماذا لا أستطيع إضافة المجموعات مباشرة؟" : "Why can't I add collections directly?"}</h3>
                    <p className="text-amber-700/70 font-bold leading-relaxed">
                        {language === 'ar' 
                            ? "لضمان تنظيم المتجر وجودة التصنيفات، يقوم المشرفون بمراجعة وإضافة المجموعات يدوياً. بمجرد الموافقة على طلبك، ستظهر المجموعة في قائمة اختياراتك عند إضافة منتج جديد."
                            : "To ensure store organization and category quality, administrators review and add collections manually. Once approved, the collection will appear in your selection when adding a new product."}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collectionRequests.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center space-y-4">
                        <Layers className="w-12 h-12 text-slate-200" />
                        <p className="font-bold text-slate-300 italic">{language === 'ar' ? "لا توجد طلبات مجموعات حالياً" : "No collection requests yet"}</p>
                    </div>
                ) : (
                    collectionRequests.map((request: any) => (
                        <Card key={request.id} className="border-0 shadow-xl shadow-slate-100/50 rounded-[32px] overflow-hidden bg-white group hover:shadow-2xl transition-all duration-500">
                            <div className="relative aspect-video bg-slate-100 overflow-hidden">
                                {request.data.imageUrl && (
                                    <img src={request.data.imageUrl} alt="Collection" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                )}
                                <div className={`absolute bottom-4 ${language === 'ar' ? 'right-4' : 'left-4'}`}>
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg",
                                        request.status === 'pending' ? "bg-amber-500 text-white" :
                                        request.status === 'approved' ? "bg-emerald-500 text-white" :
                                        "bg-red-500 text-white"
                                    )}>
                                        {language === 'ar' ? 
                                            (request.status === 'pending' ? "قيد المراجعة" : request.status === 'approved' ? "تمت الموافقة" : "مرفوض") : 
                                            request.status
                                        }
                                    </span>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 mb-1">
                                        {language === 'ar' ? request.data.nameAr : request.data.nameEn}
                                    </h3>
                                    <p className="text-slate-400 font-bold text-sm line-clamp-2">
                                        {language === 'ar' ? request.data.descriptionAr : request.data.descriptionEn}
                                    </p>
                                </div>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs font-bold">
                                            {format(new Date(request.createdAt), "dd/MM/yyyy")}
                                        </span>
                                    </div>
                                    {request.adminNotes && (
                                        <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 max-w-[150px]">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span className="text-[10px] font-bold truncate">{request.adminNotes}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl rounded-[32px] p-0 overflow-hidden border-0 bg-white shadow-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Request New Collection</DialogTitle>
                    </DialogHeader>
                    <DialogHeader className="p-8 pb-4 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-black text-slate-900">
                                {language === 'ar' ? "طلب مجموعة جديدة" : "Request New Collection"}
                            </DialogTitle>
                            <p className="text-sm font-bold text-slate-400 mt-1">
                                {language === 'ar' ? "املأ بيانات المجموعة المطلوبة للمراجعة" : "Fill in collection details for review"}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                            <Layers className="w-6 h-6 text-indigo-600" />
                        </div>
                    </DialogHeader>
                    
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Name AR */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "الاسم (بالعربية)" : "NAME (AR)"}</label>
                                <Input 
                                    className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-50 font-bold"
                                    placeholder="مثال: تشكيلة الصيف"
                                    value={nameAr}
                                    onChange={(e) => setNameAr(e.target.value)}
                                    dir="rtl"
                                />
                            </div>
                            {/* Name EN */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "NAME (EN)" : "NAME (EN)"}</label>
                                <Input 
                                    className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-50 font-bold"
                                    placeholder="e.g. Summer Collection"
                                    value={nameEn}
                                    onChange={(e) => setNameEn(e.target.value)}
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Description AR */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "الوصف (بالعربية)" : "DESCRIPTION (AR)"}</label>
                                <Textarea 
                                    className="min-h-[100px] rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-50 font-bold p-4"
                                    placeholder="وصف مختصر للمجموعة..."
                                    value={descriptionAr}
                                    onChange={(e) => setDescriptionAr(e.target.value)}
                                    dir="rtl"
                                />
                            </div>
                            {/* Description EN */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "DESCRIPTION (EN)" : "DESCRIPTION (EN)"}</label>
                                <Textarea 
                                    className="min-h-[100px] rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-50 font-bold p-4"
                                    placeholder="Short description for the collection..."
                                    value={descriptionEn}
                                    onChange={(e) => setDescriptionEn(e.target.value)}
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* Image Input Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                    {language === 'ar' ? "صورة المجموعة" : "COLLECTION IMAGE"}
                                </label>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button 
                                        onClick={() => setUploadMode("file")}
                                        className={cn("px-3 py-1 rounded-lg text-[10px] font-black transition-all", uploadMode === 'file' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400")}
                                    >
                                        {language === 'ar' ? "تحميل ملف" : "UPLOAD"}
                                    </button>
                                    <button 
                                        onClick={() => setUploadMode("url")}
                                        className={cn("px-3 py-1 rounded-lg text-[10px] font-black transition-all", uploadMode === 'url' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400")}
                                    >
                                        {language === 'ar' ? "رابط خارجي" : "URL"}
                                    </button>
                                </div>
                            </div>

                            {uploadMode === 'file' ? (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-video bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group transition-all duration-500 hover:border-indigo-300 cursor-pointer"
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
                                                <Upload className="w-6 h-6 text-indigo-600" />
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
                                        className="h-14 pl-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-50 font-bold"
                                        placeholder="https://example.com/collection.jpg"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button 
                                variant="ghost" 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="flex-1 h-14 rounded-2xl font-black text-slate-400 hover:bg-slate-50"
                            >
                                {language === 'ar' ? "إلغاء" : "Cancel"}
                            </Button>
                            <Button 
                                onClick={handleSubmit}
                                disabled={submitRequest.isPending}
                                className="flex-[2] h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-100"
                            >
                                {submitRequest.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (language === 'ar' ? "إرسال الطلب للمراجعة" : "Submit for Review")}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
