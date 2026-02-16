import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export const useSocket = () => {
    const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        if (!socketRef.current) {
            // Use relative path to leverage Netlify proxy
            socketRef.current = io('/', {
                path: '/socket.io',
                withCredentials: true,
                transports: ['websocket', 'polling'],
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected:', socketRef.current?.id);
                // Join user room
                socketRef.current?.emit('join', String(user.id));
            });

            socketRef.current.on('notification', (data: any) => {
                console.log('Notification received:', data);

                // Show toast
                toast(data.title || 'Notification', {
                    description: data.message,
                    action: data.actionUrl ? {
                        label: 'عرض',
                        onClick: () => window.location.href = data.actionUrl
                    } : undefined,
                });

                // Invalidate queries
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
                if (data.type === 'new_order' || data.type === 'order_created' || data.type === 'order_status') {
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                    queryClient.invalidateQueries({ queryKey: ['vendor', 'orders'] });
                }
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user, queryClient]);

    return socketRef.current;
};
