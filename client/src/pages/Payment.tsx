import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { CheckCircle2, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { endpoints } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function Payment() {
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();
    const [isProcessing, setIsProcessing] = useState(false);

    // Mock payment processing
    const handlePayment = async () => {
        setIsProcessing(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In a real app, this would be a Stripe/Paypal integration
        // Here we just mock success and create the order

        toast.success("تم الدفع بنجاح!");
        setLocation("/orders"); // Or show success state first
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-md w-full text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} />
                </div>

                <h1 className="text-2xl font-black text-gray-900 mb-2">بوابة الدفع الآمنة</h1>
                <p className="text-gray-500 mb-8">جارِ معالجة الطلب...</p>

                <div className="space-y-4 mb-8">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 animate-progressBar w-full origin-left" style={{ animationDuration: '2s' }}></div>
                    </div>
                    <p className="text-xs text-gray-400">سيتم خصم المبلغ من بطاقتك وتأكيد الطلب فوراً</p>
                </div>

                <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full h-14 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-100"
                >
                    {isProcessing ? "جارِ المعالجة..." : "تأكيد الدفع"}
                </Button>

                <div className="mt-6 flex justify-center gap-4 text-gray-300">
                    <ShieldCheck size={16} />
                    <span className="text-xs font-bold">مدفوعات مؤمنة 100%</span>
                </div>
            </div>
        </div>
    );
}
