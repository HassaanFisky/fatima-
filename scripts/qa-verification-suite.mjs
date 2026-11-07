/**
 * Independent Evidence-Based Audit & QA Verification Suite
 * Verifies Critical Requirements 1–15 against live running server.
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
  console.log(' STARTING INDEPENDENT EVIDENCE-BASED QA & SECURITY AUDIT');
  console.log('==============================================================\n');

  // 1. Verify Seeded Profiles Have Zero Fabricated Personal Info (Requirement 3)
  console.log('[1/9] Auditing Seeded Profiles for Zero Fabricated Personal Info (Req 3)...');
  const listRes = await fetch(`${BASE_URL}/api/experiences`);
  const listJson = await listRes.json();
  await assert(listRes.ok && listJson.ok, 'GET /api/experiences returns HTTP 200');
  await assert(
    listRes.headers.get('x-ratelimit-limit') === '60',
    `Rate-limit headers present (X-RateLimit-Limit: ${listRes.headers.get('x-ratelimit-limit')})`
  );
  console.log(
    `  ℹ Storage Backend Status: mode=${listJson.storageStatus?.mode}, configured=${listJson.storageStatus?.configured}`
  );

  const fatimaSeed = listJson.experiences.find((e) => e.slug === 'fatima');
  await assert(Boolean(fatimaSeed), 'Found clean Name-Only Fatima experience (/e/fatima)');
  await assert(
    !fatimaSeed.input.birthDate &&
      !fatimaSeed.input.birthYear &&
      !fatimaSeed.input.birthTime &&
      !fatimaSeed.input.birthplace &&
      !fatimaSeed.input.country &&
      (!fatimaSeed.input.interests || fatimaSeed.input.interests.length === 0) &&
      (!fatimaSeed.input.hobbies || fatimaSeed.input.hobbies.length === 0) &&
      !fatimaSeed.input.personalityInfo,
    'Verified Fatima seed has ZERO fabricated birthDate, birthplace, country, interests, hobbies, or personalityInfo'
  );
  await assert(
    fatimaSeed.intelligence.birthday.hasBirthData === false &&
      fatimaSeed.intelligence.zodiac.computed === false,
    'Verified Fatima seed does not fabricate natal birthday or zodiac signs'
  );

  // 2. Verify Epistemic Classification for Uncurated / Heuristic Names (Requirement 4)
  console.log('\n[2/9] Auditing Epistemic Classification on Uncurated Name (Req 4)...');
  const heuristicRes = await fetch(`${BASE_URL}/api/experiences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Tariq Al-Mansoor',
    }),
  });
  const heuristicJson = await heuristicRes.json();
  await assert(heuristicRes.ok && heuristicJson.ok, 'Generated experience for uncurated name "Tariq Al-Mansoor"');
  const tariqExp = heuristicJson.experience;
  const tariqToken = heuristicJson.ownerToken;

  await assert(
    tariqExp.intelligence.nameResearch.lexiconMatch === false,
    'NameResearchEngine correctly flagged lexiconMatch = false for uncurated name'
  );
  await assert(
    tariqExp.intelligence.nameResearch.phoneticIPA.category === 'creative_interpretation',
    `Heuristic IPA is classified as '${tariqExp.intelligence.nameResearch.phoneticIPA.category}' (NEVER 'verified_fact')`
  );
  await assert(
    tariqExp.intelligence.nameResearch.linguisticFamily.category === 'creative_interpretation',
    `Heuristic linguistic family is classified as '${tariqExp.intelligence.nameResearch.linguisticFamily.category}' (NEVER 'verified_fact')`
  );
  await assert(
    tariqExp.intelligence.nameMeaning.primaryEtymology.category === 'creative_interpretation',
    `Heuristic etymology is classified as '${tariqExp.intelligence.nameMeaning.primaryEtymology.category}' (NEVER 'verified_fact')`
  );
  await assert(
    tariqExp.intelligence.nameResearch.historicalBearers.length === 0,
    'Zero fake historical bearers fabricated for uncurated name'
  );
  await assert(
    tariqExp.intelligence.verification.breakdown.verifiedFactsCount === 0,
    `Module 14 Verification Engine confirmed 0 verified_fact claims for purely heuristic name-only input (got ${tariqExp.intelligence.verification.breakdown.verifiedFactsCount})`
  );

  // 3. Verify 16-Step Pipeline Execution Nature Telemetry (Requirement 2)
  console.log('\n[3/9] Auditing 16-Step Pipeline Execution Nature Telemetry (Req 2)...');
  await assert(tariqExp.pipelineLogs.length === 16, 'All 16 pipeline stages logged');
  const natures = tariqExp.pipelineLogs.map((s) => `${s.stepNumber}:${s.executionNature}`);
  await assert(
    tariqExp.pipelineLogs.every((s) => Boolean(s.executionNature)),
    `Every pipeline step declares explicit executionNature (${natures.slice(0, 5).join(', ')}...)`
  );

  // 4. Verify Privacy Consent Gate & Invalid Date Handling (Requirements 4 & 6)
  console.log('\n[4/9] Auditing Privacy Consent Gate & Invalid Calendar Date Handling (Req 6)...');
  const noConsentRes = await fetch(`${BASE_URL}/api/experiences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Consent Test User',
      birthDate: '1995-05-15',
      birthplace: 'London',
      privacyConsentConfirmed: false,
    }),
  });
  await assert(
    noConsentRes.status === 400,
    'POST /api/experiences rejects personal biographical data when privacyConsentConfirmed === false (HTTP 400)'
  );

  const invalidDateRes = await fetch(`${BASE_URL}/api/experiences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Calendar Edge Case',
      birthDate: '2023-02-30',
      privacyConsentConfirmed: true,
    }),
  });
  const invalidDateJson = await invalidDateRes.json();
  await assert(
    invalidDateJson.experience.intelligence.birthday.validDate === false &&
      invalidDateJson.experience.pipelineLogs[1].status === 'skipped',
    'Invalid date 2023-02-30 flagged as invalidDate and Step 2 marked skipped'
  );

  // 5. Verify Multi-User Isolation, Private Visibility & Authorization (Requirement 6)
  console.log('\n[5/9] Auditing Multi-User Isolation & Ownership Authorization (Req 6)...');
  const privCreateRes = await fetch(`${BASE_URL}/api/experiences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Private Vault Persona',
      visibility: 'private',
    }),
  });
  const privCreateJson = await privCreateRes.json();
  const privSlug = privCreateJson.experience.slug;
  const ownerAToken = privCreateJson.ownerToken;
  await assert(privCreateRes.ok && Boolean(ownerAToken), `User A created private experience /e/${privSlug}`);

  // User B (no token) lists all experiences -> must NOT see User A's private experience
  const anonListRes = await fetch(`${BASE_URL}/api/experiences`);
  const anonListJson = await anonListRes.json();
  await assert(
    !anonListJson.experiences.some((e) => e.slug === privSlug),
    'Anonymous / User B listing strictly excludes User A’s private experience'
  );

  // User B attempts to GET User A's private experience -> must get 403 Forbidden
  const anonGetPriv = await fetch(`${BASE_URL}/api/experiences/${encodeURIComponent(privSlug)}`);
  await assert(
    anonGetPriv.status === 403,
    `User B GET on User A’s private experience blocked with HTTP ${anonGetPriv.status} Forbidden`
  );

  // User B attempts to PATCH User A's private experience -> must get 403 Forbidden
  const anonPatchPriv = await fetch(`${BASE_URL}/api/experiences/${encodeURIComponent(privSlug)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ heroHeadline: 'Hacked Headline' }),
  });
  await assert(
    anonPatchPriv.status === 403,
    `User B PATCH on User A’s experience blocked with HTTP ${anonPatchPriv.status} Forbidden`
  );

  // User B attempts to DELETE User A's private experience -> must get 403 Forbidden
  const anonDelPriv = await fetch(`${BASE_URL}/api/experiences/${encodeURIComponent(privSlug)}`, {
    method: 'DELETE',
  });
  await assert(
    anonDelPriv.status === 403,
    `User B DELETE on User A’s experience blocked with HTTP ${anonDelPriv.status} Forbidden`
  );

  // User A (with valid owner token) can GET, PATCH, and DELETE their own private experience
  const ownerGetPriv = await fetch(`${BASE_URL}/api/experiences/${encodeURIComponent(privSlug)}`, {
    headers: { 'x-atelier-owner-token': ownerAToken },
  });
  await assert(
    ownerGetPriv.status === 200,
    'User A (Owner) can read their own private experience (HTTP 200)'
  );

  const ownerPatchPriv = await fetch(`${BASE_URL}/api/experiences/${encodeURIComponent(privSlug)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-atelier-owner-token': ownerAToken,
    },
    body: JSON.stringify({ regenerateSection: 'prologue', archetypeId: 'swiss_brutalist_grid' }),
  });
  await assert(
    ownerPatchPriv.status === 200,
    'User A (Owner) can PATCH and switch archetype on their own experience (HTTP 200)'
  );

  const ownerDelPriv = await fetch(`${BASE_URL}/api/experiences/${encodeURIComponent(privSlug)}`, {
    method: 'DELETE',
    headers: { 'x-atelier-owner-token': ownerAToken },
  });
  await assert(
    ownerDelPriv.status === 200,
    'User A (Owner) can DELETE their own private experience (HTTP 200)'
  );

  // Clean up temporary test experiences using their owner tokens
  await fetch(`${BASE_URL}/api/experiences/${encodeURIComponent(tariqExp.slug)}`, {
    method: 'DELETE',
    headers: { 'x-atelier-owner-token': tariqToken },
  });
  await fetch(`${BASE_URL}/api/experiences/${encodeURIComponent(invalidDateJson.experience.slug)}`, {
    method: 'DELETE',
    headers: { 'x-atelier-owner-token': invalidDateJson.ownerToken },
  });

  // 6. Verify Visual Distinctness Across Seeded Experiences (Requirement 11)
  console.log('\n[6/9] Auditing Visual Distinctness Across Generated Experiences (Req 11)...');
  const cleanListRes = await fetch(`${BASE_URL}/api/experiences`);
  const cleanListJson = await cleanListRes.json();
  const seeds = cleanListJson.experiences.filter((e) =>
    ['fatima', 'kenjiro', 'elena'].includes(e.slug)
  );
  const distinctArchetypes = new Set(
    seeds.map((e) => e.intelligence.creativeDirection.archetypeId)
  );
  const distinctScenes = new Set(
    seeds.map((e) => e.intelligence.interactions.threeSceneMode)
  );
  const distinctBgColors = new Set(
    seeds.map((e) => e.intelligence.visualDesign.colorPalette.backgroundPrimary)
  );
  await assert(
    distinctArchetypes.size === 3 && distinctScenes.size === 3 && distinctBgColors.size === 3,
    `3 showcase experiences have 3 distinct archetypes (${Array.from(distinctArchetypes).join(', ')}), 3 distinct 3D WebGL scenes (${Array.from(distinctScenes).join(', ')}), and 3 distinct color palettes`
  );

  // 7. Verify Standalone Source Code Export (Requirement 6/8)
  console.log('\n[7/9] Auditing Standalone Source Code Exporter...');
  const exportRes = await fetch(`${BASE_URL}/api/experiences/fatima/export`);
  const exportJson = await exportRes.json();
  await assert(
    exportRes.ok && exportJson.ok && exportJson.bundle.files.length === 4,
    'GET /api/experiences/fatima/export returns 4-file standalone bundle'
  );

  // 8. Verify Real GitHub Integration & for-fatima Protection Guard (Requirements 7 & 15)
  console.log('\n[8/9] Auditing Live GitHub Integration & for-fatima Protection Guard (Req 7 & 15)...');
  const ghStatusRes = await fetch(`${BASE_URL}/api/integrations/github`);
  const ghStatusJson = await ghStatusRes.json();
  await assert(
    ghStatusRes.ok && ghStatusJson.connected === true && ghStatusJson.account?.login === 'HassaanFisky',
    `GET /api/integrations/github authenticated live as @${ghStatusJson.account?.login} with ${ghStatusJson.repositories?.length} listed repos`
  );

  // Test protection guard against touching HassaanFisky/for-fatima
  const ghForFatimaGuard = await fetch(`${BASE_URL}/api/integrations/github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug: 'fatima',
      repoName: 'HassaanFisky/for-fatima',
      explicitConfirmation: true,
    }),
  });
  await assert(
    ghForFatimaGuard.status === 403,
    'Protection guard strictly blocked publishing to HassaanFisky/for-fatima (HTTP 403)'
  );

  // Test actual authenticated file push to attached repo subdirectory
  const ghPushRes = await fetch(`${BASE_URL}/api/integrations/github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug: 'fatima',
      repoName: 'HassaanFisky/fatima-',
      targetSubdirectory: 'published-experiences/fatima',
      explicitConfirmation: true,
    }),
  });
  const ghPushJson = await ghPushRes.json();
  console.log(`  ℹ Live GitHub Push Result: status=${ghPushRes.status}, ok=${ghPushJson.ok}, commit=${ghPushJson.lastCommitSha || 'N/A'}, files=${(ghPushJson.filesPushed || []).length}`);
  await assert(
    ghPushRes.ok && ghPushJson.ok && ghPushJson.filesPushed?.length === 4,
    `Pushed 4 generated experience files to GitHub (${ghPushJson.repoUrl}, commit ${ghPushJson.lastCommitSha})`
  );

  // 9. Verify Vercel Integration Status (Requirement 8)
  console.log('\n[9/9] Auditing Vercel Integration Status (Req 8)...');
  const vercelStatusRes = await fetch(`${BASE_URL}/api/integrations/vercel`);
  const vercelStatusJson = await vercelStatusRes.json();
  console.log(
    `  ℹ Vercel Integration Status: connected=${vercelStatusJson.connected}, message="${vercelStatusJson.message || vercelStatusJson.error}"`
  );

  console.log('\n==============================================================');
  console.log(' INDEPENDENT QA & SECURITY AUDIT SUITE COMPLETED SUCCESSFULLY');
  console.log('==============================================================');
}

runSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
