'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { LangToggle, useLang } from './useLang';

const T = {
  en: {
    h: 'Let’s see who you are.', sub: 'Just your name. We’ll do the rest.', name: 'Your name', age: 'Age (optional)',
    go: 'Generate', err: 'Please enter your name.',
    wait: ['Listening to your name…', 'Noticing the small things…', 'Finding the right words…', 'Giving you a face…', 'Almost there…'],
  },
  ur: {
    h: 'Chaliye, aap ko jaante hain.', sub: 'Bas apna naam likhein. Baqi hum karenge.', name: 'Aap ka naam', age: 'Umar (zaroori nahi)',
    go: 'Banayein', err: 'Pehle apna naam likhein.',
    wait: ['Aap ka naam sun rahe hain…', 'Chhoti baatein dekh rahe hain…', 'Sahi alfaaz dhoond rahe hain…', 'Aap ko ek chehra de rahe hain…', 'Bas ho gaya…'],
  },
};

export default function Home() {
  const [lang, toggle] = useLang();
  const t = T[lang];
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => setStep((s) => Math.min(s + 1, t.wait.length - 1)), 6000);
    return () => clearInterval(id);
  }, [busy, t.wait.length]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError(t.err); return; }
    setError(''); setBusy(true); setStep(0);
    try {
      const r = await fetch('/api/portrait', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, age: age || undefined }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Something went wrong.');
      router.push(`/e/${j.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden" style={{ background: '#0c0c0e', color: '#f5f2ec' }}>
      <LangToggle lang={lang} onToggle={toggle} />
      <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[620px] h-[620px] rounded-full blur-3xl opacity-25" style={{ background: 'radial-gradient(circle,#e9b872,transparent 65%)' }} />
      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
          {busy ? (
            <motion.div key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center" role="status" aria-live="polite">
              <motion.div className="mx-auto mb-8 w-14 h-14 rounded-full border-2 border-[#e9b872]" animate={{ scale: [1, 1.25, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2.4, repeat: Infinity }} />
              <p className="text-xl" style={{ fontFamily: "'Fraunces', serif" }}>{t.wait[step]}</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} noValidate>
              <h1 className="text-4xl sm:text-5xl leading-tight mb-3" style={{ fontFamily: "'Fraunces', serif" }}>{t.h}</h1>
              <p className="opacity-60 mb-10">{t.sub}</p>
              <label htmlFor="n" className="sr-only">{t.name}</label>
              <input id="n" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder={t.name} autoComplete="given-name" autoFocus
                className="w-full bg-transparent border-b border-white/30 focus:border-[#e9b872] outline-none text-2xl py-3 mb-6 placeholder:text-white/30" />
              <label htmlFor="a" className="sr-only">{t.age}</label>
              <input id="a" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 3))} inputMode="numeric" placeholder={t.age}
                className="w-40 bg-transparent border-b border-white/20 focus:border-[#e9b872] outline-none text-base py-2 mb-10 placeholder:text-white/30" />
              {error && <p role="alert" className="text-[#ff9b8a] mb-4">{error}</p>}
              <button type="submit" className="w-full rounded-full py-4 text-lg font-semibold transition-transform active:scale-[.98] hover:-translate-y-0.5" style={{ background: '#e9b872', color: '#0c0c0e' }}>{t.go}</button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
