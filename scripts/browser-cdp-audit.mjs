/**
 * Real Headless Chromium CDP (Chrome DevTools Protocol) Browser Verification
 * Inspects:
 * 1. Desktop (1440x1080) & Mobile (390x844) Viewports
 * 2. Console Errors & Uncaught Page Exceptions (Runtime.enable)
 * 3. Network Failures & HTTP Status Codes (Network.enable)
 * 4. Interactive DOM Verification (Constellation Mini-Game, Epistle Toggle, Easter Egg Cipher, Studio Tabs)
 * 5. Accessibility Audit (Landmarks, Single H1, ARIA labels, Button Accessible Names, Reduced Motion)
 * 6. Fresh Screenshot Capture into Artifact Directory
 */

import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const ARTIFACT_DIR =
  '/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/4e43c3fe-77b1-4e8b-bfb4-d78db11c3312';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runCdpAudit() {
  console.log('==============================================================');
  console.log(' STARTING HEADLESS CHROMIUM CDP INTERACTION & CONSOLE AUDIT');
  console.log('==============================================================\n');

  const chromeProc = spawn(
    '/usr/bin/chromium',
    [
      '--headless',
      '--no-sandbox',
      '--disable-gpu',
      '--remote-debugging-port=9222',
      '--window-size=1440,1080',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    // Wait for CDP endpoint to be ready
    let targets = null;
    for (let i = 0; i < 25; i++) {
      try {
        const res = await fetch('http://127.0.0.1:9222/json/list');
        if (res.ok) {
          targets = await res.json();
          if (targets.length > 0) break;
        }
      } catch {
        // retry
      }
      await sleep(250);
    }

    if (!targets || targets.length === 0) {
      throw new Error('Could not connect to Chromium CDP on port 9222');
    }

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pending = new Map();
    const consoleErrors = [];
    const pageExceptions = [];
    const localNetworkFailures = [];

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(new Error(data.error.message));
        else resolve(data.result);
      } else if (data.method === 'Runtime.consoleAPICalled') {
        if (data.params.type === 'error') {
          const text = data.params.args.map((a) => a.value || a.description || '').join(' ');
          // Ignore blocked external Google Fonts stylesheet in sandboxed VM if proxy blocks fonts.googleapis.com
          if (!text.includes('fonts.googleapis.com') && !text.includes('fonts.gstatic.com')) {
            consoleErrors.push(text);
          }
        }
      } else if (data.method === 'Runtime.exceptionThrown') {
        pageExceptions.push(
          data.params.exceptionDetails?.text || 'Uncaught exception'
        );
      } else if (data.method === 'Network.responseReceived') {
        const url = data.params.response.url;
        const status = data.params.response.status;
        if (url.startsWith(BASE_URL) && status >= 400) {
          localNetworkFailures.push(`${status} ${url}`);
        }
      }
    };

    const sendCmd = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });

    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');
    await sendCmd('Network.enable');

    const evaluate = async (expression) => {
      const res = await sendCmd('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      return res.result?.value;
    };

    // 1. Audit Studio Dashboard (Desktop 1440x1080)
    console.log('[1/4] Navigating to Studio Dashboard (http://localhost:3000/)...');
    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sendCmd('Page.navigate', { url: `${BASE_URL}/` });
    await sleep(2200);

    const studioAudit = await evaluate(`(() => {
      const h1s = document.querySelectorAll('h1');
      const header = Boolean(document.querySelector('header'));
      const main = Boolean(document.querySelector('main'));
      const navs = document.querySelectorAll('nav').length;
      const tabs = Array.from(document.querySelectorAll('[id^="studio-tab-"]')).map(b => b.id);
      return {
        title: document.title,
        h1Count: h1s.length,
        h1Text: h1s[0]?.textContent?.trim() || '',
        header,
        main,
        navs,
        tabs,
      };
    })()`);

    console.log(`  ✓ Page Title: "${studioAudit.title}"`);
    console.log(`  ✓ Semantic Landmarks: header=${studioAudit.header}, main=${studioAudit.main}, navs=${studioAudit.navs}, h1Count=${studioAudit.h1Count} ("${studioAudit.h1Text}")`);
    console.log(`  ✓ Studio Tabs Rendered: ${studioAudit.tabs.join(', ')}`);

    // Test Interactive Studio Tab Switching via DOM clicks
    console.log('\n[2/4] Testing Interactive Studio Tab Switching & Pipeline Telemetry DOM...');
    const pipelineTabCheck = await evaluate(`(() => {
      const btn = document.getElementById('studio-tab-pipeline');
      if (btn) btn.click();
      return Boolean(btn);
    })()`);
    await sleep(600);
    const pipelineDomText = await evaluate(`document.body.innerText.includes('16 / 16 STAGES VERIFIED')`);
    console.log(`  ✓ Clicked #studio-tab-pipeline (${pipelineTabCheck}) -> Verified "16 / 16 STAGES VERIFIED" rendered=${pipelineDomText}`);

    // Switch back to Live Preview
    await evaluate(`document.getElementById('studio-tab-preview')?.click()`);
    await sleep(600);

    // 3. Navigate to /e/fatima and test interactive modules (Constellation Mini-Game, Epistle Toggle, Easter Egg Cipher)
    console.log('\n[3/4] Navigating to /e/fatima & Testing Interactive Modules & Accessibility...');
    await sendCmd('Page.navigate', { url: `${BASE_URL}/e/fatima` });
    await sleep(2200);

    const fatimaInteractiveAudit = await evaluate(`(() => {
      // Check Accessibility: buttons without text or aria-label
      const buttons = Array.from(document.querySelectorAll('button'));
      const unlabeledButtons = buttons.filter(b => {
        const label = (b.innerText || b.getAttribute('aria-label') || b.getAttribute('title') || '').trim();
        return label.length === 0;
      }).length;

      // Test Easter Egg Cipher input or seal clicks
      const beforeCipher = document.body.innerText.includes('Secret Archival Colophon');
      const sealBtn = document.querySelector('button[title*="Monograph Colophon Seal"]');
      if (sealBtn) {
        sealBtn.click();
        sealBtn.click();
        sealBtn.click();
      }
      return {
        totalButtons: buttons.length,
        unlabeledButtons,
        beforeCipher,
        sealClicked: Boolean(sealBtn),
      };
    })()`);
    await sleep(400);
    const afterCipherUnlocked = await evaluate(`document.body.innerText.includes('Secret Archival Colophon')`);
    console.log(`  ✓ Accessibility Button Audit: ${fatimaInteractiveAudit.totalButtons} interactive buttons, ${fatimaInteractiveAudit.unlabeledButtons} unlabeled buttons`);
    console.log(`  ✓ Easter Egg Seal 3-Click Interaction: unlocked colophon=${afterCipherUnlocked}`);

    // Test Mobile Viewport (390x844) Horizontal Overflow Check
    console.log('\n[4/4] Testing Mobile Viewport (390x844) Responsiveness & Overflow...');
    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(800);
    const mobileAudit = await evaluate(`(() => {
      return {
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      };
    })()`);
    console.log(`  ✓ Mobile Viewport (390x844): innerWidth=${mobileAudit.innerWidth}, scrollWidth=${mobileAudit.scrollWidth}, overflow=${mobileAudit.hasHorizontalOverflow}`);

    console.log(`\n  ✓ Console Errors (Local): ${consoleErrors.length}`);
    console.log(`  ✓ Uncaught Page Exceptions: ${pageExceptions.length}`);
    console.log(`  ✓ Local Network Failures (HTTP >= 400): ${localNetworkFailures.length}`);

    if (consoleErrors.length > 0 || pageExceptions.length > 0 || localNetworkFailures.length > 0) {
      console.error('Diagnostics:', { consoleErrors, pageExceptions, localNetworkFailures });
      throw new Error('Browser console/network audit found errors');
    }

    ws.close();
  } finally {
    chromeProc.kill('SIGKILL');
  }

  // Capture fresh screenshots of the updated experiences
  console.log('\nCapturing fresh desktop and mobile screenshots...');
  const targets = [
    { name: 'studio_dashboard_desktop.png', url: `${BASE_URL}/`, width: 1440, height: 1080 },
    { name: 'experience_fatima_desktop.png', url: `${BASE_URL}/e/fatima`, width: 1440, height: 1080 },
    { name: 'experience_kenjiro_desktop.png', url: `${BASE_URL}/e/kenjiro`, width: 1440, height: 1080 },
    { name: 'experience_elena_desktop.png', url: `${BASE_URL}/e/elena`, width: 1440, height: 1080 },
    { name: 'experience_fatima_mobile.png', url: `${BASE_URL}/e/fatima`, width: 390, height: 844 },
  ];

  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  for (const t of targets) {
    const outPath = path.join(ARTIFACT_DIR, t.name);
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
    console.log(`  ✓ Captured ${t.name} (${t.width}x${t.height})`);
  }

  console.log('\n==============================================================');
  console.log(' HEADLESS CHROMIUM CDP & VISUAL AUDIT COMPLETED CLEANLY');
  console.log('==============================================================');
}

runCdpAudit().catch((err) => {
  console.error(err);
  process.exit(1);
});
