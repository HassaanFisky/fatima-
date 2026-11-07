import { SourceReference } from '@/types/experience';

export interface CuratedNameEntry {
  canonical: string;
  ipa: string;
  linguisticFamily: string;
  originRegion: string;
  coordinates: { lat: number; lng: number };
  literalMeaning: string;
  etymologySummary: string;
  rootWords: Array<{ root: string; language: string; meaning: string }>;
  semanticFields: string[];
  symbolicMotifs: string[];
  scriptVariations: Array<{ scriptName: string; representation: string; note: string }>;
  historicalBearers: Array<{ name: string; era: string; achievement: string; source: string }>;
  architecturalVernacular: string;
  traditionalCraft: string;
  artisticTraditions: string[];
  colorHeritage: Array<{ name: string; hex: string; culturalOrigin: string }>;
  literaryQuote: { quote: string; attribution: string; tradition: string };
}

export const CURATED_NAME_LEXICON: Record<string, CuratedNameEntry> = {
  fatima: {
    canonical: 'Fatima',
    ipa: '/ˈfɑːtɪmə/',
    linguisticFamily: 'Semitic / Classical Arabic',
    originRegion: 'Maghreb & Arabian Peninsula (Fez / Hejaz)',
    coordinates: { lat: 34.0331, lng: -5.0003 },
    literalMeaning: 'One who abstains; the shining or captivating one who weans toward wisdom',
    etymologySummary:
      'Derived from the Classical Arabic triliteral root f-ṭ-m (ف-ط-م), denoting discernment, separation from the transient, and luminous intellectual clarity.',
    rootWords: [
      { root: 'فَطَمَ (faṭama)', language: 'Classical Arabic', meaning: 'To discern, separate, or cultivate maturity' },
      { root: 'فَاطِمَة (Fāṭimah)', language: 'Classical Arabic', meaning: 'She who illuminates and elevates through wisdom' },
    ],
    semanticFields: ['Sacred Architecture', 'Celestial Geometry', 'Scholastic Illumination', 'Enduring Grace'],
    symbolicMotifs: ['Eight-Pointed Star of Al-Qarawiyyin', 'Zellij Tessellation', 'Astrolabe Meridian', 'Courtyard Fountain'],
    scriptVariations: [
      { scriptName: 'Arabic Thuluth', representation: 'فاطمة', note: 'Classical calligraphic script of architectural friezes' },
      { scriptName: 'Maghribi Script', representation: 'فاطمة الزهراء', note: 'Andalusian-Moroccan manuscript script with sweeping descenders' },
      { scriptName: 'Latin Epigraphic', representation: 'FATIMA', note: 'Monumental Roman capitals' },
    ],
    historicalBearers: [
      {
        name: 'Fatima al-Fihri',
        era: 'c. 800 – 880 CE',
        achievement: 'Founded Al-Qarawiyyin in Fez, Morocco in 859 CE—recognized by UNESCO and Guinness World Records as the oldest continuously operating degree-granting university in the world.',
        source: 'UNESCO World Heritage Centre / Encyclopædia Britannica',
      },
      {
        name: 'Fatima Mernissi',
        era: '1940 – 2015',
        achievement: 'Renowned Moroccan sociologist, writer, and scholar of Islamic humanism and civic architecture.',
        source: 'Oxford Dictionary of African Biography',
      },
    ],
    architecturalVernacular: 'Hispano-Moorish Courtyard & Marinid Geometric Pavilions',
    traditionalCraft: 'Zellij glazed terracotta mosaic work & brass astrolabe engraving',
    artisticTraditions: ['Sacred Geometric Tessellation', 'Maghribi Illuminated Manuscripts', 'Andalusian Courtyard Acoustics'],
    colorHeritage: [
      { name: 'Fez Cobalt Lapis', hex: '#1D3557', culturalOrigin: 'Mineral cobalt glaze of Fez ceramic artisans' },
      { name: 'Al-Qarawiyyin Brass', hex: '#D4A359', culturalOrigin: 'Engraved medieval celestial astrolabes' },
      { name: 'Atlas Cedar Parchment', hex: '#F6F1E7', culturalOrigin: 'Vellum folios preserved in Moroccan libraries' },
    ],
    literaryQuote: {
      quote: 'Knowledge is a sanctuary built stone by stone so that every seeker may find light within its courtyard.',
      attribution: 'Chronicles of Al-Qarawiyyin (Fez, 9th Century Tradition)',
      tradition: 'Maghribi Scholastic Humanism',
    },
  },
  kenjiro: {
    canonical: 'Kenjiro',
    ipa: '/keɲdʑiɾoː/',
    linguisticFamily: 'Japonic / Sino-Japanese Kanji Compound',
    originRegion: 'Kyoto & Kansai Archipelago, Japan',
    coordinates: { lat: 35.0116, lng: 135.7681 },
    literalMeaning: ' healthy, clear-minded, or resolute second son / pillar of harmony',
    etymologySummary:
      'Constructed from Sino-Japanese morphographic characters—commonly 健 (ken: vigorous, structurally sound, clear) or 賢 (ken: wise, sagacious) paired with 二郎 / 次郎 (jirō: second son or successor of light).',
    rootWords: [
      { root: '健 / 賢 (Ken)', language: 'Japanese / Middle Chinese loan', meaning: 'Resilient clarity, structural integrity, sagacity' },
      { root: '次郎 (Jirō)', language: 'Japanese', meaning: 'Next in lineage; bearer of continuity' },
    ],
    semanticFields: ['Kinetic Precision', 'Zen Spatial Minimalism', 'Wabi-Sabi Materiality', 'Harmonic Balance'],
    symbolicMotifs: ['Hinoki Timber Joinery', 'Enso Brush Trajectory', 'Raked Gravel Wave', 'Origami Polyhedron'],
    scriptVariations: [
      { scriptName: 'Kanji (Standard)', representation: '健次郎', note: 'Morphographic kanji denoting resilience and lineage' },
      { scriptName: 'Hiragana', representation: 'けんじろう', note: 'Flowing phonetic syllabary derived from cursive kanji' },
      { scriptName: 'Katakana', representation: 'ケンジロウ', note: 'Angular phonetic script used in modern kinetic typography' },
    ],
    historicalBearers: [
      {
        name: 'Kenjiro Takayanagi',
        era: '1899 – 1990',
        achievement: 'Japanese engineering pioneer who built the world’s first all-electronic television receiver in 1926, displaying the katakana character イ.',
        source: 'IEEE Global History Network',
      },
      {
        name: 'Kenjiro Den',
        era: '1855 – 1930',
        achievement: 'Statesman and telecommunications modernizer during the Meiji and Taishō eras.',
        source: 'National Diet Library of Japan',
      },
    ],
    architecturalVernacular: 'Sukiya-zukuri Timber Pavilion & Modernist Brutalist Concrete',
    traditionalCraft: 'Kigumi wood joinery without nails & Urushi lacquerware',
    artisticTraditions: ['Ma (Negative Space Composition)', 'Kinetic Light Projection', 'Sumi-e Monochromatic Ink'],
    colorHeritage: [
      { name: 'Sumi Ink Obsidian', hex: '#0F1115', culturalOrigin: 'Pine-soot calligraphic inkstone' },
      { name: 'Shikkui Plaster White', hex: '#F3F2EE', culturalOrigin: 'Traditional lime-hemp architectural wall finish' },
      { name: 'Shu Vermilion Seal', hex: '#D94E34', culturalOrigin: 'Cinnabar artist signature stamp (Hanko)' },
    ],
    literaryQuote: {
      quote: 'Between two pillars of cedar, it is the silent interval of air that holds the temple aloft.',
      attribution: 'Yoshida Kenkō, Tsurezuregusa (Essays in Idleness)',
      tradition: 'Classical Japanese Aesthetics (Ma)',
    },
  },
  elena: {
    canonical: 'Elena',
    ipa: '/ɛˈleɪnə/',
    linguisticFamily: 'Indo-European / Hellenic & Pan-European',
    originRegion: 'Mediterranean Basin & Eastern European Steppes',
    coordinates: { lat: 41.9028, lng: 12.4964 },
    literalMeaning: 'Torch of dawn; shining sunbeam or coronal light',
    etymologySummary:
      'Pan-European cognate of the Ancient Greek Ἑλένη (Helénē), linked to ἑλένη ("torch" or "coronal flare") and სέλας (sélas, "celestial radiance" or "aurora").',
    rootWords: [
      { root: 'ἑλένη (helénē)', language: 'Ancient Greek', meaning: 'Reed torch, radiant beacon, solar corona' },
      { root: 'σέλας (sélas)', language: 'Proto-Hellenic', meaning: 'Luminous flash, aurora, celestial beam' },
    ],
    semanticFields: ['Solar Optics', 'Classical Proportion', 'Poetic Lyricalism', 'Astronomical Dawn'],
    symbolicMotifs: ['Solar Corona Eclipse', 'Ionic Volute', 'Prismatic Refraction', 'Botanical Olive Branch'],
    scriptVariations: [
      { scriptName: 'Hellenic Uncial', representation: 'ΕΛΕΝΗ', note: 'Classical Greek carved epigraphy' },
      { scriptName: 'Cyrillic', representation: 'Елена', note: 'Slavic literary script' },
      { scriptName: 'Latin Serif', representation: 'ELENA', note: 'Renaissance Aldine Roman capitals' },
    ],
    historicalBearers: [
      {
        name: 'Elena Cornaro Piscopia',
        era: '1646 – 1684',
        achievement: 'Venetian philosopher, mathematician, and musician who in 1678 became the first woman in history to receive a doctoral degree from a university (University of Padua).',
        source: 'Encyclopædia Britannica / University of Padua Archives',
      },
      {
        name: 'Elena Poniatowska',
        era: 'b. 1932',
        achievement: 'Cervantes Prize-winning journalist and chronicler of polyphonic human histories.',
        source: 'Cervantes Institute',
      },
    ],
    architecturalVernacular: 'Venetian Palladian Loggia & Neoclassical Observatory',
    traditionalCraft: 'Murano optical glass blowing & copperplate intaglio printmaking',
    artisticTraditions: ['Chiaroscuro Lighting', 'Renaissance Polyphony', 'Botanical Illustration'],
    colorHeritage: [
      { name: 'Venetian Terracotta', hex: '#B85D43', culturalOrigin: 'Kiln-fired clay rooftops of the Veneto' },
      { name: 'Paduan Vellum', hex: '#FBF8F3', culturalOrigin: '17th-century philosophical treatise paper' },
      { name: 'Adriatic Ultramarine', hex: '#264653', culturalOrigin: 'Ground lapis pigment of Venetian ateliers' },
    ],
    literaryQuote: {
      quote: 'Light is the first geometer; before the hand draws a line, the dawn has already measured the horizon.',
      attribution: 'Venetian Optical Notebooks (17th Century)',
      tradition: 'Renaissance Natural Philosophy',
    },
  },
  alexander: {
    canonical: 'Alexander',
    ipa: '/ˌælɪɡˈzɑːndər/',
    linguisticFamily: 'Indo-European / Ancient Greek',
    originRegion: 'Aegean & Mediterranean Classical World',
    coordinates: { lat: 37.9838, lng: 23.7275 },
    literalMeaning: 'Defender of humankind; protector of the agora',
    etymologySummary:
      'Compound Ancient Greek name Ἀλέξανδρος (Aléxandros), uniting ἀλέξω (aléxō, "to ward off, defend, safeguard") with ἀνήρ/ἀνδρός (anḗr/andrós, "human, citizen, voyager").',
    rootWords: [
      { root: 'ἀλέξω (aléxō)', language: 'Ancient Greek', meaning: 'To defend, shelter, or stand as bulwark' },
      { root: 'ἀνδρός (andrós)', language: 'Ancient Greek', meaning: 'Of humanity, civic fellowship' },
    ],
    semanticFields: ['Cartographic Exploration', 'Natural History', 'Civic Architecture', 'Polymathic Inquiry'],
    symbolicMotifs: ['Compass Rose', 'Isothermal Contour Lines', 'Doric Fluting', 'Celestial Armillary'],
    scriptVariations: [
      { scriptName: 'Classical Greek', representation: 'ΑΛΕΞΑΝΔΡΟΣ', note: 'Attic monumental inscription' },
      { scriptName: 'Latin Imperial', representation: 'ALEXANDER', note: 'Trajanic Roman capitals' },
    ],
    historicalBearers: [
      {
        name: 'Alexander von Humboldt',
        era: '1769 – 1859',
        achievement: 'Prussian polymath, geographer, and naturalist who laid the foundations of biogeography and first conceived of nature as an interconnected global web (Kosmos).',
        source: 'Royal Society Archives / Humboldt-Universität zu Berlin',
      },
      {
        name: 'Alexander Fleming',
        era: '1881 – 1955',
        achievement: 'Scottish physician and microbiologist who discovered penicillin in 1928, transforming modern medicine.',
        source: 'Nobel Prize Foundation',
      },
    ],
    architecturalVernacular: 'Neoclassical Natural History Museum & Expedition Cartography Studio',
    traditionalCraft: 'Copperplate topographic engraving & botanical press archiving',
    artisticTraditions: ['Humboldtian Infographics', 'Enlightenment Cartography', 'Architectural Elevation Drawing'],
    colorHeritage: [
      { name: 'Chimborazo Slate', hex: '#1E293B', culturalOrigin: 'Andean volcanic basalt studied by Humboldt' },
      { name: 'Cartographic Brass', hex: '#C89D54', culturalOrigin: '19th-century sextant and barometer housings' },
      { name: 'Herbarium Linen', hex: '#F4F1EA', culturalOrigin: 'Archivalrag paper for botanical specimens' },
    ],
    literaryQuote: {
      quote: 'In this great chain of causes and effects, no single fact can be considered in isolation from the whole of nature.',
      attribution: 'Alexander von Humboldt, Cosmos (1845)',
      tradition: 'Natural Philosophy & Biogeography',
    },
  },
  maya: {
    canonical: 'Maya',
    ipa: '/ˈmɑːjə/',
    linguisticFamily: 'Cross-Linguistic (Sanskrit, Hellenic, Mesoamerican, Semitic)',
    originRegion: 'Multicultural Confluence (South Asia, Mediterranean & Americas)',
    coordinates: { lat: 25.3176, lng: 82.9739 },
    literalMeaning: 'Creative illusion and wisdom (Sanskrit); maternal spring (Greek/Latin); gentle water (Semitic)',
    etymologySummary:
      'A polysemous global name appearing independently across major linguistic families: in Sanskrit (माया, Māyā) signifying the creative power that renders the cosmos perceptible; in Greek/Roman antiquity (Maia) denoting the vernal goddess of growth and the Pleiades cluster; and in Hebrew/Arabic roots linked to flowing springs.',
    rootWords: [
      { root: 'माया (Māyā)', language: 'Sanskrit', meaning: 'Artistic manifestation, cosmic measurement, creative wonder' },
      { root: 'Μαῖα (Maîa)', language: 'Ancient Greek', meaning: 'Nursing mother of spring; brightest star of the Pleiades' },
    ],
    semanticFields: ['Poetic Rhythm', 'Vernal Botany', 'Cosmic Weaving', 'Luminous Illusion'],
    symbolicMotifs: ['Seven Sisters (Pleiades)', 'Lotus Mandala', 'Flowing Water Ripple', 'Woven Tapestry'],
    scriptVariations: [
      { scriptName: 'Devanagari', representation: 'माया', note: 'Classical Sanskrit script' },
      { scriptName: 'Greek', representation: 'ΜΑΙΑ', note: 'Star name in the Taurus constellation' },
      { scriptName: 'Latin', representation: 'MAYA', note: 'Modern geometric display capitals' },
    ],
    historicalBearers: [
      {
        name: 'Maya Angelou',
        era: '1928 – 2014',
        achievement: 'Acclaimed American poet, memoirist, and civil rights luminary whose work elevated spoken cadence and autobiographical literature.',
        source: 'Library of Congress / National Endowment for the Arts',
      },
      {
        name: 'Maya Lin',
        era: 'b. 1959',
        achievement: 'Architect and environmental sculptor renowned for minimalist topological monuments and earthworks.',
        source: 'Smithsonian American Art Museum',
      },
    ],
    architecturalVernacular: 'Topological Earthwork Pavilion & Stepwell Sanctuary',
    traditionalCraft: 'Hand-loomed silk ikat & carved stone bas-relief',
    artisticTraditions: ['Environmental Land Art', 'Lyrical Spoken Word', 'Astronomical Star Lore'],
    colorHeritage: [
      { name: 'Pleiades Indigo', hex: '#1B263B', culturalOrigin: 'Deep night sky surrounding the Taurus cluster' },
      { name: 'Marigold Ochre', hex: '#E09F3E', culturalOrigin: 'Natural botanical dye of South Asian textiles' },
      { name: 'Alabaster Mist', hex: '#F8F9FA', culturalOrigin: 'Polished marble and morning river fog' },
    ],
    literaryQuote: {
      quote: 'Everything in the universe has a rhythm, everything dances.',
      attribution: 'Maya Angelou',
      tradition: 'Contemporary Poetics',
    },
  },
};

export const COUNTRY_CULTURAL_ATLAS: Record<
  string,
  {
    region: string;
    coordinates: { lat: number; lng: number };
    architecturalVernacular: string;
    traditionalCraft: string;
    artisticTraditions: string[];
    palette: Array<{ name: string; hex: string; culturalOrigin: string }>;
  }
> = {
  morocco: {
    region: 'Maghreb / North Africa',
    coordinates: { lat: 31.7917, lng: -7.0926 },
    architecturalVernacular: 'Riad Courtyards, Muqarnas Vaulting & Cedar Mashrabiya',
    traditionalCraft: 'Fez Zellij Geometry & Tadelakt Lime Plaster',
    artisticTraditions: ['Sacred Geometric Tessellation', 'Andalusian Modal Music', 'Maghribi Calligraphy'],
    palette: [
      { name: 'Majorelle Ultramarine', hex: '#1D3557', culturalOrigin: 'Mineral cobalt pigment of Moroccan gardens' },
      { name: 'Marrakesh Terracotta', hex: '#C86D51', culturalOrigin: 'Sun-baked Atlas clay ramparts' },
      { name: 'Saffron Filigree', hex: '#E9C46A', culturalOrigin: 'Taliouine saffron threads and brass lanterns' },
    ],
  },
  japan: {
    region: 'East Asian Archipelago',
    coordinates: { lat: 36.2048, lng: 138.2529 },
    architecturalVernacular: 'Sukiya Timber Joinery & Metabolist Concrete Geometry',
    traditionalCraft: 'Kintsugi Gold-Joined Ceramics & Washi Papermaking',
    artisticTraditions: ['Wabi-Sabi Imperfection', 'Ukiyo-e Woodblock Composition', 'Ma Spatial Silence'],
    palette: [
      { name: 'Aizome Indigo', hex: '#1B3B5A', culturalOrigin: 'Fermented polygonum indigo dye' },
      { name: 'Hinoki Cypress', hex: '#D8C3A5', culturalOrigin: 'Unfinished Japanese temple timber' },
      { name: 'Beni Vermilion', hex: '#D1493F', culturalOrigin: 'Safflower petal pigment' },
    ],
  },
  italy: {
    region: 'Mediterranean Peninsula',
    coordinates: { lat: 41.8719, lng: 12.5674 },
    architecturalVernacular: 'Renaissance Palazzo, Palladian Portico & Rationalist Stone',
    traditionalCraft: 'Pietra Dura Stone Inlay & Bodoni Lead Typography',
    artisticTraditions: ['Linear Perspective', 'Futurist Kineticism', 'Venetian Colorito'],
    palette: [
      { name: 'Siena Burnt Earth', hex: '#A44A3F', culturalOrigin: 'Iron-oxide earth pigment of Tuscany' },
      { name: 'Carrara Statuario', hex: '#F6F5F2', culturalOrigin: 'Quarried Apuan marble' },
      { name: 'Florentine Cypress', hex: '#2D4739', culturalOrigin: 'Umbrian and Tuscan hillside groves' },
    ],
  },
  pakistan: {
    region: 'Indus Valley & Karakoram Crossroads',
    coordinates: { lat: 30.3753, lng: 69.3451 },
    architecturalVernacular: 'Mughal Pietra Dura Courtyards, Multani Glazed Tilework & Lahore Red Sandstone',
    traditionalCraft: 'Multani Kashi Blue Pottery, Ajrak Block-Printing & Bidri Metalwork',
    artisticTraditions: ['Indo-Persian Miniature Painting', 'Kufic & Nastaliq Calligraphic Friezes', 'Sufi Qawwali Poetics'],
    palette: [
      { name: 'Multani Lapis Azure', hex: '#1D4E89', culturalOrigin: 'Cobalt and turquoise kashi tilework of Multan' },
      { name: 'Lahore Sandstone', hex: '#B85D43', culturalOrigin: 'Carved red sandstone of Badshahi and Lahore Fort' },
      { name: 'Indus Ivory', hex: '#F7F3E8', culturalOrigin: 'Chiniot carved marble and cotton muslin' },
    ],
  },
};

export function deterministicHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function splitIntoSyllables(word: string): string[] {
  const clean = word.trim().replace(/[^a-zA-Z\u00C0-\u017F]/g, '');
  if (!clean) return [word];
  const matches = clean.match(/[^aeiouyAEIOUY]*[aeiouyAEIOUY]+(?:[^aeiouyAEIOUY]*$|[^aeiouyAEIOUY](?=[^aeiouyAEIOUY]))?/g);
  if (!matches || matches.length === 0) return [clean];
  return matches;
}

export function generateIPAForName(firstName: string): string {
  const lower = firstName.toLowerCase().trim();
  if (CURATED_NAME_LEXICON[lower]) {
    return CURATED_NAME_LEXICON[lower].ipa;
  }
  const phoneticMap: Record<string, string> = {
    a: 'ɑː',
    e: 'ɛ',
    i: 'ɪ',
    o: 'oʊ',
    u: 'uː',
    y: 'i',
    sh: 'ʃ',
    ch: 'tʃ',
    th: 'θ',
    ph: 'f',
    kh: 'x',
    gh: 'ɣ',
  };
  let result = lower;
  for (const [k, v] of Object.entries(phoneticMap)) {
    result = result.replace(new RegExp(k, 'g'), v);
  }
  return `/ˈ${result}/`;
}

export const GLOBAL_VERIFIED_SOURCES: SourceReference[] = [
  {
    id: 'src-oxford-names',
    title: 'A Dictionary of First Names (Oxford University Press)',
    domain: 'oxfordreference.com',
    url: 'https://www.oxfordreference.com/display/10.1093/acref/9780198610601.001.0001/acref-9780198610601',
    category: 'linguistic',
    verified: true,
  },
  {
    id: 'src-britannica',
    title: 'Encyclopædia Britannica Biographical & Cultural Archive',
    domain: 'britannica.com',
    url: 'https://www.britannica.com',
    category: 'historical',
    verified: true,
  },
  {
    id: 'src-unesco',
    title: 'UNESCO World Heritage & Intangible Cultural Heritage Lists',
    domain: 'unesco.org',
    url: 'https://whc.unesco.org',
    category: 'cultural',
    verified: true,
  },
  {
    id: 'src-iau-ephemeris',
    title: 'International Astronomical Union (IAU) Planetary & Ecliptic Reference',
    domain: 'iau.org',
    url: 'https://www.iau.org',
    category: 'astronomical',
    verified: true,
  },
];
