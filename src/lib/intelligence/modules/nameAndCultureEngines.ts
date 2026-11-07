import {
  CulturalContextOutput,
  NameMeaningOutput,
  NameResearchOutput,
  PersonInput,
} from '@/types/experience';
import {
  COUNTRY_CULTURAL_ATLAS,
  CURATED_NAME_LEXICON,
  deterministicHash,
  generateIPAForName,
  GLOBAL_VERIFIED_SOURCES,
  splitIntoSyllables,
} from '../knowledgeBase';

const LINGUISTIC_ROOT_PATTERNS: Array<{
  pattern: RegExp;
  family: string;
  region: string;
  coords: { lat: number; lng: number };
  etymologyNote: string;
  motifs: string[];
  vernacular: string;
  craft: string;
}> = [
  {
    pattern: /(^al-|fati|zah|nur|amir|zayn|hassan|hussein|layla|mariam|tariq|omar|ayesha|salma|khalid|yasmin|nadia)/i,
    family: 'Semitic / Classical Arabic & Persianate (Heuristic Pattern Match)',
    region: 'Mediterranean, Levant & Maghreb Cultural Sphere',
    coords: { lat: 33.8869, lng: 35.5131 },
    etymologyNote:
      'Heuristic phonological match suggesting Classical Arabic or Persianate onomastic morphology. Note: This is an algorithmic pattern estimate, not a verified dictionary entry.',
    motifs: ['Octagonal Star Tessellation', 'Calligraphic Reed Pen Trajectory', 'Courtyard Astrolabe', 'Muqarnas Vault'],
    vernacular: 'Courtyard Riads, Stone Arcades & Geometric Mashrabiya Screens',
    craft: 'Brass Astrolabe Engraving, Glazed Ceramic Mosaic & Calligraphic Illumination',
  },
  {
    pattern: /(ken|jiro|hiro|taka|yuki|haru|saki|ren|akira|kaori|hana|ryu|sora|mei)/i,
    family: 'Japonic / East Asian Morphographic (Heuristic Pattern Match)',
    region: 'Kyoto & Pacific Archipelago Cultural Sphere',
    coords: { lat: 35.0116, lng: 135.7681 },
    etymologyNote:
      'Heuristic phonological match suggesting Japonic syllabic morae. Note: Without user-supplied kanji, exact character meanings cannot be verified as fact.',
    motifs: ['Hinoki Timber Interlock', 'Enso Calligraphic Arc', 'Monochromatic Ink Wash', 'Raked Stone Horizon'],
    vernacular: 'Sukiya Timber Pavilion & Minimalist Architectural Concrete',
    craft: 'Kigumi Wood Joinery, Washi Fibre Laying & Urushi Lacquer',
  },
  {
    pattern: /(elen|alex|soph|theo|niko|chlo|ari|leo|kasp|sebast|clara|luc|jul|valen|matteo|dante)/i,
    family: 'Indo-European / Greco-Latin Classical (Heuristic Pattern Match)',
    region: 'Mediterranean & European Classical Sphere',
    coords: { lat: 43.7696, lng: 11.2558 },
    etymologyNote:
      'Heuristic phonological match suggesting Classical Hellenic or Latin onomastic stems. Classified as creative/heuristic interpretation.',
    motifs: ['Golden Ratio Spiral', 'Astrolabe Armillary Sphere', 'Botanical Acanthus Scroll', 'Roman Epigraphic Serif'],
    vernacular: 'Renaissance Loggia, Palladian Proportion & Neoclassical Rotunda',
    craft: 'Intaglio Copperplate Engraving, Letterpress Typography & Optical Glasswork',
  },
];

/**
 * MODULE 1: Name Research Engine
 * Strictly separates verified lexicon entries from heuristic phonetic analysis.
 */
export function runNameResearchEngine(input: PersonInput): NameResearchOutput {
  const rawFull = input.fullName.trim() || 'Anonymous Voyager';
  const parts = rawFull.split(/\s+/);
  const firstName = parts[0];
  const surname = parts.length > 1 ? parts.slice(1).join(' ') : undefined;
  const lowerFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');

  const curated = CURATED_NAME_LEXICON[lowerFirst];
  const isLexiconMatch = Boolean(curated);

  const syllables = splitIntoSyllables(firstName);
  const vowels = (firstName.match(/[aeiouy]/gi) || []).map((v) => v.toLowerCase());
  const uniqueVowels = Array.from(new Set(vowels));
  const hash = deterministicHash(rawFull.toLowerCase());

  const cadences: Array<'flowing' | 'percussive' | 'balanced' | 'lyrical' | 'resonant'> = [
    'lyrical',
    'resonant',
    'flowing',
    'balanced',
    'percussive',
  ];
  const openVowelRatio =
    vowels.filter((v) => ['a', 'o', 'u'].includes(v)).length / Math.max(1, firstName.length);
  const acousticWarmth = Math.min(96, Math.max(48, Math.round(55 + openVowelRatio * 85)));

  const matchedPattern = LINGUISTIC_ROOT_PATTERNS.find((p) => p.pattern.test(rawFull));

  return {
    normalizedName: rawFull,
    firstName,
    surname,
    lexiconMatch: isLexiconMatch,
    phoneticIPA: isLexiconMatch
      ? {
          value: curated.ipa,
          category: 'verified_fact',
          source: 'Oxford Dictionary of First Names (Documented IPA Transcription)',
          confidence: 0.98,
        }
      : {
          value: generateIPAForName(firstName),
          category: 'creative_interpretation',
          source: 'Heuristic Grapheme-to-Phoneme Approximation (Unverified)',
          confidence: 0.45,
          notes:
            'Algorithmic phonetic approximation; not a verified dictionary transcription.',
        },
    syllableCount: syllables.length,
    syllableBreakdown: syllables,
    sonicProfile: {
      value: {
        cadence: isLexiconMatch ? 'lyrical' : cadences[hash % cadences.length],
        dominantVowels: uniqueVowels.length > 0 ? uniqueVowels : ['a', 'e'],
        acousticWarmth,
        rhythmPattern: syllables.map((_, idx) => (idx === 0 ? '—' : '◡')).join(' '),
      },
      category: 'creative_interpretation',
      source: 'Prosodic Cadence & Vowel-Weight Heuristic Model (Creative Synthesis)',
      notes: 'Artistic sound-symbolism model used to guide visual and typographic rhythm.',
    },
    linguisticFamily: isLexiconMatch
      ? {
          value: curated.linguisticFamily,
          category: 'verified_fact',
          source: 'Oxford Dictionary of First Names & Comparative Philology',
          confidence: 0.98,
        }
      : {
          value: matchedPattern
            ? matchedPattern.family
            : 'Unverified Global Onomastic Stem (Heuristic Classification)',
          category: 'creative_interpretation',
          source: 'Heuristic Morphological Pattern Matcher (Unverified)',
          confidence: 0.5,
          notes:
            'Name not present in curated verified lexicon; linguistic family is a heuristic estimate and not claimed as verified fact.',
        },
    scriptVariations: isLexiconMatch
      ? curated.scriptVariations
      : [
          {
            scriptName: 'Monumental Epigraphic Capitals',
            representation: firstName.toUpperCase(),
            note: 'Geometric display capitals (Typographic rendering)',
          },
          {
            scriptName: 'Prosodic Syllable Division',
            representation: syllables.join(' · '),
            note: 'Heuristic syllable segmentation for visual pacing',
          },
          {
            scriptName: 'Monogram Cipher',
            representation: parts.map((p) => p[0]?.toUpperCase()).join('·'),
            note: 'Typographic seal combining initials',
          },
        ],
    // Never invent fake historical bearers when name is not in the curated verified lexicon
    historicalBearers: isLexiconMatch ? curated.historicalBearers : [],
    sources: isLexiconMatch
      ? GLOBAL_VERIFIED_SOURCES
      : [
          GLOBAL_VERIFIED_SOURCES[3], // IAU Astronomical constants are always real mathematical constants
        ],
  };
}

/**
 * MODULE 2: Name Meaning Engine
 * Never labels heuristic name meaning analysis as verified_fact.
 */
export function runNameMeaningEngine(
  input: PersonInput,
  nameResearch: NameResearchOutput
): NameMeaningOutput {
  const lowerFirst = nameResearch.firstName.toLowerCase().replace(/[^a-z]/g, '');
  const curated = CURATED_NAME_LEXICON[lowerFirst];
  const matchedPattern = LINGUISTIC_ROOT_PATTERNS.find((p) => p.pattern.test(input.fullName));

  if (curated) {
    return {
      primaryEtymology: {
        value: curated.etymologySummary,
        category: 'verified_fact',
        source: 'Oxford Dictionary of First Names & Classical Philology Lexicon',
        confidence: 0.98,
      },
      literalTranslation: {
        value: curated.literalMeaning,
        category: 'verified_fact',
        source: 'Comparative Onomastic Etymology',
        confidence: 0.97,
      },
      rootWords: curated.rootWords,
      semanticFields: {
        value: curated.semanticFields,
        category: 'creative_interpretation',
        source: 'Atelier Semantic Synthesis',
      },
      symbolicMotifs: {
        value: curated.symbolicMotifs,
        category: 'creative_interpretation',
        source: 'Visual Iconography Engine',
      },
      epistemicDisclaimer:
        'Etymological roots reflect historical linguistic evolution of the word itself and never prescribe or determine an individual’s personal character or biography.',
    };
  }

  return {
    primaryEtymology: {
      value: matchedPattern
        ? matchedPattern.etymologyNote
        : `Heuristic structural analysis: "${nameResearch.firstName}" unfolds across ${nameResearch.syllableCount} syllables (${nameResearch.phoneticIPA.value}). Because this specific name variant is not in the curated philological database, no unverified dictionary etymology is fabricated.`,
      category: 'creative_interpretation',
      source: 'Heuristic Prosodic & Morphological Analysis (Non-Factual)',
      confidence: 0.5,
    },
    literalTranslation: {
      value: `Poetic Resonance of ${nameResearch.firstName} (Creative Typographic Interpretation)`,
      category: 'creative_interpretation',
      source: 'Poetic Onomastic Synthesis (Creative Interpretation)',
    },
    rootWords: [
      {
        root: nameResearch.syllableBreakdown[0] || nameResearch.firstName,
        language: 'Heuristic Phonetic Stem (Unverified)',
        meaning: 'Primary acoustic anchor used for visual rhythm',
      },
    ],
    semanticFields: {
      value: ['Architectural Clarity', 'Harmonic Cadence', 'Intellectual Curiosity', 'Timeless Craft'],
      category: 'creative_interpretation',
      source: 'Creative Semantic Field Mapping',
    },
    symbolicMotifs: {
      value: matchedPattern
        ? matchedPattern.motifs
        : ['Celestial Meridian', 'Precision Compass', 'Botanical Specimen', 'Monolithic Arch'],
      category: 'creative_interpretation',
      source: 'Visual Motif Synthesis',
    },
    epistemicDisclaimer:
      'No verified dictionary entry matched this exact name string; all etymological and symbolic themes are explicitly labeled as Creative Interpretations rather than Verified Facts.',
  };
}

/**
 * MODULE 3: Cultural Context Engine
 */
export function runCulturalContextEngine(
  input: PersonInput,
  nameResearch: NameResearchOutput
): CulturalContextOutput {
  const lowerFirst = nameResearch.firstName.toLowerCase().replace(/[^a-z]/g, '');
  const curated = CURATED_NAME_LEXICON[lowerFirst];
  const countryKey = (input.country || input.birthplace || '').toLowerCase().trim();

  const matchedAtlas = Object.entries(COUNTRY_CULTURAL_ATLAS).find(([key]) =>
    countryKey.includes(key)
  )?.[1];

  const userPlaceText = [input.birthplace, input.country].filter(Boolean).join(', ');

  if (curated) {
    const regionLabel = userPlaceText
      ? `${userPlaceText} (User-Provided) & ${curated.originRegion} (Historical Name Origin)`
      : `${curated.originRegion} (Historical Linguistic Origin of Name — Not Personal Location)`;

    return {
      heritageSynthesis: {
        value: userPlaceText
          ? `Combines the user-provided location (${userPlaceText}) with the documented historical linguistic origin of the name ${curated.canonical} (${curated.originRegion}).`
          : `Reflects the historical linguistic heritage of the name "${curated.canonical}" in ${curated.originRegion} (${curated.architecturalVernacular} and ${curated.traditionalCraft}). No personal residence or birthplace is assumed.`,
        category: userPlaceText ? 'user_provided' : 'verified_fact',
        source: userPlaceText
          ? 'User-Provided Location + Historical Linguistic Atlas'
          : 'Historical Onomastic & Architectural Reference',
      },
      geographicResonance: {
        value: {
          region: regionLabel,
          coordinates: matchedAtlas ? matchedAtlas.coordinates : curated.coordinates,
          architecturalVernacular: matchedAtlas
            ? `${matchedAtlas.architecturalVernacular} & ${curated.architecturalVernacular}`
            : curated.architecturalVernacular,
          traditionalCraft: matchedAtlas ? matchedAtlas.traditionalCraft : curated.traditionalCraft,
        },
        category: userPlaceText ? 'user_provided' : 'verified_fact',
        source: 'Historical Architectural & Material Culture Atlas',
      },
      artisticTraditions: {
        value: matchedAtlas
          ? Array.from(new Set([...curated.artisticTraditions, ...matchedAtlas.artisticTraditions]))
          : curated.artisticTraditions,
        category: 'verified_fact',
        source: 'UNESCO & Art Historical Reference',
      },
      colorHeritage: matchedAtlas ? matchedAtlas.palette : curated.colorHeritage,
      literaryOrPhilosophicalEcho: {
        value: curated.literaryQuote,
        category: 'verified_fact',
        source: curated.literaryQuote.tradition,
      },
    };
  }

  // Non-curated name: only mark as user_provided if user provided a country/birthplace, otherwise creative_interpretation!
  if (matchedAtlas && userPlaceText) {
    return {
      heritageSynthesis: {
        value: `Anchored in the user-provided geography of ${userPlaceText} (${matchedAtlas.region}), drawing inspiration from ${matchedAtlas.architecturalVernacular}.`,
        category: 'user_provided',
        source: 'User-Provided Country/Birthplace + Cultural Atlas',
      },
      geographicResonance: {
        value: {
          region: `${userPlaceText} (${matchedAtlas.region})`,
          coordinates: matchedAtlas.coordinates,
          architecturalVernacular: matchedAtlas.architecturalVernacular,
          traditionalCraft: matchedAtlas.traditionalCraft,
        },
        category: 'user_provided',
        source: 'User-Provided Geography',
      },
      artisticTraditions: {
        value: matchedAtlas.artisticTraditions,
        category: 'verified_fact',
        source: 'Regional Material Culture Compendium',
      },
      colorHeritage: matchedAtlas.palette,
      literaryOrPhilosophicalEcho: {
        value: {
          quote: 'Every name is a vessel of memory and an open horizon waiting to be inscribed by lived days.',
          attribution: 'Atelier Editorial Notebooks',
          tradition: 'Humanist Literary Reflection',
        },
        category: 'creative_interpretation',
        source: 'Atelier Literary Anthology',
      },
    };
  }

  return {
    heritageSynthesis: {
      value: userPlaceText
        ? `Anchored in the user-provided location of ${userPlaceText}, paired with a cosmopolitan architectural design direction.`
        : `No geographic location was provided by the user; this experience adopts an open cosmopolitan architectural aesthetic without assuming any personal nationality or birthplace.`,
      category: userPlaceText ? 'user_provided' : 'creative_interpretation',
      source: userPlaceText ? 'User-Provided Location' : 'Cosmopolitan Creative Direction (Zero Location Inference)',
    },
    geographicResonance: {
      value: {
        region: userPlaceText || 'Unspecified Personal Location (Cosmopolitan Atelier)',
        coordinates: { lat: 0.0, lng: 0.0 },
        architecturalVernacular: 'Modernist Stone Pavilion & Timber Courtyard',
        traditionalCraft: 'Archival Bookbinding, Precision Cartography & Ceramic Glazing',
      },
      category: userPlaceText ? 'user_provided' : 'creative_interpretation',
      source: userPlaceText ? 'User-Provided Location' : 'Creative Architectural Direction',
    },
    artisticTraditions: {
      value: ['Geometric Abstraction', 'Editorial Typography', 'Natural Philosophy Illustration'],
      category: 'creative_interpretation',
      source: 'Atelier Creative Synthesis',
    },
    colorHeritage: [
      { name: 'Obsidian Ink', hex: '#141619', culturalOrigin: 'Archival carbon ink' },
      { name: 'Raw Linen Vellum', hex: '#F5F2EB', culturalOrigin: 'Unbleached cotton rag paper' },
      { name: 'Ochre Terracotta', hex: '#C87D55', culturalOrigin: 'Natural earth mineral pigment' },
    ],
    literaryOrPhilosophicalEcho: {
      value: {
        quote: 'Every name is a vessel of memory and an open horizon waiting to be inscribed by lived days.',
        attribution: 'Archival Notebooks on Poetics & Space',
        tradition: 'Humanist Literary Tradition',
      },
      category: 'creative_interpretation',
      source: 'Atelier Literary Anthology',
    },
  };
}
