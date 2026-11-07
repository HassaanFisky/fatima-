import { NextRequest, NextResponse } from 'next/server';
import { getExperienceBySlug, saveExperience } from '@/lib/storage/experienceStore';
import { generateExportBundle } from '@/lib/export/codeGenerator';
import { checkEndpointRateLimit, resolveRequestOwnerId } from '@/lib/security/sessionAndAuth';

function getServerGitHubToken(customToken?: string): string | null {
  if (customToken && customToken.trim().length > 0) {
    return customToken.trim();
  }
  return process.env.GH_TOKEN || process.env.GITHUB_TOKEN || null;
}

function buildGitHubHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

export async function GET() {
  const token = getServerGitHubToken();
  if (!token) {
    return NextResponse.json({
      ok: true,
      connected: false,
      provider: 'github-rest-api',
      message: 'No server GitHub token found. Provide a GitHub Personal Access Token or connect the GitHub plugin.',
      repositories: [],
    });
  }

  try {
    const headers = buildGitHubHeaders(token);
    const [userRes, reposRes] = await Promise.all([
      fetch('https://api.github.com/user', { headers }),
      fetch('https://api.github.com/user/repos?sort=updated&per_page=12', { headers }),
    ]);

    if (!userRes.ok) {
      return NextResponse.json({
        ok: true,
        connected: false,
        provider: 'github-rest-api',
        message: `GitHub token returned HTTP ${userRes.status}.`,
        repositories: [],
      });
    }

    const userData = (await userRes.json()) as {
      login: string;
      html_url: string;
      name?: string;
    };
    const reposData = reposRes.ok
      ? ((await reposRes.json()) as Array<{
          name: string;
          full_name: string;
          private: boolean;
          html_url: string;
          updated_at: string;
        }>)
      : [];

    return NextResponse.json({
      ok: true,
      connected: true,
      provider: 'github-rest-api',
      account: {
        login: userData.login,
        name: userData.name || userData.login,
        profileUrl: userData.html_url,
      },
      repositories: reposData.map((r) => ({
        name: r.name,
        nameWithOwner: r.full_name,
        isPrivate: r.private,
        url: r.html_url,
        updatedAt: r.updated_at,
      })),
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      connected: false,
      error: error instanceof Error ? error.message : 'GitHub status check failed',
      repositories: [],
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rate = checkEndpointRateLimit(req, 'github_publish', 10);
    if (!rate.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded for GitHub publishing.' },
        { status: 429, headers: rate.headers }
      );
    }

    const session = resolveRequestOwnerId(req);
    const body = await req.json();
    const {
      slug,
      repoName,
      visibility = 'public',
      explicitConfirmation = false,
      customToken,
      targetSubdirectory,
    } = body as {
      slug: string;
      repoName: string;
      visibility?: 'public' | 'private';
      explicitConfirmation?: boolean;
      customToken?: string;
      targetSubdirectory?: string;
    };

    if (!explicitConfirmation) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Explicit confirmation is required before creating or pushing to a GitHub repository.',
        },
        { status: 400, headers: rate.headers }
      );
    }

    if (!slug || !repoName) {
      return NextResponse.json(
        { ok: false, error: 'Both experience slug and target repository name are required.' },
        { status: 400, headers: rate.headers }
      );
    }

    // Security guard: never allow overwriting or modifying HassaanFisky/for-fatima (Requirement 15)
    if (repoName.toLowerCase().includes('for-fatima')) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Protection Guard: Modifying or overwriting HassaanFisky/for-fatima is strictly prohibited. Specify a separate repository.',
        },
        { status: 403, headers: rate.headers }
      );
    }

    const exp = await getExperienceBySlug(slug, session.ownerId);
    if (!exp) {
      return NextResponse.json(
        { ok: false, error: 'Experience not found or access denied.' },
        { status: 404, headers: rate.headers }
      );
    }

    const token = getServerGitHubToken(customToken);
    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'No GitHub OAuth session or Personal Access Token available on the server.',
        },
        { status: 401, headers: rate.headers }
      );
    }

    const headers = buildGitHubHeaders(token);
    const userResp = await fetch('https://api.github.com/user', { headers });
    if (!userResp.ok) {
      return NextResponse.json(
        { ok: false, error: `GitHub authentication failed (HTTP ${userResp.status}).` },
        { status: 401, headers: rate.headers }
      );
    }

    const userData = (await userResp.json()) as { login: string };
    const owner = userData.login;
    const cleanRepoName = repoName.trim().replace(/[^a-zA-Z0-9._/-]/g, '-');
    const shortName = cleanRepoName.includes('/')
      ? cleanRepoName.split('/')[1]
      : cleanRepoName;
    const fullRepo = `${owner}/${shortName}`;

    // Check if repository already exists
    const repoCheckResp = await fetch(`https://api.github.com/repos/${fullRepo}`, {
      headers,
    });

    let repoCreated = false;
    if (repoCheckResp.status === 404) {
      const createResp = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: shortName,
          private: visibility === 'private',
          description: `Personalized Digital Experience for ${exp.input.fullName} (Generated by Atelier Engine)`,
          auto_init: true,
        }),
      });

      if (!createResp.ok) {
        const errBody = await createResp.text();
        return NextResponse.json(
          {
            ok: false,
            error: `GitHub repository creation returned HTTP ${createResp.status}: ${errBody}`,
          },
          { status: createResp.status, headers: rate.headers }
        );
      }
      repoCreated = true;
      // Wait briefly for GitHub to initialize default branch
      await new Promise((r) => setTimeout(r, 1200));
    }

    const bundle = generateExportBundle(exp);
    const prefix = targetSubdirectory
      ? `${targetSubdirectory.replace(/^\/+|\/+$/g, '')}/`
      : '';

    const pushedFiles: string[] = [];
    let lastCommitSha = '';

    for (const file of bundle.files) {
      const targetPath = `${prefix}${file.path}`;
      const contentBase64 = Buffer.from(file.content, 'utf-8').toString('base64');

      // Check if file already exists to include its current blob sha
      let existingSha: string | undefined;
      const existingCheck = await fetch(
        `https://api.github.com/repos/${fullRepo}/contents/${targetPath}`,
        { headers }
      );
      if (existingCheck.ok) {
        const existingJson = (await existingCheck.json()) as { sha?: string };
        existingSha = existingJson.sha;
      }

      const putResp = await fetch(
        `https://api.github.com/repos/${fullRepo}/contents/${targetPath}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: `feat(${exp.slug}): publish ${targetPath} for ${exp.input.fullName}`,
            content: contentBase64,
            ...(existingSha ? { sha: existingSha } : {}),
          }),
        }
      );

      if (!putResp.ok) {
        const putErr = await putResp.text();
        return NextResponse.json(
          {
            ok: false,
            repoCreated,
            error: `Failed pushing ${targetPath} to ${fullRepo} (HTTP ${putResp.status}): ${putErr}`,
          },
          { status: putResp.status, headers: rate.headers }
        );
      }

      const putData = (await putResp.json()) as { commit?: { sha?: string } };
      if (putData.commit?.sha) {
        lastCommitSha = putData.commit.sha;
      }
      pushedFiles.push(targetPath);
    }

    const repoUrl = `https://github.com/${fullRepo}`;
    exp.deploymentHistory = {
      ...exp.deploymentHistory,
      githubRepoUrl: repoUrl,
      githubLastCommitSha: lastCommitSha,
      lastPublishedAt: new Date().toISOString(),
    };
    await saveExperience(exp);

    return NextResponse.json(
      {
        ok: true,
        repoCreated,
        repoUrl,
        lastCommitSha,
        visibility,
        filesPushed: pushedFiles,
      },
      { headers: rate.headers }
    );
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
