import fs from 'fs';
import path from 'path';
import { PersonalizedExperience, PersonInput } from '@/types/experience';
import { executeGenerationPipeline } from '../intelligence/pipelineOrchestrator';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'experiences.json');

const SEED_INPUTS: Array<{ slug: string; id: string; input: PersonInput }> = [
  {
    id: 'exp_seed_fatima',
    slug: 'fatima-al-qarawiyyin',
    input: {
      fullName: 'Fatima',
      birthDate: '1998-10-14',
      birthYear: 1998,
      birthTime: '06:42',
      birthplace: 'Lahore / Fez',
      country: 'Morocco',
      interests: ['Sacred Architecture', 'Celestial Cartography', 'Classical Poetry', 'Botanical Gardens'],
      hobbies: ['Calligraphy', 'Stargazing', 'Archival Bookbinding'],
      personalPreferences: 'Warm parchment, lapis lazuli, brass astrolabes, courtyard serenity',
      personalityInfo: 'Contemplative, luminous, deeply appreciative of historical craft and quiet wisdom',
      preferredVisualDirection: 'editorial_monograph',
      additionalInfo: 'Dedicated to the timeless pursuit of knowledge, grace, and architectural beauty.',
      visibility: 'public',
    },
  },
  {
    id: 'exp_seed_kenjiro',
    slug: 'kenjiro-takahashi',
    input: {
      fullName: 'Kenjiro Takahashi',
      birthDate: '1994-11-08',
      birthYear: 1994,
      birthTime: '21:15',
      birthplace: 'Kyoto',
      country: 'Japan',
      interests: ['Kinetic Typography', 'Modular Synthesizers', 'Timber Architecture', 'Computational Design'],
      hobbies: ['Analog Photography', 'Ceramics', 'Acoustic Field Recording'],
      personalPreferences: 'Sumi ink obsidian, raw hinoki wood, vermilion seals, structural precision',
      personalityInfo: 'Disciplined, curious, experimental, balances technical rigor with Zen spatial stillness',
      preferredVisualDirection: 'kinetic_atelier',
      additionalInfo: 'Exploring the threshold between digital shaders and traditional Japanese joinery.',
      visibility: 'public',
    },
  },
  {
    id: 'exp_seed_elena',
    slug: 'elena-rostova',
    input: {
      fullName: 'Elena Rostova',
      birthDate: '2001-03-24',
      birthYear: 2001,
      birthTime: '04:50',
      birthplace: 'Venice',
      country: 'Italy',
      interests: ['Astrophysics', 'Chamber Violin', 'Renaissance Optics', 'Marine Ecology'],
      hobbies: ['Telescope Making', 'Oil Glazing', 'Alpine Botanical Sketching'],
      personalPreferences: 'Nocturnal indigo, solar amber, copperplate celestial charts',
      personalityInfo: 'Poetic, radiant, observant, drawn to the intersection of music and orbital mechanics',
      preferredVisualDirection: 'celestial_observatory',
      additionalInfo: 'Mapping the harmonic resonance of planetary orbits through strings and light.',
      visibility: 'public',
    },
  },
];

let memoryCache: Record<string, PersonalizedExperience> | null = null;

function ensureDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function getAllExperiences(): Promise<PersonalizedExperience[]> {
  if (memoryCache) {
    return Object.values(memoryCache).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  ensureDirExists();

  if (fs.existsSync(STORE_PATH)) {
    try {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Record<string, PersonalizedExperience>;
      if (parsed && Object.keys(parsed).length > 0) {
        memoryCache = parsed;
        return Object.values(memoryCache).sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
    } catch {
      // Fall through to seed generation
    }
  }

  const seeded: Record<string, PersonalizedExperience> = {};
  const existingSlugs = new Set<string>();

  for (const item of SEED_INPUTS) {
    const exp = await executeGenerationPipeline(item.input, {
      forcedId: item.id,
      forcedSlug: item.slug,
      existingSlugs,
    });
    existingSlugs.add(exp.slug);
    seeded[exp.slug] = exp;
  }

  memoryCache = seeded;
  persistCache();

  return Object.values(memoryCache).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function persistCache() {
  if (!memoryCache) return;
  try {
    ensureDirExists();
    fs.writeFileSync(STORE_PATH, JSON.stringify(memoryCache, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Warning: Could not write experiences.json to disk:', err);
  }
}

export async function getExperienceBySlug(slug: string): Promise<PersonalizedExperience | null> {
  await getAllExperiences();
  if (!memoryCache) return null;
  return memoryCache[slug] || null;
}

export async function saveExperience(experience: PersonalizedExperience): Promise<PersonalizedExperience> {
  await getAllExperiences();
  if (!memoryCache) memoryCache = {};
  memoryCache[experience.slug] = {
    ...experience,
    updatedAt: new Date().toISOString(),
  };
  persistCache();
  return memoryCache[experience.slug];
}

export async function deleteExperienceBySlug(slug: string): Promise<boolean> {
  await getAllExperiences();
  if (!memoryCache || !memoryCache[slug]) return false;
  delete memoryCache[slug];
  persistCache();
  return true;
}

export async function getExistingSlugsSet(): Promise<Set<string>> {
  const list = await getAllExperiences();
  return new Set(list.map((e) => e.slug));
}
