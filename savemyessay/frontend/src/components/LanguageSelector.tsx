'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';

const languageOptions = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
];

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLocale = pathname.split('/')[1];
  const currentLanguage = languageOptions.find(option => option.value === currentLocale);

  if (!mounted) {
    return null;
  }

  const handleLanguageChange = (locale: string) => {
    const currentSearchParams = searchParams.toString();
    // to keep the search params
    const newPath = currentSearchParams ? `${pathname}?${currentSearchParams}` : pathname;
    router.replace(newPath, { locale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2 text-sm">
          <Globe className="h-4 w-4" />
          <span className="truncate max-w-[40px]">{currentLanguage?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[120px] bg-white border shadow-lg">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleLanguageChange(option.value)}
            className="cursor-pointer hover:bg-gray-100 text-sm py-1.5"
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 