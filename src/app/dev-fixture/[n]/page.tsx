import { notFound } from 'next/navigation';
import PortraitView from '@/components/portrait/PortraitView';
import { sanitizePortrait } from '@/lib/portrait/portrait';

// Layout-only fixtures (NOT AI output). Disabled in production builds.
const L = (en: string) => ({ en: `LAYOUT FIXTURE — ${en}`, ur: `LAYOUT FIXTURE (ur) — ${en}` });
const body = 'Placeholder paragraph used only to inspect typography, spacing and wrapping across devices. It is not a personality reading. '.repeat(4);
const sections = Array.from({ length: 7 }, (_, i) => ({ heading: L(`Section ${i + 1}`), body: { en: body, ur: body } }));
const base = { title: L('Title'), opening: L('Opening line that wraps across two or three lines on small screens.'), sections, mirror: L('A mirror sentence'), closing: L('Closing') };
const mk = (visual: object) => sanitizePortrait({ ...base, visual }, null, 'fixture');
const F = [
  mk({ composition: 'split', backdrop: 'rings', palette: { bg: '#10141c', surface: '#182030', ink: '#eef2f7', accent: '#8fb8ff', accent2: '#c7a6ff' }, fontDisplay: 'Cormorant Garamond', fontBody: 'Manrope', reveal: 'blur', character: { name: 'Orrin', body: 'moon', eyes: 'sleepy', accessory: 'halo', motion: 'float', line: L('hi') } }),
  mk({ composition: 'scatter', backdrop: 'blobs', palette: { bg: '#f4ead8', surface: '#fff7e8', ink: '#2a1a12', accent: '#c4411f', accent2: '#e8a33d' }, fontDisplay: 'Bricolage Grotesque', fontBody: 'Manrope', reveal: 'rise', character: { name: 'Pip', body: 'star', eyes: 'spark', accessory: 'crown', motion: 'bounce', line: L('hi') } }),
  mk({ composition: 'ribbon', backdrop: 'stripes', palette: { bg: '#0f2a22', surface: '#143a2f', ink: '#e9f5ee', accent: '#7fe0a4', accent2: '#f2d479' }, fontDisplay: 'Syne', fontBody: 'Space Grotesk', reveal: 'slide', character: { name: 'Fen', body: 'leaf', eyes: 'wink', accessory: 'sprout', motion: 'sway', line: L('hi') } }),
];

export default async function Page({ params }: { params: Promise<{ n: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { n } = await params;
  const p = F[Number(n)];
  if (!p) notFound();
  return <PortraitView portrait={p} name="Fixture" />;
}
