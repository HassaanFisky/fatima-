/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenAI } from '@google/genai';

export type Lang = 'en' | 'ur';
export interface Bi { en: string; ur: string }

export const FONTS = [
  'Cormorant Garamond', 'Instrument Serif', 'Playfair Display', 'Space Grotesk', 'Newsreader',
  'Fraunces', 'Syne', 'Bricolage Grotesque', 'DM Serif Display', 'Unbounded', 'Manrope',
] as const;
export const COMPOSITIONS = ['orbit', 'stack', 'split', 'ribbon', 'scatter'] as const;
export const BACKDROPS = ['rings', 'dots', 'waves', 'stripes', 'blobs'] as const;
export const BODIES = ['blob', 'drop', 'star', 'arch', 'moon', 'leaf'] as const;
export const EYES = ['dots', 'sleepy', 'wide', 'spark', 'wink'] as const;
export const ACCESSORIES = ['none', 'crown', 'halo', 'antenna', 'scarf', 'sprout'] as const;
export const MOTIONS = ['float', 'bounce', 'sway', 'spin'] as const;
export const REVEALS = ['rise', 'fade', 'blur', 'slide'] as const;

export interface Portrait {
  language: 'en+ur';
  ageGiven: number | null;
  title: Bi;
  opening: Bi;
  sections: { heading: Bi; body: Bi }[];
  mirror: Bi;
  closing: Bi;
  visual: {
    concept: string;
    composition: (typeof COMPOSITIONS)[number];
    backdrop: (typeof BACKDROPS)[number];
    palette: { bg: string; surface: string; ink: string; accent: string; accent2: string };
    fontDisplay: (typeof FONTS)[number];
    fontBody: (typeof FONTS)[number];
    reveal: (typeof REVEALS)[number];
    character: {
      name: string;
      body: (typeof BODIES)[number];
      eyes: (typeof EYES)[number];
      accessory: (typeof ACCESSORIES)[number];
      motion: (typeof MOTIONS)[number];
      line: Bi;
    };
  };
  model: string;
  generatedAt: string;
}

export class PortraitUnavailableError extends Error {}

const LENSES = [
  'the quiet architecture of how they decide things',
  'the gap between how they appear and how they feel',
  'how they love, argue and forgive',
  'the private ambitions they rarely say aloud',
  'how they treat silence, time and rest',
  'the way they carry responsibility',
  'how curiosity shows up in small daily habits',
  'what they protect most fiercely',
];

const pick = <T,>(arr: readonly T[], v: unknown, d: T): T => (arr.includes(v as T) ? (v as T) : d);
const hex = (v: unknown, d: string) => (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : d);
const str = (v: unknown, max = 1600) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const bi = (v: unknown, max?: number): Bi => {
  const o = (v ?? {}) as Record<string, unknown>;
  return { en: str(o.en, max), ur: str(o.ur, max) };
};

function luminance(h: string) {
  const n = parseInt(h.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((x) => {
    const s = x / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** Validates raw model JSON into a Portrait. Throws if text content is missing. Guarantees readable contrast. */
export function sanitizePortrait(raw: unknown, age: number | null, model: string): Portrait {
  const r = (raw ?? {}) as Record<string, any>;
  const sections = (Array.isArray(r.sections) ? r.sections : [])
    .map((s: any) => ({ heading: bi(s?.heading, 80), body: bi(s?.body, 1800) }))
    .filter((s: any) => s.heading.en && s.body.en && s.body.ur)
    .slice(0, 9);
  const opening = bi(r.opening, 600);
  if (sections.length < 5 || !opening.en || !opening.ur) throw new Error('Model returned an incomplete portrait');
  const v = r.visual ?? {};
  const p = v.palette ?? {};
  const bg = hex(p.bg, '#14110f');
  let ink = hex(p.ink, '#f4efe6');
  if (contrast(bg, ink) < 7) ink = luminance(bg) < 0.4 ? '#f6f2ea' : '#17140f';
  let accent = hex(p.accent, '#e0a458');
  if (contrast(bg, accent) < 3) accent = luminance(bg) < 0.4 ? '#f0c987' : '#7a3b12';
  const c = v.character ?? {};
  return {
    language: 'en+ur',
    ageGiven: age,
    title: bi(r.title, 120),
    opening,
    sections,
    mirror: bi(r.mirror, 400),
    closing: bi(r.closing, 700),
    visual: {
      concept: str(v.concept, 300),
      composition: pick(COMPOSITIONS, v.composition, 'stack'),
      backdrop: pick(BACKDROPS, v.backdrop, 'rings'),
      palette: { bg, surface: hex(p.surface, bg), ink, accent, accent2: hex(p.accent2, accent) },
      fontDisplay: pick(FONTS, v.fontDisplay, 'Fraunces'),
      fontBody: pick(FONTS, v.fontBody, 'Manrope'),
      reveal: pick(REVEALS, v.reveal, 'rise'),
      character: {
        name: str(c.name, 40) || 'Companion',
        body: pick(BODIES, c.body, 'blob'),
        eyes: pick(EYES, c.eyes, 'dots'),
        accessory: pick(ACCESSORIES, c.accessory, 'none'),
        motion: pick(MOTIONS, c.motion, 'float'),
        line: bi(c.line, 200),
      },
    },
    model,
    generatedAt: new Date().toISOString(),
  };
}

export const PORTRAIT_MODEL = process.env.PORTRAIT_MODEL || 'gemini-2.5-pro';

export function buildPrompt(name: string, age: number | null) {
  const lens = [...LENSES].sort(() => Math.random() - 0.5).slice(0, 3).join('; ');
  const nonce = Math.random().toString(36).slice(2, 8);
  return `You are a rare writer: part psychologist, part novelist, part linguist, part art director.
Write a personality portrait of a person known only by their name${age ? ` and age (${age})` : ''}.
NAME: ${name}
${age ? `AGE: ${age} (use only as life-stage context, never invent events)` : 'AGE: not given'}
Quietly draw on: the name's sound, origins and cultural associations (only what you genuinely know; if unsure, stay soft and never claim facts), life-stage psychology, personality science and behavioural patterns.

VOICE: second person ("you"). Warm, precise, literary, surprising. Each section must contain concrete, relatable behaviours and inner contradictions ("You say you don't mind, and then remember for three years"). Short and long sentences mixed.
DEPTH: cover nature, emotional patterns, thinking style, strengths, contradictions, relationships, communication, ambitions, and one lesser-obvious trait. 6 sections, 55-80 words each.
FORBIDDEN: invented memories, events, jobs, family, places, biography; horoscope clichés ("you are a natural leader", "deep down", "sometimes you"); mentioning AI, analysis, methodology, name meaning lookups, psychology jargon, frameworks, or that you only know a name. Do not open sections with the same word. Phrase insights as recognisable tendencies, not facts.
VARIATION: this is run ${nonce}; take a fresh angle each time. Emphasize: ${lens}.
LANGUAGES: every text field has "en" (natural English, simple words) and "ur" (strictly ROMAN URDU using ENGLISH/LATIN ALPHABET letters like "Aap bohat gehri soch rakhti hain, chup chap sab dekhti hain" — NEVER use Arabic or Urdu script or characters, use Latin/English letters only, natural conversational tone like a close friend texting).
VISUAL IDENTITY: invent a distinct art direction that visibly expresses THIS portrait's temperament (not generic). Pick a palette with real contrast (bg vs ink readable), avoid default purple gradients. Design a fictional companion character embodying their nature.

Return ONLY raw JSON without code blocks:
{"title":{"en":"...","ur":"..."},
"opening":{"en":"...","ur":"..."},
"sections":[{"heading":{"en":"...","ur":"..."},"body":{"en":"...","ur":"..."}} x6],
"mirror":{"en":"...","ur":"..."},
"closing":{"en":"...","ur":"..."},
"visual":{"concept":"one sentence art direction","composition":one of ${COMPOSITIONS.join('|')},"backdrop":one of ${BACKDROPS.join('|')},
"palette":{"bg":"#hex","surface":"#hex","ink":"#hex","accent":"#hex","accent2":"#hex"},"fontDisplay":one of ${FONTS.join('|')},"fontBody":one of ${FONTS.join('|')},"reveal":one of ${REVEALS.join('|')},
"character":{"name":"invented fictional name","body":one of ${BODIES.join('|')},"eyes":one of ${EYES.join('|')},"accessory":one of ${ACCESSORIES.join('|')},"motion":one of ${MOTIONS.join('|')},"line":{"en":"...","ur":"..."}}}}`;
}

async function callGroqAI(prompt: string, modelName: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: 'You are an expert personality writer and art director. Output raw JSON only. Do not include markdown formatting or backticks around the JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      reasoning_format: 'hidden',
      max_tokens: 2800,
      temperature: 0.85,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const json = await res.json();
  const choice = json.choices?.[0]?.message;
  let content = '';
  if (choice?.content && typeof choice.content === 'string' && choice.content.trim().length > 0) {
    content = choice.content.trim();
  } else if (choice?.reasoning && typeof choice.reasoning === 'string') {
    content = choice.reasoning.trim();
  }
  if (!content) throw new Error('Empty response from Groq');

  // If text contains a JSON block inside ```json ... ```, extract it
  const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    content = match[1].trim();
  } else if (content.startsWith('```')) {
    content = content.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim();
  }

  // If content has leading thought text (e.g. "We need to... { ... }"), slice from first '{' to last '}'
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    content = content.slice(firstBrace, lastBrace + 1);
  }

  return content;
}

async function callCerebrasAI(prompt: string, modelName: string = 'qwen-3.8-27b'): Promise<string> {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) throw new Error('CEREBRAS_API_KEY not configured');

  const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: 'You are an expert personality writer and art director. Output raw JSON only. Do not include markdown formatting or backticks around the JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      reasoning_effort: 'none',
      response_format: { type: 'json_object' },
      temperature: 0.85,
      max_completion_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cerebras API error (${res.status}): ${errText}`);
  }

  const json = await res.json();
  const choice = json.choices?.[0]?.message;
  let content = choice?.content?.trim() || '';
  if (!content) throw new Error('Empty response from Cerebras');

  const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    content = match[1].trim();
  } else if (content.startsWith('```')) {
    content = content.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim();
  }

  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    content = content.slice(firstBrace, lastBrace + 1);
  }

  return content;
}

export async function generatePortrait(name: string, age: number | null): Promise<Portrait> {
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!cerebrasKey && !groqKey && !geminiKey) {
    throw new PortraitUnavailableError('AI service is not configured (missing CEREBRAS_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY)');
  }

  const activeModel = process.env.PORTRAIT_MODEL || (cerebrasKey ? 'qwen-3.8-27b' : groqKey ? 'qwen/qwen3.8-27b' : 'gemini-2.5-pro');
  let lastErr: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      let rawJsonText = '';
      if (cerebrasKey) {
        try {
          rawJsonText = await callCerebrasAI(buildPrompt(name, age), activeModel);
        } catch (cerebrasErr) {
          console.warn('[generatePortrait] Cerebras call failed, trying Groq fallback:', cerebrasErr);
          if (groqKey) {
            rawJsonText = await callGroqAI(buildPrompt(name, age), 'qwen/qwen3.8-27b');
          } else {
            throw cerebrasErr;
          }
        }
      } else if (groqKey) {
        rawJsonText = await callGroqAI(buildPrompt(name, age), activeModel);
      } else if (geminiKey) {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const res = await ai.models.generateContent({
          model: activeModel,
          contents: buildPrompt(name, age),
          config: { responseMimeType: 'application/json', temperature: 1.0 },
        });
        rawJsonText = res.text || '';
      }

      if (!rawJsonText) throw new Error('Empty model response');
      try {
        const parsed = JSON.parse(rawJsonText);
        return sanitizePortrait(parsed, age, activeModel);
      } catch (parseErr) {
        console.error('[generatePortrait] JSON parse failed on raw text snippet:', rawJsonText.slice(0, 300));
        throw parseErr;
      }
    } catch (e) {
      lastErr = e;
      console.warn(`[generatePortrait] Attempt ${attempt + 1} failed:`, e);

      // If rate limited, back off before retry
      const errMsg = e instanceof Error ? e.message : String(e);
      if (errMsg.includes('429') || errMsg.includes('rate_limit')) {
        await new Promise((r) => setTimeout(r, 6000));
      } else {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error('Portrait generation failed');
}
