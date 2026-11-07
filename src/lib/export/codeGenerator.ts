import { PersonalizedExperience } from '@/types/experience';

export interface ExportedFile {
  path: string;
  content: string;
  language: 'html' | 'json' | 'markdown' | 'typescript' | 'css';
}

export interface ExportBundle {
  slug: string;
  projectName: string;
  generatedAt: string;
  standaloneHtml: string;
  files: ExportedFile[];
}

export function generateStandaloneHtml(exp: PersonalizedExperience): string {
  const { visualDesign, storytelling, nameResearch, culturalContext, planetary, content, verification } =
    exp.intelligence;
  const p = visualDesign.colorPalette;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${storytelling.heroHeadline} — Personalized Digital Monograph</title>
  <meta name="description" content="${storytelling.heroSubheadline.replace(/"/g, '&quot;')}" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    :root {
      --bg-primary: ${p.backgroundPrimary};
      --bg-elevated: ${p.backgroundElevated};
      --text-primary: ${p.textPrimary};
      --text-secondary: ${p.textSecondary};
      --text-muted: ${p.textMuted};
      --accent-primary: ${p.accentPrimary};
      --accent-secondary: ${p.accentSecondary};
      --border-subtle: ${p.borderSubtle};
      --font-display: ${visualDesign.typography.displayFont};
      --font-serif: ${visualDesign.typography.serifFont};
      --font-sans: ${visualDesign.typography.sansFont};
      --font-mono: ${visualDesign.typography.monoFont};
      --radius: ${visualDesign.borderRadiusToken};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-sans);
      line-height: 1.65;
      overflow-x: hidden;
    }
    #webgl-canvas {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      pointer-events: none;
      opacity: 0.75;
    }
    .container {
      position: relative;
      z-index: 1;
      max-width: 1180px;
      margin: 0 auto;
      padding: 4rem 2rem;
    }
    header.hero {
      min-height: 82vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 4rem;
    }
    .eyebrow {
      font-family: var(--font-mono);
      font-size: 0.78rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--accent-primary);
      margin-bottom: 1.25rem;
    }
    h1 {
      font-family: var(--font-display);
      font-size: clamp(3.2rem, 8vw, 6.2rem);
      line-height: 1.02;
      letter-spacing: ${visualDesign.typography.displayTracking};
      margin-bottom: 1.5rem;
    }
    .subtitle {
      font-family: var(--font-serif);
      font-size: clamp(1.35rem, 2.5vw, 1.95rem);
      color: var(--text-secondary);
      max-width: 780px;
      margin-bottom: 2rem;
    }
    .manifesto {
      max-width: 680px;
      color: var(--text-secondary);
      font-size: 1.05rem;
    }
    .dossier-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
      margin: 4rem 0;
    }
    .card {
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius);
      padding: 1.75rem;
      transition: transform 0.25s ease;
    }
    .card:hover { transform: translateY(-4px); }
    .card-label {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--accent-primary);
      letter-spacing: 0.12em;
      margin-bottom: 0.6rem;
    }
    .card-title {
      font-family: var(--font-display);
      font-size: 1.45rem;
      margin-bottom: 0.5rem;
    }
    .chapter {
      padding: 4rem 0;
      border-top: 1px solid var(--border-subtle);
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2.5rem;
    }
    @media (max-width: 768px) {
      .chapter { grid-template-columns: 1fr; }
    }
    .letter-box {
      margin: 5rem 0;
      padding: 3.5rem;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius);
    }
    .letter-box p {
      font-family: var(--font-serif);
      font-size: 1.25rem;
      margin-bottom: 1.25rem;
    }
    footer {
      padding-top: 3rem;
      border-top: 1px solid var(--border-subtle);
      font-family: var(--font-mono);
      font-size: 0.78rem;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
  </style>
</head>
<body>
  <canvas id="webgl-canvas"></canvas>
  <main class="container">
    <header class="hero">
      <div class="eyebrow">${exp.intelligence.creativeDirection.archetypeName} · ${nameResearch.phoneticIPA.value}</div>
      <h1>${storytelling.heroHeadline}</h1>
      <p class="subtitle">${storytelling.heroSubheadline}</p>
      <p class="manifesto">${storytelling.prologueManifesto}</p>
    </header>

    <section aria-label="Identity Dossier">
      <div class="dossier-grid">
        ${content.identityDossier.cards
          .map(
            (c) => `<article class="card">
          <div class="card-label">${c.label} · [${c.epistemicCategory.toUpperCase()}]</div>
          <h2 class="card-title">${c.title}</h2>
          <p style="font-weight:600;margin-bottom:0.5rem;">${c.value}</p>
          <p style="font-size:0.92rem;color:var(--text-secondary);">${c.detail}</p>
        </article>`
          )
          .join('\n')}
      </div>
    </section>

    <section aria-label="Narrative Chapters">
      ${storytelling.chapters
        .map(
          (ch) => `<article class="chapter">
        <div>
          <div class="card-label">CHAPTER ${ch.chapterNumber} · ${ch.epistemicTag.toUpperCase()}</div>
          <h2 style="font-family:var(--font-display);font-size:2.1rem;margin:0.4rem 0;">${ch.title}</h2>
          <p style="font-family:var(--font-mono);font-size:0.8rem;color:var(--text-muted);">${ch.subtitle}</p>
        </div>
        <div>
          <p style="font-size:1.1rem;margin-bottom:1.25rem;">${ch.narrativeBody}</p>
          <blockquote style="font-family:var(--font-serif);font-style:italic;font-size:1.35rem;color:var(--accent-primary);border-left:2px solid var(--accent-primary);padding-left:1.2rem;">
            “${ch.pullQuote}”
          </blockquote>
        </div>
      </article>`
        )
        .join('\n')}
    </section>

    <section class="letter-box" aria-label="Personal Epistle">
      <div class="eyebrow">PERSONAL EPISTLE</div>
      <p><strong>${storytelling.personalLetter.salutation}</strong></p>
      ${storytelling.personalLetter.bodyParagraphs.map((pText) => `<p>${pText}</p>`).join('\n')}
      <p style="margin-top:2rem;">${storytelling.personalLetter.valediction}<br/><strong>${storytelling.personalLetter.signature}</strong></p>
    </section>

    <footer>
      <div>SLUG: ${exp.slug} · HARMONIC: ${planetary.rulingBody.value.harmonicFrequencyHz} HZ · REGION: ${culturalContext.geographicResonance.value.region}</div>
      <div>VERIFIED CLAIMS: ${verification.breakdown.verifiedFactsCount} · USER PROVIDED: ${verification.breakdown.userProvidedCount}</div>
    </footer>
  </main>

  <script>
    (function() {
      const canvas = document.getElementById('webgl-canvas');
      if (!canvas || !window.THREE) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.z = 5;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      const geometry = new THREE.IcosahedronGeometry(1.65, 2);
      const material = new THREE.MeshBasicMaterial({
        color: '${p.accentPrimary}',
        wireframe: true,
        transparent: true,
        opacity: 0.28
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      let mouseX = 0, mouseY = 0;
      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.6;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 0.6;
      });

      function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.y += 0.003;
        mesh.rotation.x += (mouseY - mesh.rotation.x) * 0.04;
        mesh.rotation.z += (mouseX - mesh.rotation.z) * 0.04;
        renderer.render(scene, camera);
      }
      animate();
    })();
  </script>
</body>
</html>`;
}

export function generateExportBundle(exp: PersonalizedExperience): ExportBundle {
  const standaloneHtml = generateStandaloneHtml(exp);
  const projectName = `persona-${exp.slug}`;

  const packageJson = JSON.stringify(
    {
      name: projectName,
      version: '1.0.0',
      private: true,
      description: `Personalized Digital Experience for ${exp.input.fullName} (${exp.intelligence.creativeDirection.archetypeName})`,
      scripts: {
        start: 'npx serve .',
      },
    },
    null,
    2
  );

  const readmeMd = `# ${exp.intelligence.storytelling.heroHeadline} — Personalized Digital Experience

> **Archetype**: ${exp.intelligence.creativeDirection.archetypeName}  
> **Linguistic Lineage**: ${exp.intelligence.nameResearch.linguisticFamily.value} (${exp.intelligence.nameResearch.phoneticIPA.value})  
> **Cultural Meridian**: ${exp.intelligence.culturalContext.geographicResonance.value.region}  
> **Harmonic Frequency**: ${exp.intelligence.planetary.rulingBody.value.harmonicFrequencyHz} Hz (${exp.intelligence.planetary.rulingBody.value.name})

## Epistemic Integrity Report

- **Verified Facts**: ${exp.intelligence.verification.breakdown.verifiedFactsCount}
- **User-Provided Facts**: ${exp.intelligence.verification.breakdown.userProvidedCount}
- **Astrological Symbolism**: ${exp.intelligence.verification.breakdown.astrologicalCount}
- **Creative Interpretations**: ${exp.intelligence.verification.breakdown.creativeInterpretationCount}

## Running Locally

Open \`index.html\` directly in any modern browser or run:

\`\`\`bash
npx serve .
\`\`\`
`;

  const files: ExportedFile[] = [
    {
      path: 'index.html',
      content: standaloneHtml,
      language: 'html',
    },
    {
      path: 'package.json',
      content: packageJson,
      language: 'json',
    },
    {
      path: 'README.md',
      content: readmeMd,
      language: 'markdown',
    },
    {
      path: 'src/experience-data.json',
      content: JSON.stringify(exp, null, 2),
      language: 'json',
    },
  ];

  return {
    slug: exp.slug,
    projectName,
    generatedAt: new Date().toISOString(),
    standaloneHtml,
    files,
  };
}
