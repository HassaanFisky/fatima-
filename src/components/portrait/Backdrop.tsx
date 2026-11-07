'use client';
import type { Portrait } from '@/lib/portrait/portrait';

export default function Backdrop({ p }: { p: Portrait }) {
  const { backdrop: b, palette: c } = p.visual;
  const common = 'pointer-events-none fixed inset-0 -z-0 w-full h-full';
  return (
    <svg className={common} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 800" style={{ opacity: 0.5 }}>
      {b === 'rings' && [1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} cx="400" cy="300" r={i * 70} fill="none" stroke={i % 2 ? c.accent : c.accent2} strokeWidth="1.5" opacity={0.5 - i * 0.05}>
          <animate attributeName="r" values={`${i * 70};${i * 70 + 14};${i * 70}`} dur={`${6 + i}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {b === 'dots' && Array.from({ length: 144 }, (_, i) => (
        <circle key={i} cx={30 + (i % 12) * 65} cy={30 + Math.floor(i / 12) * 65} r={2 + ((i * 7) % 5)} fill={i % 3 ? c.accent : c.accent2} opacity=".5">
          <animate attributeName="opacity" values=".15;.7;.15" dur={`${3 + (i % 7)}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {b === 'waves' && [0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M-50 ${150 + i * 110} Q 150 ${90 + i * 110} 400 ${150 + i * 110} T 850 ${150 + i * 110}`} fill="none" stroke={i % 2 ? c.accent : c.accent2} strokeWidth="2">
          <animate attributeName="d" dur={`${7 + i}s`} repeatCount="indefinite"
            values={`M-50 ${150 + i * 110} Q 150 ${90 + i * 110} 400 ${150 + i * 110} T 850 ${150 + i * 110};M-50 ${150 + i * 110} Q 150 ${210 + i * 110} 400 ${150 + i * 110} T 850 ${150 + i * 110};M-50 ${150 + i * 110} Q 150 ${90 + i * 110} 400 ${150 + i * 110} T 850 ${150 + i * 110}`} />
        </path>
      ))}
      {b === 'stripes' && Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={i * 60 - 60} y="-100" width="18" height="1000" fill={i % 2 ? c.accent : c.accent2} opacity=".35" transform="rotate(18 400 400)" />
      ))}
      {b === 'blobs' && [[150, 200, 180, c.accent], [620, 420, 220, c.accent2], [300, 650, 160, c.accent]].map(([x, y, r, f], i) => (
        <circle key={i} cx={x as number} cy={y as number} r={r as number} fill={f as string} opacity=".35">
          <animate attributeName="cy" values={`${y};${(y as number) - 40};${y}`} dur={`${8 + i * 2}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}
