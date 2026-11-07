import { NextRequest, NextResponse } from 'next/server';
import { getExperienceBySlug, saveExperience } from '@/lib/storage/experienceStore';
import { generateExportBundle } from '@/lib/export/codeGenerator';

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-vercel-token') || process.env.VERCEL_TOKEN;
  if (!token) {
    return NextResponse.json({
      ok: true,
      connected: false,
      message:
        'Provide a Vercel Access Token (or set VERCEL_TOKEN on the server) to list existing Vercel projects and trigger live edge deployments.',
      projects: [],
    });
  }

  try {
    const res = await fetch('https://api.vercel.com/v9/projects?limit=10', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        connected: false,
        error: `Vercel API returned HTTP ${res.status}. Verify your Vercel Access Token.`,
        projects: [],
      });
    }
    const data = (await res.json()) as { projects?: Array<{ id: string; name: string; updatedAt: number }> };
    return NextResponse.json({
      ok: true,
      connected: true,
      projects: data.projects || [],
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      connected: false,
      error: error instanceof Error ? error.message : 'Unable to reach Vercel API from current network environment.',
      projects: [],
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slug,
      projectName,
      target = 'production',
      vercelToken,
    } = body as {
      slug: string;
      projectName?: string;
      target?: 'production' | 'preview';
      vercelToken?: string;
    };

    if (!slug) {
      return NextResponse.json({ ok: false, error: 'Experience slug is required.' }, { status: 400 });
    }

    const exp = await getExperienceBySlug(slug);
    if (!exp) {
      return NextResponse.json({ ok: false, error: 'Experience not found.' }, { status: 404 });
    }

    const token = vercelToken || process.env.VERCEL_TOKEN;
    const bundle = generateExportBundle(exp);
    const cleanProjectName = (projectName || bundle.projectName)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 52);

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          requiresToken: true,
          error:
            'Vercel Access Token is required to deploy to Vercel Edge Network. Enter your token in the Vercel Deployment panel or export the standalone bundle.',
          preparedPayloadSummary: {
            projectName: cleanProjectName,
            target,
            fileCount: bundle.files.length,
          },
        },
        { status: 401 }
      );
    }

    const vercelFiles = bundle.files.map((f) => ({
      file: f.path,
      data: f.content,
    }));

    const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: cleanProjectName,
        files: vercelFiles,
        target: target === 'production' ? 'production' : undefined,
        projectSettings: {
          framework: null,
        },
      }),
    });

    const deployJson = await deployRes.json();
    if (!deployRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: deployJson?.error?.message || `Vercel deployment failed with HTTP ${deployRes.status}`,
        },
        { status: deployRes.status }
      );
    }

    const deploymentUrl = `https://${deployJson.url}`;
    exp.deploymentHistory = {
      ...exp.deploymentHistory,
      vercelDeploymentUrl: deploymentUrl,
      vercelProjectId: deployJson.projectId || cleanProjectName,
      lastPublishedAt: new Date().toISOString(),
    };
    await saveExperience(exp);

    return NextResponse.json({
      ok: true,
      deploymentId: deployJson.id,
      deploymentUrl,
      readyState: deployJson.readyState || 'INITIALIZING',
      target,
      projectName: cleanProjectName,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Vercel deployment request encountered a network or proxy restriction.',
      },
      { status: 500 }
    );
  }
}
