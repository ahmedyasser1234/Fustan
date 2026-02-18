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
            // Use Environment Variable for connection (e.g. Ngrok or VPS URL)
            const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            socketRef.current = io(SOCKET_URL, {
                path: '/socket.io',
                withCredentials: true,
                transports: ['websocket', 'polling'],
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected');
            });

            socketRef.current.on('notification', (data) => {
                console.log('Notification received:', data);
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
                // You can add toast notifications here
            });

            socketRef.current.on('disconnect', () => {
                console.log('Socket disconnected');
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
