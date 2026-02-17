
import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/_core/hooks/useAuth";
import { endpoints } from "@/lib/api";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useChat } from "@/contexts/ChatContext";

interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    senderRole: 'customer' | 'vendor' | 'admin';
    createdAt: string;
    isRead: boolean;
}

interface ChatWidgetProps {
    vendorId: number;
    recipientId?: number; // The counterparty's UserID for presence hooks
    vendorName: string;
    vendorLogo?: string;
    isMinimized?: boolean;
    onClose?: () => void;
    onMinimize?: () => void;
}

export function ChatWidget({ vendorId, recipientId: explicitRecipientId, vendorName, vendorLogo, isMinimized, onClose, onMinimize }: ChatWidgetProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { socket, isUserOnline, checkOnlineStatus } = useChat();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [conversationId, setConversationId] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Refs for socket listeners to avoid closure bugs
    const conversationIdRef = useRef<number | null>(null);

    useEffect(() => {
        conversationIdRef.current = conversationId;
    }, [conversationId]);

    // The ID we use for real-time presence (must be a UserID)
    const presenceUserId = explicitRecipientId || vendorId;
    const isRecipientOnline = isUserOnline(presenceUserId);

    // Helper to mark read
    const markAsRead = () => {
        if (conversationId) {
            // Signal to backend (persistent)
            console.log(`ChatWidget: Marking conversation ${conversationId} as read via API`);
            endpoints.chat.markRead(conversationId).then(() => {
                console.log(`ChatWidget: Marked ${conversationId} as read successfully`);
                queryClient.invalidateQueries({ queryKey: ['chat', 'unread-count'] });
            }).catch(err => {
                console.error(`ChatWidget: Failed to mark ${conversationId} as read`, err);
            });

            // Signal to socket (real-time, requires recipient)
            if (presenceUserId) {
                socket?.emit('markAsRead', {
                    conversationId,
                    recipientId: presenceUserId
                });
            }
        }
    };

    // Socket Listeners
    useEffect(() => {
        if (!socket || !user) return;

        const handleReceiveMessage = (message: Message) => {
            // If message belongs to this conversation
            if (message.conversationId === conversationIdRef.current) {
                setMessages((prev) => [...prev, message]);
                // If window/input is focused, we could mark as read here automatically?
                // For now relying on focus event.
            } else if (conversationIdRef.current === null) {
                // Possible first message of a new conversation
                // Determine if it belongs to this widget context (vendor/recipient match)
                // This is checking if the message sender is the person we are chatting with
                if (message.senderId === presenceUserId) {
                    setMessages((prev) => [...prev, message]);
                    // Optionally set conversationId if we can infer it
                    // message.conversationId would be the new ID
                    if (message.conversationId) {
                        setConversationId(message.conversationId);
                    }
                }
            }
        };

        const handleMessagesRead = ({ conversationId: readConvId }: { conversationId: number }) => {
            if (readConvId === conversationIdRef.current) {
                setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
            }
        };

        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("messagesRead", handleMessagesRead);

        // Initial check is done via global presence state in context
        if (presenceUserId) {
            checkOnlineStatus(presenceUserId);
        }

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("messagesRead", handleMessagesRead);
        };
    }, [socket, user, presenceUserId, checkOnlineStatus]);

    // Fetch conversations and history
    const { data: conversations } = useQuery({
        queryKey: ['chat-conversations'],
        queryFn: () => endpoints.chat.conversations(),
    });

    useEffect(() => {
        if (conversations && (vendorId || explicitRecipientId)) {
            const existing = conversations.find((c: any) => {
                if (vendorId) {
                    return c.recipientId === presenceUserId && (c.vendorId === vendorId || !c.vendorId);
                }
                return c.recipientId === presenceUserId || c.counterpartName === vendorName;
            });

            if (existing) {
                setConversationId(existing.id);
                endpoints.chat.getMessages(existing.id).then(setMessages);
            } else {
                setConversationId(null);
                setMessages([]);
            }
        }
    }, [conversations, vendorId, explicitRecipientId, vendorName, presenceUserId]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        console.log('📤 Debug: handleSend triggered');
        const content = inputValue;
        setInputValue("");

        if (socket && socket.connected) {
            console.log('📤 Debug: Emit sendMessage', {
                conversationId: conversationIdRef.current,
                vendorId,
                recipientId: presenceUserId,
                content,
            });
            socket.emit("sendMessage", {
                conversationId: conversationIdRef.current,
                vendorId,
                recipientId: presenceUserId,
                content,
            }, (response: { message: Message, conversationId: number }) => {
                console.log('✅ Debug: sendMessage Ack/Response:', response);
                if (response && response.message) {
                    setMessages((prev) => {
                        if (prev.some(m => m.id === response.message.id)) return prev;
                        return [...prev, response.message];
                    });
                    if (!conversationIdRef.current && response.conversationId) {
                        setConversationId(response.conversationId);
                    }
                } else {
                    console.error('❌ Debug: sendMessage Ack returned no message!', response);
                }
            });
        } else {
            console.warn('⚠️ Debug: Socket is null or disconnected, using API fallback');
            try {
                const response = await endpoints.chat.sendMessage({
                    conversationId: conversationIdRef.current || undefined,
                    content,
                    vendorId,
                    userId: explicitRecipientId // If vendor is sending to customer
                });

                console.log('✅ Debug: sendMessage API Response:', response);
                if (response && response.message) {
                    setMessages((prev) => {
                        if (prev.some(m => m.id === response.message.id)) return prev;
                        return [...prev, response.message];
                    });
                    if (!conversationIdRef.current && response.conversationId) {
                        setConversationId(response.conversationId);
                    }
                }
            } catch (err) {
                console.error('❌ Debug: API fallback failed', err);
            }
        }
    };

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isMinimized]);

    // Mark as read automatically when window is open and messages exist
    useEffect(() => {
        if (!isMinimized && conversationId && user && messages.some(m => !m.isRead && m.senderId !== user.id)) {
            markAsRead();
        }
    }, [isMinimized, conversationId, messages, user]);

    // Mark as read on focus (additional safety)
    const handleFocus = () => {
        if (!isMinimized) {
            markAsRead();
        }
    };

    if (!user) return null;

    if (isMinimized) {
        return (
            <div className="w-64 bg-white rounded-t-lg shadow-lg border border-gray-200 flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={onMinimize}>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Avatar className="w-8 h-8 border border-gray-100">
                            <AvatarImage src={vendorLogo} />
                            <AvatarFallback>{vendorName[0]}</AvatarFallback>
                        </Avatar>
                        {isRecipientOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                    </div>
                    <span className="font-semibold text-sm truncate max-w-[120px]">{vendorName}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={(e) => { e.stopPropagation(); onClose?.(); }}>
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 h-[500px] bg-white rounded-t-2xl shadow-2xl flex flex-col border border-gray-100 ring-1 ring-black/5 animate-in slide-in-from-bottom-10 duration-200 relative">
            {/* Header */}
            <div className="p-3 border-b flex items-center justify-between bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-t-2xl shadow-sm cursor-pointer"
                onClick={onMinimize}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="w-10 h-10 border-2 border-white/20 shadow-sm">
                            <AvatarImage src={vendorLogo} />
                            <AvatarFallback className="text-rose-600 bg-white font-bold">{vendorName[0]}</AvatarFallback>
                        </Avatar>
                        {isRecipientOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-rose-600 rounded-full shadow-sm animate-pulse"></span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm leading-tight">{vendorName}</h3>
                        <span className="text-[10px] text-white/80 font-medium flex items-center gap-1">
                            {isRecipientOnline ? 'متصل الآن' : 'غير متصل'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20 rounded-full transition-colors" onClick={(e) => { e.stopPropagation(); onMinimize?.(); }}>
                        <Minimize2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20 rounded-full transition-colors" onClick={(e) => { e.stopPropagation(); onClose?.(); }}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4 bg-[#f8f9fa] scrollbar-thin scrollbar-thumb-gray-200" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-60">
                        <MessageSquare className="w-12 h-12 stroke-1" />
                        <p className="text-sm">ابدأ المحادثة الآن</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = Number(msg.senderId) === Number(user?.id);
                        return (
                            <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm relative group ${isMe
                                    ? "bg-rose-600 text-white rounded-br-none"
                                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                                    }`}>
                                    <p className="leading-relaxed">{msg.content}</p>
                                    <div className={`text-[10px] mt-1 flex items-center gap-1 ${isMe ? "text-white/70" : "text-gray-400"}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && (
                                            <span className="font-bold">
                                                {msg.isRead ? "✓✓" : "✓"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/80 backdrop-blur-sm absolute bottom-0 w-full rounded-b-2xl">
                <div className="relative shadow-lg rounded-full bg-white ring-1 ring-gray-100 flex items-center p-1 pl-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSend();
                            markAsRead(); // Mark read when typing
                        }}
                        onFocus={markAsRead} // Mark read when focused
                        placeholder="اكتب..."
                        className="flex-1 h-10 border-none shadow-none focus-visible:ring-0 bg-transparent text-sm px-4"
                    />
                    <Button
                        size="icon"
                        className={`h-9 w-9 rounded-full transition-all duration-300 ${inputValue.trim() ? 'bg-rose-600 hover:bg-rose-700 scale-100' : 'bg-gray-200 text-gray-400 scale-90'}`}
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
