import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Truck, PackageCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/i18n";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShippingTabProps {
    vendorId: number;
}

export default function ShippingTab({ vendorId }: ShippingTabProps) {
    const { language, t } = useLanguage();
    const queryClient = useQueryClient();
    const [shippingCost, setShippingCost] = useState<string>("");
    const [hasFreeShipping, setHasFreeShipping] = useState<boolean>(false);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState<string>("");

    // Fetch Vendor Profile to get current shipping cost
    const { data: vendor, isLoading } = useQuery({
        queryKey: ['vendor', 'profile', vendorId],
        queryFn: async () => (await api.get(`/vendors/${vendorId}`)).data,
    });

    useEffect(() => {
        if (vendor) {
            setShippingCost(vendor.shippingCost?.toString() || "0");
            setHasFreeShipping(vendor.hasFreeShipping || false);
            setFreeShippingThreshold(vendor.freeShippingThreshold?.toString() || "0");
        }
    }, [vendor]);

    // Update Vendor Shipping Settings
    const updateShipping = useMutation({
        mutationFn: async (data: { shippingCost: number; hasFreeShipping: boolean; freeShippingThreshold: number }) => {
            return api.patch(`/vendors/${vendorId}`, data);
        },
        onSuccess: () => {
            toast.success(t('shippingUpdated'));
            queryClient.invalidateQueries({ queryKey: ['vendor', 'profile', vendorId] });
            queryClient.invalidateQueries({ queryKey: ['vendor', 'dashboard'] });
        },
        onError: () => {
            toast.error(t('shippingError'));
        }
    });

    const handleSave = () => {
        const cost = parseFloat(shippingCost);
        const threshold = parseFloat(freeShippingThreshold);

        if (isNaN(cost) || cost < 0) {
            toast.error(t('invalidShippingCost'));
            return;
        }

        if (hasFreeShipping && (isNaN(threshold) || threshold < 0)) {
            toast.error(t('invalidFreeThreshold'));
            return;
        }

        updateShipping.mutate({
            shippingCost: cost,
            hasFreeShipping,
            freeShippingThreshold: hasFreeShipping ? threshold : 0
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <Truck className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-gray-500 font-bold animate-pulse">{language === 'ar' ? "جاري تحميل إعدادات الشحن..." : "Loading shipping settings..."}</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Standard Shipping Card */}
                <Card className="border-0 shadow-sm overflow-hidden group">
                    <div className="h-1 bg-blue-500 w-full group-hover:h-2 transition-all" />
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded-xl">
                                <Truck className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black">{t('standardShipping')}</CardTitle>
                                <CardDescription>{t('standardShippingDesc')}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="shipping-cost" className="font-bold text-slate-700">{t('shippingCostSR')}</Label>
                            <div className="relative">
                                <Input
                                    id="shipping-cost"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={shippingCost}
                                    onChange={(e) => setShippingCost(e.target.value)}
                                    className="pl-16 h-12 text-lg font-bold rounded-xl border-slate-200 focus:ring-blue-500"
                                />
                                <div className="absolute top-0 left-0 h-full flex items-center px-4 text-slate-400 font-bold border-r border-slate-100">
                                    {t('sar')}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                            <ul className="text-xs space-y-2 text-blue-700 font-medium">
                                <li className="flex items-center gap-2">• {t('shippingNote1')}</li>
                                <li className="flex items-center gap-2">• {t('shippingNote2')}</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Free Shipping Card */}
                <Card className={cn(
                    "border-0 shadow-sm overflow-hidden transition-all duration-300 group",
                    hasFreeShipping ? "ring-2 ring-emerald-500" : "opacity-80"
                )}>
                    <div className={cn("h-1 w-full transition-all", hasFreeShipping ? "bg-emerald-500" : "bg-slate-200")} />
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-xl transition-colors", hasFreeShipping ? "bg-emerald-50" : "bg-slate-50")}>
                                    <Zap className={cn("w-6 h-6", hasFreeShipping ? "text-emerald-600" : "text-slate-400")} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black">{t('freeShipping')}</CardTitle>
                                    <CardDescription>{t('freeShippingDesc')}</CardDescription>
                                </div>
                            </div>
                            <Switch
                                checked={hasFreeShipping}
                                onCheckedChange={setHasFreeShipping}
                                className="data-[state=checked]:bg-emerald-500"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className={cn("space-y-4 transition-all duration-300", hasFreeShipping ? "opacity-100 translate-y-0" : "opacity-40 pointer-events-none -translate-y-2")}>
                            <div className="space-y-2">
                                <Label htmlFor="free-threshold" className="font-bold text-slate-700">{t('freeThreshold')}</Label>
                                <div className="relative">
                                    <Input
                                        id="free-threshold"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={freeShippingThreshold}
                                        onChange={(e) => setFreeShippingThreshold(e.target.value)}
                                        className="pl-16 h-12 text-lg font-bold rounded-xl border-slate-200"
                                        placeholder="1000"
                                    />
                                    <div className="absolute top-0 left-0 h-full flex items-center px-4 text-slate-400 font-bold border-r border-slate-100">
                                        {t('sar')}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex items-start gap-3">
                                <PackageCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-emerald-800 font-medium">
                                    {t('freeThresholdDesc')}
                                </p>
                            </div>
                        </div>
                        {!hasFreeShipping && (
                            <div className="p-8 text-center text-slate-400 text-sm italic">
                                {t('enableFreeShipping')}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-slate-500 text-sm font-medium">
                    {hasFreeShipping ? (
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {t('freeShippingActive')} <span className="text-slate-900 font-black">{freeShippingThreshold} {t('sar')}</span>
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                            {t('freeShippingInactive')}
                        </span>
                    )}
                </div>
                <Button
                    onClick={handleSave}
                    disabled={updateShipping.isPending}
                    className="w-full md:w-auto min-w-[200px] bg-slate-900 hover:bg-slate-800 h-12 rounded-xl text-lg font-bold gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95"
                >
                    {updateShipping.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {t('saveSettings')}
                </Button>
            </div>
        </div>
    );
}
