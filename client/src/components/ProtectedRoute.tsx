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

export function ProtectedRoute({ path, component: Component, role, redirectPath }: ProtectedRouteProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const { language } = useLanguage();
    const [, setLocation] = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('app_token');
        console.log(`[ProtectedRoute] Path: ${path}, Loading: ${loading}, Auth: ${isAuthenticated}, Token: ${!!token}, Role Required: ${role || 'none'}`);

        if (!loading) {
            if (!isAuthenticated && !token) {
                console.warn(`[ProtectedRoute] Redirection triggered: No token/auth found. Redirecting to ${role === 'admin' ? '/admin/login' : (role === 'vendor' ? '/vendor/login' : '/login')}`);
                if (role === 'admin') setLocation(redirectPath || "/admin/login");
                else if (role === 'vendor') setLocation(redirectPath || "/vendor/login");
                else setLocation(redirectPath || "/login");
            } else if (isAuthenticated && role && user?.role !== role) {
                console.warn(`[ProtectedRoute] Redirection triggered: Role mismatch. Required: ${role}, Got: ${user?.role}. Redirecting to /`);
                setLocation("/");
            }
        }
    }, [loading, isAuthenticated, role, user, setLocation, redirectPath, path]);

    // Added a fail-safe: if it stays loading too long, check if we really have auth
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
                    <img src="/logo-small.png" alt="Loading..." className="absolute inset-0 m-auto w-10 h-10 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
                <p className="mt-4 text-slate-500 font-bold animate-pulse">
                    {language === 'ar' ? 'جاري التحقق...' : 'Verifying Access...'}
                </p>
            </div>
        );
    }

    if (!isAuthenticated && !localStorage.getItem('app_token')) {
        return null;
    }

    return <Route path={path} component={Component} />;
}
