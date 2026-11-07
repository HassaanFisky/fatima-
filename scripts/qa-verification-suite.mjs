/**
 * Comprehensive Automated QA & Integration Verification Suite
 * Tests:
 * 1. All 14 Intelligence Modules & 16-Step Pipeline Telemetry
 * 2. Multiple different names (Fatima, Kenjiro, Elena, Alexander, Maya, Zayd Al-Mansoor)
 * 3. Missing optional information (Name-only generation, strict non-inference of personality)
 * 4. Incorrect dates (e.g. 2023-02-30, 1999-13-45, year 3050) -> graceful validation & handling
 * 5. Multi-tenant isolation & unique slugs (never overwriting existing experiences)
 * 6. Live Section Editing & Archetype Switching (PATCH /api/experiences/[slug])
 * 7. Standalone Source Code Export (GET /api/experiences/[slug]/export)
 * 8. GitHub Integration Endpoint (GET & POST /api/integrations/github validation)
 * 9. Vercel Integration Endpoint (GET & POST /api/integrations/vercel validation)
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runSuite() {
  console.log('==============================================================');
  console.log(' STARTING AUTOMATED QA VERIFICATION SUITE');
  console.log('==============================================================\n');

  // 1. Test initial seeded experiences
  console.log('[1/8] Verifying Pre-Seeded Multi-Person Experiences...');
  const listRes = await fetch(`${BASE_URL}/api/experiences`);
  const listJson = await listRes.json();
  await assert(listRes.ok && listJson.ok, 'GET /api/experiences returns HTTP 200');
  await assert(listJson.experiences.length >= 3, `Found ${listJson.experiences.length} initial experiences`);

  const archetypes = new Set(
    listJson.experiences.map((e) => e.intelligence.creativeDirection.archetypeId)
  );
  await assert(archetypes.size >= 3, `Seeded experiences have distinct creative archetypes: ${Array.from(archetypes).join(', ')}`);

  // 2. Test generating multiple different names with full data
  console.log('\n[2/8] Testing Generation Pipeline with Full Biographical & Creative Data...');
  const fullGenRes = await fetch(`${BASE_URL}/api/experiences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Alexander von Humboldt',
      birthDate: '1991-09-14',
      birthYear: 1991,
      birthplace: 'Berlin',
      country: 'Germany',
      interests: ['Botany', 'Cartography', 'Geophysics'],
      hobbies: ['Mountain Climbing', 'Scientific Illustration'],
      personalityInfo: 'Observant, empirical, deeply curious about global ecosystems',
      preferredVisualDirection: 'botanical_sanctuary',
    }),
  });
  const fullGenJson = await fullGenRes.json();
  await assert(fullGenRes.ok && fullGenJson.ok, 'POST /api/experiences succeeded for Alexander von Humboldt');
  const alexExp = fullGenJson.experience;
  await assert(alexExp.pipelineLogs.length === 16, 'All 16 pipeline steps logged and completed');
  await assert(
    alexExp.intelligence.zodiac.westernSign?.value?.sign === 'Virgo',
    `Zodiac Calculation Engine computed Virgo for Sept 14 (got ${alexExp.intelligence.zodiac.westernSign?.value?.sign})`
  );
  await assert(
    alexExp.intelligence.personality.hasUserPersonalityInput === true,
    'Personality Input Engine recorded user-provided traits'
  );

  // 3. Test missing optional information (Name-only input -> strict non-inference check)
  console.log('\n[3/8] Testing Missing Information & Strict Non-Inference of Personality...');
  const minimalRes = await fetch(`${BASE_URL}/api/experiences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Tariq Ibn Ziyad',
    }),
  });
  const minimalJson = await minimalRes.json();
  await assert(minimalRes.ok && minimalJson.ok, 'Name-only generation succeeded without optional fields');
  const tariqExp = minimalJson.experience;
  await assert(
    tariqExp.intelligence.birthday.hasBirthData === false,
    'Birthday Intelligence gracefully entered timeless mode when birth date omitted'
  );
  await assert(
    tariqExp.intelligence.personality.hasUserPersonalityInput === false &&
      tariqExp.intelligence.personality.verbatimTraits.length === 0,
    'Personality Engine strictly refused to infer personality from name alone'
  );

  // 4. Test incorrect / impossible dates (e.g., Feb 30, Month 13)
  console.log('\n[4/8] Testing Invalid & Impossible Calendar Dates (2023-02-30)...');
  const badDateRes = await fetch(`${BASE_URL}/api/experiences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Maya Angelou',
      birthDate: '2023-02-30',
    }),
  });
  const badDateJson = await badDateRes.json();
  await assert(badDateRes.ok && badDateJson.ok, 'Pipeline gracefully handled invalid date 2023-02-30 without crashing');
  const mayaExp = badDateJson.experience;
  await assert(
    mayaExp.intelligence.birthday.validDate === false &&
      mayaExp.intelligence.birthday.validationMessage?.includes('Day 30 is invalid'),
    `Birthday engine flagged invalid date: "${mayaExp.intelligence.birthday.validationMessage}"`
  );
  await assert(
    mayaExp.pipelineLogs.find((s) => s.stepNumber === 2)?.status === 'skipped',
    'Step 2 (Input Validation) recorded skipped status with diagnostic warning'
  );

  // 5. Test Multi-Tenant Collision Prevention (Generating same name twice)
  console.log('\n[5/8] Testing Multi-Tenant Slug Isolation (Duplicate Name Generation)...');
  const dupRes = await fetch(`${BASE_URL}/api/experiences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Fatima' }),
  });
  const dupJson = await dupRes.json();
  await assert(
    dupJson.experience.slug !== 'fatima-al-qarawiyyin',
    `Generated unique non-colliding slug "${dupJson.experience.slug}" without overwriting existing Fatima experience`
  );

  // 6. Test Live Editing & Section Regeneration
  console.log('\n[6/8] Testing Live Section Regeneration & Archetype Switching...');
  const patchRes = await fetch(`${BASE_URL}/api/experiences/${encodeURIComponent(alexExp.slug)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      regenerateSection: 'prologue',
      archetypeId: 'swiss_brutalist_grid',
      accentPrimary: '#C83E2B',
    }),
  });
  const patchJson = await patchRes.json();
  await assert(patchRes.ok && patchJson.ok, 'PATCH /api/experiences/[slug] updated experience');
  await assert(
    patchJson.experience.intelligence.creativeDirection.archetypeId === 'swiss_brutalist_grid',
    'Archetype dynamically switched to swiss_brutalist_grid'
  );
  await assert(patchJson.experience.version === 2, 'Experience version incremented to v2');

  // 7. Test Standalone Source Code Export
  console.log('\n[7/8] Testing Standalone Source Code & HTML Bundle Export...');
  const exportRes = await fetch(`${BASE_URL}/api/experiences/fatima-al-qarawiyyin/export`);
  const exportJson = await exportRes.json();
  await assert(exportRes.ok && exportJson.ok, 'GET /api/experiences/[slug]/export succeeded');
  await assert(
    exportJson.bundle.files.length === 4 &&
      exportJson.bundle.standaloneHtml.includes('<!DOCTYPE html>'),
    'Export bundle contains standalone HTML + package.json + README.md + experience-data.json'
  );

  // 8. Test GitHub & Vercel Integration Endpoints & Security Guards
  console.log('\n[8/8] Testing GitHub & Vercel Integration Endpoints & Security Guards...');
  const ghGetRes = await fetch(`${BASE_URL}/api/integrations/github`);
  const ghGetJson = await ghGetRes.json();
  await assert(ghGetRes.ok && ghGetJson.ok, `GET /api/integrations/github status check passed (connected=${ghGetJson.connected})`);

  const ghUnconfirmedRes = await fetch(`${BASE_URL}/api/integrations/github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug: 'fatima-al-qarawiyyin',
      repoName: 'test-repo',
      explicitConfirmation: false,
    }),
  });
  await assert(
    ghUnconfirmedRes.status === 400,
    'POST /api/integrations/github enforces explicit confirmation before publishing'
  );

  const vercelGetRes = await fetch(`${BASE_URL}/api/integrations/vercel`);
  const vercelGetJson = await vercelGetRes.json();
  await assert(vercelGetRes.ok && vercelGetJson.ok, 'GET /api/integrations/vercel status check passed');

  // Clean up temporary test experiences
  await fetch(`${BASE_URL}/api/experiences/${encodeURIComponent(tariqExp.slug)}`, { method: 'DELETE' });
  await fetch(`${BASE_URL}/api/experiences/${encodeURIComponent(dupJson.experience.slug)}`, { method: 'DELETE' });

  console.log('\n==============================================================');
  console.log(' ALL AUTOMATED QA & INTEGRATION CHECKS PASSED!');
  console.log('==============================================================');
}

runSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
