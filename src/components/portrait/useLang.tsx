'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Lang } from '@/lib/portrait/portrait';

export function useLang(): [Lang, () => void] {
  const [lang, setLang] = useState<Lang>('en');
  useEffect(() => {
    const v = localStorage.getItem('atelier_lang');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (v === 'ur') setLang('ur');
  }, []);
  const toggle = useCallback(() => {
    setLang((l) => {
      const n = l === 'en' ? 'ur' : 'en';
      localStorage.setItem('atelier_lang', n);
      document.documentElement.lang = n === 'ur' ? 'ur-Latn' : 'en';
      return n;
    });
  }, []);
  return [lang, toggle];
}

export function LangToggle({ lang, onToggle, color }: { lang: Lang; onToggle: () => void; color?: string }) {
  return (
    <button
      onClick={onToggle}
      aria-label={lang === 'en' ? 'Switch to Roman Urdu' : 'Switch to English'}
      className="fixed top-4 right-4 z-50 rounded-full px-4 py-2 text-sm font-medium backdrop-blur border"
      style={{ color: color ?? '#fff', borderColor: 'currentColor', background: 'rgba(127,127,127,.12)' }}
    >
      {lang === 'en' ? 'Roman Urdu' : 'English'}
    </button>
  );
}
