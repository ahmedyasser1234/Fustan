import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ExternalLink, ImageIcon, Instagram, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { useLanguage } from "@/lib/i18n";

export default function ContentTab() {
    const { t, language } = useLanguage();
    const queryClient = useQueryClient();
    const [updatingIds, setUpdatingIds] = useState<number[]>([]);

    const { data: socialFeed, isLoading } = useQuery({
        queryKey: ['content', 'social_feed'],
        queryFn: () => endpoints.content.list('social_feed'),
    });

    const updateContent = useMutation({
        mutationFn: async ({ id, data }: { id: number, data: any }) => {
            return endpoints.content.update(id, data);
        },
        onMutate: (variables) => {
            setUpdatingIds(prev => [...prev, variables.id]);
        },
        onSettled: (data, error, variables) => {
            setUpdatingIds(prev => prev.filter(id => id !== variables.id));
        },
        onSuccess: () => {
            toast.success(t('contentUpdated'));
            queryClient.invalidateQueries({ queryKey: ['content', 'social_feed'] });
        },
        onError: () => {
            toast.error(t('updateError'));
        }
    });

    const handleUpdate = (id: number, currentData: any, field: string, value: string) => {
        const newData = { ...currentData, [field]: value };
        updateContent.mutate({ id, data: newData });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('manageInstagramContent')}</h2>
                    <p className="text-gray-500">{t('instagramContentDesc')}</p>
                </div>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Instagram className="w-4 h-4" />
                                {t('autoConnect')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <DialogHeader>
                                <DialogTitle>{t('autoConnectInstagram')}</DialogTitle>
                                <DialogDescription>
                                    {t('autoConnectDesc')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>{t('instagramAccessToken')}</Label>
                                    <Input
                                        placeholder="Paste your long-lived access token here..."
                                        id="ig-token"
                                    />
                                </div>
                                <Button
                                    className="w-full bg-rose-600 hover:bg-rose-700"
                                    onClick={() => {
                                        const token = (document.getElementById('ig-token') as HTMLInputElement).value;
                                        if (!token) return toast.error(t('enterTokenFirst'));

                                        toast.promise(endpoints.content.setupInstagram(token), {
                                            loading: t('connecting'),
                                            success: t('connectSuccess'),
                                            error: t('connectError')
                                        });
                                    }}
                                >
                                    {t('saveAndSync')}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button
                        variant="ghost"
                        size="icon"
                        title={t('syncNow')}
                        onClick={() => {
                            toast.promise(endpoints.content.syncInstagram(), {
                                loading: t('syncing'),
                                success: t('syncStarted'),
                                error: t('syncFailed')
                            });
                        }}
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {socialFeed?.map((item: any) => (
                    <Card key={item.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                        <div className="aspect-square relative bg-gray-100 group">
                            {item.data.imageUrl ? (
                                <img
                                    src={item.data.imageUrl}
                                    alt="Social Feed"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-gray-400">
                                    <ImageIcon className="w-12 h-12" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a
                                    href={item.data.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-white rounded-full text-gray-900 hover:text-rose-600 transition-colors"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block text-start">{t('imageUrl')}</label>
                                <div className="flex gap-2">
                                    <Input
                                        defaultValue={item.data.imageUrl}
                                        onBlur={(e) => {
                                            if (e.target.value !== item.data.imageUrl) {
                                                handleUpdate(item.id, item.data, 'imageUrl', e.target.value);
                                            }
                                        }}
                                        className="text-left ltr"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block text-start">{t('postUrl')}</label>
                                <Input
                                    defaultValue={item.data.link}
                                    onBlur={(e) => {
                                        if (e.target.value !== item.data.link) {
                                            handleUpdate(item.id, item.data, 'link', e.target.value);
                                        }
                                    }}
                                    className="text-left ltr"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div className="pt-2 flex justify-end">
                                {updatingIds.includes(item.id) && (
                                    <span className="text-xs text-rose-600 flex items-center gap-1 animate-pulse">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        {t('saving')}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
