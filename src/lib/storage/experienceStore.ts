import fs from 'fs';
import path from 'path';
import { PersonalizedExperience, PersonInput } from '@/types/experience';
import { executeGenerationPipeline } from '../intelligence/pipelineOrchestrator';
import { getSupabaseServerClient, getSupabaseStatus } from './supabaseClient';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'experiences.json');

/**
 * Strictly Name-Only Showcase Seeds.
 * Requirement 3: Never invent birthdays, locations, interests, or personality attributes.
 * Every optional biographical field is left undefined so zero personal facts are fabricated.
 */
const SEED_INPUTS: Array<{ slug: string; id: string; input: PersonInput }> = [
  {
    id: 'exp_seed_fatima',
    slug: 'fatima',
    input: {
      fullName: 'Fatima',
      visibility: 'public',
    },
  },
  {
    id: 'exp_seed_kenjiro',
    slug: 'kenjiro',
    input: {
      fullName: 'Kenjiro',
      visibility: 'public',
    },
  },
  {
    id: 'exp_seed_elena',
    slug: 'elena',
    input: {
      fullName: 'Elena',
      visibility: 'public',
    },
  },
];

interface SupabaseExperienceRow {
  id: string;
  slug: string;
  owner_id: string;
  visibility: 'public' | 'unlisted' | 'private';
  version: number;
  input: PersonInput;
  intelligence: PersonalizedExperience['intelligence'];
  pipeline_logs: PersonalizedExperience['pipelineLogs'];
  deployment_history?: PersonalizedExperience['deploymentHistory'];
  created_at: string;
  updated_at: string;
}

function mapRowToExperience(row: SupabaseExperienceRow): PersonalizedExperience {
  return {
    id: row.id,
    slug: row.slug,
    ownerId: row.owner_id,
    visibility: row.visibility,
    version: row.version,
    input: row.input,
    intelligence: row.intelligence,
    pipelineLogs: row.pipeline_logs,
    deploymentHistory: row.deployment_history,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    storageSource: 'supabase',
  };
}

function mapExperienceToRow(exp: PersonalizedExperience): SupabaseExperienceRow {
  return {
    id: exp.id,
    slug: exp.slug,
    owner_id: exp.ownerId || 'system_public',
    visibility: exp.visibility,
    version: exp.version,
    input: exp.input,
    intelligence: exp.intelligence,
    pipeline_logs: exp.pipelineLogs,
    deployment_history: exp.deploymentHistory || {},
    created_at: exp.createdAt,
    updated_at: exp.updatedAt,
  };
}

let memoryCache: Record<string, PersonalizedExperience> | null = null;

function ensureDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function ensureLocalCacheInitialized(): Promise<Record<string, PersonalizedExperience>> {
  if (memoryCache) return memoryCache;

  ensureDirExists();

  if (fs.existsSync(STORE_PATH)) {
    try {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Record<string, PersonalizedExperience>;
      if (parsed && Object.keys(parsed).length > 0) {
        memoryCache = parsed;
        return memoryCache;
      }
    } catch {
      // Regenerate clean seeds if corrupted
    }
  }

  const seeded: Record<string, PersonalizedExperience> = {};
  const existingSlugs = new Set<string>();

  for (const item of SEED_INPUTS) {
    const exp = await executeGenerationPipeline(item.input, {
      forcedId: item.id,
      forcedSlug: item.slug,
      ownerId: 'system_public',
      existingSlugs,
    });
    exp.storageSource = 'local_fallback';
    existingSlugs.add(exp.slug);
    seeded[exp.slug] = exp;
  }

  memoryCache = seeded;
  persistLocalCache();
  return memoryCache;
}

function persistLocalCache() {
  if (!memoryCache) return;
  try {
    ensureDirExists();
    fs.writeFileSync(STORE_PATH, JSON.stringify(memoryCache, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Warning: Could not write experiences.json to disk:', err);
  }
}

/**
 * Lists experiences visible to the requester:
 * - Public experiences are visible to everyone
 * - Unlisted & Private experiences are only included in the list if owned by requesterOwnerId
 */
export async function getAllExperiences(
  requesterOwnerId?: string
): Promise<PersonalizedExperience[]> {
  const supabase = getSupabaseServerClient(requesterOwnerId);
  if (supabase) {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      const rows = (data as SupabaseExperienceRow[]).map(mapRowToExperience);
      return rows.filter(
        (exp) =>
          exp.visibility === 'public' ||
          (requesterOwnerId && exp.ownerId === requesterOwnerId)
      );
    }
  }

  const cache = await ensureLocalCacheInitialized();
  return Object.values(cache)
    .filter(
      (exp) =>
        exp.visibility === 'public' ||
        (requesterOwnerId && exp.ownerId === requesterOwnerId)
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Retrieves a single experience by slug with multi-tenant privacy enforcement.
 * - 'public' and 'unlisted' can be viewed by direct slug link
 * - 'private' can ONLY be viewed if requesterOwnerId === exp.ownerId
 */
export async function getExperienceBySlug(
  slug: string,
  requesterOwnerId?: string
): Promise<PersonalizedExperience | null> {
  const supabase = getSupabaseServerClient(requesterOwnerId);
  if (supabase) {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (!error && data) {
      const exp = mapRowToExperience(data as SupabaseExperienceRow);
      if (
        exp.visibility === 'private' &&
        exp.ownerId !== 'system_public' &&
        exp.ownerId !== requesterOwnerId
      ) {
        return null;
      }
      return exp;
    }
  }

  const cache = await ensureLocalCacheInitialized();
  const exp = cache[slug] || null;
  if (!exp) return null;

  if (
    exp.visibility === 'private' &&
    exp.ownerId !== 'system_public' &&
    exp.ownerId !== requesterOwnerId
  ) {
    return null;
  }

  return exp;
}

export async function getRawExperienceMetaBySlug(
  slug: string
): Promise<{ exists: boolean; ownerId?: string; visibility?: string }> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from('experiences')
      .select('owner_id, visibility')
      .eq('slug', slug)
      .maybeSingle();
    if (data) {
      return {
        exists: true,
        ownerId: (data as { owner_id: string }).owner_id,
        visibility: (data as { visibility: string }).visibility,
      };
    }
  }

  const cache = await ensureLocalCacheInitialized();
  const exp = cache[slug];
  if (!exp) return { exists: false };
  return { exists: true, ownerId: exp.ownerId, visibility: exp.visibility };
}

export function canMutateExperience(
  ownerIdOfRecord: string | undefined,
  requesterOwnerId: string
): boolean {
  if (!ownerIdOfRecord || ownerIdOfRecord === 'system_public') {
    return true;
  }
  return ownerIdOfRecord === requesterOwnerId;
}

export async function saveExperience(
  experience: PersonalizedExperience
): Promise<PersonalizedExperience> {
  const updated: PersonalizedExperience = {
    ...experience,
    updatedAt: new Date().toISOString(),
  };

  const supabase = getSupabaseServerClient(updated.ownerId);
  if (supabase) {
    const row = mapExperienceToRow(updated);
    const { data, error } = await supabase
      .from('experiences')
      .upsert(row, { onConflict: 'slug' })
      .select('*')
      .single();

    if (!error && data) {
      return mapRowToExperience(data as SupabaseExperienceRow);
    }
  }

  const cache = await ensureLocalCacheInitialized();
  updated.storageSource = getSupabaseStatus().configured ? 'supabase' : 'local_fallback';
  cache[updated.slug] = updated;
  persistLocalCache();
  return cache[updated.slug];
}

export async function deleteExperienceBySlug(
  slug: string,
  requesterOwnerId?: string
): Promise<{ deleted: boolean; forbidden?: boolean }> {
  const meta = await getRawExperienceMetaBySlug(slug);
  if (!meta.exists) {
    return { deleted: false };
  }

  if (requesterOwnerId && !canMutateExperience(meta.ownerId, requesterOwnerId)) {
    return { deleted: false, forbidden: true };
  }

  const supabase = getSupabaseServerClient(requesterOwnerId);
  if (supabase) {
    const { error } = await supabase.from('experiences').delete().eq('slug', slug);
    if (!error) {
      return { deleted: true };
    }
  }

  const cache = await ensureLocalCacheInitialized();
  if (!cache[slug]) return { deleted: false };
  delete cache[slug];
  persistLocalCache();
  return { deleted: true };
}

export async function getExistingSlugsSet(): Promise<Set<string>> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase.from('experiences').select('slug');
    if (!error && data) {
      return new Set((data as Array<{ slug: string }>).map((r) => r.slug));
    }
  }

  const cache = await ensureLocalCacheInitialized();
  return new Set(Object.keys(cache));
}
