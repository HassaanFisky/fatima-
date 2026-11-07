import { NextRequest, NextResponse } from 'next/server';
import { executeGenerationPipeline } from '@/lib/intelligence/pipelineOrchestrator';
import { getExistingSlugsSet, saveExperience } from '@/lib/storage/experienceStore';
import { attachOwnerSessionCookie, checkEndpointRateLimit, resolveRequestOwnerId } from '@/lib/security/sessionAndAuth';
import { generatePortrait, PortraitUnavailableError } from '@/lib/portrait/portrait';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const rate = checkEndpointRateLimit(req, 'portrait_generate', 8);
  if (!rate.allowed) {
    return NextResponse.json({ ok: false, error: 'Please wait a moment and try again.' }, { status: 429, headers: rate.headers });
  }
  try {
    const body = (await req.json()) as { name?: unknown; age?: unknown };
    const name = typeof body.name === 'string' ? body.name.replace(/\s+/g, ' ').trim() : '';
    if (!name || name.length > 80) {
      return NextResponse.json({ ok: false, error: 'Please enter your name.' }, { status: 400, headers: rate.headers });
    }
    let age: number | null = null;
    if (body.age !== undefined && body.age !== null && body.age !== '') {
      const n = Number(body.age);
      if (!Number.isInteger(n) || n < 3 || n > 110) {
        return NextResponse.json({ ok: false, error: 'Age should be a number between 3 and 110.' }, { status: 400, headers: rate.headers });
      }
      age = n;
    }
    const session = resolveRequestOwnerId(req);
    const portrait = await generatePortrait(name, age);
    const exp = await executeGenerationPipeline(
      { fullName: name, visibility: 'unlisted' },
      { existingSlugs: await getExistingSlugsSet(), ownerId: session.ownerId }
    );
    exp.intelligence.portrait = portrait;
    const saved = await saveExperience(exp);
    const res = NextResponse.json({ ok: true, slug: saved.slug }, { headers: rate.headers });
    return attachOwnerSessionCookie(res, session.signedToken);
  } catch (e) {
    if (e instanceof PortraitUnavailableError) {
      console.error('[portrait] unavailable:', e.message);
      return NextResponse.json({ ok: false, error: "We can't create portraits right now. Please try again later." }, { status: 503, headers: rate.headers });
    }
    console.error('[portrait] failed:', e);
    return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500, headers: rate.headers });
  }
}
