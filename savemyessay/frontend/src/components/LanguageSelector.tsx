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

const languageOptions = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
];

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
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
    router.replace(pathname, { locale });
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t py-1">
      <div className="container mx-auto flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 h-7 px-2 text-xs min-w-0 w-auto">
              <Globe className="h-3 w-3" />
              <span className="truncate max-w-[40px]">{currentLanguage?.label}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-[120px] bg-white border shadow-lg">
            {languageOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleLanguageChange(option.value)}
                className="cursor-pointer hover:bg-gray-100 text-xs py-1"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 