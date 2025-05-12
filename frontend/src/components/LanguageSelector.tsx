'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export type Language = 'Korean' | 'English' | 'Japanese' | 'Chinese' | 'Vietnamese' | 'Thai' | 'Indonesian' | 'French' | 'German' | 'Spanish' | 'Italian' | 'Portuguese' | 'Russian';

const languageOptions: { value: Language; label: string }[] = [
  { value: 'Korean', label: '한국어' },
  { value: 'English', label: 'English' },
  { value: 'Japanese', label: '日本語' },
  { value: 'Chinese', label: '中文' },
  { value: 'Vietnamese', label: 'Tiếng Việt' },
  { value: 'Thai', label: 'ไทย' },
  { value: 'Indonesian', label: 'Bahasa Indonesia' },
  { value: 'French', label: 'Français' },
  { value: 'German', label: 'Deutsch' },
  { value: 'Spanish', label: 'Español' },
  { value: 'Italian', label: 'Italiano' },
  { value: 'Portuguese', label: 'Português' },
  { value: 'Russian', label: 'Русский' },
];

export function LanguageSelector() {
  const { language, setLanguage, isFirstVisit } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isFirstVisit) {
      const browserLang = navigator.language.toLowerCase();
      const languageMap: Record<string, Language> = {
        'ko': 'Korean',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'vi': 'Vietnamese',
        'th': 'Thai',
        'id': 'Indonesian',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian'
      };
      const langCode = browserLang.split('-')[0];
      const detectedLanguage = languageMap[langCode] || 'English';
      setLanguage(detectedLanguage);
    }
  }, [isFirstVisit, setLanguage]);

  const currentLanguage = languageOptions.find(option => option.value === language);

  if (!mounted) {
    return null;
  }

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
                onClick={() => setLanguage(option.value)}
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