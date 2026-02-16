import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/_core/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export interface ChatSession {
    sessionId: string;
    vendorId: number;
    recipientId: number;
    vendorName: string;
    vendorLogo?: string;
    isMinimized?: boolean;
}

interface ChatContextType {
    openChats: ChatSession[];
    openChat: (session: Omit<ChatSession, 'sessionId'> & { sessionId?: string }) => void;
    closeChat: (sessionId: string) => void;
    minimizeChat: (sessionId: string) => void;
    isChatHistoryOpen: boolean;
    setIsChatHistoryOpen: (open: boolean) => void;
    socket: Socket | null;
    isUserOnline: (userId: number) => boolean;
    checkOnlineStatus: (userId: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [openChats, setOpenChats] = useState<ChatSession[]>([]);
    const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
    const queryClient = useQueryClient(); // Requires import

    // Initialize Global Socket
    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        if (!socket) {
            // Use relative path to leverage Netlify proxy
            const newSocket = io('/chat', {
                withCredentials: true,
                transports: ['websocket', 'polling'],
            });

            newSocket.on('connect', () => {
                console.log('Global Chat Socket Connected:', newSocket.id);
            });

            newSocket.on('userStatus', ({ userId, status }: { userId: number, status: 'online' | 'offline' }) => {
                setOnlineUsers(prev => {
                    const next = new Set(prev);
                    if (status === 'online') {
                        next.add(userId);
                    } else {
                        next.delete(userId);
                    }
                    return next;
                });
            });

            // Initial status check for already open chats or known users could be here,
            // but we rely on broadcast events and lazy checks in widgets if needed.
            // Ideally, the server pushes the full list or we fetch it?
            // For scalability, we usually don't fetch *everyone*.
            // But we can listen to the stream.

            newSocket.on('receiveMessage', () => {
                // Invalidate conversation lists to update snippets and unread counts
                queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
                queryClient.invalidateQueries({ queryKey: ['chat-conversations-customer'] });
                // Also invalidate specific chat messages if we wanted, but individual widgets handle that.
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                setSocket(null);
            };
        }
    }, [user, queryClient]);

    const isUserOnline = (userId: number) => {
        return onlineUsers.has(userId);
    };

    const openChat = (session: Omit<ChatSession, 'sessionId'> & { sessionId?: string }) => {
        const id = session.sessionId || `vendor-${session.vendorId}`;
        const newSession = { ...session, sessionId: id };

        setOpenChats(prev => {
            const existing = prev.find(c => c.sessionId === id);
            if (existing) {
                if (existing.isMinimized) {
                    return prev.map(c => c.sessionId === id ? { ...c, isMinimized: false } : c);
                }
                return prev;
            }
            return [...prev, { ...newSession, isMinimized: false }];
        });
    };

    const closeChat = (sessionId: string) => {
        setOpenChats(prev => prev.filter(c => c.sessionId !== sessionId));
    };

    const minimizeChat = (sessionId: string) => {
        setOpenChats(prev => prev.map(c =>
            c.sessionId === sessionId ? { ...c, isMinimized: !c.isMinimized } : c
        ));
    };

    const checkOnlineStatus = useCallback((userId: number) => {
        if (!socket) return;
        socket.emit('checkUserStatus', userId, (response: { userId: number, status: 'online' | 'offline' }) => {
            if (response && response.status === 'online') {
                setOnlineUsers(prev => new Set(prev).add(userId));
            } else {
                setOnlineUsers(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            }
        });
    }, [socket]);

    return (
        <ChatContext.Provider value={{
            openChats,
            openChat,
            closeChat,
            minimizeChat,
            isChatHistoryOpen,
            setIsChatHistoryOpen,
            socket,
            isUserOnline,
            checkOnlineStatus
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
