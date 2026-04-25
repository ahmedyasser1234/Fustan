import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import { useAuth } from '@/_core/hooks/useAuth';

export function useSystemNotifications() {
    const { user } = useAuth();

    const { data: unreadData, refetch } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: endpoints.notifications.getUnreadCount,
        enabled: !!user && !!user?.id,
        refetchOnWindowFocus: true,
        staleTime: 1000 * 60, // 1 minute
    });

    const unreadCount = unreadData?.count || 0;

    return { unreadCount, refetch };
}
