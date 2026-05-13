import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';

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
            // Priority: 1. VITE_SOCKET_URL, 2. VITE_API_URL, 3. Hardcoded Fallback
            const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
                import.meta.env.VITE_API_URL ||
                window.location.origin;

            // Prevent connecting to self (Netlify) if URL is relative or missing
            if (!SOCKET_URL || SOCKET_URL.startsWith('/')) {
                return;
            }

            socketRef.current = io(SOCKET_URL, {
                path: '/socket.io',
                withCredentials: true,
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5, // Stop after 5 failed attempts to save bandwidth
                reconnectionDelay: 5000, // Wait 5 seconds between retries
            });

            socketRef.current.on('connect', () => {
                // connection established silently
            });

            socketRef.current.on('notification', () => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
                // You can add toast notifications here
            });

            socketRef.current.on('disconnect', () => {
                // socket disconnected silently
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

export default useSocket;
