'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Languages } from 'lucide-react';

const supportedLanguages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'zh-CN', label: '中文' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'ar', label: 'العربية' },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  disabled?: boolean;
}

export function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Languages className="h-5 w-5 text-amber-400" />
      <Select
        value={selectedLanguage}
        onValueChange={onLanguageChange}
        disabled={disabled}
      >
        <SelectTrigger 
          className="w-[180px] h-10 bg-slate-800/80 border border-blue-700 text-blue-100 
                     hover:bg-slate-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-0"
        >
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border border-blue-800 text-blue-100">
          {supportedLanguages.map((lang) => (
            <SelectItem 
              key={lang.value} 
              value={lang.value}
              className="focus:bg-blue-800 focus:text-amber-300 cursor-pointer"
            >
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
