import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Share2, Instagram, Plus, Calendar, Clock, Image as ImageIcon, CheckCircle, XCircle, AlertCircle } from "lucide-react";
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

export default function SocialTab() {
    const { language, t } = useLanguage();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Form State
    const [caption, setCaption] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);

    const { data: requests, isLoading } = useQuery({
        queryKey: ['vendor', 'social-requests'],
        queryFn: () => endpoints.vendorRequests.myRequests(),
    });

    const socialRequests = requests?.filter((r: any) => r.type === 'social_post_request') || [];

    const submitRequest = useMutation({
        mutationFn: (data: any) => endpoints.vendorRequests.create(data),
        onSuccess: () => {
            toast.success(language === 'ar' ? "تم إرسال طلب المنشور بنجاح" : "Post request sent successfully");
            setIsCreateModalOpen(false);
            resetForm();
            queryClient.invalidateQueries({ queryKey: ['vendor', 'social-requests'] });
        },
        onError: () => {
            toast.error(language === 'ar' ? "فشل إرسال الطلب" : "Failed to send request");
        }
    });

    const resetForm = () => {
        setCaption("");
        setImageUrl("");
        setScheduledDate("");
        setScheduledTime("");
    };

    const handlePlatformToggle = (platform: string) => {
        setSelectedPlatforms(prev => 
            prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
        );
    };

    const handleSubmit = () => {
        if (!caption || !imageUrl) {
            return toast.error(language === 'ar' ? "يرجى ملء البيانات المطلوبة" : "Please fill in all required fields");
        }

        const scheduledAt = scheduledDate && scheduledTime 
            ? `${scheduledDate}T${scheduledTime}:00` 
            : undefined;

        submitRequest.mutate({
            type: 'social_post_request',
            data: {
                caption,
                mediaUrls: [imageUrl],
                platforms: selectedPlatforms
            },
            scheduledAt
        });
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
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{language === 'ar' ? "التسويق الاجتماعي" : "Social Marketing"}</h2>
                    <p className="text-slate-400 font-bold">{language === 'ar' ? "جدولة منشوراتك على منصات التواصل الاجتماعي ومتابعة حالتها" : "Schedule your social media posts and track their status"}</p>
                </div>

                <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black shadow-xl shadow-slate-200 gap-3"
                >
                    <Plus className="w-5 h-5" />
                    {language === 'ar' ? "إنشاء منشور جديد" : "Create New Post"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {socialRequests.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center space-y-4">
                        <Share2 className="w-12 h-12 text-slate-200" />
                        <p className="font-bold text-slate-300 italic">{language === 'ar' ? "لا توجد طلبات نشر حالياً" : "No post requests yet"}</p>
                    </div>
                ) : (
                    socialRequests.map((request: any) => (
                        <Card key={request.id} className="border-0 shadow-xl shadow-slate-100/50 rounded-[32px] overflow-hidden bg-white">
                            <div className="relative aspect-video bg-slate-100 overflow-hidden">
                                {request.data.mediaUrls?.[0] && (
                                    <img src={request.data.mediaUrls[0]} alt="Post media" className="w-full h-full object-cover" />
                                )}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    {request.data.platforms?.map((p: string) => (
                                        <div key={p} className="p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-sm">
                                            {p === 'instagram' && <Instagram className="w-4 h-4 text-pink-600" />}
                                        </div>
                                    ))}
                                </div>
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
                                <p className="text-slate-600 font-bold text-sm line-clamp-2">{request.data.caption}</p>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs font-bold">
                                            {request.scheduledAt ? format(new Date(request.scheduledAt), "dd/MM/yyyy") : (language === 'ar' ? "نشر فوري" : "Instant")}
                                        </span>
                                    </div>
                                    {request.status === 'approved' && (
                                        <div className="flex items-center gap-1">
                                            {request.isExecuted ? (
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-amber-500" />
                                            )}
                                            <span className="text-[10px] font-black text-slate-400">
                                                {request.isExecuted ? (language === 'ar' ? "تم النشر" : "PUBLISHED") : (language === 'ar' ? "مجدول" : "SCHEDULED")}
                                            </span>
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
                    <DialogHeader className="p-8 pb-4 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-black text-slate-900">
                                {language === 'ar' ? "جدولة منشور جديد" : "Schedule New Post"}
                            </DialogTitle>
                            <p className="text-sm font-bold text-slate-400 mt-1">
                                {language === 'ar' ? "اختر المنصة والوقت المناسب لمنشورك" : "Choose platform and time for your post"}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                            <Share2 className="w-6 h-6 text-purple-600" />
                        </div>
                    </DialogHeader>
                    
                    <div className="p-8 space-y-6">
                        {/* Platform Selection */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "المنصات" : "PLATFORMS"}</label>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => handlePlatformToggle('instagram')}
                                    className={cn(
                                        "flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-black",
                                        selectedPlatforms.includes('instagram') 
                                            ? "border-pink-500 bg-pink-50 text-pink-600" 
                                            : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                                    )}
                                >
                                    <Instagram className="w-5 h-5" />
                                    Instagram
                                </button>
                                <button 
                                    className="flex-1 p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-300 cursor-not-allowed flex items-center justify-center gap-3 font-black"
                                >
                                    Facebook ({language === 'ar' ? 'قريباً' : 'Soon'})
                                </button>
                            </div>
                        </div>

                        {/* Caption */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "نص المنشور" : "POST CAPTION"}</label>
                            <Textarea 
                                className="min-h-[120px] rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-purple-50 font-bold p-4 text-slate-700"
                                placeholder={language === 'ar' ? "اكتب تفاصيل المنشور هنا..." : "Write post details here..."}
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                        </div>

                        {/* Image URL */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "رابط الصورة" : "IMAGE URL"}</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <Input 
                                    className="h-14 pl-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-purple-50 font-bold"
                                    placeholder="https://example.com/image.jpg"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Scheduling */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "تاريخ النشر" : "PUBLISH DATE"}</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <Input 
                                        type="date"
                                        className="h-14 pl-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-purple-50 font-bold"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "وقت النشر" : "PUBLISH TIME"}</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <Input 
                                        type="time"
                                        className="h-14 pl-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-purple-50 font-bold"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                    />
                                </div>
                            </div>
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
                                className="flex-[2] h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black shadow-lg shadow-purple-100"
                            >
                                {submitRequest.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (language === 'ar' ? "تأكيد الطلب والجدولة" : "Confirm & Schedule")}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
