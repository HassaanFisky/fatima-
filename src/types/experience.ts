/**
 * Core Domain & Epistemic Architecture Types
 * Personalized Digital Experience Generation Engine
 */

export type EpistemicCategory =
  | 'verified_fact'
  | 'user_provided'
  | 'astrological_interpretation'
  | 'creative_interpretation';

export interface EpistemicClaim<T = string> {
  value: T;
  category: EpistemicCategory;
  source?: string;
  confidence?: number;
  notes?: string;
}

export interface SourceReference {
  id: string;
  title: string;
  domain: string;
  url: string;
  category: 'linguistic' | 'historical' | 'cultural' | 'astronomical' | 'user_input';
  verified: boolean;
}

export interface PersonInput {
  fullName: string;
  birthDate?: string; // YYYY-MM-DD
  birthYear?: number;
  birthTime?: string; // HH:mm
  birthplace?: string;
  country?: string;
  interests?: string[];
  hobbies?: string[];
  personalPreferences?: string;
  personalityInfo?: string;
  preferredVisualDirection?: ArchetypeId | 'auto';
  additionalInfo?: string;
  visibility?: 'public' | 'unlisted' | 'private';
}

export type ArchetypeId =
  | 'editorial_monograph'
  | 'celestial_observatory'
  | 'kinetic_atelier'
  | 'botanical_sanctuary'
  | 'swiss_brutalist_grid'
  | 'ethereal_storybook';

export type ThreeSceneMode =
  | 'orbital_sanctuary'
  | 'kinetic_monogram'
  | 'botanical_particles'
  | 'bauhaus_totem'
  | 'celestial_vault';

export type CursorMode =
  | 'magnetic_ring'
  | 'stardust_trail'
  | 'editorial_crosshair'
  | 'ambient_spotlight'
  | 'minimal_precision';

export type CharacterTotemType =
  | 'celestial_astrolabe'
  | 'origami_guardian'
  | 'kinetic_polyhedron'
  | 'botanical_spirit'
  | 'architectural_monolith';

/**
 * 14 Intelligence Engine Module Outputs
 */

// 1. Name Research Engine
export interface NameResearchOutput {
  normalizedName: string;
  firstName: string;
  surname?: string;
  phoneticIPA: EpistemicClaim<string>;
  syllableCount: number;
  syllableBreakdown: string[];
  sonicProfile: EpistemicClaim<{
    cadence: 'flowing' | 'percussive' | 'balanced' | 'lyrical' | 'resonant';
    dominantVowels: string[];
    acousticWarmth: number; // 0-100
    rhythmPattern: string;
  }>;
  linguisticFamily: EpistemicClaim<string>;
  scriptVariations: Array<{
    scriptName: string;
    representation: string;
    note: string;
  }>;
  historicalBearers: Array<{
    name: string;
    era: string;
    achievement: string;
    source: string;
  }>;
  sources: SourceReference[];
}

// 2. Name Meaning Engine
export interface NameMeaningOutput {
  primaryEtymology: EpistemicClaim<string>;
  literalTranslation: EpistemicClaim<string>;
  rootWords: Array<{
    root: string;
    language: string;
    meaning: string;
  }>;
  semanticFields: EpistemicClaim<string[]>;
  symbolicMotifs: EpistemicClaim<string[]>;
  epistemicDisclaimer: string;
}

// 3. Cultural Context Engine
export interface CulturalContextOutput {
  heritageSynthesis: EpistemicClaim<string>;
  geographicResonance: EpistemicClaim<{
    region: string;
    coordinates: { lat: number; lng: number };
    architecturalVernacular: string;
    traditionalCraft: string;
  }>;
  artisticTraditions: EpistemicClaim<string[]>;
  colorHeritage: Array<{
    name: string;
    hex: string;
    culturalOrigin: string;
  }>;
  literaryOrPhilosophicalEcho: EpistemicClaim<{
    quote: string;
    attribution: string;
    tradition: string;
  }>;
}

// 4. Birthday Intelligence Engine
export interface BirthdayIntelligenceOutput {
  hasBirthData: boolean;
  validDate: boolean;
  validationMessage?: string;
  dayOfWeek?: EpistemicClaim<string>;
  season?: EpistemicClaim<'Spring' | 'Summer' | 'Autumn' | 'Winter'>;
  dayOfYear?: number;
  lifePathNumber?: EpistemicClaim<{
    number: number;
    archetypeTitle: string;
    interpretation: string;
  }>;
  birthstone?: EpistemicClaim<{
    name: string;
    hexColor: string;
    mineralFamily: string;
  }>;
  birthFlower?: EpistemicClaim<{
    name: string;
    botanicalName: string;
    symbolism: string;
  }>;
  historicalEventsOnDay: Array<{
    year: number;
    event: string;
    source: string;
  }>;
}

// 5. Zodiac Calculation Engine
export interface ZodiacCalculationOutput {
  computed: boolean;
  westernSign?: EpistemicClaim<{
    sign: string;
    symbol: string;
    unicodeGlyph: string;
    element: 'Fire' | 'Earth' | 'Air' | 'Water';
    modality: 'Cardinal' | 'Fixed' | 'Mutable';
    polarity: 'Diurnal' | 'Nocturnal';
    decan: number;
    dateRange: string;
    symbolicThemes: string[];
  }>;
  lunarYearSign?: EpistemicClaim<{
    animal: string;
    element: string;
    yinYang: 'Yin' | 'Yang';
    symbolicQualities: string[];
  }>;
}

// 6. Planetary Association Engine
export interface PlanetaryAssociationOutput {
  rulingBody: EpistemicClaim<{
    name: string;
    classicalSymbol: string;
    orbitalPeriodDays: number;
    axialTiltDegrees: number;
    albedo: number;
    dominantSpectrumHex: string;
    secondarySpectrumHex: string;
    harmonicFrequencyHz: number; // Used by Web Audio synthesizer
    ringSystem: boolean;
    moonCount: number;
    poeticEpithet: string;
  }>;
  shaderParameters: {
    orbitSpeed: number;
    particleCount: number;
    turbulence: number;
    bloomIntensity: number;
    wireframeRatio: number;
  };
}

// 7. Interest Analysis Engine
export interface InterestAnalysisOutput {
  hasUserInterests: boolean;
  rawInterests: string[];
  domainVectors: Array<{
    domain: string;
    weight: number; // 0-100
    matchedKeywords: string[];
    visualMetaphor: string;
    interactiveFeatureSuggestion: string;
  }>;
  synthesizedPassionsNarrative: EpistemicClaim<string>;
}

// 8. Personality Input Analysis Engine
export interface PersonalityAnalysisOutput {
  hasUserPersonalityInput: boolean;
  verbatimTraits: string[];
  toneOfVoice: EpistemicClaim<{
    warmth: number; // 0-100
    formality: number; // 0-100
    kineticEnergy: number; // 0-100
    introspection: number; // 0-100
    editorialStyle: string;
  }>;
  strictNonInferenceNotice: string;
}

// 9. Creative Direction Engine
export interface CreativeDirectionOutput {
  archetypeId: ArchetypeId;
  archetypeName: string;
  artDirectionManifesto: string;
  moodKeywords: string[];
  spatialArchitecture: {
    gridSystem: 'asymmetric-12' | 'editorial-split' | 'radial-observatory' | 'swiss-modular' | 'flowing-manuscript';
    whitespaceRatio: 'generous' | 'balanced' | 'dense-architectural';
    sectionRhythm: string;
  };
  lightingAndAtmosphere: {
    themePolarity: 'dark-obsidian' | 'warm-parchment' | 'midnight-indigo' | 'botanical-alabaster' | 'stark-monochrome' | 'twilight-saffron';
    grainOpacity: number;
    ambientGlowIntensity: number;
  };
}

// 10. Storytelling Engine
export interface StorytellingOutput {
  heroHeadline: string;
  heroSubheadline: string;
  prologueManifesto: string;
  chapters: Array<{
    id: string;
    chapterNumber: string;
    title: string;
    subtitle: string;
    narrativeBody: string;
    pullQuote: string;
    epistemicTag: EpistemicCategory;
  }>;
  personalLetter: {
    salutation: string;
    bodyParagraphs: string[];
    valediction: string;
    signature: string;
  };
  curatedQuotes: Array<{
    text: string;
    author: string;
    context: string;
  }>;
}

// 11. Visual Design Intelligence
export interface VisualDesignSystem {
  colorPalette: {
    backgroundPrimary: string;
    backgroundElevated: string;
    surfaceGlass: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accentPrimary: string;
    accentSecondary: string;
    accentTertiary: string;
    borderSubtle: string;
  };
  typography: {
    displayFont: string;
    serifFont: string;
    sansFont: string;
    monoFont: string;
    displayTracking: string;
    heroScaleRem: number;
  };
  borderRadiusToken: '0px' | '6px' | '14px' | '24px';
  borderTreatment: 'hairline-architectural' | 'soft-organic' | 'double-editorial' | 'minimal-none';
  backgroundTreatment: 'topographic- contours' | 'celestial-starfield' | 'architectural-draft' | 'organic-paper' | 'kinetic-minimal';
}

// 12. Interaction Recommendation Engine
export interface InteractionConfig {
  threeSceneMode: ThreeSceneMode;
  cursorMode: CursorMode;
  characterTotem: {
    type: CharacterTotemType;
    name: string;
    symbolism: string;
    primaryColor: string;
    secondaryColor: string;
    interactiveBehavior: string;
  };
  enabledModules: {
    threeHeroCanvas: boolean;
    magneticCursor: boolean;
    tiltCards: boolean;
    personalLetterEnvelope: boolean;
    digitalPostcardStudio: boolean;
    harmonicAudioSynth: boolean;
    constellationMiniGame: boolean;
    epistemicProvenanceModal: boolean;
    easterEggCipher: boolean;
  };
  motionProfile: {
    entranceStyle: 'cinematic-curtain' | 'staggered-editorial' | 'orbital-bloom' | 'precision-snap';
    scrollParallaxIntensity: number; // 0 to 1
    springStiffness: number;
    springDamping: number;
  };
}

// 13. Content Generation Engine
export interface GeneratedContentSections {
  navigationItems: Array<{ id: string; label: string; index: string }>;
  identityDossier: {
    sectionTitle: string;
    cards: Array<{
      id: string;
      label: string;
      title: string;
      value: string;
      detail: string;
      epistemicCategory: EpistemicCategory;
    }>;
  };
  interactivePostcard: {
    stampCode: string;
    originLabel: string;
    destinationLabel: string;
    defaultMessage: string;
    prompts: string[];
  };
  miniGameConfig: {
    title: string;
    instruction: string;
    targetNodes: Array<{
      id: string;
      label: string;
      x: number;
      y: number;
      unlockedInsight: string;
    }>;
    completionRewardQuote: string;
  };
  easterEgg: {
    triggerHint: string;
    secretKeyphrase: string;
    revealedArtifactTitle: string;
    revealedMessage: string;
  };
}

// 14. Research Verification Engine
export interface VerificationAuditReport {
  passed: boolean;
  timestamp: string;
  totalClaimsAudited: number;
  breakdown: {
    verifiedFactsCount: number;
    userProvidedCount: number;
    astrologicalCount: number;
    creativeInterpretationCount: number;
  };
  epistemicGuarantees: string[];
  sanitizedWarnings: string[];
}

/**
 * 16-Step Generation Pipeline Telemetry
 */
export type PipelineStepStatus = 'pending' | 'running' | 'completed' | 'skipped' | 'error';

export interface PipelineStepLog {
  stepNumber: number;
  code: string;
  title: string;
  status: PipelineStepStatus;
  durationMs: number;
  summary: string;
  artifactPreview?: string;
}

/**
 * Complete Synthesized Experience Record
 */
export interface PersonalizedExperience {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  visibility: 'public' | 'unlisted' | 'private';
  input: PersonInput;
  intelligence: {
    nameResearch: NameResearchOutput;
    nameMeaning: NameMeaningOutput;
    culturalContext: CulturalContextOutput;
    birthday: BirthdayIntelligenceOutput;
    zodiac: ZodiacCalculationOutput;
    planetary: PlanetaryAssociationOutput;
    interests: InterestAnalysisOutput;
    personality: PersonalityAnalysisOutput;
    creativeDirection: CreativeDirectionOutput;
    storytelling: StorytellingOutput;
    visualDesign: VisualDesignSystem;
    interactions: InteractionConfig;
    content: GeneratedContentSections;
    verification: VerificationAuditReport;
  };
  pipelineLogs: PipelineStepLog[];
  deploymentHistory?: {
    githubRepoUrl?: string;
    githubLastCommitSha?: string;
    vercelDeploymentUrl?: string;
    vercelProjectId?: string;
    lastPublishedAt?: string;
  };
}
