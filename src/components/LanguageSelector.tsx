'use client';

import type * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Languages } from 'lucide-react';

interface Language {
  value: string;
  label: string;
}

const supportedLanguages: Language[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'de', label: 'Deutsch (German)' },
  { value: 'it', label: 'Italiano (Italian)' },
  { value: 'pt', label: 'Português (Portuguese)' },
  { value: 'ja', label: '日本語 (Japanese)' },
  { value: 'ko', label: '한국어 (Korean)' },
  { value: 'zh-CN', label: '简体中文 (Simplified Chinese)' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'ar', label: 'العربية (Arabic)' },
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
    <div className="flex items-center space-x-2">
      <Languages className="h-5 w-5 text-amber-400" />
      <Select
        value={selectedLanguage}
        onValueChange={onLanguageChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[220px] bg-slate-800 border-blue-700 text-blue-100 hover:bg-slate-700 focus:ring-amber-500">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-blue-800 text-blue-100">
          {supportedLanguages.map((lang) => (
            <SelectItem 
              key={lang.value} 
              value={lang.value}
              className="focus:bg-blue-900 focus:text-amber-300"
            >
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
