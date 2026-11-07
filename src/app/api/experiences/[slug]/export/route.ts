import { NextRequest, NextResponse } from 'next/server';
import { getExperienceBySlug } from '@/lib/storage/experienceStore';
import { generateExportBundle } from '@/lib/export/codeGenerator';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const exp = await getExperienceBySlug(slug);
  if (!exp) {
    return NextResponse.json({ ok: false, error: 'Experience not found' }, { status: 404 });
  }

  const bundle = generateExportBundle(exp);
  const format = req.nextUrl.searchParams.get('format');

  if (format === 'html') {
    return new NextResponse(bundle.standaloneHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${exp.slug}-experience.html"`,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    bundle,
  });
}
