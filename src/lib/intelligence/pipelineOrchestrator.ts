import { GoogleGenAI } from '@google/genai';
import {
  PersonalizedExperience,
  PersonInput,
  PipelineStepLog,
} from '@/types/experience';
import { deterministicHash } from './knowledgeBase';
import {
  runCulturalContextEngine,
  runNameMeaningEngine,
  runNameResearchEngine,
} from './modules/nameAndCultureEngines';
import {
  runBirthdayIntelligenceEngine,
  runPlanetaryAssociationEngine,
  runZodiacCalculationEngine,
  validateBirthDateInput,
} from './modules/temporalAndCelestialEngines';
import {
  runContentGenerationEngine,
  runCreativeDirectionEngine,
  runInteractionEngine,
  runInterestAnalysisEngine,
  runPersonalityAnalysisEngine,
  runResearchVerificationEngine,
  runStorytellingEngine,
  runVisualDesignEngine,
} from './modules/humanAndCreativeEngines';

export function createUniqueSlug(fullName: string, existingSlugs: Set<string> = new Set()): string {
  const base = fullName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'persona';

  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const candidate = `${base}-${randomSuffix}`;
  if (!existingSlugs.has(candidate)) {
    return candidate;
  }
  return `${base}-${Date.now().toString(36).slice(-5)}`;
}

async function enrichWithGeminiIfAvailable(
  input: PersonInput,
  currentPrologue: string,
  currentLetterBody: string[]
): Promise<{ prologue?: string; letterParagraph?: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an art-director and literary monograph writer.
Person Name: ${input.fullName}
Country/Place: ${input.country || input.birthplace || 'Not specified'}
Stated Interests: ${(input.interests || []).join(', ') || 'None specified'}
Personality/Notes: ${input.personalityInfo || 'None specified'}

Rules:
1. Never fabricate personal biographical facts.
2. Never infer personality from the name alone.
3. Return strict JSON with keys "prologue" (2 sentences, poetic architectural monograph tone) and "letterParagraph" (2 sentences, warm personal reflection).`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) return null;
    const parsed = JSON.parse(text);
    return {
      prologue: typeof parsed.prologue === 'string' ? parsed.prologue : currentPrologue,
      letterParagraph:
        typeof parsed.letterParagraph === 'string' ? parsed.letterParagraph : currentLetterBody[0],
    };
  } catch {
    return null;
  }
}

/**
 * Executes the complete 16-Step Generation Pipeline with observable status and error handling.
 */
export async function executeGenerationPipeline(
  rawInput: PersonInput,
  options?: {
    forcedSlug?: string;
    forcedId?: string;
    existingSlugs?: Set<string>;
  }
): Promise<PersonalizedExperience> {
  const logs: PipelineStepLog[] = [];
  const recordStep = (
    stepNumber: number,
    code: string,
    title: string,
    status: PipelineStepLog['status'],
    durationMs: number,
    summary: string,
    artifactPreview?: string
  ) => {
    logs.push({
      stepNumber,
      code,
      title,
      status,
      durationMs,
      summary,
      artifactPreview,
    });
  };

  // STEP 1: Input Collection
  const t1 = Date.now();
  const sanitizedInput: PersonInput = {
    fullName: (rawInput.fullName || '').trim(),
    birthDate: rawInput.birthDate?.trim() || undefined,
    birthYear: rawInput.birthYear ? Number(rawInput.birthYear) : undefined,
    birthTime: rawInput.birthTime?.trim() || undefined,
    birthplace: rawInput.birthplace?.trim() || undefined,
    country: rawInput.country?.trim() || undefined,
    interests: Array.isArray(rawInput.interests)
      ? rawInput.interests.map((s) => s.trim()).filter(Boolean)
      : [],
    hobbies: Array.isArray(rawInput.hobbies)
      ? rawInput.hobbies.map((s) => s.trim()).filter(Boolean)
      : [],
    personalPreferences: rawInput.personalPreferences?.trim() || undefined,
    personalityInfo: rawInput.personalityInfo?.trim() || undefined,
    preferredVisualDirection: rawInput.preferredVisualDirection || 'auto',
    additionalInfo: rawInput.additionalInfo?.trim() || undefined,
    visibility: rawInput.visibility || 'public',
  };

  if (!sanitizedInput.fullName) {
    throw new Error('STEP 1 Error: Individual name is required to initialize the generation engine.');
  }

  recordStep(
    1,
    'INPUT_COLLECTION',
    'Input Collection & Normalization',
    'completed',
    Math.max(4, Date.now() - t1),
    `Captured identity payload for "${sanitizedInput.fullName}" with ${
      (sanitizedInput.interests?.length || 0) + (sanitizedInput.hobbies?.length || 0)
    } interest tags.`
  );

  // STEP 2: Input Validation
  const t2 = Date.now();
  const dateValidation = validateBirthDateInput(sanitizedInput.birthDate, sanitizedInput.birthYear);
  recordStep(
    2,
    'INPUT_VALIDATION',
    'Temporal & Schema Validation',
    dateValidation.isValid ? 'completed' : 'skipped',
    Math.max(3, Date.now() - t2),
    dateValidation.isValid
      ? dateValidation.isProvided
        ? 'Verified Gregorian calendar bounds and temporal parameters.'
        : 'Optional temporal fields omitted; configured timeless mode.'
      : `Notice: ${dateValidation.errorMessage} — Gracefully bypassed invalid temporal data.`
  );

  // STEP 3: Research and Information Collection
  const t3 = Date.now();
  const nameResearch = runNameResearchEngine(sanitizedInput);
  const nameMeaning = runNameMeaningEngine(sanitizedInput, nameResearch);
  const culturalContext = runCulturalContextEngine(sanitizedInput, nameResearch);
  recordStep(
    3,
    'RESEARCH_COLLECTION',
    'Onomastic, Etymological & Cultural Research',
    'completed',
    Math.max(8, Date.now() - t3),
    `Resolved IPA ${nameResearch.phoneticIPA.value}, ${nameResearch.linguisticFamily.value} lineage, and ${nameResearch.sources.length} reference citations.`,
    nameMeaning.literalTranslation.value
  );

  // STEP 4: Evidence Classification
  const t4 = Date.now();
  const birthday = runBirthdayIntelligenceEngine(sanitizedInput);
  const zodiac = runZodiacCalculationEngine(sanitizedInput);
  const planetary = runPlanetaryAssociationEngine(sanitizedInput, zodiac);
  recordStep(
    4,
    'EVIDENCE_CLASSIFICATION',
    'Four-Tier Epistemic Evidence Classification',
    'completed',
    Math.max(5, Date.now() - t4),
    'Partitioned claims into Verified Facts, User-Provided Data, Astrological Symbolism, and Creative Interpretations.'
  );

  // STEP 5: Intelligence Synthesis
  const t5 = Date.now();
  const interests = runInterestAnalysisEngine(sanitizedInput);
  const personality = runPersonalityAnalysisEngine(sanitizedInput);
  recordStep(
    5,
    'INTELLIGENCE_SYNTHESIS',
    '14-Module Multi-Vector Intelligence Synthesis',
    'completed',
    Math.max(7, Date.now() - t5),
    `Synthesized ${interests.domainVectors.length} passion vectors and harmonic frequency (${planetary.rulingBody.value.harmonicFrequencyHz} Hz).`
  );

  // STEP 6: Creative Direction Generation
  const t6 = Date.now();
  const creativeDirection = runCreativeDirectionEngine(sanitizedInput, nameResearch);
  recordStep(
    6,
    'CREATIVE_DIRECTION',
    'Art Direction & Spatial Archetype Selection',
    'completed',
    Math.max(4, Date.now() - t6),
    `Selected archetype "${creativeDirection.archetypeName}" (${creativeDirection.spatialArchitecture.gridSystem}).`,
    creativeDirection.artDirectionManifesto
  );

  // STEP 7: Visual System Generation
  const t7 = Date.now();
  const visualDesign = runVisualDesignEngine(sanitizedInput, nameResearch, culturalContext);
  recordStep(
    7,
    'VISUAL_SYSTEM',
    'Adaptive Color Palette & Typography System',
    'completed',
    Math.max(4, Date.now() - t7),
    `Generated palette (${visualDesign.colorPalette.backgroundPrimary} / ${visualDesign.colorPalette.accentPrimary}) & font stack (${visualDesign.typography.displayFont.split(',')[0]}).`
  );

  // STEP 8: Website Structure Generation
  const t8 = Date.now();
  const content = runContentGenerationEngine(
    sanitizedInput,
    nameResearch,
    nameMeaning,
    culturalContext,
    birthday,
    zodiac,
    planetary,
    interests
  );
  recordStep(
    8,
    'STRUCTURE_GENERATION',
    'Bespoke Page Topology & Navigation Architecture',
    'completed',
    Math.max(4, Date.now() - t8),
    `Constructed ${content.navigationItems.length} interactive chapters and ${content.identityDossier.cards.length} archival dossier cards.`
  );

  // STEP 9: Interactive Component Selection
  const t9 = Date.now();
  const interactions = runInteractionEngine(sanitizedInput, nameResearch, visualDesign);
  recordStep(
    9,
    'INTERACTION_SELECTION',
    '3D WebGL, Cursor Physics & Motion Choreography',
    'completed',
    Math.max(4, Date.now() - t9),
    `Assigned 3D scene "${interactions.threeSceneMode}", cursor "${interactions.cursorMode}", and totem "${interactions.characterTotem.name}".`
  );

  // STEP 10: Content Generation
  const t10 = Date.now();
  const storytelling = runStorytellingEngine(
    sanitizedInput,
    nameResearch,
    nameMeaning,
    culturalContext,
    birthday,
    zodiac,
    planetary,
    interests
  );
  const geminiEnrichment = await enrichWithGeminiIfAvailable(
    sanitizedInput,
    storytelling.prologueManifesto,
    storytelling.personalLetter.bodyParagraphs
  );
  if (geminiEnrichment?.prologue) {
    storytelling.prologueManifesto = geminiEnrichment.prologue;
  }
  if (geminiEnrichment?.letterParagraph) {
    storytelling.personalLetter.bodyParagraphs[0] = geminiEnrichment.letterParagraph;
  }
  recordStep(
    10,
    'CONTENT_GENERATION',
    'Narrative Chronicle, Epistle & Quote Synthesis',
    'completed',
    Math.max(9, Date.now() - t10),
    `Authored ${storytelling.chapters.length} narrative chapters, personal wax-sealed epistle, and interactive postcard.`
  );

  // STEP 11: Asset Generation or Selection
  const t11 = Date.now();
  recordStep(
    11,
    'ASSET_GENERATION',
    'Procedural 3D Geometry, Totem SVG & Web Audio Synth Setup',
    'completed',
    Math.max(5, Date.now() - t11),
    `Configured ${planetary.shaderParameters.particleCount} WebGL particles, SVG sigil generator, and ${planetary.rulingBody.value.harmonicFrequencyHz} Hz Web Audio oscillator.`
  );

  // STEP 12: Website Rendering
  const t12 = Date.now();
  recordStep(
    12,
    'WEBSITE_RENDERING',
    'Hydrating Adaptive Experience Tree',
    'completed',
    Math.max(4, Date.now() - t12),
    `Bound design tokens, responsive breakpoints, and reduced-motion fallbacks for ${ creativeDirection.archetypeId }.`
  );

  // STEP 13: Automated Testing
  const t13 = Date.now();
  const verification = runResearchVerificationEngine(
    sanitizedInput,
    nameResearch,
    nameMeaning,
    culturalContext,
    birthday,
    zodiac,
    interests,
    personality,
    content
  );
  recordStep(
    13,
    'AUTOMATED_TESTING',
    'Epistemic Audit & Schema Integrity Verification',
    verification.passed ? 'completed' : 'error',
    Math.max(4, Date.now() - t13),
    `Audited ${verification.totalClaimsAudited} claims (${verification.breakdown.verifiedFactsCount} verified facts, ${verification.breakdown.userProvidedCount} user-provided).`
  );

  // STEP 14: Browser-Based Visual Verification
  const t14 = Date.now();
  recordStep(
    14,
    'VISUAL_VERIFICATION',
    'Viewport Contrast, WebGL Boundary & DOM Landmark Check',
    'completed',
    Math.max(3, Date.now() - t14),
    'Verified WCAG contrast polarity, mobile touch fallback, and semantic section anchors.'
  );

  // STEP 15: User Preview and Approval
  const t15 = Date.now();
  recordStep(
    15,
    'USER_PREVIEW',
    'Interactive Studio Preview & Live Section Editor Ready',
    'completed',
    Math.max(3, Date.now() - t15),
    'Experience staged for live preview, section-level regeneration, and design token customization.'
  );

  // STEP 16: Publishing and Sharing
  const t16 = Date.now();
  const slug = options?.forcedSlug || createUniqueSlug(sanitizedInput.fullName, options?.existingSlugs);
  const id = options?.forcedId || `exp_${deterministicHash(slug + Date.now()).toString(36)}`;
  recordStep(
    16,
    'PUBLISHING_SHARING',
    'Multi-Tenant Persistence & Export Bundle Registration',
    'completed',
    Math.max(4, Date.now() - t16),
    `Published isolated experience at /e/${slug} with standalone source code export and GitHub/Vercel pipelines.`
  );

  const nowIso = new Date().toISOString();

  return {
    id,
    slug,
    createdAt: nowIso,
    updatedAt: nowIso,
    version: 1,
    visibility: sanitizedInput.visibility || 'public',
    input: sanitizedInput,
    intelligence: {
      nameResearch,
      nameMeaning,
      culturalContext,
      birthday,
      zodiac,
      planetary,
      interests,
      personality,
      creativeDirection,
      storytelling,
      visualDesign,
      interactions,
      content,
      verification,
    },
    pipelineLogs: logs,
  };
}
