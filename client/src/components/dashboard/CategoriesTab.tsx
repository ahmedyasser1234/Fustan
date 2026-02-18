import { useQuery } from "@tanstack/react-query";
import { Loader2, Layers, Search, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CategoriesTabProps {
    onCategoryClick?: (id: number) => void;
}

export default function CategoriesTab({ onCategoryClick }: CategoriesTabProps) {
    const { language } = useLanguage();
    const [search, setSearch] = useState("");

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
                        onChange={(e) => setSearch(e.target.value)}
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
                    <Button variant="outline" className="w-full md:w-auto h-12 md:h-14 px-8 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 font-black">
                        {language === 'ar' ? "طلب قسم جديد" : "Request New Category"}
                    </Button>
                </div>
                <Layers className="absolute -right-16 -bottom-16 w-48 h-48 md:w-64 md:h-64 text-white/5 -rotate-12" />
            </div>
        </div>
    );
}
