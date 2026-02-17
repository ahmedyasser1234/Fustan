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
            // Use environment variable for socket URL, or correct backend URL from VITE_API_URL
            let socketUrl = import.meta.env.VITE_SOCKET_URL;
            const apiUrl = import.meta.env.VITE_API_URL;

            if (!socketUrl && apiUrl) {
                try {
                    // Check if apiUrl is absolute
                    if (apiUrl.startsWith('http')) {
                        const url = new URL(apiUrl);
                        socketUrl = url.origin;
                    } else {
                        // Relative path, use window origin or fallback
                        // If it's just '/api', we might want to check if there is a hardcoded fallback
                        console.warn("VITE_API_URL is relative, using default fallback for socket.");
                    }
                } catch (e) {
                    console.error("Invalid API URL for socket", e);
                }
            }

            // Fallback to the backend IP found in netlify.toml if no other URL is found
            if (!socketUrl) {
                // Check if we are in production (netlify) to avoid breaking local dev if env is missing
                if (window.location.hostname.includes('netlify.app')) {
                    socketUrl = "http://148.230.126.48";
                } else {
                    socketUrl = window.location.origin;
                }
            }

            console.log('Connecting socket to:', socketUrl);

            socketRef.current = io(socketUrl, {
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
