import { Route, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    path: string;
    component: React.ComponentType<any>;
    role?: "admin" | "vendor" | "customer";
    redirectPath?: string;
}

export function ProtectedRoute({ path, component: Component, role, redirectPath }: ProtectedRouteProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            // Default redirects based on role requirement
            if (role === 'admin') {
                setLocation(redirectPath || "/admin/login");
            } else if (role === 'vendor') {
                setLocation(redirectPath || "/vendor/login");
            } else {
                setLocation(redirectPath || "/login");
            }
        } else if (!loading && isAuthenticated && role && user?.role !== role) {
            // User is authenticated but doesn't have the required role
            setLocation("/");
        }
    }, [loading, isAuthenticated, role, user, setLocation, redirectPath]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen pt-20">
                <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated || (role && user?.role !== role)) {
        return null; // Effect will handle redirection
    }

    return <Route path={path} component={Component} />;
}
