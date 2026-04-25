import { Bell, Check, Trash2, Package, Truck, AlertCircle, Info, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
    unreadCount: number;
}

export function NotificationDropdown({ unreadCount }: NotificationDropdownProps) {
    const { language, t } = useLanguage();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => endpoints.notifications.list(),
        enabled: !!user,
    });

    const markAsReadMutation = useMutation({
        mutationFn: (id: number) => endpoints.notifications.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () => endpoints.notifications.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
            toast.success(language === 'ar' ? "تم تحديث الكل كمقروء" : "All marked as read");
        }
    });

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "order": return <Package className="w-4 h-4 text-blue-600" />;
            case "shipment": return <Truck className="w-4 h-4 text-purple-600" />;
            case "alert": return <AlertCircle className="w-4 h-4 text-red-600" />;
            case "info": return <Info className="w-4 h-4 text-green-600" />;
            default: return <Bell className="w-4 h-4 text-gray-600" />;
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner hover:bg-blue-100 transition-all relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white ring-2 ring-white font-bold">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 rounded-3xl overflow-hidden shadow-2xl border-gray-100" align="end">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white">
                    <h3 className="font-black text-gray-900">{t('notifications') || (language === 'ar' ? "الإشعارات" : "Notifications")}</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2 rounded-full font-bold"
                            onClick={() => markAllAsReadMutation.mutate()}
                        >
                            {language === 'ar' ? "تحديد الكل" : "Mark all"}
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[350px]">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">
                                {language === 'ar' ? "لا توجد إشعارات حالياً" : "No notifications yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {notifications.map((notif: any) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        "p-4 hover:bg-gray-50/50 transition-colors group relative",
                                        !notif.isRead && "bg-blue-50/30"
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1">{getNotificationIcon(notif.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm mb-0.5 leading-tight",
                                                !notif.isRead ? "font-bold text-gray-900" : "text-gray-600 font-medium"
                                            )}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-2 font-medium">
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-gray-400 font-bold">
                                                    {new Date(notif.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {!notif.isRead && (
                                                        <button
                                                            onClick={() => markAsReadMutation.mutate(notif.id)}
                                                            className="h-6 w-6 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
                                                            title={language === 'ar' ? "تحديث كمقروء" : "Mark as read"}
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                    {notif.actionUrl && (
                                                        <Link href={notif.actionUrl}>
                                                            <button className="h-6 w-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                                                                <ExternalLink size={12} />
                                                            </button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-3 bg-gray-50/50 border-t border-gray-50 text-center">
                    <Link href="/notifications">
                        <button className="text-xs font-black text-gray-600 hover:text-blue-600 transition-colors py-1">
                            {language === 'ar' ? "عرض جميع الإشعارات" : "View all notifications"}
                        </button>
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
