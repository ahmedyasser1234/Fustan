import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface CategoryNavItem {
    id: number;
    name: string;
    isActive: boolean;
    onClick: () => void;
}

interface CategoryNavProps {
    items: CategoryNavItem[];
}

export function CategoryNav({ items }: CategoryNavProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 300;
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group w-full bg-white border-b border-gray-100 shadow-sm z-20">
            <div className="container mx-auto relative px-4">
                {/* Left Arrow */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-opacity opacity-0 group-hover:opacity-100 disabled:opacity-0"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                {/* Scroll Container */}
                <div
                    ref={scrollRef}
                    className="flex items-center gap-4 overflow-x-auto py-6 px-8 scrollbar-hide no-scrollbar scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={item.onClick}
                            className={`flex-shrink-0 px-6 py-2.5 rounded-full text-base font-bold transition-all duration-300 border ${item.isActive
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-opacity opacity-0 group-hover:opacity-100"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </div>
    );
}
