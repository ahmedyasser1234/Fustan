import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Package, Loader2, Save, X, Image as ImageIcon, CheckCircle2, Eye, Sparkles, Upload } from "lucide-react";
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
import { HelpCircle, Info } from "lucide-react";

const SIZE_DATA = [
    { us: "0", eu: "30", uk: "4", chest: "82", waist: "62", hips: "89" },
    { us: "2", eu: "32", uk: "6", chest: "84", waist: "64", hips: "91" },
    { us: "4", eu: "34", uk: "8", chest: "86", waist: "66", hips: "94" },
    { us: "6", eu: "36", uk: "10", chest: "89", waist: "69", hips: "97" },
    { us: "8", eu: "38", uk: "12", chest: "91", waist: "71", hips: "99" },
    { us: "10", eu: "40", uk: "14", chest: "94", waist: "74", hips: "102" },
    { us: "12", eu: "42", uk: "16", chest: "98", waist: "77", hips: "105" },
    { us: "14", eu: "44", uk: "18", chest: "102", waist: "81", hips: "109" },
    { us: "16", eu: "46", uk: "20", chest: "107", waist: "86", hips: "114" },
    { us: "18", eu: "48", uk: "22", chest: "112", waist: "91", hips: "119" },
];

const SILHOUETTE_DATA = {
    "Ball Gown": {
        ar: "الأميرات (Ball Gown)",
        bodyShapeAr: "الكبمثري، المستطيل، والنحيفات",
        bodyShapeEn: "Pear, Rectangle, and Slender",
        vibeAr: "فخم وملكي: يمنحك إطلالة سندريلا التقليدية.",
        vibeEn: "Luxurious and Royal: Gives you the traditional Cinderella look.",
        venueAr: "القاعات الكبيرة والفنادق الفخمة",
        venueEn: "Large halls and luxury hotels"
    },
    "A-Line": {
        ar: "A-Line الـ",
        bodyShapeAr: "مثالي لجميع الأجسام (خاصة المثلث المقلوب)",
        bodyShapeEn: "Ideal for all bodies (especially inverted triangle)",
        vibeAr: "كلاسيكي وراقي: يجمع بين الأناقة والراحة في الحركة.",
        vibeEn: "Classic and Sophisticated: Combines elegance with comfort in movement.",
        venueAr: "كافة أنواع الحفلات (داخلية أو خارجية)",
        venueEn: "All types of parties (indoor or outdoor)"
    },
    "Mermaid": {
        ar: "حورية البحر (Mermaid)",
        bodyShapeAr: "الساعة الرملية (Hourglass)",
        bodyShapeEn: "Hourglass",
        vibeAr: "جذاب وعصري: يبرز منحنيات الجسم بشكل جريء وواضح.",
        vibeEn: "Attractive and Modern: Highlights body curves boldly and clearly.",
        venueAr: "القاعات الحديثة وحفلات العشاء",
        venueEn: "Modern halls and dinner parties"
    },
    "Sheath": {
        ar: "الغمد (Sheath)",
        bodyShapeAr: "النحيفات، القوام الممشوق، والطويلات",
        bodyShapeEn: "Slender, lean, and tall",
        vibeAr: "بسيط وناعم: يركز على الجمال الطبيعي الهادئ دون تكلف.",
        vibeEn: "Simple and Soft: Focuses on calm natural beauty without pretension.",
        venueAr: "حفلات الشاطئ، الحدائق، أو الزواج المدني",
        venueEn: "Beach parties, gardens, or civil marriage"
    },
    "Empire": {
        ar: "الخصر العالي (Empire)",
        bodyShapeAr: "القصيرات، وصاحبات الصدر الصغير",
        bodyShapeEn: "Petite, and those with small busts",
        vibeAr: "رومانسي وحالم: يعطي إيحاء بالطول ومستوحى من الأساطير.",
        vibeEn: "Romantic and Dreamy: Gives an illusion of length and inspired by myths.",
        venueAr: "الحفلات البسيطة أو التراثية",
        venueEn: "Simple or traditional parties"
    },
    "Trumpet": {
        ar: "البوق (Trumpet)",
        bodyShapeAr: "الساعة الرملية والمستطيل",
        bodyShapeEn: "Hourglass and Rectangle",
        vibeAr: "انيق وحيوي: نسخة مريحة من \"حورية البحر\" تسمح بحركة أفضل.",
        vibeEn: "Elegant and Lively: A comfortable version of \"Mermaid\" that allows better movement.",
        venueAr: "حفلات الزفاف العصرية",
        venueEn: "Modern wedding parties"
    }
};

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
    const [availability, setAvailability] = useState<"rent" | "sale" | "both">("sale");
    const [condition, setCondition] = useState<"new" | "used">("new");
    const [usageCount, setUsageCount] = useState<number>(0);
    const [rentPrice, setRentPrice] = useState("");
    const [salePrice, setSalePrice] = useState("");
    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("0");
    const [collectionIdState, setCollectionId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [aiQualifiedImage, setAiQualifiedImage] = useState<File | null>(null);
    const [sizes, setSizes] = useState<{ size: string; quantity: number }[]>([{ size: "", quantity: 0 }]);
    const [selectedSystem, setSelectedSystem] = useState<"us" | "eu" | "uk">("us");
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
            if (!aiQualifiedImage && !editingProduct?.aiQualifiedImage) {
                toast.error(language === 'ar' ? "صورة AI مطلوبة للميزة التجريبية" : "AI-Ready image is required for Try-On feature");
                throw new Error("AI Image required");
            }

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
            formData.append("availability", availability);
            formData.append("condition", condition);
            formData.append("usageCount", usageCount.toString());
            formData.append("rentPrice", rentPrice);
            formData.append("salePrice", salePrice);
            // Convert tags string to array before sending
            const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t !== "");
            formData.append("tags", JSON.stringify(tagsArray));

            images.forEach((image) => {
                formData.append("images", image);
            });

            if (aiQualifiedImage) {
                formData.append("aiQualifiedImage", aiQualifiedImage);
            }

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
        setAvailability(product.availability || "sale");
        setCondition(product.condition || "new");
        setUsageCount(product.usageCount || 0);
        setRentPrice(product.rentPrice?.toString() || "");
        setSalePrice(product.salePrice?.toString() || "");
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
        setPrice(""); setDiscount("0"); setImages([]); setAiQualifiedImage(null); setSizes([{ size: "", quantity: 0 }]);
        setAvailability("sale"); setCondition("new"); setUsageCount(0); setRentPrice(""); setSalePrice("");
        setCategoryId(""); setCollectionId("");
        setCutType(""); setBodyShape(""); setImpression(""); setOccasion(""); setSilhouette("");
        setSku(""); setTags("");
        setColorVariants([]);
        setSelectedSystem("us");
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

    const handleSilhouetteChange = (val: string) => {
        setSilhouette(val);
        const data = SILHOUETTE_DATA[val as keyof typeof SILHOUETTE_DATA];
        if (data) {
            setBodyShape(language === 'ar' ? data.bodyShapeAr : data.bodyShapeEn);
            setImpression(language === 'ar' ? data.vibeAr : data.vibeEn);
            setOccasion(language === 'ar' ? data.venueAr : data.venueEn);
        }
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className={`w-full sm:w-auto ${language === 'ar' ? 'text-center sm:text-right' : 'text-center sm:text-left'}`}>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{language === 'ar' ? "إدارة المنتجات" : "Product Management"}</h2>
                    <p className="text-slate-400 font-bold text-sm sm:text-base">{language === 'ar' ? "أضف، عدل وأدر مبيعات فساتينك في مكان واحد" : "Add, edit and manage your dress sales in one place"}</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 h-12 sm:h-14 px-8 rounded-full text-base sm:text-lg font-black shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95 group">
                    <Plus className={`w-5 h-5 sm:w-6 sm:h-6 ${language === 'ar' ? 'ml-2' : 'mr-2'} group-hover:rotate-90 transition-transform`} />
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
                <DialogContent className="w-full h-full sm:h-[95vh] sm:max-w-7xl sm:w-[95vw] p-0 overflow-hidden shadow-2xl transition-all duration-700 animate-in zoom-in-95 rounded-none sm:rounded-[40px]">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                        <p className="text-slate-400">Manage dress details and variants</p>
                    </DialogHeader>
                    <div className="flex flex-col h-full bg-slate-50">
                        {/* Custom Header */}
                        <div className="bg-white px-4 py-4 md:px-8 md:py-6 flex items-center justify-between border-b border-slate-100 sticky top-0 z-50">
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
                                <div className="md:col-span-4 bg-white p-4 md:p-8 border-l border-slate-100 flex flex-col gap-6 md:gap-8">
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

                                    {/* AI Try-On Feature Section */}
                                    <div className="space-y-4 pt-4 border-t border-slate-100 px-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-rose-500" />
                                                {language === 'ar' ? "صورة التجربة الافتراضية (AI)" : "AI Try-On Image"}
                                            </h4>
                                            <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase">
                                                {language === 'ar' ? "إلزامي" : "Required"}
                                            </span>
                                        </div>

                                        <div className="aspect-[4/3] bg-rose-50/30 rounded-[28px] border-2 border-dashed border-rose-200 flex flex-col items-center justify-center overflow-hidden relative group transition-all duration-500 hover:border-rose-300">
                                            {aiQualifiedImage ? (
                                                <img src={URL.createObjectURL(aiQualifiedImage)} className="w-full h-full object-cover" />
                                            ) : editingProduct?.aiQualifiedImage ? (
                                                <img src={editingProduct.aiQualifiedImage} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-2">
                                                        <Upload className="w-6 h-6 text-rose-500" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-900">{language === 'ar' ? "تحميل صورة AI" : "Upload AI Image"}</p>
                                                    <p className="text-[8px] font-bold text-slate-400 mt-1">{language === 'ar' ? "صورة واضحة للفستان على مانيكان" : "Clear dress on mannequin"}</p>
                                                </div>
                                            )}
                                            <label className="absolute inset-0 cursor-pointer">
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => setAiQualifiedImage(e.target.files?.[0] || null)} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mt-auto p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
                                        <h5 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">{language === 'ar' ? "تلميح العرض" : "Photography Tip"}</h5>
                                        <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"الفساتين المصورة في ضوء النهار الطبيعي تحقق مبيعات أعلى بنسبة 40%."</p>
                                    </div>
                                </div>

                                {/* Form Section (Right/Bottom) */}
                                <div className="md:col-span-8 p-4 md:p-12 space-y-8 md:space-y-12 pb-24 md:pb-12">
                                    {/* Global Sections */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
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

                                        {/* Pricing System */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-8 bg-[#e91e63] rounded-full" />
                                                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">{language === 'ar' ? "نظام التسعير والحالة" : "Pricing & Condition"}</h4>
                                            </div>

                                            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-6 relative overflow-hidden">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400">{t('availability')}</label>
                                                        <Select value={availability} onValueChange={(val: any) => setAvailability(val)}>
                                                            <SelectTrigger className="h-12 rounded-xl bg-white border-slate-100 font-bold">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl font-bold">
                                                                <SelectItem value="sale">{t('sale')}</SelectItem>
                                                                <SelectItem value="rent">{t('rent')}</SelectItem>
                                                                <SelectItem value="both">{t('both')}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400">{t('condition')}</label>
                                                        <Select value={condition} onValueChange={(val: any) => setCondition(val)}>
                                                            <SelectTrigger className="h-12 rounded-xl bg-white border-slate-100 font-bold">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl font-bold">
                                                                <SelectItem value="new">{t('new')}</SelectItem>
                                                                <SelectItem value="used">{t('used')}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                {condition === 'used' && (
                                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <label className="text-[10px] font-black text-slate-400">{t('usageCount')}</label>
                                                        <Select value={usageCount.toString()} onValueChange={(val) => setUsageCount(parseInt(val))}>
                                                            <SelectTrigger className="h-12 rounded-xl bg-white border-slate-100 font-bold">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl font-bold">
                                                                {[1, 2, 3, 4, 5].map(n => (
                                                                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <p className="text-[9px] font-bold text-[#e91e63] mt-1 italic">
                                                            {language === 'ar' ? "* الأسعار قد تختلف بناءً على عدد مرات الاستخدام" : "* Prices may vary based on usage count"}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    {(availability === 'sale' || availability === 'both') && (
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400">{t('salePrice')}</label>
                                                            <div className="relative">
                                                                <Input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} className="h-14 rounded-2xl border-white shadow-sm font-black text-xl px-6 pr-14 focus:ring-4 focus:ring-pink-50" />
                                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 pointer-events-none">{t('sar')}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {(availability === 'rent' || availability === 'both') && (
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400">{t('rentPrice')}</label>
                                                            <div className="relative">
                                                                <Input type="number" value={rentPrice} onChange={e => setRentPrice(e.target.value)} className="h-14 rounded-2xl border-white shadow-sm font-black text-xl px-6 pr-14 focus:ring-4 focus:ring-blue-50" />
                                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 pointer-events-none">{t('sar')}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400">{language === 'ar' ? "الخصم %" : "DISCOUNT %"}</label>
                                                    <div className="relative">
                                                        <Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="h-14 rounded-2xl border-white shadow-sm font-black text-xl px-6 pr-14 focus:ring-4 focus:ring-pink-50" />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 pointer-events-none">%</span>
                                                    </div>
                                                </div>

                                                <div className="col-span-2 mt-4 pt-6 border-t border-slate-200/50">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">
                                                        {language === 'ar' ? "السعر النهائي للمشتري (يشمل 15% عمولة):" : "Final Price (Includes 15% Commission):"}
                                                    </span>
                                                    <div className="space-y-3">
                                                        {(availability === 'sale' || availability === 'both') && (
                                                            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
                                                                <span className="font-bold text-slate-500">{t('sale')}</span>
                                                                <span className="text-2xl font-black text-[#e91e63]">{(parseFloat(salePrice || "0") * (1 - parseFloat(discount || "0") / 100) * 1.15).toFixed(2)} <span className="text-xs">{t('sar')}</span></span>
                                                            </div>
                                                        )}
                                                        {(availability === 'rent' || availability === 'both') && (
                                                            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
                                                                <span className="font-bold text-slate-500">{t('rent')}</span>
                                                                <span className="text-2xl font-black text-blue-600">{(parseFloat(rentPrice || "0") * (1 - parseFloat(discount || "0") / 100) * 1.15).toFixed(2)} <span className="text-xs">{t('sar')}</span></span>
                                                            </div>
                                                        )}
                                                    </div>
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
                                    <div className="space-y-6 bg-gradient-to-br from-purple-50 to-pink-50 p-6 md:p-12 rounded-[24px] md:rounded-[40px] border border-purple-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
                                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">{language === 'ar' ? "معلومات إضافية (اختيارية)" : "Optional Attributes"}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? "نوع القصة (Silhouette)" : "SILHOUETTE"}</label>
                                                <Select value={silhouette} onValueChange={handleSilhouetteChange}>
                                                    <SelectTrigger className="h-12 rounded-2xl border-white bg-white shadow-sm font-bold focus:ring-4 focus:ring-purple-100">
                                                        <SelectValue placeholder={language === 'ar' ? "اختر القصة" : "Select Silhouette"} />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-slate-200 bg-white font-bold">
                                                        {Object.keys(SILHOUETTE_DATA).map((key) => (
                                                            <SelectItem key={key} value={key}>
                                                                {language === 'ar' ? SILHOUETTE_DATA[key as keyof typeof SILHOUETTE_DATA].ar : key}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
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
                                    <div className="space-y-6 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 md:p-12 rounded-[24px] md:rounded-[40px] border border-blue-100">
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
                                    <div className="space-y-6 bg-slate-900 p-6 md:p-12 rounded-[24px] md:rounded-[40px] text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-8 bg-amber-500 rounded-full" />
                                                <h4 className="font-black text-white uppercase tracking-widest text-xs">{language === 'ar' ? "المخزون والمقاسات" : "Stock & Inventory"}</h4>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1">
                                                        {t('sizeSystem')}
                                                    </label>
                                                    <Select value={selectedSystem} onValueChange={(val: any) => setSelectedSystem(val)}>
                                                        <SelectTrigger className="h-10 w-40 bg-transparent border-white/10 text-white font-black rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl border-slate-800 bg-slate-900 text-white font-bold">
                                                            <SelectItem value="us">{t('usSystem')}</SelectItem>
                                                            <SelectItem value="eu">{t('euSystem')}</SelectItem>
                                                            <SelectItem value="uk">{t('ukSystem')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex-1 min-w-[200px] p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                                                    <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-black text-amber-500 uppercase tracking-tight">{t('sizeGuide')}</p>
                                                        <p className="text-[10px] font-bold text-white/60 leading-relaxed">{t('sizeGuideDesc')}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button variant="outline" size="sm" onClick={handleAddSize} className="rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 h-10 px-4">
                                                <Plus className="w-4 h-4 ml-2" /> {language === 'ar' ? "إضافة مقاس جديد" : "Add Size Variant"}
                                            </Button>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {sizes.map((s, idx) => {
                                                const sizeInfo = SIZE_DATA.find(d => d[selectedSystem] === s.size);
                                                return (
                                                    <div key={idx} className="flex flex-col gap-6 bg-white/5 p-8 rounded-[40px] border border-white/10 group/item relative transition-all hover:bg-white/10">
                                                        {sizes.length > 1 && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="absolute top-4 right-4 h-10 w-10 text-white/20 hover:text-red-400 hover:bg-red-400/10 z-10" 
                                                                onClick={() => handleRemoveSize(idx)}
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </Button>
                                                        )}

                                                        <div className="space-y-4 flex flex-col items-center">
                                                            <div className="w-full space-y-2">
                                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center block w-full">{language === 'ar' ? "المقاس" : "Size"}</label>
                                                                <Select value={s.size} onValueChange={(val) => handleSizeChange(idx, 'size', val)}>
                                                                    <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white font-black w-full rounded-2xl text-base text-center">
                                                                        <SelectValue placeholder={language === 'ar' ? "اختر المقاس" : "Select Size"} />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="rounded-2xl border-slate-800 bg-slate-900 text-white font-bold">
                                                                        {SIZE_DATA.map((d, dIdx) => (
                                                                            <SelectItem key={dIdx} value={d[selectedSystem]} className="text-sm py-2.5 rounded-xl">
                                                                                {selectedSystem.toUpperCase()} {d[selectedSystem]}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            
                                                            <div className="w-full space-y-2">
                                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center block w-full">{language === 'ar' ? "الكمية" : "Qty"}</label>
                                                                <Input 
                                                                    type="number" 
                                                                    placeholder="0" 
                                                                    value={s.quantity} 
                                                                    onChange={e => handleSizeChange(idx, 'quantity', parseInt(e.target.value))} 
                                                                    className="h-12 bg-white/5 border-white/10 text-white font-black text-center w-full rounded-2xl text-base focus:ring-4 focus:ring-amber-500/20" 
                                                                />
                                                            </div>
                                                        </div>

                                                        {sizeInfo && (
                                                            <div className="mt-2 pt-4 border-t border-white/10 flex flex-col items-center gap-3 px-1">
                                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{t('measurements')} (CM)</span>
                                                                <div className="flex items-center justify-center gap-6">
                                                                    <div className="flex flex-col items-center">
                                                                        <span className="text-[10px] font-black text-white/30 uppercase leading-none tracking-tight mb-1">{t('chest')}</span>
                                                                        <span className="text-sm font-black text-amber-500">{sizeInfo.chest}</span>
                                                                    </div>
                                                                    <div className="w-[1px] h-6 bg-white/10" />
                                                                    <div className="flex flex-col items-center">
                                                                        <span className="text-[10px] font-black text-white/30 uppercase leading-none tracking-tight mb-1">{t('waist')}</span>
                                                                        <span className="text-sm font-black text-amber-500">{sizeInfo.waist}</span>
                                                                    </div>
                                                                    <div className="w-[1px] h-6 bg-white/10" />
                                                                    <div className="flex flex-col items-center">
                                                                        <span className="text-[10px] font-black text-white/30 uppercase leading-none tracking-tight mb-1">{t('hips')}</span>
                                                                        <span className="text-sm font-black text-amber-500">{sizeInfo.hips}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
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
                        <div className="bg-white px-4 py-4 md:px-12 md:py-8 flex flex-col-reverse sm:flex-row items-center justify-between border-t border-slate-100 gap-4 sticky bottom-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <Button variant="ghost" onClick={handleCloseModal} className="w-full sm:w-auto h-12 md:h-14 px-8 rounded-full font-black text-slate-400 hover:bg-slate-50">
                                {language === 'ar' ? "تجاهل" : "Discard"}
                            </Button>
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                <div className="text-center sm:text-right hidden sm:block">
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
                                    className="bg-slate-900 hover:bg-black w-full sm:w-auto h-14 md:h-16 px-8 md:px-16 rounded-[20px] md:rounded-[28px] text-base md:text-lg font-black text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                >
                                    {submitMutation.isPending ? (
                                        <div className="flex items-center gap-3 justify-center">
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
