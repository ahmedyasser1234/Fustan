import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Package, Loader2, Save, X, Image as ImageIcon, CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { endpoints } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductsTabProps {
    vendorId: number;
    collectionId?: number | null;
    onProductClick: (id: number) => void;
    onPreview?: (id: number) => void;
    showConfirm: (title: string, description: string, onConfirm: () => void) => void;
}

export default function ProductsTab({ vendorId, collectionId, onProductClick, onPreview, showConfirm }: ProductsTabProps) {
    const queryClient = useQueryClient();
    const { t, language } = useLanguage();

    // Modal & Edit State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    // Form State
    const [nameAr, setNameAr] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [descriptionAr, setDescriptionAr] = useState("");
    const [descriptionEn, setDescriptionEn] = useState("");
    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("0");
    const [collectionIdState, setCollectionId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [sizes, setSizes] = useState<{ size: string; quantity: number }[]>([{ size: "", quantity: 0 }]);
    const [cutType, setCutType] = useState("");
    const [bodyShape, setBodyShape] = useState("");
    const [impression, setImpression] = useState("");
    const [occasion, setOccasion] = useState("");
    const [silhouette, setSilhouette] = useState("");
    const [colorVariants, setColorVariants] = useState<{ id?: number; colorName: string; colorCode: string; imageFiles: File[]; existingImages?: string[] }[]>([]);
    const [sku, setSku] = useState("");
    const [tags, setTags] = useState("");

    // Queries
    const { data: products, isLoading } = useQuery({
        queryKey: ['vendor', 'products', vendorId, collectionId],
        queryFn: async () => await endpoints.products.list({ vendorId, collectionId: collectionId || undefined }),
        enabled: !!vendorId,
    });

    const { data: collections } = useQuery({
        queryKey: ['vendor', 'collections', vendorId],
        queryFn: async () => await endpoints.collections.list(vendorId),
        enabled: !!vendorId,
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => await endpoints.categories.list(),
    });

    // Auto-select Category when Collection changes
    useEffect(() => {
        if (collectionIdState && collections) {
            const selectedCollection = collections.find((c: any) => c.id.toString() === collectionIdState);
            if (selectedCollection?.categoryId) {
                setCategoryId(selectedCollection.categoryId.toString());
            }
        }
    }, [collectionIdState, collections]);

    const deleteProduct = useMutation({
        mutationFn: async (id: number) => await endpoints.products.delete(id),
        onSuccess: () => {
            toast.success(language === 'ar' ? "تم حذف المنتج بنجاح" : "Product deleted successfully");
            queryClient.invalidateQueries({ queryKey: ['vendor', 'products', vendorId] });
        },
    });

    const submitMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            formData.append("vendorId", vendorId.toString());
            formData.append("nameAr", nameAr);
            formData.append("nameEn", nameEn);
            formData.append("descriptionAr", descriptionAr);
            formData.append("descriptionEn", descriptionEn);
            formData.append("price", calculateFinalPrice());
            formData.append("originalPrice", price);
            formData.append("discount", discount.toString());
            if (collectionIdState) formData.append("collectionId", collectionIdState.toString());
            if (categoryId) formData.append("categoryId", categoryId.toString());
            formData.append("sizes", JSON.stringify(sizes));
            formData.append("cutType", cutType);
            formData.append("bodyShape", bodyShape);
            formData.append("impression", impression);
            formData.append("occasion", occasion);
            formData.append("silhouette", silhouette);
            formData.append("sku", sku);
            // Convert tags string to array before sending
            const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t !== "");
            formData.append("tags", JSON.stringify(tagsArray));

            images.forEach((image) => {
                formData.append("images", image);
            });

            // Process and append Color Variants
            const processedVariants = colorVariants.map((v, idx) => {
                const prefix = `v${idx}_`;
                v.imageFiles.forEach((file, fileIdx) => {
                    formData.append(`${prefix}${fileIdx}`, file);
                });
                return {
                    id: v.id,
                    colorName: v.colorName,
                    colorCode: v.colorCode,
                    imageFieldPrefix: prefix,
                    existingImages: v.existingImages || []
                };
            });
            formData.append("colorVariants", JSON.stringify(processedVariants));

            if (editingProduct) {
                return await endpoints.products.update(editingProduct.id, formData);
            }
            return (await endpoints.products.create(formData)).data;
        },
        onSuccess: () => {
            toast.success(editingProduct ?
                (language === 'ar' ? "تم تعديل المنتج بنجاح" : "Product updated successfully") :
                (language === 'ar' ? "تم إضافة المنتج بنجاح" : "Product added successfully")
            );
            handleCloseModal();
            queryClient.invalidateQueries({ queryKey: ['vendor', 'products', vendorId] });
        },
        onError: (err) => {
            console.error(err);
            toast.error(language === 'ar' ? "فشل حفظ المنتج" : "Failed to save product");
        }
    });

    const calculateFinalPrice = () => {
        const p = parseFloat(price);
        const d = parseFloat(discount);
        if (!isNaN(p) && !isNaN(d)) {
            return (p * (1 - d / 100)).toFixed(2);
        }
        return isNaN(p) ? "0.00" : p.toFixed(2);
    };

    const handleEdit = async (e: React.MouseEvent, product: any) => {
        e.stopPropagation();
        setEditingProduct(product);
        setNameAr(product.nameAr);
        setNameEn(product.nameEn);
        setDescriptionAr(product.descriptionAr);
        setDescriptionEn(product.descriptionEn);
        setPrice(product.originalPrice?.toString() || product.price.toString());
        setDiscount(product.discount?.toString() || "0");
        setCollectionId(product.collectionId?.toString() || "");
        setCategoryId(product.categoryId?.toString() || "");
        setSizes(product.sizes || [{ size: "", quantity: 0 }]);
        setCutType(product.cutType || "");
        setBodyShape(product.bodyShape || "");
        setImpression(product.impression || "");
        setOccasion(product.occasion || "");
        setSilhouette(product.silhouette || "");
        setSku(product.sku || "");
        setTags(Array.isArray(product.tags) ? product.tags.join(', ') : "");
        setImages([]); // Reset for new uploads

        // Fetch existing colors
        try {
            const colors = await endpoints.products.getColors(product.id);
            setColorVariants(colors.map((c: any) => ({
                id: c.id,
                colorName: c.colorName,
                colorCode: c.colorCode,
                imageFiles: [],
                existingImages: c.images || []
            })));
        } catch (error) {
            console.error("Failed to fetch colors:", error);
            setColorVariants([]);
        }

        setIsModalOpen(true);
    };

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        showConfirm(
            language === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Delete Product?',
            language === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this product? This action cannot be undone.',
            () => deleteProduct.mutate(id)
        );
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setNameAr(""); setNameEn(""); setDescriptionAr(""); setDescriptionEn("");
        setPrice(""); setDiscount("0"); setImages([]); setSizes([{ size: "", quantity: 0 }]);
        setCategoryId(""); setCollectionId("");
        setCutType(""); setBodyShape(""); setImpression(""); setOccasion(""); setSilhouette("");
        setSku(""); setTags("");
        setColorVariants([]);
    };

    const handleAddSize = () => {
        setSizes([...sizes, { size: "", quantity: 0 }]);
    };

    const handleRemoveSize = (index: number) => {
        const newSizes = [...sizes];
        newSizes.splice(index, 1);
        setSizes(newSizes);
    };

    const handleSizeChange = (index: number, field: "size" | "quantity", value: string | number) => {
        const newSizes = [...sizes];
        // @ts-ignore
        newSizes[index][field] = value;
        setSizes(newSizes);
    };

    if (isLoading) return (
        <div className="space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <Skeleton className="h-14 w-40 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="border-0 shadow-xl shadow-slate-100/50 rounded-[40px] overflow-hidden bg-white">
                        <Skeleton className="aspect-[3/4] w-full" />
                        <CardContent className="p-6 space-y-3">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-7 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between">
                <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{language === 'ar' ? "إدارة المنتجات" : "Product Management"}</h2>
                    <p className="text-slate-400 font-bold">{language === 'ar' ? "أضف، عدل وأدر مبيعات فساتينك في مكان واحد" : "Add, edit and manage your dress sales in one place"}</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 h-14 px-8 rounded-full text-lg font-black shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95 group">
                    <Plus className={`w-6 h-6 ${language === 'ar' ? 'ml-2' : 'mr-2'} group-hover:rotate-90 transition-transform`} />
                    {language === 'ar' ? "منتج جديد" : "New Product"}
                </Button>
            </div>

            {collectionId && (
                <div className="flex items-center gap-4 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    <p className="text-sm font-bold text-purple-900">
                        {language === 'ar' ? `تصفية حسب المجموعة: ` : `Filtering by Collection: `}
                        <span className="font-black underline mx-1 underline-offset-4 cursor-pointer hover:text-purple-700" onClick={() => window.location.search = "?tab=products"}>
                            {collections?.find((c: any) => c.id === collectionId)?.nameAr || collectionId}
                        </span>
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => window.location.search = "?tab=products"} className={`h-8 px-4 rounded-xl text-xs font-black text-purple-600 hover:bg-purple-100 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>
                        <X className={`w-3 h-3 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} /> {language === 'ar' ? "إلغاء الفلتر" : "Clear Filter"}
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products?.map((product: any) => (
                    <Card
                        key={product.id}
                        className="group border-0 shadow-xl shadow-slate-100/50 rounded-[40px] overflow-hidden bg-white hover:scale-[1.02] transition-all duration-500 cursor-pointer"
                        onClick={() => onProductClick(product.id)}
                    >
                        <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden">
                            {product.images?.[0] ? (
                                <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={product.nameEn} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                    <Package className="w-16 h-16" />
                                </div>
                            )}

                            <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 z-10">
                                <Button size="icon" className="h-10 w-10 bg-white/90 rounded-xl shadow-lg border border-slate-100 transition-all hover:bg-white active:scale-95" onClick={(e) => { e.stopPropagation(); onPreview?.(product.id); }}>
                                    <Eye className="w-4 h-4 text-purple-600" />
                                </Button>
                                <Button size="icon" className="h-10 w-10 bg-white/90 rounded-xl shadow-lg border border-slate-100 transition-all hover:bg-white active:scale-95" onClick={(e) => handleEdit(e, product)}>
                                    <Edit className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button size="icon" className="h-10 w-10 bg-white/90 rounded-xl shadow-lg border border-slate-100 transition-all hover:bg-red-50 active:scale-95" onClick={(e) => handleDelete(e, product.id)}>
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                            </div>

                            {product.discount > 0 && (
                                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                                    -{product.discount}% OFF
                                </div>
                            )}
                        </div>
                        <CardContent className={`p-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                {collections?.find((c: any) => c.id === product.collectionId)?.nameAr || (language === 'ar' ? 'عام' : 'General')}
                            </p>
                            <h3 className="font-black text-lg text-slate-900 line-clamp-1 mb-2">
                                {language === 'ar' ? product.nameAr : product.nameEn}
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="font-black text-xl text-[#e91e63]">{product.price} {t('currency')}</span>
                                {product.originalPrice > product.price && (
                                    <span className="text-slate-400 line-through text-xs font-bold">{product.originalPrice} {t('currency')}</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* CREATE/EDIT PRODUCT MODAL */}
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-7xl h-[95vh] rounded-[40px] p-0 overflow-hidden shadow-2xl transition-all duration-700 animate-in zoom-in-95">
                    <div className="flex flex-col h-full bg-slate-50">
                        {/* Custom Header */}
                        <div className="bg-white px-8 py-6 flex items-center justify-between border-b border-slate-100">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">
                                    {editingProduct ? (language === 'ar' ? 'تعديل منتج' : 'Edit Product') : (language === 'ar' ? 'إضافة منتج جديد' : 'New Dress')}
                                </h3>
                                <p className="text-sm font-bold text-slate-400">{language === 'ar' ? "املأ البيانات التالية لعرض فستانك في المتجر" : "Fill in the details to list your dress"}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleCloseModal} className="rounded-2xl hover:bg-slate-50 h-12 w-12 transition-all">
                                <X className="w-6 h-6 text-slate-400" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-12 h-full">
                                {/* Media Section (Left/Top) */}
                                <div className="md:col-span-4 bg-white p-8 border-l border-slate-100 flex flex-col gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4 text-purple-600" />
                                                {language === 'ar' ? "صور المنتج" : "Media Library"}
                                            </h4>
                                            <div className="h-6 px-2 bg-purple-50 text-[10px] font-black text-purple-600 rounded-full flex items-center">
                                                {images.length || editingProduct?.images?.length || 0} / 6
                                            </div>
                                        </div>

                                        {/* Dropzone/Main Image Area */}
                                        <div className="aspect-[3/4] bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group transition-all duration-500 hover:border-purple-300">
                                            {images.length > 0 ? (
                                                <img src={URL.createObjectURL(images[0])} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                                            ) : editingProduct?.images?.[0] ? (
                                                <img src={editingProduct.images[0]} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center p-8 space-y-4 pointer-events-none">
                                                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto transition-transform group-hover:translate-y-[-4px]">
                                                        <Plus className="w-8 h-8 text-purple-600" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-black text-slate-900">{language === 'ar' ? "تحميل صورة الغلاف" : "Upload Cover"}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{language === 'ar' ? "اسحب وأفلت أو اضغط هنا" : "Tap to browse files"}</p>
                                                        <p className="text-[9px] font-black text-purple-500 mt-2 bg-purple-50 px-2 py-0.5 rounded-full inline-block">
                                                            {language === 'ar' ? "الأبعاد المنصوح بها: 1200 × 1600 (3:4)" : "Recommended: 1200 x 1600 (3:4)"}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <label className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-500 cursor-pointer text-white flex-col gap-2">
                                                <ImageIcon className="w-8 h-8" />
                                                <span className="font-black text-sm uppercase tracking-widest underline underline-offset-8">
                                                    {language === 'ar' ? "تغيير الصورة" : "Update Cover"}
                                                </span>
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        const newFiles = Array.from(e.target.files);
                                                        setImages(prev => [newFiles[0], ...prev.slice(1)]);
                                                    }
                                                }} />
                                            </label>
                                        </div>

                                        {/* Thumbnails */}
                                        <div className="grid grid-cols-4 gap-3">
                                            {images.slice(1).map((img, i) => (
                                                <div key={i} className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden relative group shadow-sm">
                                                    <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => {
                                                            const newImages = [...images];
                                                            newImages.splice(i + 1, 1);
                                                            setImages(newImages);
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-75"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {images.length < 6 && (
                                                <label className="aspect-square bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-purple-300 transition-all active:scale-95">
                                                    <Plus className="w-6 h-6 text-slate-300" />
                                                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                                                        if (e.target.files && e.target.files.length > 0) {
                                                            setImages(prev => [...prev, ...Array.from(e.target.files as FileList)]);
                                                        }
                                                    }} />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-auto p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
                                        <h5 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">{language === 'ar' ? "تلميح العرض" : "Photography Tip"}</h5>
                                        <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"الفساتين المصورة في ضوء النهار الطبيعي تحقق مبيعات أعلى بنسبة 40%."</p>
                                    </div>
                                </div>

                                {/* Form Section (Right/Bottom) */}
                                <div className="md:col-span-8 p-12 space-y-12">
                                    {/* Global Sections */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        {/* Basic Info */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-8 bg-purple-600 rounded-full" />
                                                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">{language === 'ar' ? "المعلومات الأساسية" : "Identity"}</h4>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400">{language === 'ar' ? "اسم الفستان (بالعربية)" : "ARABIC NAME"}</label>
                                                    <Input className="h-14 rounded-2xl border-slate-100 shadow-sm font-bold text-lg px-6 focus:ring-4 focus:ring-purple-50" value={nameAr} onChange={e => setNameAr(e.target.value)} dir="rtl" placeholder="فستان زفاف دانتيل..." />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400">{language === 'ar' ? "ENGLISH NAME" : "ENGLISH NAME"}</label>
                                                    <Input className="h-14 rounded-2xl border-slate-100 shadow-sm font-bold text-lg px-6 focus:ring-4 focus:ring-purple-50" value={nameEn} onChange={e => setNameEn(e.target.value)} dir="ltr" placeholder="Lace Wedding Dress..." />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400">{language === 'ar' ? "الرمز (SKU)" : "SKU"}</label>
                                                    <Input className="h-14 rounded-2xl border-slate-100 shadow-sm font-bold text-lg px-6 focus:ring-4 focus:ring-purple-50" value={sku} onChange={e => setSku(e.target.value)} placeholder="SKU-1234..." />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400">{language === 'ar' ? "الوسوم (مفصولة بفاصلة)" : "Tags (comma separated)"}</label>
                                                    <Input className="h-14 rounded-2xl border-slate-100 shadow-sm font-bold text-lg px-6 focus:ring-4 focus:ring-purple-50" value={tags} onChange={e => setTags(e.target.value)} placeholder="فستان, زفاف, دانتيل..." />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pricing */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-8 bg-[#e91e63] rounded-full" />
                                                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">{language === 'ar' ? "التسعير والخصم" : "Pricing System"}</h4>
                                            </div>

                                            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 grid grid-cols-2 gap-6 relative overflow-hidden">
                                                <div className="space-y-2 relative z-10">
                                                    <label className="text-[10px] font-black text-slate-400">{language === 'ar' ? "السعر الأصلي" : "BASE PRICE"}</label>
                                                    <div className="relative">
                                                        <Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="h-14 rounded-2xl border-white shadow-sm font-black text-xl px-6 pr-14 focus:ring-4 focus:ring-pink-50" />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 pointer-events-none">{t('currency')}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 relative z-10">
                                                    <label className="text-[10px] font-black text-slate-400">{language === 'ar' ? "الخصم %" : "DISCOUNT %"}</label>
                                                    <div className="relative">
                                                        <Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="h-14 rounded-2xl border-white shadow-sm font-black text-xl px-6 pr-14 focus:ring-4 focus:ring-pink-50" />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 pointer-events-none">%</span>
                                                    </div>
                                                </div>

                                                <div className="col-span-2 mt-4 pt-6 border-t border-slate-200/50 flex items-center justify-between">
                                                    <span className="text-sm font-black text-slate-500">{language === 'ar' ? "السعر النهائي للمشتري:" : "Final Listing Price:"}</span>
                                                    <span className="text-3xl font-black text-[#e91e63]">{calculateFinalPrice()} <span className="text-xs">{t('currency')}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Categorization Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-8 bg-blue-600 rounded-full" />
                                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">{language === 'ar' ? "التصنيف والذكاء" : "Product Intelligence"}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400">{language === 'ar' ? "المجموعة" : "COLLECTION"}</label>
                                                <Select value={collectionIdState} onValueChange={setCollectionId}>
                                                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 shadow-sm font-bold bg-white focus:ring-4 focus:ring-blue-50">
                                                        <SelectValue placeholder={language === 'ar' ? "اختر مجموعة" : "Select Collection"} />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl shadow-xl border-slate-100">
                                                        {collections?.map((c: any) => (
                                                            <SelectItem key={c.id} value={c.id.toString()} className="font-bold py-3">
                                                                {language === 'ar' ? c.nameAr : c.nameEn}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400">{language === 'ar' ? "القسم" : "CATEGORY"}</label>
                                                <Select value={categoryId} onValueChange={setCategoryId}>
                                                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 shadow-sm font-bold bg-white focus:ring-4 focus:ring-blue-50">
                                                        <SelectValue placeholder={language === 'ar' ? "اختر القسم" : "Select Category"} />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl shadow-xl border-slate-100">
                                                        {categories?.map((c: any) => (
                                                            <SelectItem key={c.id} value={c.id.toString()} className="font-bold py-3">
                                                                {language === 'ar' ? c.nameAr : c.nameEn}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Optional Attributes Section */}
                                    <div className="space-y-6 bg-gradient-to-br from-purple-50 to-pink-50 p-12 rounded-[40px] border border-purple-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
                                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">{language === 'ar' ? "معلومات إضافية (اختيارية)" : "Optional Attributes"}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? "نوع القصة (Silhouette)" : "SILHOUETTE"}</label>
                                                <Input className="h-12 rounded-2xl border-white bg-white shadow-sm font-bold focus:ring-4 focus:ring-purple-100" value={silhouette} onChange={e => setSilhouette(e.target.value)} placeholder={language === 'ar' ? "A-Line, Mermaid..." : "A-Line, Mermaid..."} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? "نوع القص" : "CUT TYPE"}</label>
                                                <Input className="h-12 rounded-2xl border-white bg-white shadow-sm font-bold focus:ring-4 focus:ring-purple-100" value={cutType} onChange={e => setCutType(e.target.value)} placeholder={language === 'ar' ? "V-Neck, Off-Shoulder..." : "V-Neck, Off-Shoulder..."} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? "شكل الجسم المناسب" : "BODY SHAPE"}</label>
                                                <Input className="h-12 rounded-2xl border-white bg-white shadow-sm font-bold focus:ring-4 focus:ring-purple-100" value={bodyShape} onChange={e => setBodyShape(e.target.value)} placeholder={language === 'ar' ? "Hourglass, Pear..." : "Hourglass, Pear..."} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? "الانطباع العام (Vibe)" : "VIBE"}</label>
                                                <Input className="h-12 rounded-2xl border-white bg-white shadow-sm font-bold focus:ring-4 focus:ring-purple-100" value={impression} onChange={e => setImpression(e.target.value)} placeholder={language === 'ar' ? "Elegant, Romantic..." : "Elegant, Romantic..."} />
                                            </div>
                                            <div className="space-y-2 sm:col-span-2">
                                                <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? "أفضل مكان للتجول" : "BEST OCCASION"}</label>
                                                <Input className="h-12 rounded-2xl border-white bg-white shadow-sm font-bold focus:ring-4 focus:ring-purple-100" value={occasion} onChange={e => setOccasion(e.target.value)} placeholder={language === 'ar' ? "Wedding, Party, Formal..." : "Wedding, Party, Formal..."} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Color Variants Section */}
                                    <div className="space-y-6 bg-gradient-to-br from-blue-50 to-cyan-50 p-12 rounded-[40px] border border-blue-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full" />
                                                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">{language === 'ar' ? "الألوان المتوفرة (اختيارية)" : "Color Variants (Optional)"}</h4>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setColorVariants([...colorVariants, { colorName: "", colorCode: "#000000", imageFiles: [], existingImages: [] }])}
                                                className="rounded-xl bg-white border-blue-200 text-blue-700 hover:bg-blue-50 h-10 px-4"
                                            >
                                                <Plus className="w-4 h-4 ml-2" /> {language === 'ar' ? "إضافة لون" : "Add Color"}
                                            </Button>
                                        </div>
                                        {colorVariants.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {colorVariants.map((variant, idx) => (
                                                    <div key={idx} className="bg-white p-6 rounded-3xl border border-blue-100 space-y-4 relative group/color">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-2 left-2 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/color:opacity-100 transition-opacity"
                                                            onClick={() => {
                                                                const newVariants = [...colorVariants];
                                                                newVariants.splice(idx, 1);
                                                                setColorVariants(newVariants);
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-slate-400">{language === 'ar' ? "اسم اللون" : "COLOR NAME"}</label>
                                                                <Input
                                                                    className="h-10 rounded-xl border-slate-200 font-bold"
                                                                    value={variant.colorName}
                                                                    onChange={e => {
                                                                        const newVariants = [...colorVariants];
                                                                        newVariants[idx].colorName = e.target.value;
                                                                        setColorVariants(newVariants);
                                                                    }}
                                                                    placeholder={language === 'ar' ? "أحمر، أزرق..." : "Red, Blue..."}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-slate-400">{language === 'ar' ? "كود اللون" : "COLOR CODE"}</label>
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        type="color"
                                                                        className="h-10 w-14 rounded-xl border-slate-200 cursor-pointer p-1"
                                                                        value={variant.colorCode}
                                                                        onChange={e => {
                                                                            const newVariants = [...colorVariants];
                                                                            newVariants[idx].colorCode = e.target.value;
                                                                            setColorVariants(newVariants);
                                                                        }}
                                                                    />
                                                                    <Input
                                                                        className="h-10 flex-1 rounded-xl border-slate-200 font-mono text-xs"
                                                                        value={variant.colorCode}
                                                                        onChange={e => {
                                                                            const newVariants = [...colorVariants];
                                                                            newVariants[idx].colorCode = e.target.value;
                                                                            setColorVariants(newVariants);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "صور هذا اللون" : "COLOR IMAGES"}</label>
                                                                <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                                                    {language === 'ar' ? "1200 × 1600 (3:4)" : "1200 x 1600 (3:4)"}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                                {/* Existing Images */}
                                                                {variant.existingImages?.map((url, imgIdx) => (
                                                                    <div key={`existing-${imgIdx}`} className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden group/img border border-slate-100">
                                                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newVariants = [...colorVariants];
                                                                                newVariants[idx].existingImages?.splice(imgIdx, 1);
                                                                                setColorVariants(newVariants);
                                                                            }}
                                                                            className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-sm"
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                ))}

                                                                {/* New Image Files */}
                                                                {variant.imageFiles.map((file, imgIdx) => (
                                                                    <div key={`new-${imgIdx}`} className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden group/img border border-blue-100">
                                                                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newVariants = [...colorVariants];
                                                                                newVariants[idx].imageFiles.splice(imgIdx, 1);
                                                                                setColorVariants(newVariants);
                                                                            }}
                                                                            className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-sm"
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                ))}

                                                                {/* Upload Placeholder */}
                                                                <label className="aspect-square bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group/upload">
                                                                    <Plus className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                                                                    <span className="text-[10px] font-black text-blue-500 mt-1 uppercase">{language === 'ar' ? "إضافة" : "ADD"}</span>
                                                                    <input
                                                                        type="file"
                                                                        multiple
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={e => {
                                                                            if (e.target.files) {
                                                                                const newFiles = Array.from(e.target.files);
                                                                                const newVariants = [...colorVariants];
                                                                                newVariants[idx].imageFiles = [...newVariants[idx].imageFiles, ...newFiles];
                                                                                setColorVariants(newVariants);
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {colorVariants.length === 0 && (
                                            <div className="text-center py-12">
                                                <p className="text-sm font-bold text-slate-400">{language === 'ar' ? "لم تقم بإضافة أي ألوان بعد. اضغط \"إضافة لون\" للبدء." : "No colors added yet. Click \"Add Color\" to start."}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Inventory (Sizes) Section */}
                                    <div className="space-y-6 bg-slate-900 p-12 rounded-[40px] text-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-8 bg-amber-500 rounded-full" />
                                                <h4 className="font-black text-white uppercase tracking-widest text-xs">{language === 'ar' ? "المخزون والمقاسات" : "Stock & Inventory"}</h4>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={handleAddSize} className="rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 h-10 px-4">
                                                <Plus className="w-4 h-4 ml-2" /> {language === 'ar' ? "إضافة مقاس جديد" : "Add Size Variant"}
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {sizes.map((s, idx) => (
                                                <div key={idx} className="flex flex-col gap-3 bg-white/5 p-4 rounded-3xl border border-white/10 group/item relative transition-all hover:bg-white/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 space-y-1">
                                                            <label className="text-[10px] font-black text-white/40 uppercase">{language === 'ar' ? "المقاس" : "Size"}</label>
                                                            <Input placeholder="S, M, 38..." value={s.size} onChange={e => handleSizeChange(idx, 'size', e.target.value)} className="h-10 bg-transparent border-white/10 text-white font-black" />
                                                        </div>
                                                        <div className="w-20 space-y-1">
                                                            <label className="text-[10px] font-black text-white/40 uppercase">{language === 'ar' ? "الكمية" : "Qty"}</label>
                                                            <Input type="number" placeholder="0" value={s.quantity} onChange={e => handleSizeChange(idx, 'quantity', parseInt(e.target.value))} className="h-10 bg-transparent border-white/10 text-white font-black text-center" />
                                                        </div>
                                                        {sizes.length > 1 && (
                                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-white/40 hover:text-red-400 hover:bg-red-400/10 mt-5" onClick={() => handleRemoveSize(idx)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Final Description Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-8 bg-emerald-600 rounded-full" />
                                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">{language === 'ar' ? "التفاصيل والوصف" : "Copywriting"}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 tracking-widest">{language === 'ar' ? "وصف الفستان (بالعربية)" : "ARABIC STORYTELLING"}</label>
                                                <Textarea className="min-h-[160px] rounded-[32px] border-slate-100 shadow-sm p-6 font-bold leading-relaxed focus:ring-4 focus:ring-emerald-50" value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} dir="rtl" placeholder="احكِ قصة هذا الفستان وكيف سيميز من تلبسه..." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 tracking-widest">{language === 'ar' ? "ENGLISH DESCRIPTION" : "ENGLISH DESCRIPTION"}</label>
                                                <Textarea className="min-h-[160px] rounded-[32px] border-slate-100 shadow-sm p-6 font-bold leading-relaxed focus:ring-4 focus:ring-emerald-50" value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} dir="ltr" placeholder="Describe the fabrics, the fit, and the feeling..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="bg-white px-12 py-8 flex items-center justify-between border-t border-slate-100">
                            <Button variant="ghost" onClick={handleCloseModal} className="h-14 px-8 rounded-full font-black text-slate-400 hover:bg-slate-50">
                                {language === 'ar' ? "تجاهل" : "Discard"}
                            </Button>
                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? "حالة المنتج" : "Visibility"}</p>
                                    <p className="text-sm font-black text-emerald-500">{language === 'ar' ? "متاح للعرض فوراً" : "Ready for Listing"}</p>
                                </div>
                                <Button
                                    onClick={() => {
                                        if (!nameAr) return toast.error("يرجى إدخال الاسم بالعربية");
                                        if (!price || parseFloat(price) <= 0) return toast.error("يرجى إدخال سعر صحيح");
                                        if (!collectionIdState) return toast.error(language === 'ar' ? "يرجى اختيار مجموعة" : "Please select a collection");
                                        submitMutation.mutate();
                                    }}
                                    disabled={submitMutation.isPending}
                                    className="bg-slate-900 hover:bg-black h-16 px-16 rounded-[28px] text-lg font-black text-white shadow-2xl transition-all hover:scale-[1.05] active:scale-95 disabled:opacity-50"
                                >
                                    {submitMutation.isPending ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="animate-spin w-5 h-5" />
                                            <span>{language === 'ar' ? "جاري الحفظ..." : "Processing..."}</span>
                                        </div>
                                    ) : (
                                        editingProduct ? (language === 'ar' ? "حفظ التعديلات" : "Update Profile") : (language === 'ar' ? "نشر الفستان" : "Publish Dress")
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
