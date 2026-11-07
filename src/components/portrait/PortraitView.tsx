'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { Portrait } from '@/lib/portrait/portrait';
import Character from './Character';
import Backdrop from './Backdrop';
import { LangToggle, useLang } from './useLang';

const UI = {
  en: { say: 'Tap me', share: 'Share this portrait', copied: 'Link copied', another: 'Make another' },
  ur: { say: 'Mujhe dabayein', share: 'Is portrait ko share karein', copied: 'Link copy ho gaya', another: 'Aur banayein' },
};

export default function PortraitView({ portrait: p, name }: { portrait: Portrait; name: string }) {
  const [lang, toggle] = useLang();
  const [said, setSaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();
  const v = p.visual;
  const c = v.palette;
  const t = UI[lang];
  const rev = reduce ? {} : {
    rise: { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 } },
    fade: { initial: { opacity: 0 }, whileInView: { opacity: 1 } },
    blur: { initial: { opacity: 0, filter: 'blur(14px)' }, whileInView: { opacity: 1, filter: 'blur(0px)' } },
    slide: { initial: { opacity: 0, x: -50 }, whileInView: { opacity: 1, x: 0 } },
  }[v.reveal];
  const mv = (d = 0) => ({ ...rev, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.9, delay: d, ease: [0.22, 1, 0.36, 1] as const } });
  const display = { fontFamily: `'${v.fontDisplay}', serif` };
  const bodyFont = { fontFamily: `'${v.fontBody}', sans-serif` };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: p.title[lang], url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* user cancelled */ }
  };

  const comp = v.composition;
  const wrap = comp === 'split' ? 'lg:grid lg:grid-cols-[minmax(280px,38%)_1fr] lg:gap-16 max-w-6xl' : comp === 'scatter' ? 'max-w-5xl' : 'max-w-2xl';
  const list = comp === 'scatter' ? 'grid sm:grid-cols-2 gap-6' : comp === 'orbit' ? 'space-y-16' : 'space-y-14';

  const characterBlock = (
    <div className={comp === 'split' ? 'lg:sticky lg:top-24 self-start py-10' : 'py-10'}>
      <Character p={p} onTap={() => setSaid((s) => !s)} />
      <p className="text-center mt-4 text-sm opacity-70" style={bodyFont}>{v.character.name}</p>
      <div aria-live="polite" className="text-center mt-3 min-h-[3.5rem] px-6 text-lg italic" style={{ ...display, color: c.accent }}>
        {said ? `“${v.character.line[lang]}”` : <span className="text-sm not-italic opacity-60" style={bodyFont}>{t.say}</span>}
      </div>
    </div>
  );

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: c.bg, color: c.ink, ...bodyFont }} lang={lang === 'ur' ? 'ur-Latn' : 'en'}>
      <Backdrop p={p} />
      <LangToggle lang={lang} onToggle={toggle} color={c.ink} />
      <div className={`relative z-10 mx-auto px-6 pt-24 pb-24 ${wrap}`}>
        {comp === 'split' && characterBlock}
        <div>
          <motion.header {...mv()} className="mb-14">
            <p className="text-sm tracking-widest uppercase opacity-60 mb-4">{name}</p>
            <h1 className="text-[2.6rem] sm:text-6xl leading-[1.05] mb-8" style={display}>{p.title[lang]}</h1>
            <p className="text-xl sm:text-2xl leading-relaxed" style={{ ...display, color: c.accent }}>{p.opening[lang]}</p>
          </motion.header>
          {comp !== 'split' && characterBlock}
          <div className={list}>
            {p.sections.map((s, i) => (
              <motion.section
                key={i}
                {...mv(0.05)}
                className={comp === 'scatter' ? 'rounded-3xl p-6' : comp === 'ribbon' ? 'pl-6 border-l-2' : comp === 'orbit' ? (i % 2 ? 'sm:ml-14' : 'sm:mr-14') : ''}
                style={{
                  ...(comp === 'scatter' ? { background: c.surface, border: `1px solid ${c.accent}33`, transform: reduce ? undefined : `rotate(${(i % 3 - 1) * 0.8}deg)` } : {}),
                  ...(comp === 'ribbon' ? { borderColor: c.accent } : {}),
                }}
              >
                <h2 className="text-2xl sm:text-3xl mb-3" style={{ ...display, color: c.accent }}>
                  {comp === 'ribbon' && <span className="opacity-40 mr-3 text-base">{String(i + 1).padStart(2, '0')}</span>}
                  {s.heading[lang]}
                </h2>
                <p className="text-[1.05rem] leading-[1.8]">{s.body[lang]}</p>
              </motion.section>
            ))}
          </div>
          <motion.blockquote {...mv()} className="my-20 text-3xl sm:text-4xl leading-tight" style={display}>
            <span style={{ color: c.accent }}>“</span>{p.mirror[lang]}<span style={{ color: c.accent }}>”</span>
          </motion.blockquote>
          <motion.p {...mv()} className="text-lg leading-relaxed opacity-90 mb-12">{p.closing[lang]}</motion.p>
          <div className="flex flex-wrap gap-3">
            <button onClick={share} className="rounded-full px-6 py-3 font-semibold min-h-12" style={{ background: c.accent, color: c.bg }}>
              {copied ? t.copied : t.share}
            </button>
            <Link href="/" className="rounded-full px-6 py-3 font-semibold border min-h-12" style={{ borderColor: c.ink + '55' }}>{t.another}</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
