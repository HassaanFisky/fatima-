'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { Portrait } from '@/lib/portrait/portrait';

const BODY: Record<string, string> = {
  blob: 'M100 22c44 0 78 30 78 76s-30 80-78 80S22 150 22 100 56 22 100 22z',
  drop: 'M100 16c30 40 70 70 70 112a70 70 0 0 1-140 0c0-42 40-72 70-112z',
  star: 'M100 14l24 52 56 6-42 38 12 56-50-28-50 28 12-56-42-38 56-6z',
  arch: 'M34 180V96a66 66 0 0 1 132 0v84z',
  moon: 'M140 22a82 82 0 1 0 38 120A70 70 0 0 1 140 22z',
  leaf: 'M30 170C30 80 90 24 176 24c0 90-56 146-146 146z',
};
const EYES: Record<string, (c: string) => React.ReactNode> = {
  dots: (c) => (<><circle cx="80" cy="100" r="6" fill={c} /><circle cx="120" cy="100" r="6" fill={c} /></>),
  sleepy: (c) => (<><path d="M70 102q10 8 20 0M110 102q10 8 20 0" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" /></>),
  wide: (c) => (<><circle cx="78" cy="98" r="11" fill="#fff" /><circle cx="122" cy="98" r="11" fill="#fff" /><circle cx="80" cy="100" r="5" fill={c} /><circle cx="124" cy="100" r="5" fill={c} /></>),
  spark: (c) => (<><path d="M78 88l4 10 10 4-10 4-4 10-4-10-10-4 10-4zM122 88l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill={c} /></>),
  wink: (c) => (<><circle cx="80" cy="100" r="6" fill={c} /><path d="M110 102q10-8 20 0" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" /></>),
};
const ACC: Record<string, (a: string) => React.ReactNode> = {
  none: () => null,
  crown: (a) => <path d="M64 34l12-18 14 14 10-20 10 20 14-14 12 18z" fill={a} />,
  halo: (a) => <ellipse cx="100" cy="16" rx="34" ry="8" fill="none" stroke={a} strokeWidth="5" />,
  antenna: (a) => (<><path d="M100 30V4" stroke={a} strokeWidth="4" /><circle cx="100" cy="4" r="7" fill={a} /></>),
  scarf: (a) => (<><path d="M52 138q48 22 96 0l4 16q-52 24-104 0z" fill={a} /><path d="M128 148l12 38 14-6-8-34z" fill={a} /></>),
  sprout: (a) => (<><path d="M100 30c0-14 4-20 4-20" stroke={a} strokeWidth="4" fill="none" /><path d="M104 12c14-10 26-2 26-2s-6 16-24 14zM102 18C90 8 80 14 80 14s6 12 20 10z" fill={a} /></>),
};

export default function Character({ p, onTap }: { p: Portrait; onTap?: () => void }) {
  const reduce = useReducedMotion();
  const { character: c, palette: pal } = p.visual;
  const anim = reduce
    ? {}
    : c.motion === 'bounce' ? { y: [0, -18, 0] }
    : c.motion === 'sway' ? { rotate: [-5, 5, -5] }
    : c.motion === 'spin' ? { rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }
    : { y: [0, -10, 0] };
  const dur = c.motion === 'bounce' ? 1.4 : c.motion === 'spin' ? 5 : 4;
  return (
    <motion.button
      type="button"
      onClick={onTap}
      aria-label={`${c.name}, tap to hear what they say`}
      className="block mx-auto"
      animate={anim}
      transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
      whileTap={{ scale: 0.92 }}
      style={{ width: 'min(60vw, 240px)' }}
    >
      <svg viewBox="0 0 200 200" role="img" aria-hidden="true" className="w-full h-auto overflow-visible">
        <ellipse cx="100" cy="194" rx="50" ry="6" fill={pal.ink} opacity=".12" />
        <path d={BODY[c.body]} fill={pal.accent} />
        <path d={BODY[c.body]} fill={pal.accent2} opacity=".28" transform="translate(6 8) scale(.94)" />
        {EYES[c.eyes](pal.bg)}
        <path d="M88 130q12 9 24 0" stroke={pal.bg} strokeWidth="4" fill="none" strokeLinecap="round" />
        {ACC[c.accessory](pal.accent2)}
      </svg>
    </motion.button>
  );
}
