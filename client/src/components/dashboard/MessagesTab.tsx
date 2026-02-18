import { useState, useEffect, useRef, useMemo } from "react";
import { MessageSquare, Send, Search, User, AlertCircle, Check, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import api, { endpoints } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";


interface Conversation {
    id: number;
    counterpartName: string;
    counterpartImage?: string;
    lastMessage?: string;
    lastMessageTime: string;
    unread: boolean;
    recipientId?: number; // Added
}

interface Message {
    id: number;
    conversationId: number; // Added
    content: string;
    senderRole: 'customer' | 'vendor';
    createdAt: string;
    isRead: boolean;
}

export default function MessagesTab() {
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const queryClient = useQueryClient();
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch Conversations
    const { data: conversations, refetch: refetchConversations } = useQuery({
        queryKey: ['vendor-conversations'],
        queryFn: () => endpoints.chat.conversations(),
    });

    const filteredConversations = useMemo(() => {
        return conversations?.filter((conv: any) =>
            conv.counterpartName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [conversations, searchTerm]);

    // Socket Connection
    useEffect(() => {
        if (!user) return;
        const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
        const newSocket = io(`${socketUrl}/chat`, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        newSocket.on("connect", () => {
            // console.log("Vendor Chat Connected");
        });

        newSocket.on("receiveMessage", (message: Message) => {
            setMessages((prev) => {
                if (selectedConversation && message.conversationId === selectedConversation.id) {
                    // Mark as read immediately if chat is open
                    newSocket.emit('markAsRead', {
                        conversationId: selectedConversation.id,
                        recipientId: selectedConversation.recipientId
                    });
                    return [...prev, message];
                }
                return prev;
            });
            refetchConversations();
        });

        newSocket.on("userStatus", ({ userId, status }: { userId: number, status: 'online' | 'offline' }) => {
            setOnlineUsers(prev => {
                const next = new Set(prev);
                if (status === 'online') next.add(userId);
                else next.delete(userId);
                return next;
            });
        });

        newSocket.on("messagesRead", ({ conversationId }: { conversationId: number }) => {
            if (selectedConversation && conversationId === selectedConversation.id) {
                setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user, selectedConversation, refetchConversations]);

    // Fetch Messages when conversation selected
    useEffect(() => {
        if (selectedConversation) {
            endpoints.chat.getMessages(selectedConversation.id).then(setMessages);

            // Mark as read via HTTP
            endpoints.chat.markRead(selectedConversation.id).then(() => {
                queryClient.invalidateQueries({ queryKey: ['chat', 'unread'] });
                queryClient.invalidateQueries({ queryKey: ['vendor-conversations'] });
            });

            // Mark as read via Socket (to notify counterparty)
            if (socket && selectedConversation.recipientId) {
                socket.emit('markAsRead', {
                    conversationId: selectedConversation.id,
                    recipientId: selectedConversation.recipientId
                });

                // Initial status check
                if (selectedConversation.recipientId) {
                    socket.emit('checkUserStatus', selectedConversation.recipientId, (res: any) => {
                        const recId = selectedConversation.recipientId;
                        if (res?.status === 'online' && recId) {
                            setOnlineUsers(prev => new Set(prev).add(recId));
                        }
                    });
                }
            }
        }
    }, [selectedConversation, queryClient, socket]);

    // Auto scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, selectedConversation]);

    const handleSend = () => {
        if (!inputValue.trim() || !selectedConversation || !socket) {
            console.error('❌ Debug: cannot send. Missing info.', {
                input: !!inputValue.trim(),
                conv: !!selectedConversation,
                socket: !!socket
            });
            return;
        }

        console.log("📤 Debug: Sending message to:", selectedConversation.recipientId);
        const payload = {
            conversationId: selectedConversation.id,
            content: inputValue,
            recipientId: selectedConversation.recipientId
        };
        console.log("📤 Debug: Payload:", payload);

        socket.emit("sendMessage", payload, (response: any) => {
            console.log('✅ Debug: sendMessage Ack/Response:', response);
            if (response && response.id) {
                setMessages(prev => [...prev, response]);
            } else {
                console.error("❌ Debug: Message send failed/No ACK:", response);
                toast.error(t('messageFailed'));
            }
        });

        setInputValue("");
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-200px)] border-0 md:rounded-2xl overflow-hidden bg-white shadow-none md:shadow-xl shadow-slate-100" dir={language === 'ar' ? "rtl" : "ltr"}>
            {/* Sidebar List */}
            <div className={cn(
                "w-full md:w-1/3 border-b md:border-b-0 md:border-l md:rtl:border-l-0 md:rtl:border-r border-gray-100 bg-gray-50/50 flex flex-col transition-all duration-300 absolute inset-0 md:relative z-10",
                selectedConversation ? '-translate-x-full md:translate-x-0 rtl:translate-x-full rtl:md:translate-x-0 opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto' : 'translate-x-0 opacity-100'
            )}>
                <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-20">
                    <h3 className={`font-black text-gray-900 mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('conversations')}</h3>
                    <div className="relative">
                        <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400`} />
                        <Input
                            placeholder={t('searchPlaceholder')}
                            className={`bg-gray-50 border-0 h-10 ${language === 'ar' ? 'pr-9' : 'pl-9'} rounded-xl focus-visible:ring-1 focus-visible:ring-gray-200`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 px-2">
                    <div className="py-2 space-y-1">
                        {filteredConversations?.map((conv: any) => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv)}
                                className={cn(
                                    "p-4 rounded-[20px] cursor-pointer flex items-center gap-4 transition-all duration-200 group relative",
                                    selectedConversation?.id === conv.id
                                        ? 'bg-white shadow-md border border-gray-100 ring-1 ring-[#e91e63]/10'
                                        : 'hover:bg-white/60 border border-transparent hover:shadow-sm'
                                )}
                            >
                                <div className="relative shrink-0">
                                    <Avatar className="h-12 w-12 md:h-14 md:w-14 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                                        <AvatarImage src={conv.counterpartImage} />
                                        <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                                            <User className="h-6 w-6" />
                                        </AvatarFallback>
                                    </Avatar>
                                    {onlineUsers.has(conv.recipientId) && (
                                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm ring-2 ring-white"></span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <h4 className={cn("text-sm md:text-base truncate transition-colors", selectedConversation?.id === conv.id ? "font-black text-slate-900" : "font-bold text-slate-700")}>
                                            {conv.counterpartName}
                                        </h4>
                                        <span className="text-[10px] md:text-xs text-slate-400 font-medium whitespace-nowrap">
                                            {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: true, locale: language === 'ar' ? ar : undefined })}
                                        </span>
                                    </div>
                                    <p className={cn("text-xs md:text-sm truncate leading-relaxed", conv.unread ? "text-[#e91e63] font-bold" : "text-slate-400 font-medium")}>
                                        {conv.lastMessage || t('startNewChat')}
                                    </p>
                                </div>
                                {conv.unread && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-[#e91e63] rounded-full shadow-lg shadow-[#e91e63]/30 animate-pulse" />
                                )}
                            </div>
                        ))}
                        {filteredConversations?.length === 0 && searchTerm && (
                            <div className="p-8 text-center text-gray-400 text-xs">
                                {t('noConversations')}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-white absolute inset-0 md:relative z-20 transition-all duration-300",
                selectedConversation ? 'translate-x-0 opacity-100' : 'translate-x-full md:translate-x-0 rtl:-translate-x-full rtl:md:translate-x-0 opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto'
            )}>
                {selectedConversation ? (
                    <>
                        <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-20 sticky top-0 shadow-sm">
                            <div className="flex items-center gap-4">
                                {/* Mobile Back Button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden -ml-2 rtl:-mr-2 text-gray-400 hover:text-gray-900"
                                    onClick={() => setSelectedConversation(null)}
                                >
                                    {language === 'ar' ? <ArrowRight className="h-6 w-6" /> : <ArrowLeft className="h-6 w-6" />}
                                </Button>

                                <Avatar className="h-10 w-10 md:h-12 md:w-12 border border-gray-100">
                                    <AvatarImage src={selectedConversation.counterpartImage} />
                                    <AvatarFallback><User className="h-5 w-5 md:h-6 md:w-6" /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-black text-base md:text-lg text-gray-900">{selectedConversation.counterpartName}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className={cn(
                                            "h-2 w-2 rounded-full",
                                            selectedConversation.recipientId && onlineUsers.has(selectedConversation.recipientId) ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'
                                        )} />
                                        <span className={cn(
                                            "text-xs font-bold",
                                            selectedConversation.recipientId && onlineUsers.has(selectedConversation.recipientId) ? 'text-emerald-500' : 'text-gray-400'
                                        )}>
                                            {selectedConversation.recipientId && onlineUsers.has(selectedConversation.recipientId) ? t('online') : t('offline')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-[#fcfcfd]" ref={scrollRef}>
                            {messages
                                .filter(m => m.conversationId === selectedConversation.id)
                                .map((msg, index, arr) => {
                                    const isMe = msg.senderRole === 'vendor';
                                    const nextMsg = arr[index + 1];
                                    const isLastInGroup = !nextMsg || nextMsg.senderRole !== msg.senderRole;

                                    return (
                                        <div key={msg.id} className={cn("flex flex-col mb-1", isMe ? 'items-end' : 'items-start')}>
                                            <div className={cn(
                                                "max-w-[85%] md:max-w-[75%] px-5 py-3 text-[15px] md:text-base shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 break-words leading-relaxed",
                                                isMe
                                                    ? 'bg-[#e91e63] text-white rounded-[20px] rounded-tr-[4px]'
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-[20px] rounded-tl-[4px]'
                                            )}>
                                                {msg.content}
                                            </div>
                                            {isLastInGroup && (
                                                <div className={cn("flex items-center gap-1.5 mt-2 px-1", isMe ? 'flex-row-reverse' : 'flex-row')}>
                                                    <span className="text-[10px] md:text-xs font-bold text-gray-300">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMe && (
                                                        <span className={msg.isRead ? 'text-emerald-500' : 'text-gray-300'}>
                                                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>

                        <div className="p-4 md:p-5 bg-white border-t border-gray-100 sticky bottom-0 z-20">
                            <div className="flex gap-3 items-center bg-gray-50 p-2 rounded-[20px] border border-gray-100 focus-within:ring-2 focus-within:ring-[#e91e63]/10 transition-all shadow-sm">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={t('writeReply')}
                                    className="border-0 bg-transparent h-14 text-base focus-visible:ring-0 placeholder:text-gray-400 font-medium px-4"
                                />
                                <Button
                                    onClick={handleSend}
                                    size="icon"
                                    className="bg-[#e91e63] hover:bg-[#c2185b] h-12 w-12 rounded-2xl shadow-lg shadow-[#e91e63]/20 shrink-0 transition-transform active:scale-95"
                                >
                                    <Send className={`h-5 w-5 ${language === 'ar' ? 'rtl:rotate-180' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50/50 p-12 text-center">
                        <div className="relative mb-6">
                            <div className="h-24 w-24 bg-white rounded-3xl shadow-xl flex items-center justify-center rotate-3 scale-110">
                                <MessageSquare className="h-10 w-10 text-[#e91e63]" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#e91e63] rounded-2xl shadow-lg flex items-center justify-center -rotate-6">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">{t('startChat')}</h3>
                        <p className="text-slate-400 text-sm max-w-[280px]">{t('selectChat')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
