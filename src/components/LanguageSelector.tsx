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

// Expanded list of supported languages
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
  { value: 'ru', label: 'Русский (Russian)' },
  { value: 'bn', label: 'বাংলা (Bengali)' },
  { value: 'ur', label: 'اردو (Urdu)' },
  { value: 'sw', label: 'Kiswahili (Swahili)' },
  { value: 'tr', label: 'Türkçe (Turkish)' },
  { value: 'id', label: 'Bahasa Indonesia (Indonesian)'},
  { value: 'nl', label: 'Nederlands (Dutch)'},
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
      <Languages className="h-5 w-5 text-muted-foreground" />
      <Select
        value={selectedLanguage}
        onValueChange={onLanguageChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[220px] sm:w-[200px] bg-card"> {/* Adjusted width slightly for longer language names */}
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {supportedLanguages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
