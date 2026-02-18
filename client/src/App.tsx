import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Link, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import OrderDetails from "@/pages/OrderDetails";
import OrderSuccess from "@/pages/OrderSuccess";
import Notifications from "@/pages/Notifications";
import VendorProfile from "@/pages/VendorProfile";
import VendorDashboard from "@/pages/VendorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLogin from "@/pages/AdminLogin";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import TermsOfService from "@/pages/legal/TermsOfService";
import AboutUs from "@/pages/AboutUs";
import ContactUs from "@/pages/ContactUs";
import VendorLogin from "@/pages/VendorLogin.tsx";
import VendorRegister from "@/pages/VendorRegister.tsx";
import AdminRegister from "@/pages/AdminRegister.tsx";
import Wishlist from "@/pages/Wishlist";
import Profile from "@/pages/Profile";
import SharedWishlist from "@/pages/SharedWishlist";
import FAQ from "@/pages/FAQ";
import SearchResults from "@/pages/SearchResults";
import { useAuth } from "@/_core/hooks/useAuth";
import { endpoints } from "@/lib/api";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, User, Menu, X, ChevronLeft, Search, ShoppingBag, LayoutDashboard, MessageSquare, Facebook, Instagram, Twitter, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { getLoginUrl } from "@/const";
import { motion, AnimatePresence } from "framer-motion";

import { Switch as UISwitch } from "@/components/ui/switch"; // Renamed to avoid conflict with wouter's Switch
import { useLanguage } from "@/lib/i18n";

import { ChatHistory } from "./components/chat/ChatHistory";
import { useChatNotifications } from "@/hooks/useChatNotifications";
import { useSystemNotifications } from "@/hooks/useSystemNotifications";
import { ScrollToTop } from "./components/ScrollToTop";
import { NotificationDropdown } from "./components/NotificationDropdown";

const HERO_PAGES = ['/', '/products', '/about-us', '/contact-us'];

function Navigation({ isChatHistoryOpen, setIsChatHistoryOpen, unreadCount, systemUnreadCount }: { isChatHistoryOpen: boolean, setIsChatHistoryOpen: (open: boolean) => void, unreadCount: number, systemUnreadCount: number }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location, setLocation] = useLocation();
  const isHeroPage = HERO_PAGES.includes(location);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => endpoints.cart.get(),
    enabled: !!user
  });

  const [guestCartTrigger, setGuestCartTrigger] = useState(0);

  useEffect(() => {
    const handleCartUpdate = () => {
      setGuestCartTrigger(prev => prev + 1);
    };
    window.addEventListener('fustan-cart-updated', handleCartUpdate);
    return () => window.removeEventListener('fustan-cart-updated', handleCartUpdate);
  }, []);

  const cartCount = useMemo(() => {
    let count = 0;
    // Server items
    if (cartData && Array.isArray(cartData)) {
      count = cartData.reduce((acc, item) => acc + (item.quantity || 0), 0);
    }
    // Guest items from localStorage
    if (typeof window !== "undefined") {
      const guestItemsRaw = localStorage.getItem('fustan-guest-items');
      if (guestItemsRaw) {
        try {
          const guestItems = JSON.parse(guestItemsRaw);
          if (Array.isArray(guestItems)) {
            count += guestItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
          }
        } catch (e) {
          console.error("Failed to parse guest cart", e);
        }
      }
    }
    return count;
  }, [cartData, guestCartTrigger]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled || !isHeroPage
      ? 'bg-white/80 backdrop-blur-xl border-white/20 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
      : 'bg-transparent border-transparent py-6'
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between font-sans">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer group">
              <img
                src={(!isScrolled && isHeroPage) ? "/logo-white.png" : "/12345.png"}
                alt="Fustan Logo"
                className={`w-auto object-contain transition-all duration-500 ${isScrolled || !isHeroPage ? 'h-12' : 'h-16 drop-shadow-lg'}`}
              />
            </div>
          </Link>

          {/* Center: Navigation Links (Luxury Pill) */}
          <div className={`hidden lg:flex items-center gap-1 px-2 py-2 rounded-full transition-all duration-300 ${isScrolled || !isHeroPage
            ? 'bg-gray-100/50 backdrop-blur-md border border-gray-100'
            : 'bg-transparent border border-transparent'
            }`}>
            {[
              { label: t('home'), href: "/" },
              { label: t('products'), href: "/products" },
              { label: t('about'), href: "/about-us" },
              { label: t('contact'), href: "/contact-us" }
            ].map(link => {
              const isActive = location === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <span className={`block px-6 py-2.5 rounded-full text-sm font-black cursor-pointer transition-all duration-300 ${isActive
                    ? (isScrolled || location !== '/' ? 'bg-white text-gray-900 shadow-sm' : 'bg-white text-gray-900 shadow-lg')
                    : (isScrolled || location !== '/' ? 'text-gray-500 hover:text-gray-900' : 'text-white/80 hover:text-white')
                    }`}>
                    {link.label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Right Side: Tools & Search */}
          <div className="flex items-center gap-1.5 md:gap-3">
            {/* Search Input (Hidden on extra small) */}
            {/* Search Input (Hidden on mobile) */}
            <form onSubmit={handleSearch} className="hidden lg:flex relative items-center group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? "ابحثي عن فستان أحلامك..." : "Find your dream dress..."}
                className={`h-11 rounded-full px-6 pe-12 transition-all duration-300 ${isScrolled || !isHeroPage
                  ? 'bg-gray-100/50 focus:bg-white border-gray-100 focus:border-rose-200 w-48 md:w-64 focus:w-72'
                  : 'bg-transparent hover:bg-white/5 text-white placeholder:text-white/60 border-transparent focus:border-white/20 w-48 md:w-60 focus:w-64'
                  } border outline-none font-medium text-sm`}
              />
              <button type="submit" className={`absolute end-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isScrolled || !isHeroPage ? 'bg-rose-600 text-white shadow-rose-200 shadow-lg' : 'bg-white text-gray-900 shadow-white/20 shadow-md'}`}>
                <Search size={14} />
              </button>
            </form>

            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className={`flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full font-bold shadow-sm transition-all border ${isScrolled || !isHeroPage
                ? 'bg-gray-50 text-gray-900 border-gray-100 hover:bg-gray-100'
                : 'bg-transparent text-white border-transparent hover:bg-white/5'
                }`}
            >
              <span className="text-xs md:text-sm">{language === 'ar' ? 'En' : 'ع'}</span>
            </button>

            <div className="flex items-center gap-3">
              <Link href="/cart">
                <button className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-all relative shadow-lg">
                  <ShoppingCart className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-rose-500 text-[10px] md:text-xs font-black text-white ring-2 ring-white shadow-lg"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </button>
              </Link>

              {user ? (
                <>
                  {user.role !== 'admin' && user.role !== 'vendor' && (
                    <>
                      <Link href="/wishlist">
                        <button className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner hover:bg-rose-100 transition-all">
                          <Heart className="w-4.5 h-4.5 md:w-5 md:h-5" />
                        </button>
                      </Link>

                      <NotificationDropdown unreadCount={systemUnreadCount} />
                    </>
                  )}

                  <div className="relative user-menu-container" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner hover:bg-rose-200 transition-all"
                    >
                      <User className="w-4.5 h-4.5 md:w-5 md:h-5" />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute end-0 mt-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-5 z-50 overflow-hidden text-start"
                        >
                          <div className="flex items-center gap-4 p-2 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg">{user.name}</p>
                              <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            {user?.role === "vendor" && (
                              <Link href="/vendor-dashboard">
                                <button
                                  onClick={() => setUserMenuOpen(false)}
                                  className="w-full text-start px-4 py-3.5 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-colors font-bold text-gray-600 flex items-center gap-3">
                                  <LayoutDashboard size={18} />
                                  {t('vendorDashboard')}
                                </button>
                              </Link>
                            )}
                            {user?.role === "admin" && (
                              <Link href="/admin-dashboard">
                                <button
                                  onClick={() => setUserMenuOpen(false)}
                                  className="w-full text-start px-4 py-3.5 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-colors font-bold text-gray-600 flex items-center gap-3">
                                  <LayoutDashboard size={18} />
                                  {t('adminDashboard')}
                                </button>
                              </Link>
                            )}
                            {user?.role !== 'vendor' && user?.role !== 'admin' && (
                              <Link href="/orders">
                                <button
                                  onClick={() => setUserMenuOpen(false)}
                                  className="w-full text-start px-4 py-3.5 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-colors font-bold text-gray-600 flex items-center gap-3">
                                  <ShoppingBag size={18} />
                                  {t('myOrders')}
                                </button>
                              </Link>
                            )}
                            <Link href="/profile">
                              <button
                                onClick={() => setUserMenuOpen(false)}
                                className="w-full text-start px-4 py-3.5 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-colors font-bold text-gray-600 flex items-center gap-3">
                                <User size={18} />
                                {language === 'ar' ? "الملف الشخصي" : "My Profile"}
                              </button>
                            </Link>

                            <div className="h-px bg-gray-50 my-2" />

                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                logout();
                              }}
                              className="w-full text-start px-4 py-3.5 rounded-2xl hover:bg-red-50 text-red-500 transition-colors font-bold flex items-center gap-3"
                            >
                              <div className="w-5" />
                              {t('logout')}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className={`h-11 px-8 rounded-full text-base font-bold shadow-xl transition-all ${isScrolled || !isHeroPage
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                    : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}>
                    {t('startNow')}
                  </Button>
                </a>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-9 h-9 md:w-11 md:h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-900 shadow-sm"
              >
                {mobileMenuOpen ? <X className="w-4.5 h-4.5 md:w-5 md:h-5" /> : <Menu className="w-4.5 h-4.5 md:w-5 md:h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 bg-white rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden"
            >
              <div className="p-8 space-y-4 text-center">
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={language === 'ar' ? "ابحثي عن فستان..." : "Search for dress..."}
                      className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 text-right font-medium focus:ring-2 focus:ring-rose-200"
                    />
                    <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-100">
                      <Search size={16} />
                    </button>
                  </div>
                </form>
                <div className="space-y-2">
                  {[
                    { label: t('home'), href: "/" },
                    { label: t('products'), href: "/products" },
                    { label: t('about'), href: "/about-us" },
                    { label: t('contact'), href: "/contact-us" }
                  ].map((item) => (
                    <Link key={item.label} href={item.href}>
                      <span
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-lg font-black text-gray-600 hover:text-gray-900 hover:bg-gray-50 py-3 rounded-2xl cursor-pointer transition-colors"
                      >
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function Footer() {
  const { language, t } = useLanguage();
  const isAr = language === 'ar';

  return (
    <footer className="bg-slate-950 pt-24 pb-12 text-slate-400">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5 text-start">
            <div className="flex items-center justify-start mb-6">
              <img
                src="/logo-white.png"
                alt="Fustan Logo"
                className="h-20 w-auto object-contain"
              />
            </div>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              {isAr
                ? "نحن هنا لنصنع لكِ لحظة لا تُنسى. أكثر من مجرد متجر، نحن رفيقكِ في رحلة اختيار فستان العمر بتصاميم تجمع بين الرقي والابتكار."
                : "We are here to create an unforgettable moment for you. More than just a store, we are your companion in the journey of choosing your dream dress with designs that blend elegance and innovation."
              }
            </p>
            <div className="flex justify-start gap-4">
              {[
                { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
                { icon: Instagram, href: "https://instagram.com/ahmedyasser1456/", label: "Instagram" },
                { icon: Twitter, href: "https://twitter.com", label: "X (Twitter)" },
                { icon: MessageCircle, href: "https://wa.me/201021464303", label: "WhatsApp" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-300 flex items-center justify-center text-slate-400 group"
                >
                  <social.icon size={20} className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 text-start">
            <h3 className="text-base font-black text-white mb-6 uppercase tracking-wider">
              {isAr ? 'روابط تهمك' : 'Quick Links'}
            </h3>
            <ul className="space-y-3 text-slate-400 font-medium text-sm">
              <li><Link href="/products" className="hover:text-rose-600 transition-colors">{isAr ? 'مجموعتنا الجديدة' : 'New Collection'}</Link></li>
              <li><Link href="/about-us" className="hover:text-rose-600 transition-colors">{isAr ? 'حكاية فستان' : 'Our Story'}</Link></li>
              <li><Link href="/contact-us" className="hover:text-rose-600 transition-colors">{isAr ? 'تواصل معنا' : 'Contact Us'}</Link></li>
              <li><Link href="/faq" className="hover:text-rose-600 transition-colors">{isAr ? 'الأسئلة الشائعة' : 'FAQs'}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 text-start">
            <h3 className="text-base font-black text-white mb-6 uppercase tracking-wider">
              {isAr ? 'سياساتنا' : 'Our Policies'}
            </h3>
            <ul className="space-y-3 text-slate-400 font-medium text-sm">
              <li><Link href="/shipping" className="hover:text-rose-600 transition-colors">{isAr ? 'الشحن والتوصيل' : 'Shipping & Delivery'}</Link></li>
              <li><Link href="/returns" className="hover:text-rose-600 transition-colors">{isAr ? 'الاستبدال والاسترجاع' : 'Returns & Exchange'}</Link></li>
              <li><Link href="/terms" className="hover:text-rose-600 transition-colors">{isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}</Link></li>
              <li><Link href="/privacy" className="hover:text-rose-600 transition-colors">{isAr ? 'الخصوصية' : 'Privacy Policy'}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3 text-start">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
              <h3 className="text-base font-black text-white mb-3">
                {isAr ? 'انضمي لنشرتنا' : 'Join Our Newsletter'}
              </h3>
              <p className="text-xs text-slate-400 font-medium mb-4">
                {isAr ? 'كوني أول من يعرف عن المجموعات الجديدة والعروض الحصرية' : 'Be the first to know about new collections and exclusive offers'}
              </p>
              <div className="flex gap-2">
                <button className={`bg-rose-600 hover:bg-rose-700 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-900/20 transition-all ${isAr ? '' : 'rotate-180'}`}>
                  <ChevronLeft size={18} />
                </button>
                <input
                  className="w-full bg-white/10 rounded-xl border-none px-4 text-start text-white placeholder:text-slate-500 font-medium text-sm focus:ring-2 focus:ring-rose-200 outline-none"
                  placeholder={isAr ? "بريدك الإلكتروني" : "Your Email"}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8 text-slate-500 font-medium text-xs">
          <div className={`flex gap-4 mb-4 md:mb-0 ${isAr ? 'flex-row' : 'flex-row-reverse'}`}>
            <span dir="ltr">&copy; {new Date().getFullYear()} Elegance Bridal Co.</span>
            <span>{isAr ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}</span>
          </div>
          <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-slate-600">{isAr ? 'صنع بكل' : 'Built with'}</span>
            <Heart size={12} className="text-rose-500 fill-rose-500" />
            <span className="text-slate-600">{isAr ? 'في مصر' : 'in Egypt'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchResults} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Product Routes */}
      <Route path={"/products"} component={Products} />
      <Route path={"/products/:id"} component={ProductDetail} />
      <Route path={"/cart"} component={Cart} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/orders"} component={Orders} />
      <Route path={"/orders/:id"} component={OrderDetails} />
      <Route path={"/wishlist"} component={Wishlist} />
      <Route path={"/wishlist/shared/:token"} component={SharedWishlist} />
      <Route path={"/notifications"} component={Notifications} />
      {/* Vendor Auth */}
      <Route path="/vendor/login" component={VendorLogin} />
      <Route path="/vendor/register" component={VendorRegister} />

      {/* Admin Auth */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/register" component={AdminRegister} />
      <Route path="/fustan-super-admin-auth" component={AdminLogin} />

      {/* Profile & Dashboard Routes */}
      <Route path={"/vendor/:slug"} component={VendorProfile} />
      <Route path="/vendor-dashboard" component={VendorDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path={"/profile"} component={Profile} />

      {/* Legal & Static Routes */}
      <Route path={"/privacy"} component={PrivacyPolicy} />
      <Route path={"/terms"} component={TermsOfService} />
      <Route path={"/about-us"} component={AboutUs} />
      <Route path={"/contact-us"} component={ContactUs} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

import { ChatProvider } from "./contexts/ChatContext";
import { ChatContainer } from "./components/chat/ChatContainer";

function App() {
  // const socket = useSocket(); // Socket is now managed in ChatContext
  const { user } = useAuth();
  // const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false); // MOVED TO CONTEXT

  // Centralized chat notifications

  const [location] = useLocation();
  const isHome = location === '/';

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Separated Content to use ChatContext
import { useChat } from "./contexts/ChatContext";

function AppContent() {
  const { isChatHistoryOpen, setIsChatHistoryOpen } = useChat();
  const { unreadCount } = useChatNotifications();
  const { unreadCount: systemUnreadCount } = useSystemNotifications();
  const { user } = useAuth();
  const { dir } = useLanguage();
  const [location] = useLocation();
  const isHome = location === '/';

  return (
    <div className="flex flex-col min-h-screen" dir={dir}>
      <ScrollToTop />
      <Toaster />
      <Navigation
        isChatHistoryOpen={isChatHistoryOpen}
        setIsChatHistoryOpen={setIsChatHistoryOpen}
        unreadCount={unreadCount}
        systemUnreadCount={systemUnreadCount}
      />
      <main className={`flex-1 ${!HERO_PAGES.includes(location) ? 'pt-20' : ''}`}>
        <Router />
      </main>
      <Footer />

      <ChatHistory
        isOpen={isChatHistoryOpen}
        onOpenChange={setIsChatHistoryOpen}
      />

      <ChatContainer />

      {/* Floating Chat Button (Support Style) */}
      {user && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatHistoryOpen(true)}
          className="fixed bottom-8 left-8 z-[100] w-16 h-16 rounded-full bg-rose-600 text-white shadow-2xl shadow-rose-200 flex items-center justify-center group transition-all hover:bg-rose-700"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-600 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
          <MessageSquare className="w-8 h-8 relative z-10" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-rose-600 text-[12px] font-black shadow-lg animate-bounce border-2 border-rose-500">
              {unreadCount}
            </span>
          )}
        </motion.button>
      )}
    </div>
  );
}

export default App;
