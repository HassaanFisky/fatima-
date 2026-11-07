import { NextRequest, NextResponse } from 'next/server';
import { executeGenerationPipeline } from '@/lib/intelligence/pipelineOrchestrator';
import {
  getAllExperiences,
  getExistingSlugsSet,
  saveExperience,
} from '@/lib/storage/experienceStore';
import { getSupabaseStatus } from '@/lib/storage/supabaseClient';
import {
  attachOwnerSessionCookie,
  checkEndpointRateLimit,
  resolveRequestOwnerId,
} from '@/lib/security/sessionAndAuth';
import { PersonInput } from '@/types/experience';

export async function GET(req: NextRequest) {
  try {
    const rate = checkEndpointRateLimit(req, 'experiences_get', 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded.' },
        { status: 429, headers: rate.headers }
      );
    }

    const session = resolveRequestOwnerId(req);
    const experiences = await getAllExperiences(session.ownerId);
    const supabaseStatus = getSupabaseStatus();

    const res = NextResponse.json(
      {
        ok: true,
        count: experiences.length,
        ownerId: session.ownerId,
        storageStatus: supabaseStatus,
        experiences,
      },
      { headers: rate.headers }
    );
    return attachOwnerSessionCookie(res, session.signedToken);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load experiences',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const rate = checkEndpointRateLimit(req, 'experiences_generate', 20);
    if (!rate.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded. Please wait before generating again.' },
        { status: 429, headers: rate.headers }
      );
    }

    const session = resolveRequestOwnerId(req);
    const body = (await req.json()) as Partial<PersonInput>;

    if (!body || typeof body.fullName !== 'string' || body.fullName.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Please provide an individual name (fullName is required).' },
        { status: 400, headers: rate.headers }
      );
    }

    if (body.fullName.trim().length > 120) {
      return NextResponse.json(
        { ok: false, error: 'Name must be 120 characters or fewer.' },
        { status: 400, headers: rate.headers }
      );
    }

    const hasOptionalPersonalFields = Boolean(
      body.birthDate ||
        body.birthYear ||
        body.birthplace ||
        body.country ||
        (body.interests && body.interests.length > 0) ||
        (body.hobbies && body.hobbies.length > 0) ||
        body.personalityInfo
    );

    if (hasOptionalPersonalFields && body.privacyConsentConfirmed === false) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Consent confirmation is required before processing optional personal biographical attributes.',
        },
        { status: 400, headers: rate.headers }
      );
    }

    const existingSlugs = await getExistingSlugsSet();
    const generated = await executeGenerationPipeline(body as PersonInput, {
      existingSlugs,
      ownerId: session.ownerId,
    });

    const saved = await saveExperience(generated);

    const res = NextResponse.json(
      {
        ok: true,
        ownerToken: session.signedToken,
        experience: saved,
      },
      { headers: rate.headers }
    );
    return attachOwnerSessionCookie(res, session.signedToken);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Generation pipeline failed',
      },
      { status: 500 }
    );
  }
}
