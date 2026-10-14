'use client';

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
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        disabled={disabled}
        className="h-10 px-3 rounded-md bg-slate-800 border border-blue-700 text-blue-100 
                   hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500
                   disabled:opacity-50"
      >
        {supportedLanguages.map((lang) => (
          <option key={lang.value} value={lang.value} className="bg-slate-900 text-blue-100">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
