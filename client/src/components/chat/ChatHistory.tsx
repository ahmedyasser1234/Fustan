
import { MessageSquare, X, User, ArrowLeft, ArrowRight, Plus, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/_core/hooks/useAuth";

interface ChatHistoryProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ChatHistory({ isOpen, onOpenChange }: ChatHistoryProps) {
    const { user } = useAuth();
    const { openChat } = useChat();
    const { data: conversations, isLoading } = useQuery({
        queryKey: ['chat-conversations-customer'],
        queryFn: () => endpoints.chat.conversations(),
        enabled: isOpen
    });

    const [isSelectingVendor, setIsSelectingVendor] = useState(false);
    const [vendorSearch, setVendorSearch] = useState("");
    const [chatSearch, setChatSearch] = useState("");

    const { data: vendors, isLoading: vendorsLoading } = useQuery({
        queryKey: ['vendors-list-chat'],
        queryFn: () => endpoints.vendors.list(),
        enabled: isSelectingVendor
    });

    const filteredVendors = vendors?.filter((v: any) =>
        v.storeNameAr?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        v.storeNameEn?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        v.email?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        v.city?.toLowerCase().includes(vendorSearch.toLowerCase())
    );

    const filteredConversations = conversations?.filter((c: any) =>
        c.counterpartName?.toLowerCase().includes(chatSearch.toLowerCase()) ||
        c.counterpartEmail?.toLowerCase().includes(chatSearch.toLowerCase()) ||
        c.lastMessage?.toLowerCase().includes(chatSearch.toLowerCase())
    );

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 flex flex-col" dir="rtl">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle className="text-xl font-black flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="text-rose-600" />
                            {isSelectingVendor ? 'بدء محادثة جديدة' : 'محادثاتي'}
                        </div>
                        {!isSelectingVendor ? (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100"
                                onClick={() => setIsSelectingVendor(true)}
                            >
                                <Plus size={20} />
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsSelectingVendor(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                إلغاء
                            </Button>
                        )}
                    </SheetTitle>
                </SheetHeader>

                {/* Search Bar for Vendors or Existing Chats */}
                <div className="px-6 py-4 border-b bg-gray-50/50">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder={isSelectingVendor ? "ابحث عن متجر بالاسم أو البريد..." : "ابحث في محادثاتك..."}
                            className="pr-10 border-rose-100 focus-visible:ring-rose-500 rounded-xl bg-white"
                            value={isSelectingVendor ? vendorSearch : chatSearch}
                            onChange={(e) => isSelectingVendor ? setVendorSearch(e.target.value) : setChatSearch(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    {isSelectingVendor ? (
                        <div className="p-2">
                            {vendorsLoading ? (
                                <div className="p-8 text-center text-gray-400">جاري تحميل المتاجر...</div>
                            ) : filteredVendors?.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">لا توجد متاجر تطابق بحثك</div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredVendors?.map((vendor: any) => (
                                        <div
                                            key={vendor.id}
                                            onClick={() => {
                                                openChat({
                                                    vendorId: vendor.id,
                                                    recipientId: vendor.userId,
                                                    vendorName: vendor.storeNameAr || vendor.storeNameEn,
                                                    vendorLogo: vendor.logo,
                                                    sessionId: `vendor-${vendor.id}`
                                                });
                                                setIsSelectingVendor(false);
                                                onOpenChange(false);
                                            }}
                                            className="p-3 hover:bg-rose-50/50 rounded-2xl cursor-pointer transition-all flex items-center gap-3 group border border-transparent hover:border-rose-100"
                                        >
                                            <Avatar className="h-10 w-10 border border-rose-100">
                                                <AvatarImage src={vendor.logo} />
                                                <AvatarFallback>{(vendor.storeNameAr || vendor.storeNameEn || 'S').substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm text-gray-900 group-hover:text-rose-600">{vendor.storeNameAr || vendor.storeNameEn}</h4>
                                                <p className="text-[10px] text-gray-500">{vendor.city || 'متجر معتمد'}</p>
                                            </div>
                                            <ChevronRight size={14} className="text-gray-300 group-hover:text-rose-400" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        isLoading ? (
                            <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
                        ) : filteredConversations?.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                {chatSearch ? "لا توجد نتائج تطابق بحثك" : "لا توجد محادثات سابقة"}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {filteredConversations?.map((conv: any) => (
                                    <div
                                        key={conv.id}
                                        onClick={() => {
                                            const sessionId = user?.role === 'vendor'
                                                ? `customer-${conv.recipientId}`
                                                : `vendor-${conv.vendorId}`;

                                            openChat({
                                                vendorId: conv.vendorId,
                                                recipientId: conv.recipientId,
                                                vendorName: conv.counterpartName,
                                                vendorLogo: conv.counterpartImage,
                                                sessionId
                                            });
                                            onOpenChange(false);
                                        }}
                                        className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group border-b border-slate-50"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="flex -space-x-4 rtl:space-x-reverse">
                                                <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-400 ring-4 ring-slate-50/50 overflow-hidden shadow-sm">
                                                    {conv.counterpartImage ? (
                                                        <img src={conv.counterpartImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} />
                                                    )}
                                                </div>
                                                <div className="w-12 h-12 rounded-full border-2 border-white bg-rose-50 flex items-center justify-center text-rose-600 font-black text-xs ring-4 ring-rose-50/50 overflow-hidden shadow-sm">
                                                    {conv.counterpartName?.substring(0, 1)}
                                                </div>
                                            </div>
                                            <div className="text-right" dir="rtl">
                                                <h4 className="font-black text-slate-900 text-base group-hover:text-rose-600 transition-colors flex items-center gap-2">
                                                    {conv.counterpartName}
                                                    {conv.unread && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs text-slate-400 font-medium truncate max-w-[180px]">
                                                        {conv.lastMessage || 'بدء محادثة جديدة'}
                                                    </p>
                                                    <span className="text-[10px] text-slate-300">•</span>
                                                    <span className="text-[10px] text-slate-300 whitespace-nowrap">
                                                        {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: true, locale: ar })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-xl text-slate-300 group-hover:bg-rose-50 group-hover:text-rose-400 transition-all translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0">
                                            <ArrowLeft size={18} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
