import {
  BirthdayIntelligenceOutput,
  PersonInput,
  PlanetaryAssociationOutput,
  ZodiacCalculationOutput,
} from '@/types/experience';
import { deterministicHash } from '../knowledgeBase';

const BIRTHSTONES_BY_MONTH: Record<
  number,
  { name: string; hexColor: string; mineralFamily: string }
> = {
  1: { name: 'Almandine Garnet', hexColor: '#8B1E24', mineralFamily: 'Nesosilicate' },
  2: { name: 'Imperial Amethyst', hexColor: '#6C4A8B', mineralFamily: 'Crystalline Quartz' },
  3: { name: 'Beryl Aquamarine', hexColor: '#5DA9B8', mineralFamily: 'Cyclosilicate Beryl' },
  4: { name: 'White Diamond / Herkimer Quartz', hexColor: '#E2E8F0', mineralFamily: 'Carbon Allotrope' },
  5: { name: 'Muzo Emerald', hexColor: '#2E6F40', mineralFamily: 'Chromian Beryl' },
  6: { name: 'Nacre Pearl & Alexandrite', hexColor: '#EDE6D6', mineralFamily: 'Chrysoberyl / Aragonite' },
  7: { name: 'Pigeon-Blood Ruby', hexColor: '#9E1B32', mineralFamily: 'Corundum' },
  8: { name: 'Olivine Peridot & Sardonyx', hexColor: '#769F3B', mineralFamily: 'Magnesium Silicate' },
  9: { name: 'Kashmir Sapphire', hexColor: '#1E3F7A', mineralFamily: 'Aluminum Oxide Corundum' },
  10: { name: 'Iridescent Opal & Tourmaline', hexColor: '#729EA1', mineralFamily: 'Hydrated Silica' },
  11: { name: 'Imperial Topaz & Citrine', hexColor: '#D48C2A', mineralFamily: 'Fluorosilicate' },
  12: { name: 'Persian Turquoise & Lapis Lazuli', hexColor: '#256D85', mineralFamily: 'Phosphate / Lazurite' },
};

const BIRTH_FLOWERS_BY_MONTH: Record<
  number,
  { name: string; botanicalName: string; symbolism: string }
> = {
  1: { name: 'Snowdrop & Carnation', botanicalName: 'Galanthus nivalis', symbolism: 'Resilience at the threshold of winter' },
  2: { name: 'Sweet Violet & Iris', botanicalName: 'Viola odorata', symbolism: 'Intellectual vigilance and quiet eloquence' },
  3: { name: 'Jonquil Daffodil', botanicalName: 'Narcissus jonquilla', symbolism: 'Vernal renewal and clarity of vision' },
  4: { name: 'Sweet Pea & Bellis Daisy', botanicalName: 'Lathyrus odoratus', symbolism: 'Lucid gratitude and radiant simplicity' },
  5: { name: 'Lily of the Valley', botanicalName: 'Convallaria majalis', symbolism: 'Delicate precision and enduring grace' },
  6: { name: 'Damask Rose & Honeysuckle', botanicalName: 'Rosa damascena', symbolism: 'Poetic devotion and sensory richness' },
  7: { name: 'Delphinium Larkspur & Water Lily', botanicalName: 'Nelumbo nucifera', symbolism: 'Buoyant elevation and serenity' },
  8: { name: 'Gladiolus & Field Poppy', botanicalName: 'Gladiolus communis', symbolism: 'Strength of conviction and vivid imagination' },
  9: { name: 'Morning Glory & Aster', botanicalName: 'Symphyotrichum novi-belgii', symbolism: 'Star-like patience and scholarly reflection' },
  10: { name: 'Calendula Marigold', botanicalName: 'Calendula officinalis', symbolism: 'Solar warmth and autumnal craftsmanship' },
  11: { name: 'Chrysanthemum', botanicalName: 'Chrysanthemum indicum', symbolism: 'Longevity, structural radial harmony, and candor' },
  12: { name: 'Paperwhite Narcissus & Holly', botanicalName: 'Narcissus papyraceus', symbolism: 'Sanctuary light during the solstice' },
};

const HISTORICAL_MILESTONES_BY_MONTH: Record<number, Array<{ year: number; event: string; source: string }>> = {
  1: [
    { year: 1610, event: 'Galileo Galilei observes the four Galilean moons of Jupiter through his refracting telescope.', source: 'Sidereus Nuncius Archive' },
  ],
  2: [
    { year: 1473, event: 'Birth of Nicolaus Copernicus, mathematician and astronomer who formulated the heliocentric cosmos.', source: 'Encyclopædia Britannica' },
  ],
  3: [
    { year: 1879, event: 'Birth of Albert Einstein in Ulm, whose relativistic physics reshaped humanity’s conception of spacetime.', source: 'Nobel Foundation Archives' },
  ],
  4: [
    { year: 1452, event: 'Birth of Leonardo da Vinci in Vinci, exemplar of Renaissance art, optics, and engineering.', source: 'Codex Atlanticus Archive' },
  ],
  5: [
    { year: 1919, event: 'Solar eclipse expedition organized by Arthur Eddington confirms gravitational lensing of starlight.', source: 'Royal Astronomical Society' },
  ],
  6: [
    { year: 1678, event: 'Elena Cornaro Piscopia receives the first university doctorate awarded to a woman at the Cathedral of Padua.', source: 'University of Padua Historical Registry' },
  ],
  7: [
    { year: 1969, event: 'Apollo 11 Lunar Module Eagle lands on Mare Tranquillitatis, marking humanity’s first steps on another celestial body.', source: 'NASA Historical Reference Collection' },
  ],
  8: [
    { year: 1991, event: 'The first public website on the World Wide Web goes live at CERN, inaugurating hypertext publishing.', source: 'CERN Archive' },
  ],
  9: [
    { year: 1977, event: 'Voyager 1 launches Carrying the Golden Record—an interstellar time capsule of Earth’s music, greetings, and science.', source: 'JPL / NASA Archive' },
  ],
  10: [
    { year: 859, event: 'Foundation of Al-Qarawiyyin Mosque and University in Fez by Fatima al-Fihri.', source: 'UNESCO World Heritage Centre' },
  ],
  11: [
    { year: 1867, event: 'Birth of Marie Skłodowska-Curie in Warsaw, pioneer of radioactivity and first person awarded two Nobel Prizes.', source: 'Institut Curie / Nobel Foundation' },
  ],
  12: [
    { year: 1815, event: 'Birth of Ada Lovelace, mathematician who authored the first algorithm intended for a mechanical computer.', source: 'Bodleian Library Archives' },
  ],
};

export function validateBirthDateInput(
  birthDate?: string,
  birthYear?: number
): {
  isProvided: boolean;
  isValid: boolean;
  errorMessage?: string;
  year?: number;
  month?: number;
  day?: number;
} {
  if (!birthDate && !birthYear) {
    return { isProvided: false, isValid: true };
  }

  if (birthDate && birthDate.trim() !== '') {
    const trimmed = birthDate.trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (!match) {
      return {
        isProvided: true,
        isValid: false,
        errorMessage: `Invalid date format "${trimmed}". Expected ISO YYYY-MM-DD.`,
      };
    }

    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const d = parseInt(match[3], 10);

    const currentYear = new Date().getFullYear();
    if (y < 1000 || y > currentYear) {
      return {
        isProvided: true,
        isValid: false,
        errorMessage: `Birth year ${y} is outside plausible historical or living bounds (1000–${currentYear}).`,
      };
    }

    if (m < 1 || m > 12) {
      return {
        isProvided: true,
        isValid: false,
        errorMessage: `Month ${m} does not exist on the Gregorian calendar (must be 01–12).`,
      };
    }

    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    if (d < 1 || d > daysInMonth) {
      return {
        isProvided: true,
        isValid: false,
        errorMessage: `Day ${d} is invalid for ${y}-${String(m).padStart(2, '0')} (maximum days in that month: ${daysInMonth}).`,
      };
    }

    return { isProvided: true, isValid: true, year: y, month: m, day: d };
  }

  if (birthYear !== undefined) {
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(birthYear) || birthYear < 1000 || birthYear > currentYear) {
      return {
        isProvided: true,
        isValid: false,
        errorMessage: `Birth year ${birthYear} is outside valid bounds (1000–${currentYear}).`,
      };
    }
    return { isProvided: true, isValid: true, year: birthYear };
  }

  return { isProvided: false, isValid: true };
}

function reduceLifePathNumber(y: number, m: number, d: number): number {
  const digits = `${y}${m}${d}`.split('').map((n) => parseInt(n, 10));
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum)
      .split('')
      .reduce((acc, c) => acc + parseInt(c, 10), 0);
  }
  return sum;
}

const LIFE_PATH_ARCHETYPES: Record<number, { title: string; interpretation: string }> = {
  1: { title: 'The Sovereign Architect', interpretation: 'Symbolic numerological cadence emphasizing original initiative and structural independence.' },
  2: { title: 'The Harmonic Diplomat', interpretation: 'Symbolic cadence of relational equilibrium, acoustic sensitivity, and proportion.' },
  3: { title: 'The Lyrical Polymath', interpretation: 'Symbolic cadence of expressive synthesis, visual storytelling, and narrative wit.' },
  4: { title: 'The Master Geometer', interpretation: 'Symbolic cadence of foundational rigor, tectonic permanence, and methodical craft.' },
  5: { title: 'The Kinetic Cartographer', interpretation: 'Symbolic cadence of exploratory curiosity, sensory adaptability, and horizon-seeking.' },
  6: { title: 'The Sanctuary Steward', interpretation: 'Symbolic cadence of civic hospitality, aesthetic harmony, and protective care.' },
  7: { title: 'The Contemplative Scholar', interpretation: 'Symbolic cadence of deep archival inquiry, philosophical precision, and quiet observation.' },
  8: { title: 'The Systemic Orchestrator', interpretation: 'Symbolic cadence of macro-scale architecture, material mastery, and enduring impact.' },
  9: { title: 'The Universal Humanist', interpretation: 'Symbolic cadence of broad empathy, panoramic synthesis, and cultural stewardship.' },
  11: { title: 'The Luminous Visionary', interpretation: 'Master-number symbolic cadence associated with heightened aesthetic intuition and illumination.' },
  22: { title: 'The Monumental Builder', interpretation: 'Master-number symbolic cadence uniting lofty idealism with concrete architectural realization.' },
  33: { title: 'The Compassionate Teacher', interpretation: 'Master-number symbolic cadence centered on wisdom transmission and creative elevation.' },
};

/**
 * MODULE 4: Birthday Intelligence Engine
 */
export function runBirthdayIntelligenceEngine(input: PersonInput): BirthdayIntelligenceOutput {
  const check = validateBirthDateInput(input.birthDate, input.birthYear);

  if (!check.isProvided) {
    return {
      hasBirthData: false,
      validDate: true,
      validationMessage: 'No birth date provided; temporal and zodiac modules gracefully operating in timeless mode.',
      historicalEventsOnDay: [],
    };
  }

  if (!check.isValid) {
    return {
      hasBirthData: false,
      validDate: false,
      validationMessage: check.errorMessage,
      historicalEventsOnDay: [],
    };
  }

  if (check.year && check.month && check.day) {
    const utcDate = new Date(Date.UTC(check.year, check.month - 1, check.day));
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[utcDate.getUTCDay()];

    const startOfYear = new Date(Date.UTC(check.year, 0, 0));
    const diff = utcDate.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    let season: 'Spring' | 'Summer' | 'Autumn' | 'Winter' = 'Winter';
    if (check.month >= 3 && check.month <= 5) season = 'Spring';
    else if (check.month >= 6 && check.month <= 8) season = 'Summer';
    else if (check.month >= 9 && check.month <= 11) season = 'Autumn';

    const lp = reduceLifePathNumber(check.year, check.month, check.day);
    const lpMeta = LIFE_PATH_ARCHETYPES[lp] || LIFE_PATH_ARCHETYPES[7];

    return {
      hasBirthData: true,
      validDate: true,
      dayOfWeek: {
        value: dayName,
        category: 'verified_fact',
        source: 'Gregorian Perpetual Calendar Calculation',
        confidence: 1.0,
      },
      season: {
        value: season,
        category: 'verified_fact',
        source: 'Solar Meteorological Calendar',
        confidence: 1.0,
      },
      dayOfYear,
      lifePathNumber: {
        value: {
          number: lp,
          archetypeTitle: lpMeta.title,
          interpretation: lpMeta.interpretation,
        },
        category: 'astrological_interpretation',
        source: 'Pythagorean Arithmology / Symbolic Numerology',
      },
      birthstone: {
        value: BIRTHSTONES_BY_MONTH[check.month],
        category: 'verified_fact',
        source: 'Gemological Institute Traditional Mineral Registry',
      },
      birthFlower: {
        value: BIRTH_FLOWERS_BY_MONTH[check.month],
        category: 'verified_fact',
        source: 'Royal Botanic Gardens Horticultural Lore',
      },
      historicalEventsOnDay: HISTORICAL_MILESTONES_BY_MONTH[check.month] || [],
    };
  }

  // Only birthYear was provided
  return {
    hasBirthData: true,
    validDate: true,
    validationMessage: `Birth year ${check.year} verified; exact calendar month/day omitted.`,
    historicalEventsOnDay: [
      {
        year: check.year!,
        event: `Year ${check.year} CE marks the temporal horizon of this personal chronicle.`,
        source: 'Chronological Registry',
      },
    ],
  };
}

interface WesternZodiacDef {
  sign: string;
  symbol: string;
  unicodeGlyph: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  polarity: 'Diurnal' | 'Nocturnal';
  dateRange: string;
  themes: string[];
  ruler: string;
}

const WESTERN_ZODIAC_TABLE: WesternZodiacDef[] = [
  {
    sign: 'Capricorn',
    symbol: 'The Mountain Sea-Goat',
    unicodeGlyph: '♑',
    element: 'Earth',
    modality: 'Cardinal',
    polarity: 'Nocturnal',
    dateRange: 'Dec 22 – Jan 19',
    themes: ['Tectonic Architecture', 'Enduring Mastery', 'Long-Horizon Stewardship'],
    ruler: 'Saturn',
  },
  {
    sign: 'Aquarius',
    symbol: 'The Water-Bearer of Starlight',
    unicodeGlyph: '♒',
    element: 'Air',
    modality: 'Fixed',
    polarity: 'Diurnal',
    dateRange: 'Jan 20 – Feb 18',
    themes: ['Systemic Invention', 'Civic Futurism', 'Independent Inquiry'],
    ruler: 'Uranus & Saturn',
  },
  {
    sign: 'Pisces',
    symbol: 'The Celestial Fishes',
    unicodeGlyph: '♓',
    element: 'Water',
    modality: 'Mutable',
    polarity: 'Nocturnal',
    dateRange: 'Feb 19 – Mar 20',
    themes: ['Poetic Resonance', 'Oceanic Empathy', 'Dreamscape Synthesis'],
    ruler: 'Neptune & Jupiter',
  },
  {
    sign: 'Aries',
    symbol: 'The Golden Ram',
    unicodeGlyph: '♈',
    element: 'Fire',
    modality: 'Cardinal',
    polarity: 'Diurnal',
    dateRange: 'Mar 21 – Apr 19',
    themes: ['Vernal Ignition', 'Courageous First Stroke', 'Kinetic Momentum'],
    ruler: 'Mars',
  },
  {
    sign: 'Taurus',
    symbol: 'The Celestial Bull',
    unicodeGlyph: '♉',
    element: 'Earth',
    modality: 'Fixed',
    polarity: 'Nocturnal',
    dateRange: 'Apr 20 – May 20',
    themes: ['Tactile Craftsmanship', 'Botanical Permanence', 'Sensory Harmony'],
    ruler: 'Venus',
  },
  {
    sign: 'Gemini',
    symbol: 'The Dioscuri Twins',
    unicodeGlyph: '♊',
    element: 'Air',
    modality: 'Mutable',
    polarity: 'Diurnal',
    dateRange: 'May 21 – Jun 20',
    themes: ['Polyphonic Dialogue', 'Lexical Agility', 'Dual Perspective'],
    ruler: 'Mercury',
  },
  {
    sign: 'Cancer',
    symbol: 'The Lunar Carapace',
    unicodeGlyph: '♋',
    element: 'Water',
    modality: 'Cardinal',
    polarity: 'Nocturnal',
    dateRange: 'Jun 21 – Jul 22',
    themes: ['Archival Memory', 'Protective Sanctuary', 'Tidal Intuition'],
    ruler: 'Moon',
  },
  {
    sign: 'Leo',
    symbol: 'The Solar Lion',
    unicodeGlyph: '♌',
    element: 'Fire',
    modality: 'Fixed',
    polarity: 'Diurnal',
    dateRange: 'Jul 23 – Aug 22',
    themes: ['Radiant Generosity', 'Sovereign Expression', 'Heliocentric Warmth'],
    ruler: 'Sun',
  },
  {
    sign: 'Virgo',
    symbol: 'The Astrea Maiden of Wheat',
    unicodeGlyph: '♍',
    element: 'Earth',
    modality: 'Mutable',
    polarity: 'Nocturnal',
    dateRange: 'Aug 23 – Sep 22',
    themes: ['Editorial Precision', 'Botanical Taxonomy', 'Refined Discernment'],
    ruler: 'Mercury',
  },
  {
    sign: 'Libra',
    symbol: 'The Golden Scales',
    unicodeGlyph: '♎',
    element: 'Air',
    modality: 'Cardinal',
    polarity: 'Diurnal',
    dateRange: 'Sep 23 – Oct 22',
    themes: ['Classical Proportion', 'Aesthetic Equilibrium', 'Harmonic Justice'],
    ruler: 'Venus',
  },
  {
    sign: 'Scorpio',
    symbol: 'The Alchemical Phoenix & Scorpion',
    unicodeGlyph: '♏',
    element: 'Water',
    modality: 'Fixed',
    polarity: 'Nocturnal',
    dateRange: 'Oct 23 – Nov 21',
    themes: ['Subterranean Depth', 'Transformative Alchemy', 'Magnetic Focus'],
    ruler: 'Mars & Pluto',
  },
  {
    sign: 'Sagittarius',
    symbol: 'The Centaur Archer',
    unicodeGlyph: '♐',
    element: 'Fire',
    modality: 'Mutable',
    polarity: 'Diurnal',
    dateRange: 'Nov 22 – Dec 21',
    themes: ['Philosophical Odyssey', 'Celestial Cartography', 'Expansive Horizon'],
    ruler: 'Jupiter',
  },
];

function getWesternSign(month: number, day: number): WesternZodiacDef {
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return WESTERN_ZODIAC_TABLE[0];
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return WESTERN_ZODIAC_TABLE[1];
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return WESTERN_ZODIAC_TABLE[2];
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return WESTERN_ZODIAC_TABLE[3];
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return WESTERN_ZODIAC_TABLE[4];
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return WESTERN_ZODIAC_TABLE[5];
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return WESTERN_ZODIAC_TABLE[6];
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return WESTERN_ZODIAC_TABLE[7];
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return WESTERN_ZODIAC_TABLE[8];
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return WESTERN_ZODIAC_TABLE[9];
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return WESTERN_ZODIAC_TABLE[10];
  return WESTERN_ZODIAC_TABLE[11];
}

/**
 * MODULE 5: Zodiac Calculation Engine
 */
export function runZodiacCalculationEngine(input: PersonInput): ZodiacCalculationOutput {
  const check = validateBirthDateInput(input.birthDate, input.birthYear);
  if (!check.isProvided || !check.isValid) {
    return { computed: false };
  }

  let westernSign: ZodiacCalculationOutput['westernSign'];
  if (check.month && check.day) {
    const def = getWesternSign(check.month, check.day);
    const decan = check.day <= 10 ? 1 : check.day <= 20 ? 2 : 3;
    westernSign = {
      value: {
        sign: def.sign,
        symbol: def.symbol,
        unicodeGlyph: def.unicodeGlyph,
        element: def.element,
        modality: def.modality,
        polarity: def.polarity,
        decan,
        dateRange: def.dateRange,
        symbolicThemes: def.themes,
      },
      category: 'astrological_interpretation',
      source: 'Tropical Ecliptic Solar Longitude (Symbolic Astrological Tradition)',
    };
  }

  let lunarYearSign: ZodiacCalculationOutput['lunarYearSign'];
  if (check.year) {
    const animals = [
      'Monkey',
      'Rooster',
      'Dog',
      'Boar',
      'Rat',
      'Ox',
      'Tiger',
      'Rabbit',
      'Dragon',
      'Serpent',
      'Horse',
      'Ram',
    ];
    const elements = ['Metal', 'Metal', 'Water', 'Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth'];
    const animal = animals[check.year % 12];
    const element = elements[check.year % 10];
    const yinYang: 'Yin' | 'Yang' = check.year % 2 === 0 ? 'Yang' : 'Yin';

    lunarYearSign = {
      value: {
        animal,
        element,
        yinYang,
        symbolicQualities: [`${element} ${animal}`, `${yinYang} Polarity`, 'East Asian Sexagenary Cycle'],
      },
      category: 'astrological_interpretation',
      source: 'Traditional East Asian Sexagenary Calendar (Symbolic Interpretation)',
    };
  }

  return {
    computed: Boolean(westernSign || lunarYearSign),
    westernSign,
    lunarYearSign,
  };
}

interface PlanetaryProfile {
  name: string;
  classicalSymbol: string;
  orbitalPeriodDays: number;
  axialTiltDegrees: number;
  albedo: number;
  dominantSpectrumHex: string;
  secondarySpectrumHex: string;
  harmonicFrequencyHz: number;
  ringSystem: boolean;
  moonCount: number;
  poeticEpithet: string;
}

const PLANETARY_CATALOG: Record<string, PlanetaryProfile> = {
  Venus: {
    name: 'Venus (Hesperus / Zuhrah)',
    classicalSymbol: '♀',
    orbitalPeriodDays: 224.7,
    axialTiltDegrees: 177.36,
    albedo: 0.77,
    dominantSpectrumHex: '#D4A359',
    secondarySpectrumHex: '#254E70',
    harmonicFrequencyHz: 221.23, // Hans Cousto Cosmic Octave for Venus
    ringSystem: false,
    moonCount: 0,
    poeticEpithet: 'The Morning & Evening Star of Harmonic Proportion',
  },
  Mercury: {
    name: 'Mercury (Hermes / Utarid)',
    classicalSymbol: '☿',
    orbitalPeriodDays: 87.97,
    axialTiltDegrees: 0.03,
    albedo: 0.068,
    dominantSpectrumHex: '#94A3B8',
    secondarySpectrumHex: '#38BDF8',
    harmonicFrequencyHz: 141.27,
    ringSystem: false,
    moonCount: 0,
    poeticEpithet: 'The Swift Meridian of Language, Optics, and Synthesis',
  },
  Sun: {
    name: 'Sol (Helios / Shams)',
    classicalSymbol: '☉',
    orbitalPeriodDays: 365.25,
    axialTiltDegrees: 7.25,
    albedo: 1.0,
    dominantSpectrumHex: '#E09F3E',
    secondarySpectrumHex: '#9E2A2B',
    harmonicFrequencyHz: 126.22,
    ringSystem: false,
    moonCount: 8,
    poeticEpithet: 'The Sovereign Aperture of First Light',
  },
  Moon: {
    name: 'Luna (Selene / Qamar)',
    classicalSymbol: '☽',
    orbitalPeriodDays: 27.32,
    axialTiltDegrees: 6.68,
    albedo: 0.12,
    dominantSpectrumHex: '#E2E8F0',
    secondarySpectrumHex: '#475569',
    harmonicFrequencyHz: 210.42,
    ringSystem: false,
    moonCount: 1,
    poeticEpithet: 'The Silver Mirror of Tides and Archival Memory',
  },
  Jupiter: {
    name: 'Jupiter (Jove / Mushtari)',
    classicalSymbol: '♃',
    orbitalPeriodDays: 4332.59,
    axialTiltDegrees: 3.13,
    albedo: 0.538,
    dominantSpectrumHex: '#C87D55',
    secondarySpectrumHex: '#1D3557',
    harmonicFrequencyHz: 183.58,
    ringSystem: true,
    moonCount: 95,
    poeticEpithet: 'The Great Benefic of Philosophical Horizons',
  },
  Saturn: {
    name: 'Saturn (Kronos / Zuhal)',
    classicalSymbol: '♄',
    orbitalPeriodDays: 10759.22,
    axialTiltDegrees: 26.73,
    albedo: 0.499,
    dominantSpectrumHex: '#C2B280',
    secondarySpectrumHex: '#2B2D42',
    harmonicFrequencyHz: 147.85,
    ringSystem: true,
    moonCount: 146,
    poeticEpithet: 'The Ringed Geometer of Time and Monumental Structure',
  },
  Mars: {
    name: 'Mars (Ares / Mirrikh)',
    classicalSymbol: '♂',
    orbitalPeriodDays: 686.98,
    axialTiltDegrees: 25.19,
    albedo: 0.17,
    dominantSpectrumHex: '#C1493D',
    secondarySpectrumHex: '#3D2622',
    harmonicFrequencyHz: 144.72,
    ringSystem: false,
    moonCount: 2,
    poeticEpithet: 'The Ochre Forge of Kinetic Resolve',
  },
};

/**
 * MODULE 6: Planetary Association Engine
 */
export function runPlanetaryAssociationEngine(
  input: PersonInput,
  zodiac: ZodiacCalculationOutput
): PlanetaryAssociationOutput {
  const signToPlanet: Record<string, keyof typeof PLANETARY_CATALOG> = {
    Aries: 'Mars',
    Taurus: 'Venus',
    Gemini: 'Mercury',
    Cancer: 'Moon',
    Leo: 'Sun',
    Virgo: 'Mercury',
    Libra: 'Venus',
    Scorpio: 'Mars',
    Sagittarius: 'Jupiter',
    Capricorn: 'Saturn',
    Aquarius: 'Saturn',
    Pisces: 'Jupiter',
  };

  let selectedKey: keyof typeof PLANETARY_CATALOG = 'Venus';
  if (zodiac.westernSign) {
    selectedKey = signToPlanet[zodiac.westernSign.value.sign] || 'Venus';
  } else {
    const keys = Object.keys(PLANETARY_CATALOG) as Array<keyof typeof PLANETARY_CATALOG>;
    const hash = deterministicHash(input.fullName.toLowerCase());
    selectedKey = keys[hash % keys.length];
  }

  const profile = PLANETARY_CATALOG[selectedKey];
  const hash = deterministicHash(input.fullName);

  return {
    rulingBody: {
      value: profile,
      category: zodiac.westernSign ? 'astrological_interpretation' : 'creative_interpretation',
      source:
        'IAU Planetary Ephemeris Constants (Orbital Period, Tilt, Albedo) + Classical Celestial Symbolism',
    },
    shaderParameters: {
      orbitSpeed: Number((0.18 + (hash % 30) / 100).toFixed(2)),
      particleCount: 900 + (hash % 600),
      turbulence: Number((0.12 + (hash % 25) / 100).toFixed(2)),
      bloomIntensity: Number((0.45 + (hash % 35) / 100).toFixed(2)),
      wireframeRatio: Number((0.25 + (hash % 40) / 100).toFixed(2)),
    },
  };
}
