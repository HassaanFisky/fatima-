import { NextRequest, NextResponse } from 'next/server';
import { executeGenerationPipeline } from '@/lib/intelligence/pipelineOrchestrator';
import {
  getAllExperiences,
  getExistingSlugsSet,
  saveExperience,
} from '@/lib/storage/experienceStore';
import { PersonInput } from '@/types/experience';

// Simple in-memory rate limiter per IP
const rateLimitWindowMs = 60_000;
const maxRequestsPerMinute = 30;
const requestLog = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter((t) => now - t < rateLimitWindowMs);
  if (timestamps.length >= maxRequestsPerMinute) {
    return false;
  }
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return true;
}

export async function GET() {
  try {
    const experiences = await getAllExperiences();
    return NextResponse.json({
      ok: true,
      count: experiences.length,
      experiences,
    });
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
    const ip = req.headers.get('x-forwarded-for') || 'local';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded. Please wait a moment before generating again.' },
        { status: 429 }
      );
    }

    const body = (await req.json()) as Partial<PersonInput>;
    if (!body || typeof body.fullName !== 'string' || body.fullName.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Please provide an individual name (fullName is required).' },
        { status: 400 }
      );
    }

    if (body.fullName.trim().length > 120) {
      return NextResponse.json(
        { ok: false, error: 'Name must be 120 characters or fewer.' },
        { status: 400 }
      );
    }

    const existingSlugs = await getExistingSlugsSet();
    const generated = await executeGenerationPipeline(body as PersonInput, {
      existingSlugs,
    });

    const saved = await saveExperience(generated);

    return NextResponse.json({
      ok: true,
      experience: saved,
    });
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
