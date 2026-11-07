'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ShieldCheck,
  ExternalLink,
  CheckCircle,
  Info,
  Sliders,
} from 'lucide-react';
import { EpistemicCategory, PersonalizedExperience } from '@/types/experience';
import { MagneticCursor, InteractiveTiltCard } from './InteractiveCursorAndMotion';
import {
  CharacterAndHarmonicModule,
  ConstellationMiniGameModule,
  EasterEggVaultModule,
  PersonalEpistleAndPostcardModule,
} from './EmotionalAndAdvancedModules';

const ThreeSceneCanvas = dynamic(() => import('./ThreeSceneCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] flex items-center justify-center font-mono text-xs uppercase tracking-widest opacity-60">
      Initializing 3D WebGL Sanctuary...
    </div>
  ),
});

interface ExperienceRendererProps {
  experience: PersonalizedExperience;
  isEmbeddedPreview?: boolean;
  onOpenStudioEditor?: () => void;
}

const EPISTEMIC_BADGE_META: Record<
  EpistemicCategory,
  { label: string; description: string }
> = {
  verified_fact: {
    label: 'Verified Fact',
    description: 'Backed by linguistic, historical, or astronomical reference documentation.',
  },
  user_provided: {
    label: 'User-Provided',
    description: 'Directly supplied by the user during experience creation.',
  },
  astrological_interpretation: {
    label: 'Celestial Symbolism',
    description: 'Traditional solar/lunar zodiac or numerological symbolic correspondence.',
  },
  creative_interpretation: {
    label: 'Creative Direction',
    description: 'Art-directed poetic or visual metaphor synthesized for this monograph.',
  },
};

export default function ExperienceRenderer({
  experience,
  isEmbeddedPreview = false,
  onOpenStudioEditor,
}: ExperienceRendererProps) {
  const {
    nameResearch,
    culturalContext,
    planetary,
    personality,
    creativeDirection,
    storytelling,
    visualDesign,
    interactions,
    content,
    verification,
  } = experience.intelligence;

  const p = visualDesign.colorPalette;
  const typo = visualDesign.typography;

  const [reducedMotion, setReducedMotion] = useState(false);
  const [epistemicFilter, setEpistemicFilter] = useState<EpistemicCategory | 'all'>('all');

  const monogramInitials = nameResearch.normalizedName
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div
      className="relative min-h-screen w-full transition-colors duration-500 selection:bg-amber-500/20"
      style={{
        backgroundColor: p.backgroundPrimary,
        color: p.textPrimary,
        fontFamily: typo.sansFont,
      }}
    >
      {/* Magnetic Cursor (automatically disabled on touch or reduced-motion) */}
      {!reducedMotion && !isEmbeddedPreview && (
        <MagneticCursor mode={interactions.cursorMode} accentColor={p.accentPrimary} />
      )}

      {/* Subtle architectural grid / topographic background treatment */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            visualDesign.backgroundTreatment === 'architectural-draft'
              ? `linear-gradient(to right, ${p.textPrimary} 1px, transparent 1px), linear-gradient(to bottom, ${p.textPrimary} 1px, transparent 1px)`
              : `radial-gradient(${p.accentPrimary} 1px, transparent 1px)`,
          backgroundSize:
            visualDesign.backgroundTreatment === 'architectural-draft' ? '64px 64px' : '32px 32px',
        }}
      />

      {/* Top Navigation Bar */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md border-b px-6 py-3.5"
        style={{
          backgroundColor: p.surfaceGlass,
          borderColor: p.borderSubtle,
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 flex items-center justify-center font-mono text-xs font-bold border"
              style={{
                borderColor: p.accentPrimary,
                color: p.accentPrimary,
                borderRadius: visualDesign.borderRadiusToken,
              }}
            >
              {monogramInitials.slice(0, 2)}
            </span>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest" style={{ color: p.accentPrimary }}>
                {creativeDirection.archetypeName}
              </div>
              <div className="text-xs font-medium" style={{ color: p.textSecondary }}>
                {nameResearch.normalizedName} · {nameResearch.phoneticIPA.value}
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-5" aria-label="Experience Chapters">
            {content.navigationItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-xs font-mono uppercase tracking-wider transition-opacity hover:opacity-100 opacity-75"
                style={{ color: p.textPrimary }}
              >
                <span style={{ color: p.accentPrimary }}>{item.index}.</span> {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReducedMotion((prev) => !prev)}
              className="px-2.5 py-1.5 text-[11px] font-mono uppercase border"
              style={{
                borderColor: p.borderSubtle,
                color: p.textSecondary,
                borderRadius: visualDesign.borderRadiusToken,
              }}
              title="Toggle Reduced Motion Mode"
            >
              {reducedMotion ? 'Motion: Reduced' : 'Motion: Full'}
            </button>
            {onOpenStudioEditor && (
              <button
                type="button"
                onClick={onOpenStudioEditor}
                className="px-3 py-1.5 text-[11px] font-mono uppercase border inline-flex items-center gap-1.5"
                style={{
                  backgroundColor: p.accentPrimary,
                  color: p.backgroundPrimary,
                  borderColor: p.accentPrimary,
                  borderRadius: visualDesign.borderRadiusToken,
                }}
              >
                <Sliders className="w-3.5 h-3.5" />
                Customize in Studio
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 sm:py-16 space-y-24">
        {/* SECTION 00: HERO SANCTUARY WITH 3D WEBGL SCENE */}
        <section
          id="hero"
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[72vh] pb-12 border-b"
          style={{ borderColor: p.borderSubtle }}
        >
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex flex-wrap items-center gap-2">
              <span
                className="px-3 py-1 text-xs font-mono uppercase tracking-widest border"
                style={{
                  borderColor: p.accentPrimary,
                  color: p.accentPrimary,
                  borderRadius: visualDesign.borderRadiusToken,
                }}
              >
                {nameResearch.linguisticFamily.value}
              </span>
              <span
                className="px-3 py-1 text-xs font-mono border"
                style={{
                  borderColor: p.borderSubtle,
                  color: p.textSecondary,
                  borderRadius: visualDesign.borderRadiusToken,
                }}
              >
                IPA: {nameResearch.phoneticIPA.value}
              </span>
              <span
                className="px-3 py-1 text-xs font-mono border"
                style={{
                  borderColor: p.borderSubtle,
                  color: p.textSecondary,
                  borderRadius: visualDesign.borderRadiusToken,
                }}
              >
                {planetary.rulingBody.value.classicalSymbol} {planetary.rulingBody.value.harmonicFrequencyHz} Hz
              </span>
            </div>

            <h1
              className="font-bold tracking-tight leading-[1.03]"
              style={{
                fontFamily: typo.displayFont,
                fontSize: `clamp(3.1rem, 7vw, ${typo.heroScaleRem}rem)`,
                letterSpacing: typo.displayTracking,
              }}
            >
              {storytelling.heroHeadline}
            </h1>

            <p
              className="text-xl sm:text-2xl leading-snug"
              style={{
                fontFamily: typo.serifFont,
                color: p.accentPrimary,
              }}
            >
              {storytelling.heroSubheadline}
            </p>

            <p
              className="text-base sm:text-lg leading-relaxed max-w-2xl"
              style={{ color: p.textSecondary }}
            >
              {storytelling.prologueManifesto}
            </p>

            {/* Script & Calligraphic Variations */}
            <div className="pt-2 flex flex-wrap gap-3">
              {nameResearch.scriptVariations.map((sv) => (
                <div
                  key={sv.scriptName}
                  className="px-4 py-2.5 border"
                  style={{
                    backgroundColor: p.backgroundElevated,
                    borderColor: p.borderSubtle,
                    borderRadius: visualDesign.borderRadiusToken,
                  }}
                >
                  <div className="text-[10px] font-mono uppercase" style={{ color: p.textMuted }}>
                    {sv.scriptName}
                  </div>
                  <div
                    className="text-lg font-semibold mt-0.5"
                    style={{ fontFamily: typo.displayFont, color: p.textPrimary }}
                  >
                    {sv.representation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive 3D WebGL Sculpture */}
          <div
            className="lg:col-span-5 h-[420px] sm:h-[480px] border relative overflow-hidden"
            style={{
              backgroundColor: p.backgroundElevated,
              borderColor: p.borderSubtle,
              borderRadius: visualDesign.borderRadiusToken,
            }}
          >
            <ThreeSceneCanvas
              mode={interactions.threeSceneMode}
              primaryColor={p.accentPrimary}
              secondaryColor={p.accentSecondary}
              accentTertiary={p.accentTertiary}
              particleCount={planetary.shaderParameters.particleCount}
              orbitSpeed={planetary.shaderParameters.orbitSpeed}
              monogramInitials={monogramInitials}
              reducedMotion={reducedMotion}
            />
          </div>
        </section>

        {/* SECTION 01: ARCHIVAL IDENTITY DOSSIER WITH EPISTEMIC TAGS */}
        <section id="dossier" className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest" style={{ color: p.accentPrimary }}>
                01 / STRUCTURED INTELLIGENCE SYNTHESIS
              </div>
              <h2
                className="text-3xl sm:text-4xl font-semibold mt-1"
                style={{ fontFamily: typo.displayFont }}
              >
                {content.identityDossier.sectionTitle}
              </h2>
            </div>

            {/* Epistemic Tier Filter */}
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'verified_fact', 'user_provided', 'astrological_interpretation', 'creative_interpretation'] as const).map(
                (tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setEpistemicFilter(tier)}
                    className="px-3 py-1.5 text-[11px] font-mono uppercase border transition-colors"
                    style={{
                      backgroundColor:
                        epistemicFilter === tier ? p.accentPrimary : p.backgroundElevated,
                      color: epistemicFilter === tier ? p.backgroundPrimary : p.textSecondary,
                      borderColor: epistemicFilter === tier ? p.accentPrimary : p.borderSubtle,
                      borderRadius: visualDesign.borderRadiusToken,
                    }}
                  >
                    {tier === 'all' ? 'All Tiers' : EPISTEMIC_BADGE_META[tier].label}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.identityDossier.cards
              .filter((c) => epistemicFilter === 'all' || c.epistemicCategory === epistemicFilter)
              .map((card) => (
                <InteractiveTiltCard
                  key={card.id}
                  accentColor={p.accentPrimary}
                  className="p-7 border"
                  style={{
                    backgroundColor: p.backgroundElevated,
                    borderColor: p.borderSubtle,
                    borderRadius: visualDesign.borderRadiusToken,
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs uppercase tracking-wider" style={{ color: p.accentPrimary }}>
                      {card.label}
                    </span>
                    <span
                      className="px-2.5 py-0.5 text-[10px] font-mono uppercase border"
                      style={{
                        borderColor: p.borderSubtle,
                        color: p.textSecondary,
                        borderRadius: visualDesign.borderRadiusToken,
                      }}
                    >
                      {EPISTEMIC_BADGE_META[card.epistemicCategory].label}
                    </span>
                  </div>
                  <h3
                    className="text-2xl font-semibold mb-2"
                    style={{ fontFamily: typo.displayFont }}
                  >
                    {card.title}
                  </h3>
                  <div
                    className="text-base font-medium mb-2"
                    style={{ color: p.accentPrimary }}
                  >
                    {card.value}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: p.textSecondary }}>
                    {card.detail}
                  </p>
                </InteractiveTiltCard>
              ))}
          </div>

          {/* Historical Bearers & Cultural Color Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
            <div
              className="lg:col-span-7 p-7 border space-y-4"
              style={{
                backgroundColor: p.backgroundElevated,
                borderColor: p.borderSubtle,
                borderRadius: visualDesign.borderRadiusToken,
              }}
            >
              <div className="font-mono text-xs uppercase tracking-widest" style={{ color: p.accentPrimary }}>
                HISTORICAL & ARCHIVAL BEARERS [VERIFIED FACT]
              </div>
              <div className="space-y-4">
                {nameResearch.historicalBearers.map((bearer) => (
                  <div
                    key={bearer.name}
                    className="pb-4 last:pb-0 border-b last:border-b-0"
                    style={{ borderColor: p.borderSubtle }}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4
                        className="text-xl font-semibold"
                        style={{ fontFamily: typo.displayFont }}
                      >
                        {bearer.name}
                      </h4>
                      <span className="font-mono text-xs" style={{ color: p.accentPrimary }}>
                        {bearer.era}
                      </span>
                    </div>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: p.textSecondary }}>
                      {bearer.achievement}
                    </p>
                    <div className="font-mono text-[11px] mt-1.5" style={{ color: p.textMuted }}>
                      Source: {bearer.source}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="lg:col-span-5 p-7 border space-y-4"
              style={{
                backgroundColor: p.backgroundElevated,
                borderColor: p.borderSubtle,
                borderRadius: visualDesign.borderRadiusToken,
              }}
            >
              <div className="font-mono text-xs uppercase tracking-widest" style={{ color: p.accentPrimary }}>
                CULTURAL PIGMENT & MATERIAL HERITAGE
              </div>
              <div className="space-y-3">
                {culturalContext.colorHeritage.map((swatch) => (
                  <div key={swatch.name} className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 shrink-0 border"
                      style={{
                        backgroundColor: swatch.hex,
                        borderColor: p.borderSubtle,
                        borderRadius: visualDesign.borderRadiusToken,
                      }}
                    />
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2">
                        {swatch.name}
                        <span className="font-mono text-xs" style={{ color: p.textMuted }}>
                          {swatch.hex}
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: p.textSecondary }}>
                        {swatch.culturalOrigin}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02: NARRATIVE CHRONICLE CHAPTERS */}
        <section id="chronicle" className="space-y-8">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest" style={{ color: p.accentPrimary }}>
              02 / FOUR-CHAPTER EDITORIAL CHRONICLE
            </div>
            <h2
              className="text-3xl sm:text-4xl font-semibold mt-1"
              style={{ fontFamily: typo.displayFont }}
            >
              Origin, Meridian, Ephemeris & Living Craft
            </h2>
          </div>

          <div className="space-y-6">
            {storytelling.chapters.map((ch) => (
              <article
                key={ch.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 border"
                style={{
                  backgroundColor: p.backgroundElevated,
                  borderColor: p.borderSubtle,
                  borderRadius: visualDesign.borderRadiusToken,
                }}
              >
                <div className="lg:col-span-4 space-y-2">
                  <div className="font-mono text-xs uppercase" style={{ color: p.accentPrimary }}>
                    CHAPTER {ch.chapterNumber} · {EPISTEMIC_BADGE_META[ch.epistemicTag].label}
                  </div>
                  <h3
                    className="text-2xl sm:text-3xl font-semibold"
                    style={{ fontFamily: typo.displayFont }}
                  >
                    {ch.title}
                  </h3>
                  <div className="font-mono text-xs" style={{ color: p.textMuted }}>
                    {ch.subtitle}
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-4">
                  <p className="text-base sm:text-lg leading-relaxed" style={{ color: p.textPrimary }}>
                    {ch.narrativeBody}
                  </p>
                  <blockquote
                    className="pl-4 border-l-2 italic text-lg sm:text-xl"
                    style={{
                      borderColor: p.accentPrimary,
                      fontFamily: typo.serifFont,
                      color: p.accentPrimary,
                    }}
                  >
                    “{ch.pullQuote}”
                  </blockquote>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 03: INTERACTIVE CHARACTER TOTEM & HARMONIC AUDIO SYNTHESIZER */}
        <section id="totem" className="space-y-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest" style={{ color: p.accentPrimary }}>
              03 / SONIC & SYMBOLIC INTERACTION
            </div>
            <h2
              className="text-3xl sm:text-4xl font-semibold mt-1"
              style={{ fontFamily: typo.displayFont }}
            >
              Interactive Character Totem & Planetary Harmonics
            </h2>
          </div>
          <CharacterAndHarmonicModule experience={experience} />
        </section>

        {/* SECTION 04: CONSTELLATION ALIGNMENT MINI-GAME */}
        <section id="constellation" className="space-y-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest" style={{ color: p.accentPrimary }}>
              04 / INTERACTIVE DISCOVERY
            </div>
            <h2
              className="text-3xl sm:text-4xl font-semibold mt-1"
              style={{ fontFamily: typo.displayFont }}
            >
              Celestial Sigil & Star Alignment
            </h2>
          </div>
          <ConstellationMiniGameModule experience={experience} />
        </section>

        {/* SECTION 05: PERSONAL EPISTLE & DIGITAL POSTCARD STUDIO */}
        <section id="epistle" className="space-y-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest" style={{ color: p.accentPrimary }}>
              05 / EMOTIONAL ARTIFACTS
            </div>
            <h2
              className="text-3xl sm:text-4xl font-semibold mt-1"
              style={{ fontFamily: typo.displayFont }}
            >
              Personal Wax-Sealed Epistle & Postcard Studio
            </h2>
          </div>
          <PersonalEpistleAndPostcardModule experience={experience} />
        </section>

        {/* SECTION 06: RESEARCH VERIFICATION & EPISTEMIC PROVENANCE AUDIT */}
        <section id="provenance" className="space-y-6">
          <div
            className="p-8 border space-y-6"
            style={{
              backgroundColor: p.backgroundElevated,
              borderColor: p.borderSubtle,
              borderRadius: visualDesign.borderRadiusToken,
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5" style={{ borderColor: p.borderSubtle }}>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6" style={{ color: p.accentPrimary }} />
                <div>
                  <div className="font-mono text-xs uppercase tracking-widest" style={{ color: p.accentPrimary }}>
                    06 / MODULE 14 RESEARCH VERIFICATION ENGINE
                  </div>
                  <h2
                    className="text-2xl font-semibold"
                    style={{ fontFamily: typo.displayFont }}
                  >
                    Epistemic Provenance & Non-Fabrication Audit
                  </h2>
                </div>
              </div>

              <div className="font-mono text-xs px-3 py-1.5 border" style={{ borderColor: p.accentPrimary, color: p.accentPrimary }}>
                STATUS: {verification.passed ? 'VERIFIED & AUDITED' : 'REVIEW REQUIRED'}
              </div>
            </div>

            {/* 4-Tier Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 border" style={{ backgroundColor: p.backgroundPrimary, borderColor: p.borderSubtle }}>
                <div className="font-mono text-xs uppercase" style={{ color: p.accentPrimary }}>
                  Verified Facts
                </div>
                <div className="text-2xl font-bold mt-1">{verification.breakdown.verifiedFactsCount}</div>
                <div className="text-xs mt-1" style={{ color: p.textMuted }}>
                  Linguistic, calendar & archival citations
                </div>
              </div>
              <div className="p-4 border" style={{ backgroundColor: p.backgroundPrimary, borderColor: p.borderSubtle }}>
                <div className="font-mono text-xs uppercase" style={{ color: p.accentPrimary }}>
                  User-Provided
                </div>
                <div className="text-2xl font-bold mt-1">{verification.breakdown.userProvidedCount}</div>
                <div className="text-xs mt-1" style={{ color: p.textMuted }}>
                  Direct personal inputs & hobbies
                </div>
              </div>
              <div className="p-4 border" style={{ backgroundColor: p.backgroundPrimary, borderColor: p.borderSubtle }}>
                <div className="font-mono text-xs uppercase" style={{ color: p.accentPrimary }}>
                  Celestial Symbolism
                </div>
                <div className="text-2xl font-bold mt-1">{verification.breakdown.astrologicalCount}</div>
                <div className="text-xs mt-1" style={{ color: p.textMuted }}>
                  Solar/lunar symbolic tradition
                </div>
              </div>
              <div className="p-4 border" style={{ backgroundColor: p.backgroundPrimary, borderColor: p.borderSubtle }}>
                <div className="font-mono text-xs uppercase" style={{ color: p.accentPrimary }}>
                  Creative Synthesis
                </div>
                <div className="text-2xl font-bold mt-1">{verification.breakdown.creativeInterpretationCount}</div>
                <div className="text-xs mt-1" style={{ color: p.textMuted }}>
                  Art direction & visual metaphors
                </div>
              </div>
            </div>

            {/* Epistemic Guarantees & Non-Inference Notice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="font-mono text-xs uppercase" style={{ color: p.accentPrimary }}>
                  Epistemic Integrity Guarantees
                </div>
                <ul className="space-y-1.5 text-xs" style={{ color: p.textSecondary }}>
                  {verification.epistemicGuarantees.map((g, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: p.accentPrimary }} />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs pt-2 italic" style={{ color: p.textMuted }}>
                  {personality.strictNonInferenceNotice}
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-mono text-xs uppercase" style={{ color: p.accentPrimary }}>
                  Preserved Reference Sources
                </div>
                <ul className="space-y-1.5 text-xs">
                  {nameResearch.sources.map((src) => (
                    <li key={src.id} className="flex items-center justify-between gap-2 py-1 border-b" style={{ borderColor: p.borderSubtle }}>
                      <span style={{ color: p.textPrimary }}>{src.title}</span>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase"
                        style={{ color: p.accentPrimary }}
                      >
                        {src.domain}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {verification.sanitizedWarnings.length > 0 && (
              <div
                className="p-3 border flex items-center gap-2 text-xs font-mono"
                style={{ borderColor: p.accentPrimary, color: p.accentPrimary }}
              >
                <Info className="w-4 h-4 shrink-0" />
                <span>Validation Notice: {verification.sanitizedWarnings.join(' | ')}</span>
              </div>
            )}
          </div>

          {/* Easter Egg Cipher Vault */}
          <EasterEggVaultModule experience={experience} />
        </section>
      </main>

      {/* Monograph Colophon Footer */}
      <footer
        className="border-t py-8 px-6 font-mono text-xs"
        style={{
          borderColor: p.borderSubtle,
          color: p.textMuted,
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            EXPERIENCE ID: {experience.id} · SLUG: /e/{experience.slug} · VERSION v{experience.version}
          </div>
          <div>
            ARCHETYPE: {creativeDirection.archetypeName.toUpperCase()} · GENERATED BY ATELIER ENGINE
          </div>
        </div>
      </footer>
    </div>
  );
}
