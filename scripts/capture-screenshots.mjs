import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);

const ARTIFACT_DIR =
  '/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/4e43c3fe-77b1-4e8b-bfb4-d78db11c3312';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

const TARGETS = [
  {
    name: 'studio_dashboard_desktop.png',
    url: `${BASE_URL}/`,
    width: 1440,
    height: 1080,
  },
  {
    name: 'experience_fatima_desktop.png',
    url: `${BASE_URL}/e/fatima-al-qarawiyyin`,
    width: 1440,
    height: 1080,
  },
  {
    name: 'experience_kenjiro_desktop.png',
    url: `${BASE_URL}/e/kenjiro-takahashi`,
    width: 1440,
    height: 1080,
  },
  {
    name: 'experience_elena_desktop.png',
    url: `${BASE_URL}/e/elena-rostova`,
    width: 1440,
    height: 1080,
  },
  {
    name: 'experience_fatima_mobile.png',
    url: `${BASE_URL}/e/fatima-al-qarawiyyin`,
    width: 390,
    height: 844,
  },
];

async function captureAll() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  for (const t of TARGETS) {
    const outPath = path.join(ARTIFACT_DIR, t.name);
    console.log(`Capturing ${t.url} (${t.width}x${t.height}) -> ${outPath}`);
    await execFileAsync(
      '/usr/bin/chromium',
      [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        '--hide-scrollbars',
        `--window-size=${t.width},${t.height}`,
        '--virtual-time-budget=3500',
        `--screenshot=${outPath}`,
        t.url,
      ],
      { timeout: 30000 }
    );
    console.log(`  ✓ Saved ${t.name}`);
  }
}

captureAll().catch((err) => {
  console.error('Screenshot capture error:', err);
  process.exit(1);
});
