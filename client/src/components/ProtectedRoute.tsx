import { Route, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface ProtectedRouteProps {
    path: string;
    component: React.ComponentType<any>;
    role?: "admin" | "vendor" | "customer";
    redirectPath?: string;
}

export function ProtectedRoute({ path, component: Component, role: propRole, redirectPath }: ProtectedRouteProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const { language } = useLanguage();
    const [, setLocation] = useLocation();

    // Aggressively determine if we are a guest
    const token = typeof window !== 'undefined' ? localStorage.getItem('app_token') : null;
    const isGuest = !isAuthenticated && !token;

    // Guess role from path if not provided
    const role = propRole || (path.startsWith('/admin') ? 'admin' : (path.startsWith('/vendor') ? 'vendor' : 'customer'));

    useEffect(() => {
        if (isGuest) {
            const loginPath = role === 'admin' ? "/admin/login" : (role === 'vendor' ? "/vendor/login" : "/login");
            console.warn(`[ProtectedRoute] GUEST detected on ${path}. Redirecting to ${loginPath}`);
            setLocation(redirectPath || loginPath);
        } else if (!loading && isAuthenticated && propRole && user?.role !== propRole) {
            console.warn(`[ProtectedRoute] ROLE MISMATCH on ${path}. Expected ${propRole}, got ${user?.role}. Redirecting to /`);
            setLocation("/");
        }
    }, [isGuest, loading, isAuthenticated, propRole, user, setLocation, redirectPath, path, role]);

    // IF GUEST, DO NOT SHOW LOADER. REDIRECT IMMEDIATELY.
    if (isGuest) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
                    <img src="/logo-small.png" alt="Fustan" className="absolute inset-0 m-auto w-10 h-10 object-contain opacity-50" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
                <p className="mt-4 text-slate-500 font-bold animate-pulse">
                    {language === 'ar' ? 'جاري التحقق من الهوية...' : 'Verifying Identity...'}
                </p>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <Route path={path} component={Component} />;
}
