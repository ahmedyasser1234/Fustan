import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Folder, Loader2, Image as ImageIcon, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { endpoints } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface CollectionsTabProps {
    vendorId: number;
    categoryId?: number | null;
    onCollectionClick: (id: number) => void;
    showConfirm: (title: string, description: string, onConfirm: () => void) => void;
}

export default function CollectionsTab({ vendorId, categoryId, onCollectionClick, showConfirm }: CollectionsTabProps) {
    const queryClient = useQueryClient();
    const { language } = useLanguage();

    // UI State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<any>(null);

    // Form State
    const [nameAr, setNameAr] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [categoryIdLocal, setCategoryIdLocal] = useState("");
    const [newCollectionImage, setNewCollectionImage] = useState<File | null>(null);

    // Queries
    const { data: collections, isLoading } = useQuery({
        queryKey: ['vendor', 'collections', vendorId, categoryId],
        queryFn: async () => await endpoints.collections.list(vendorId, categoryId || undefined),
        enabled: !!vendorId,
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => await endpoints.categories.list(),
    });

    const createCollection = useMutation({
        mutationFn: async (data: { nameAr: string; nameEn: string; image: File | null; categoryId: number }) => {
            const formData = new FormData();
            formData.append("vendorId", vendorId.toString());
            formData.append("nameAr", data.nameAr);
            formData.append("nameEn", data.nameEn);
            formData.append("categoryId", data.categoryId.toString());
            if (data.image) formData.append("image", data.image);

            if (editingCollection) {
                return await endpoints.collections.update(editingCollection.id, formData);
            }
            return await endpoints.collections.create(formData);
        },
        onSuccess: () => {
            toast.success(editingCollection ?
                (language === 'ar' ? "تم تحديث المجموعة" : "Collection updated") :
                (language === 'ar' ? "تم إنشاء المجموعة بنجاح" : "Collection created successfully")
            );
            handleResetForm();
            queryClient.invalidateQueries({ queryKey: ['vendor', 'collections', vendorId] });
        },
        onError: () => {
            toast.error(language === 'ar' ? "فشل حفظ المجموعة" : "Failed to save collection");
        }
    });

    const deleteCollection = useMutation({
        mutationFn: async (id: number) => await endpoints.collections.delete(id),
        onSuccess: () => {
            toast.success(language === 'ar' ? "تم حذف المجموعة" : "Collection deleted");
            queryClient.invalidateQueries({ queryKey: ['vendor', 'collections', vendorId] });
        }
    });

    const handleEdit = (e: React.MouseEvent, collection: any) => {
        e.stopPropagation();
        setEditingCollection(collection);
        setNameAr(collection.nameAr);
        setNameEn(collection.nameEn);
        setCategoryIdLocal(collection.categoryId?.toString() || "");
        setIsFormOpen(true);
    };

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        showConfirm(
            language === 'ar' ? 'حذف المجموعة؟' : 'Delete Collection?',
            language === 'ar' ? 'هل أنت متأكد؟ سيتم نقل المنتجات إلى "عام"' : 'Are you sure? Products will be moved to "General".',
            () => deleteCollection.mutate(id)
        );
    };

    const handleResetForm = () => {
        setIsFormOpen(false);
        setEditingCollection(null);
        setNameAr("");
        setNameEn("");
        setCategoryIdLocal("");
        setNewCollectionImage(null);
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            <p className="text-slate-400 font-black">{language === 'ar' ? "تحميل المجموعات..." : "Loading collections..."}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className={`w-full sm:w-auto ${language === 'ar' ? 'text-center sm:text-right' : 'text-center sm:text-left'}`}>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{language === 'ar' ? "مجموعات المتجر" : "Brand Collections"}</h2>
                    <p className="text-slate-400 font-bold text-sm sm:text-base">{language === 'ar' ? "نظم منتجاتك في مجموعات موسمية أو مميزة" : "Organize your dresses into seasonal or themed collections"}</p>
                </div>
                {!isFormOpen && (
                    <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto bg-slate-900 hover:bg-black h-12 sm:h-14 px-8 rounded-full text-base sm:text-lg font-black shadow-lg transition-all hover:scale-105 active:scale-95 group">
                        <Plus className={`w-5 h-5 sm:w-6 sm:h-6 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {language === 'ar' ? "مجموعة جديدة" : "New Collection"}
                    </Button>
                )}
            </div>

            {isFormOpen && (
                <Card className="border-0 shadow-2xl shadow-purple-100/50 rounded-[24px] md:rounded-[40px] bg-white overflow-hidden animate-in zoom-in-95 duration-500">
                    <CardContent className="p-6 md:p-10">
                        <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between mb-6 md:mb-10 gap-4">
                            <h3 className="text-xl font-black text-slate-900">{editingCollection ? (language === 'ar' ? 'تعديل المجموعة' : 'Edit Collection') : (language === 'ar' ? 'إنشاء مجموعة جديدة' : 'Add New Collection')}</h3>
                            <Button variant="ghost" size="icon" onClick={handleResetForm} className="rounded-xl hover:bg-slate-50 self-end md:self-auto">
                                <X className="w-5 h-5 text-slate-400" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                            {/* Image Upload */}
                            <div className="lg:col-span-4 space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "صورة المجموعة" : "Collection Poster"}</label>
                                <div className="aspect-square bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group transition-all hover:border-purple-300">
                                    {newCollectionImage ? (
                                        <img src={URL.createObjectURL(newCollectionImage)} className="w-full h-full object-cover" />
                                    ) : editingCollection?.coverImage ? (
                                        <img src={editingCollection.coverImage} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-6 space-y-3">
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-purple-600">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-400">{language === 'ar' ? "اضغط للتحميل" : "Tap to upload"}</p>
                                            <p className="text-[9px] font-black text-purple-500 mt-2 bg-purple-50 px-2 py-0.5 rounded-full inline-block">
                                                {language === 'ar' ? "الأبعاد المنصوح بها: 1000 × 1000 (1:1)" : "Recommended: 1000 x 1000 (1:1)"}
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => e.target.files?.[0] && setNewCollectionImage(e.target.files[0])}
                                    />
                                </div>
                            </div>

                            {/* Info Fields */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "الاسم بالعربية" : "NAME (AR)"}</label>
                                        <Input value={nameAr} onChange={e => setNameAr(e.target.value)} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 shadow-sm font-bold px-6 focus:ring-4 focus:ring-purple-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "NAME (EN)" : "NAME (EN)"}</label>
                                        <Input value={nameEn} onChange={e => setNameEn(e.target.value)} dir="ltr" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 shadow-sm font-bold px-6 focus:ring-4 focus:ring-purple-50" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Tag className="w-3 h-3" />
                                        {language === 'ar' ? "تصنيف المجموعة" : "GLOBAL CATEGORY"}
                                    </label>
                                    <Select value={categoryIdLocal} onValueChange={setCategoryIdLocal}>
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 shadow-sm font-bold px-6">
                                            <SelectValue placeholder={language === 'ar' ? "اختر التصنيف الرئيسي" : "Select Parent Category"} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl shadow-xl">
                                            {categories?.map((c: any) => (
                                                <SelectItem key={c.id} value={c.id.toString()} className="font-bold py-3">
                                                    {language === 'ar' ? c.nameAr : c.nameEn}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-4">
                                    <Button variant="ghost" onClick={handleResetForm} className="h-14 px-8 rounded-2xl font-black text-slate-400 w-full sm:w-auto">
                                        {language === 'ar' ? "إلغاء" : "Discard"}
                                    </Button>
                                    <Button
                                        className="h-14 px-12 rounded-2xl bg-purple-600 hover:bg-purple-700 font-black text-white shadow-xl shadow-purple-100 transition-all hover:scale-105 w-full sm:w-auto"
                                        disabled={!nameAr || !nameEn || !categoryIdLocal || createCollection.isPending}
                                        onClick={() => createCollection.mutate({ nameAr, nameEn, image: newCollectionImage, categoryId: parseInt(categoryIdLocal) })}
                                    >
                                        {createCollection.isPending ? "..." : (editingCollection ? (language === 'ar' ? "حفظ التعديلات" : "Update") : (language === 'ar' ? "إنشاء المجموعة" : "Create Collection"))}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {collections?.length === 0 ? (
                    <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 italic font-bold text-slate-300">
                        {language === 'ar' ? "لا توجد مجموعات حالياً" : "No collections found"}
                    </div>
                ) : (
                    collections?.map((collection: any) => (
                        <Card
                            key={collection.id}
                            className="group border-0 shadow-xl shadow-slate-100/50 rounded-[40px] overflow-hidden bg-white hover:scale-[1.02] transition-all duration-500 cursor-pointer relative"
                            onClick={() => onCollectionClick(collection.id)}
                        >
                            <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden">
                                {collection.coverImage ? (
                                    <img src={collection.coverImage} className="w-full h-full object-contain group-hover:scale-105 transition duration-700 font-black" alt={collection.nameEn} />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 group-hover:from-purple-100 group-hover:to-pink-100 transition-colors duration-500">
                                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                                            <Folder className="w-8 h-8 text-purple-400" />
                                        </div>
                                        <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">{language === 'ar' ? 'لا توجد صورة' : 'No Image'}</span>
                                    </div>
                                )}

                                <div className="absolute top-4 left-4 flex gap-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 z-10">
                                    <Button size="icon" className="h-10 w-10 bg-white/90 rounded-xl shadow-lg border border-slate-100 hover:bg-white active:scale-95" onClick={(e) => handleEdit(e, collection)}>
                                        <Edit className="w-4 h-4 text-blue-600" />
                                    </Button>
                                    <Button size="icon" className="h-10 w-10 bg-white/90 rounded-xl shadow-lg border border-slate-100 hover:bg-red-50 active:scale-95" onClick={(e) => handleDelete(e, collection.id)}>
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                            <CardContent className={`p-6 ${language === 'ar' ? 'text-right' : 'text-left'} relative`}>
                                <span className={`absolute -top-3 ${language === 'ar' ? 'right-8' : 'left-8'} px-3 py-1 bg-white shadow-sm border border-slate-50 rounded-full text-[10px] font-black text-purple-600 uppercase tracking-widest`}>
                                    {language === 'ar' ? (categories?.find((c: any) => c.id === collection.categoryId)?.nameAr || "قسم") : (categories?.find((c: any) => c.id === collection.categoryId)?.nameEn || "Category")}
                                </span>
                                <h3 className="font-black text-xl text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">
                                    {language === 'ar' ? collection.nameAr : collection.nameEn}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{language === 'ar' ? "اضغط لاستعراض الفساتين" : "Tap to explore products"}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
