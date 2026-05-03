import React from 'react';
import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface BreadcrumbsProps {
  items: {
    name: string;
    href: string;
  }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { language, dir } = useLanguage();
  
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb" dir={dir}>
      <ol className="flex items-center space-x-1 md:space-x-3 flex-wrap">
        <li className="inline-flex items-center">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-rose-600">
            <Home className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
            {language === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className={`w-4 h-4 text-gray-400 ${language === 'ar' ? 'rotate-180 ml-1' : 'mr-1'}`} />
              <Link
                href={item.href}
                className={`ml-1 text-sm font-medium text-gray-700 hover:text-rose-600 md:ml-2 ${
                  index === items.length - 1 ? 'text-rose-600' : ''
                }`}
              >
                {item.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
