import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { getExperienceBySlug, saveExperience } from '@/lib/storage/experienceStore';
import { generateExportBundle } from '@/lib/export/codeGenerator';

const execFileAsync = promisify(execFile);

async function runGhCommand(args: string[]): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  try {
    const { stdout, stderr } = await execFileAsync('gh', args, {
      timeout: 15000,
      env: process.env,
    });
    return { ok: true, stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    return {
      ok: false,
      stdout: (e.stdout || '').trim(),
      stderr: (e.stderr || e.message || 'gh command failed').trim(),
    };
  }
}

export async function GET() {
  const userRes = await runGhCommand(['api', 'user', '--jq', '.login + "|" + .html_url']);
  const reposRes = await runGhCommand([
    'repo',
    'list',
    '--limit',
    '10',
    '--json',
    'name,nameWithOwner,isPrivate,url,updatedAt',
  ]);

  if (userRes.ok && userRes.stdout) {
    const [login, profileUrl] = userRes.stdout.split('|');
    let repositories: unknown[] = [];
    try {
      repositories = JSON.parse(reposRes.stdout || '[]');
    } catch {
      repositories = [];
    }

    return NextResponse.json({
      ok: true,
      connected: true,
      provider: 'github-oauth-proxy',
      account: {
        login,
        profileUrl,
      },
      repositories,
    });
  }

  return NextResponse.json({
    ok: true,
    connected: false,
    provider: 'github-oauth-proxy',
    message: 'GitHub session can be authenticated via connected GitHub plugin or Personal Access Token.',
    repositories: [],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slug,
      repoName,
      visibility = 'public',
      explicitConfirmation = false,
      customToken,
    } = body as {
      slug: string;
      repoName: string;
      visibility?: 'public' | 'private';
      explicitConfirmation?: boolean;
      customToken?: string;
    };

    if (!explicitConfirmation) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Explicit confirmation is required before creating or pushing to a GitHub repository.',
        },
        { status: 400 }
      );
    }

    if (!slug || !repoName) {
      return NextResponse.json(
        { ok: false, error: 'Both experience slug and target repository name are required.' },
        { status: 400 }
      );
    }

    const exp = await getExperienceBySlug(slug);
    if (!exp) {
      return NextResponse.json({ ok: false, error: 'Experience not found.' }, { status: 404 });
    }

    const bundle = generateExportBundle(exp);
    const cleanRepoName = repoName.trim().replace(/[^a-zA-Z0-9._/-]/g, '-');

    // If user supplied a PAT token or we use connected gh CLI:
    if (customToken) {
      const headers = {
        Authorization: `Bearer ${customToken}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      };

      const userResp = await fetch('https://api.github.com/user', { headers });
      if (!userResp.ok) {
        return NextResponse.json(
          { ok: false, error: 'GitHub token authentication failed (HTTP ' + userResp.status + ').' },
          { status: 401 }
        );
      }
      const userData = (await userResp.json()) as { login: string };
      const owner = userData.login;
      const shortName = cleanRepoName.includes('/') ? cleanRepoName.split('/')[1] : cleanRepoName;

      // Create repo if needed
      await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: shortName,
          private: visibility === 'private',
          description: `Personalized Digital Experience for ${exp.input.fullName}`,
          auto_init: true,
        }),
      });

      // Push index.html and README.md via GitHub Contents API
      for (const file of bundle.files) {
        const contentBase64 = Buffer.from(file.content, 'utf-8').toString('base64');
        await fetch(
          `https://api.github.com/repos/${owner}/${shortName}/contents/${file.path}`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              message: `feat: publish personalized experience for ${exp.input.fullName}`,
              content: contentBase64,
            }),
          }
        );
      }

      const repoUrl = `https://github.com/${owner}/${shortName}`;
      exp.deploymentHistory = {
        ...exp.deploymentHistory,
        githubRepoUrl: repoUrl,
        lastPublishedAt: new Date().toISOString(),
      };
      await saveExperience(exp);

      return NextResponse.json({
        ok: true,
        repoUrl,
        visibility,
        filesPushed: bundle.files.map((f) => f.path),
      });
    }

    // Connected `gh` CLI path
    const userRes = await runGhCommand(['api', 'user', '--jq', '.login']);
    if (!userRes.ok || !userRes.stdout) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'No active GitHub OAuth session detected on server. Provide a GitHub Personal Access Token or connect the GitHub plugin.',
        },
        { status: 401 }
      );
    }

    const owner = userRes.stdout.trim();
    const fullRepo = cleanRepoName.includes('/') ? cleanRepoName : `${owner}/${cleanRepoName}`;

    // Check if repo exists
    const checkRepo = await runGhCommand(['repo', 'view', fullRepo, '--json', 'url']);
    if (!checkRepo.ok) {
      const createRes = await runGhCommand([
        'repo',
        'create',
        fullRepo,
        visibility === 'private' ? '--private' : '--public',
        '--description',
        `Personalized Digital Experience for ${exp.input.fullName}`,
      ]);
      if (!createRes.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: `GitHub repository creation restricted by token scope: ${createRes.stderr}`,
          },
          { status: 403 }
        );
      }
    }

    // Push files via gh api
    const pushedFiles: string[] = [];
    for (const file of bundle.files) {
      const b64 = Buffer.from(file.content, 'utf-8').toString('base64');
      // Check existing sha if file exists
      const existingFile = await runGhCommand([
        'api',
        `repos/${fullRepo}/contents/${file.path}`,
        '--jq',
        '.sha',
      ]);
      const args = [
        'api',
        '--method',
        'PUT',
        `repos/${fullRepo}/contents/${file.path}`,
        '-f',
        `message=feat(${exp.slug}): publish generated experience file ${file.path}`,
        '-f',
        `content=${b64}`,
      ];
      if (existingFile.ok && existingFile.stdout && existingFile.stdout.length > 10) {
        args.push('-f', `sha=${existingFile.stdout}`);
      }
      const putRes = await runGhCommand(args);
      if (putRes.ok) {
        pushedFiles.push(file.path);
      }
    }

    const repoUrl = `https://github.com/${fullRepo}`;
    exp.deploymentHistory = {
      ...exp.deploymentHistory,
      githubRepoUrl: repoUrl,
      lastPublishedAt: new Date().toISOString(),
    };
    await saveExperience(exp);

    return NextResponse.json({
      ok: true,
      repoUrl,
      visibility,
      filesPushed: pushedFiles,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'GitHub integration error',
      },
      { status: 500 }
    );
  }
}
