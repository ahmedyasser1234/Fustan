import { useRoute, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { endpoints } from "@/lib/api";
import { Star, MapPin, Phone, Globe, MessageSquare, ShoppingCart, Layers, Mail, Facebook, Instagram, Twitter, MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "@/contexts/ChatContext";
import { ProductCard } from "@/components/ProductCard";
import { QuickViewModal } from "@/components/home/QuickViewModal";
import { EmptyState } from "@/components/ui/EmptyState";



import { StoreRatingModal } from "@/components/store/StoreRatingModal";

export default function VendorProfile() {
  const [match, params] = useRoute("/vendor/:id");
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { openChat } = useChat();
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  // Parse query params
  const searchParams = new URLSearchParams(searchString);
  const selectedTab = (searchParams.get("tab") as "products" | "reviews" | "info") || "products";
  const selectedCollectionId = searchParams.get("collectionId") ? Number(searchParams.get("collectionId")) : null;

  const vendorIdOrSlug = params?.id;


  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor', vendorIdOrSlug],
    queryFn: () => endpoints.vendors.get(vendorIdOrSlug as string),
    enabled: !!vendorIdOrSlug
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'vendor', vendorIdOrSlug, selectedCollectionId],
    queryFn: () => endpoints.products.list({
      vendorId: vendor?.id,
      collectionId: selectedCollectionId
    }),
    enabled: !!vendor?.id
  });

  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: ['collections', 'vendor', vendor?.id],
    queryFn: () => endpoints.collections.list(vendor?.id),
    enabled: !!vendor?.id
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', 'vendor', vendor?.id],
    queryFn: () => endpoints.reviews.vendor.list(vendor?.id),
    enabled: !!vendor?.id
  });

  // Handle Tab Change
  const handleTabChange = (tab: string) => {
    const newParams = new URLSearchParams(searchString);
    newParams.set("tab", tab);
    // When changing main tabs, we might want to clear specific filters like collection
    if (tab !== "products") {
      newParams.delete("collectionId");
    }
    setLocation(`${location.split('?')[0]}?${newParams.toString()}`);
  };

  // Handle Collection Click
  const handleCollectionClick = (collectionId: number) => {
    const newParams = new URLSearchParams(searchString);
    newParams.set("tab", "products");
    newParams.set("collectionId", collectionId.toString());
    setLocation(`${location.split('?')[0]}?${newParams.toString()}`);

    // Smooth scroll to products
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const clearCollectionFilter = () => {
    const newParams = new URLSearchParams(searchString);
    newParams.delete("collectionId");
    setLocation(`${location.split('?')[0]}?${newParams.toString()}`);
  };

  if (!match) return null;

  // Find active collection name
  const activeCollection = collections?.find((c: any) => c.id === selectedCollectionId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Banner */}
      <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 h-64 md:h-80">
        {(vendor?.coverImage || vendor?.banner) ? (
          <img
            src={vendor.coverImage || vendor.banner}
            alt="Store Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Vendor Info Card - Overlapping Banner */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Store Logo */}
            <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex-shrink-0 flex items-center justify-center border-4 border-white overflow-hidden">
              {vendor?.logo ? (
                <img src={vendor.logo} alt="Store Logo" className="w-full h-full object-cover" />
              ) : (
                <ShoppingCart className="w-16 h-16 text-purple-600" />
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {language === 'ar' ? vendor?.storeNameAr : vendor?.storeNameEn || vendor?.storeName || "متجر"}
              </h1>
              <p className="text-gray-600 mb-4 text-lg">
                {language === 'ar' ? vendor?.descriptionAr : vendor?.descriptionEn || vendor?.description}
              </p>

              <div className="flex flex-wrap gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-gray-900">
                    {Number(vendor?.rating || 0).toFixed(1)} من 5
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-600">{products?.length || 0} {language === 'ar' ? 'منتج' : 'Products'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Debug: UserID={user?.id} VendorUserID={vendor?.userId} Role={user?.role} */}
                {/* Always show Contact Seller button for verification, or restrict if needed later */}
                {user && (
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => openChat({
                      vendorId: vendor.id,
                      recipientId: vendor.userId,
                      vendorName: language === 'ar' ? vendor.storeNameAr : vendor.storeNameEn,
                      vendorLogo: vendor.logo,
                      sessionId: `vendor-${vendor.id}`
                    })}
                  >
                    <MessageSquare className="w-4 h-4 ml-2" />
                    {language === 'ar' ? "تواصل مع البائع" : "Contact Seller"}
                  </Button>
                )}

                {/* Always show Rate Store button for verification, or check if user is logged in */}
                {user && (
                  <Button variant="outline" onClick={() => setIsRatingOpen(true)}>
                    <Star className="w-4 h-4 ml-2 mr-1" />
                    {language === 'ar' ? "تقييم المتجر" : "Rate Store"}
                  </Button>
                )}
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-gray-50 rounded-xl p-6 w-full md:w-80">
              <h3 className="font-semibold text-gray-900 mb-4">{language === 'ar' ? "معلومات التواصل" : "Contact Info"}</h3>
              <div className="space-y-3">
                {vendor?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{vendor.phone}</span>
                  </div>
                )}
                {vendor?.cityAr && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      {language === 'ar' ? vendor.cityAr : vendor.cityEn || vendor.city}, {language === 'ar' ? vendor.countryAr : vendor.countryEn || vendor.country}
                    </span>
                  </div>
                )}
                {vendor?.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                      {vendor.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StoreRatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        vendorId={vendor?.id}
        vendorName={language === 'ar' ? vendor?.storeNameAr : vendor?.storeNameEn}
      />

      {/* Navigation Tabs - Sticky offset increased to top-24 (was top-0 then top-20 proposed, trying 24 for more space) */}
      <div className="bg-white border-b border-gray-200 sticky top-24 z-20 mt-8 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {[
              { id: "products", label: "المنتجات" },
              { id: "reviews", label: "التقييمات" },
              { id: "info", label: "معلومات المتجر" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-2 border-b-2 transition ${selectedTab === tab.id
                  ? "border-purple-600 text-purple-600 font-bold"
                  : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div id="products-section" className="container mx-auto px-4 py-8 min-h-[400px]">
        {/* Products Tab */}
        {selectedTab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCollectionId && activeCollection
                  ? `منتجات مجموعة: ${language === 'ar' ? activeCollection.nameAr : activeCollection.nameEn}`
                  : "منتجات المتجر"}
              </h2>

              {selectedCollectionId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCollectionFilter}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 ml-2" />
                  إلغاء التصنيف
                </Button>
              )}
            </div>

            {productsLoading ? (
              <div className="grid md:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-[3/4] bg-gray-100 rounded-3xl animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid md:grid-cols-4 gap-6">
                {products.map((product: any, i: number) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ShoppingCart}
                title={language === 'ar' ? "لا توجد منتجات" : "No Products Found"}
                description={selectedCollectionId
                  ? (language === 'ar' ? "لا توجد منتجات في هذه المجموعة حالياً" : "No products found in this collection.")
                  : (language === 'ar' ? "لم يتم إضافة منتجات بعد" : "No products added yet.")
                }
                actionLabel={selectedCollectionId ? (language === 'ar' ? "عرض كل المنتجات" : "View All Products") : undefined}
                onAction={selectedCollectionId ? clearCollectionFilter : undefined}
              />
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {selectedTab === "reviews" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">تقييمات العملاء</h2>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <Card key={review.id} className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-semibold">{review.customerName || 'عميل'}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">لا توجد تقييمات بعد</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Info Tab */}
        {selectedTab === "info" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات المتجر</h2>

            {/* Description & Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="md:col-span-2 border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">عن المتجر</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-line">
                    {language === 'ar' ? (vendor?.descriptionAr || vendor?.description) : (vendor?.descriptionEn || vendor?.description)}
                  </p>

                  {/* Gallery */}
                  {vendor?.gallery && vendor.gallery.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">معرض الصور</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {vendor.gallery.map((img: string, i: number) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer">
                            <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">معلومات الاتصال</h3>
                    <div className="space-y-4">
                      {vendor?.phone && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <Phone className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">الهاتف</p>
                            <p className="font-semibold text-gray-900 dir-ltr">{vendor.phone}</p>
                          </div>
                        </div>
                      )}

                      {vendor?.email && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                            <p className="font-semibold text-gray-900">{vendor.email}</p>
                          </div>
                        </div>
                      )}

                      {(vendor?.cityAr || vendor?.cityEn) && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">العنوان</p>
                            <p className="font-semibold text-gray-900">
                              {language === 'ar' ? `${vendor?.cityAr || ''}، ${vendor?.countryAr || ''}` : `${vendor?.cityEn || ''}, ${vendor?.countryEn || ''}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Social Media */}
                    {vendor?.socialLinks && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">تابعنا على</h4>
                        <div className="flex gap-3 flex-wrap">
                          {vendor.socialLinks.whatsapp && (
                            <a
                              href={`https://wa.me/${vendor.socialLinks.whatsapp.replace(/[^0-9+]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition"
                            >
                              <MessageCircle className="w-5 h-5" />
                            </a>
                          )}
                          {vendor.socialLinks.facebook && (
                            <a
                              href={vendor.socialLinks.facebook.startsWith('http') ? vendor.socialLinks.facebook : `https://${vendor.socialLinks.facebook}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition"
                            >
                              <Facebook className="w-5 h-5" />
                            </a>
                          )}
                          {vendor.socialLinks.instagram && (
                            <a
                              href={vendor.socialLinks.instagram.startsWith('http') ? vendor.socialLinks.instagram : `https://${vendor.socialLinks.instagram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-100 transition"
                            >
                              <Instagram className="w-5 h-5" />
                            </a>
                          )}
                          {vendor.socialLinks.twitter && (
                            <a
                              href={vendor.socialLinks.twitter.startsWith('http') ? vendor.socialLinks.twitter : `https://${vendor.socialLinks.twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-100 transition"
                            >
                              <Twitter className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-purple-600 mb-1">{Number(vendor?.rating || 0).toFixed(1)}</p>
                        <p className="text-sm text-gray-600">التقييم العام</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-purple-600 mb-1">{products?.length || 0}</p>
                        <p className="text-sm text-gray-600">{language === 'ar' ? 'عدد المنتجات' : 'Products Count'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collections Section - Moved to bottom */}
      <div className="container mx-auto px-4 py-8 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">المجموعات</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {collections?.map((collection: any) => (
            <Card
              key={collection.id}
              className={`cursor-pointer transition group ${selectedCollectionId === collection.id ? 'ring-2 ring-purple-600' : 'hover:shadow-lg'}`}
              onClick={() => handleCollectionClick(collection.id)}
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden rounded-t-lg">
                {collection.coverImage ? (
                  <img
                    src={collection.coverImage}
                    alt={language === 'ar' ? collection.nameAr : collection.nameEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                    <Layers className="w-12 h-12 text-purple-600" />
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className={`font-semibold text-center truncate ${selectedCollectionId === collection.id ? 'text-purple-600' : 'text-gray-900'}`}>
                  {language === 'ar' ? collection.nameAr : collection.nameEn}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Local ChatWidget removed in favor of global context */}
      <QuickViewModal
        initialProduct={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
