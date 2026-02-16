import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { refresh } = useAuth();
    const [, setLocation] = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post("/auth/login", {
                email: email.toLowerCase(),
                password,
                role: 'admin'
            });
            await refresh();

            toast.success("Welcome, Super Admin");
            setLocation("/admin-dashboard");
        } catch (error: any) {
            const message = error.response?.data?.message || "Invalid credentials or access denied";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.2),transparent_70%)]"></div>

            <Card className="w-full max-w-md bg-white border-none shadow-2xl relative z-10 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <CardHeader className="space-y-1 text-center pb-8 pt-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 ring-8 ring-blue-50/50">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Super Admin Portal</CardTitle>
                    <CardDescription className="text-slate-500 font-medium tracking-wide">Enter your administrative credentials</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <Input
                                    type="email"
                                    placeholder="admin@fustan.com"
                                    className="pl-10 h-12 bg-slate-50 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all rounded-xl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-12 bg-slate-50 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all rounded-xl"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95"
                            disabled={isLoading}
                        >
                            {isLoading ? "Verifying Authority..." : "Access Administrator Dashboard"}
                        </Button>
                    </form>

                    <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
                        <AlertCircle size={14} />
                        <span className="text-[10px] uppercase font-black tracking-widest">Secure Access Only</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
