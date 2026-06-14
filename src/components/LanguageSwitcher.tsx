import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const LANGUAGES = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'fr', label: 'FR', full: 'Français' },
  { code: 'es', label: 'ES', full: 'Español' },
  { code: 'zh', label: '中', full: '中文' },
];

type Props = {
  compact?: boolean;
};

export default function LanguageSwitcher({ compact = false }: Props) {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = async (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('bips-language', code);

    const url = new URL(window.location.href);
    url.searchParams.set('lang', code);
    window.history.replaceState({}, '', url.toString());

    if (user) {
      await supabase.auth.updateUser({ data: { preferred_language: code } });
    }
    setOpen(false);
  };

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  if (compact) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-800/60 border border-gray-700/50 hover:border-gray-600 transition-colors"
        >
          <Globe size={10} className="text-gray-400" />
          <span className="text-[10px] font-medium text-gray-300">{current.label}</span>
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 w-28 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleChange(lang.code)}
                className={`w-full text-left px-3 py-1.5 text-[10px] hover:bg-gray-800 transition-colors ${
                  lang.code === i18n.language ? 'text-cyan-400' : 'text-gray-300'
                }`}
              >
                <span className="font-medium">{lang.label}</span>{' '}
                <span className="text-gray-500">{lang.full}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors"
      >
        <Globe size={12} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-200">{current.full}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 py-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-800 transition-colors ${
                lang.code === i18n.language ? 'text-cyan-400 bg-gray-800/50' : 'text-gray-300'
              }`}
            >
              <span className="font-medium">{lang.label}</span>{' '}
              <span className="text-gray-400">{lang.full}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
