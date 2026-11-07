'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  Layers,
  Code2,
  GitBranch,
  Globe,
  RefreshCw,
  Trash2,
  ExternalLink,
  AlertCircle,
  Sliders,
  History,
  Download,
  Copy,
  Eye,
  Cpu,
} from 'lucide-react';
import {
  ArchetypeId,
  PersonalizedExperience,
  PersonInput,
} from '@/types/experience';
import ExperienceRenderer from '@/components/experience/ExperienceRenderer';

interface StudioDashboardProps {
  initialExperiences: PersonalizedExperience[];
  initialSelectedSlug?: string;
}

type StudioTab =
  | 'preview'
  | 'generator'
  | 'pipeline'
  | 'intelligence'
  | 'editor'
  | 'export_deploy';

const ARCHETYPE_OPTIONS: Array<{ id: ArchetypeId | 'auto'; label: string; desc: string }> = [
  { id: 'auto', label: 'Auto Art-Directed (Recommended)', desc: 'Adaptive selection from cultural & phonetic vectors' },
  { id: 'editorial_monograph', label: 'Illuminated Architectural Monograph', desc: 'Warm parchment, lapis ink, astrolabe brass' },
  { id: 'celestial_observatory', label: 'Nocturnal Celestial Observatory', desc: 'Midnight indigo, solar amber, ecliptic vault' },
  { id: 'kinetic_atelier', label: 'Kinetic Spatial Atelier', desc: 'Sumi obsidian, plaster white, vermilion seal' },
  { id: 'botanical_sanctuary', label: 'Naturalist Herbarium Sanctuary', desc: 'Alabaster linen, cypress green, terracotta' },
  { id: 'swiss_brutalist_grid', label: 'Neo-Swiss Constructivist Grid', desc: 'Exposed modular grid, Bauhaus 3D primitives' },
  { id: 'ethereal_storybook', label: 'Twilight Poetic Chronicle', desc: 'Candlelit saffron, rosewood, intimate epistle' },
];

export default function StudioDashboard({
  initialExperiences,
  initialSelectedSlug,
}: StudioDashboardProps) {
  const [experiences, setExperiences] = useState<PersonalizedExperience[]>(initialExperiences);
  const initialActive =
    initialExperiences.find((e) => e.slug === initialSelectedSlug) || initialExperiences[0] || null;

  const [selectedSlug, setSelectedSlug] = useState<string>(initialActive?.slug || '');
  const [activeTab, setActiveTab] = useState<StudioTab>('preview');

  // Form state for New Experience Generation
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthplace, setBirthplace] = useState('');
  const [country, setCountry] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [hobbiesInput, setHobbiesInput] = useState('');
  const [personalPreferences, setPersonalPreferences] = useState('');
  const [personalityInfo, setPersonalityInfo] = useState('');
  const [preferredVisualDirection, setPreferredVisualDirection] = useState<ArchetypeId | 'auto'>('auto');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepIndex, setGenerationStepIndex] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Live Editor state
  const [editHeroHeadline, setEditHeroHeadline] = useState(
    initialActive?.intelligence.storytelling.heroHeadline || ''
  );
  const [editHeroSubheadline, setEditHeroSubheadline] = useState(
    initialActive?.intelligence.storytelling.heroSubheadline || ''
  );
  const [editPrologue, setEditPrologue] = useState(
    initialActive?.intelligence.storytelling.prologueManifesto || ''
  );
  const [editLetterFirstPara, setEditLetterFirstPara] = useState(
    initialActive?.intelligence.storytelling.personalLetter.bodyParagraphs[0] || ''
  );
  const [editAccentColor, setEditAccentColor] = useState(
    initialActive?.intelligence.visualDesign.colorPalette.accentPrimary || '#B67B32'
  );
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Export, GitHub & Vercel state
  const [exportFiles, setExportFiles] = useState<
    Array<{ path: string; content: string; language: string }>
  >([]);
  const [selectedExportFile, setSelectedExportFile] = useState('index.html');
  const [copiedCode, setCopiedCode] = useState(false);

  // GitHub state
  const [ghStatus, setGhStatus] = useState<{
    connected: boolean;
    account?: { login: string; profileUrl: string };
    repositories?: Array<{ name: string; nameWithOwner: string; url: string; isPrivate: boolean }>;
  } | null>(null);
  const [ghRepoName, setGhRepoName] = useState(`persona-${initialActive?.slug || 'experience'}`);
  const [ghVisibility, setGhVisibility] = useState<'public' | 'private'>('public');
  const [ghExplicitConfirm, setGhExplicitConfirm] = useState(false);
  const [ghCustomToken, setGhCustomToken] = useState('');
  const [ghPublishing, setGhPublishing] = useState(false);
  const [ghResult, setGhResult] = useState<{ ok: boolean; repoUrl?: string; error?: string } | null>(
    null
  );

  // Vercel state
  const [vercelToken, setVercelToken] = useState('');
  const [vercelProjectName, setVercelProjectName] = useState(
    `persona-${initialActive?.slug || 'experience'}`
  );
  const [vercelTarget, setVercelTarget] = useState<'production' | 'preview'>('production');
  const [vercelDeploying, setVercelDeploying] = useState(false);
  const [vercelResult, setVercelResult] = useState<{
    ok: boolean;
    deploymentUrl?: string;
    readyState?: string;
    error?: string;
  } | null>(null);

  const currentExperience =
    experiences.find((e) => e.slug === selectedSlug) || experiences[0] || null;

  const selectExperienceAndSync = (slug: string, list: PersonalizedExperience[] = experiences) => {
    setSelectedSlug(slug);
    const target = list.find((e) => e.slug === slug);
    if (target) {
      setEditHeroHeadline(target.intelligence.storytelling.heroHeadline);
      setEditHeroSubheadline(target.intelligence.storytelling.heroSubheadline);
      setEditPrologue(target.intelligence.storytelling.prologueManifesto);
      setEditLetterFirstPara(
        target.intelligence.storytelling.personalLetter.bodyParagraphs[0] || ''
      );
      setEditAccentColor(target.intelligence.visualDesign.colorPalette.accentPrimary);
      setGhRepoName(`persona-${target.slug}`);
      setVercelProjectName(`persona-${target.slug}`);
    }
  };

  useEffect(() => {
    if (activeTab !== 'export_deploy' || !currentExperience) return;
    let cancelled = false;
    (async () => {
      try {
        const [expRes, ghRes] = await Promise.all([
          fetch(`/api/experiences/${encodeURIComponent(currentExperience.slug)}/export`),
          fetch('/api/integrations/github'),
        ]);
        if (cancelled) return;
        if (expRes.ok) {
          const data = await expRes.json();
          if (data.bundle?.files) {
            setExportFiles(data.bundle.files);
            setSelectedExportFile(data.bundle.files[0]?.path || 'index.html');
          }
        }
        if (ghRes.ok) {
          const ghData = await ghRes.json();
          setGhStatus(ghData);
        }
      } catch {
        // Ignore transient fetch issues
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, currentExperience]);

  const applyQuickPreset = (preset: 'fatima' | 'alexander' | 'maya') => {
    if (preset === 'fatima') {
      setFullName('Fatima Al-Zahra');
      setBirthDate('1999-10-14');
      setBirthYear('1999');
      setBirthTime('06:30');
      setBirthplace('Fez');
      setCountry('Morocco');
      setInterestsInput('Sacred Architecture, Astrolabe Geometry, Classical Arabic Poetry');
      setHobbiesInput('Calligraphy, Botanical Gardens, Archival Bookbinding');
      setPersonalPreferences('Warm vellum parchment, Fez cobalt lapis, burnished brass');
      setPersonalityInfo('Luminous, contemplative, discerning, devoted to timeless scholarship');
      setPreferredVisualDirection('editorial_monograph');
    } else if (preset === 'alexander') {
      setFullName('Alexander von Humboldt');
      setBirthDate('1992-09-14');
      setBirthYear('1992');
      setBirthTime('08:15');
      setBirthplace('Berlin');
      setCountry('Germany');
      setInterestsInput('Alpine Biogeography, Topographic Cartography, Natural Philosophy');
      setHobbiesInput('Botanical Pressing, Barometric Observation, Expedition Sketching');
      setPersonalPreferences('Herbarium linen, cypress green, volcanic basalt');
      setPersonalityInfo('Observant, polymathic, adventurous, sees nature as an interconnected web');
      setPreferredVisualDirection('botanical_sanctuary');
    } else {
      setFullName('Maya Lin');
      setBirthDate('1996-05-04');
      setBirthYear('1996');
      setBirthTime('19:45');
      setBirthplace('Athens');
      setCountry('United States');
      setInterestsInput('Environmental Land Art, Acoustic Sculpture, Poetics of Memory');
      setHobbiesInput('Ceramic Glazing, Star Lore, Landscape Architecture');
      setPersonalPreferences('Twilight saffron, rosewood, alabaster stone');
      setPersonalityInfo('Intimate, lyrical, grounded, attentive to silence and landform');
      setPreferredVisualDirection('ethereal_storybook');
    }
  };

  const handleGenerateExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setGenerationError('Please enter an individual’s name to generate an experience.');
      return;
    }

    setGenerationError(null);
    setIsGenerating(true);
    setGenerationStepIndex(1);

    const stepInterval = setInterval(() => {
      setGenerationStepIndex((prev) => (prev < 15 ? prev + 1 : prev));
    }, 85);

    try {
      const payload: PersonInput = {
        fullName: fullName.trim(),
        birthDate: birthDate.trim() || undefined,
        birthYear: birthYear.trim() ? Number(birthYear.trim()) : undefined,
        birthTime: birthTime.trim() || undefined,
        birthplace: birthplace.trim() || undefined,
        country: country.trim() || undefined,
        interests: interestsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        hobbies: hobbiesInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        personalPreferences: personalPreferences.trim() || undefined,
        personalityInfo: personalityInfo.trim() || undefined,
        preferredVisualDirection,
        additionalInfo: additionalInfo.trim() || undefined,
        visibility,
      };

      const res = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (!res.ok || !data.ok) {
        setGenerationError(data.error || 'Failed to generate experience');
        setIsGenerating(false);
        return;
      }

      const newExp = data.experience as PersonalizedExperience;
      setExperiences((prev) => [newExp, ...prev.filter((item) => item.slug !== newExp.slug)]);
      selectExperienceAndSync(newExp.slug);
      setGenerationStepIndex(16);
      setIsGenerating(false);
      setActiveTab('preview');
    } catch (err) {
      clearInterval(stepInterval);
      setGenerationError(err instanceof Error ? err.message : 'Network error during generation');
      setIsGenerating(false);
    }
  };

  const handleSaveEdits = async (patchPayload: Record<string, unknown>) => {
    if (!currentExperience) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/experiences/${encodeURIComponent(currentExperience.slug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchPayload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        const updated = data.experience as PersonalizedExperience;
        setExperiences((prev) =>
          prev.map((item) => (item.slug === updated.slug ? updated : item))
        );
      }
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteExperience = async (slugToDelete: string) => {
    if (experiences.length <= 1) {
      alert('At least one showcase experience must remain in the studio.');
      return;
    }
    const res = await fetch(`/api/experiences/${encodeURIComponent(slugToDelete)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const remaining = experiences.filter((e) => e.slug !== slugToDelete);
      setExperiences(remaining);
      if (selectedSlug === slugToDelete && remaining[0]) {
        selectExperienceAndSync(remaining[0].slug);
      }
    }
  };

  const handlePushToGitHub = async () => {
    if (!currentExperience) return;
    setGhPublishing(true);
    setGhResult(null);
    try {
      const res = await fetch('/api/integrations/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: currentExperience.slug,
          repoName: ghRepoName,
          visibility: ghVisibility,
          explicitConfirmation: ghExplicitConfirm,
          customToken: ghCustomToken.trim() || undefined,
        }),
      });
      const data = await res.json();
      setGhResult({
        ok: Boolean(res.ok && data.ok),
        repoUrl: data.repoUrl,
        error: data.error,
      });
    } catch (err) {
      setGhResult({
        ok: false,
        error: err instanceof Error ? err.message : 'GitHub request failed',
      });
    } finally {
      setGhPublishing(false);
    }
  };

  const handleDeployToVercel = async () => {
    if (!currentExperience) return;
    setVercelDeploying(true);
    setVercelResult(null);
    try {
      const res = await fetch('/api/integrations/vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: currentExperience.slug,
          projectName: vercelProjectName,
          target: vercelTarget,
          vercelToken: vercelToken.trim() || undefined,
        }),
      });
      const data = await res.json();
      setVercelResult({
        ok: Boolean(res.ok && data.ok),
        deploymentUrl: data.deploymentUrl,
        readyState: data.readyState,
        error: data.error,
      });
    } catch (err) {
      setVercelResult({
        ok: false,
        error: err instanceof Error ? err.message : 'Vercel deployment request failed',
      });
    } finally {
      setVercelDeploying(false);
    }
  };

  const activeFileContent =
    exportFiles.find((f) => f.path === selectedExportFile)?.content || '';

  return (
    <div className="min-h-screen bg-[#0D1017] text-[#F3F1EC] flex flex-col">
      {/* STUDIO TOP COMMAND BAR */}
      <header className="sticky top-0 z-40 bg-[#0D1017]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C89D54] text-[#0D1017] flex items-center justify-center font-mono font-bold text-sm">
              AT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-[#C89D54]">
                  ATELIER ENGINE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 border border-white/15 text-white/70">
                  14 MODULES · 16 STEPS
                </span>
              </div>
              <p className="text-xs text-white/60 hidden sm:block">
                Personalized Digital Experience Generation Engine
              </p>
            </div>
          </div>

          {/* Active Experience Selector Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="experience-switcher" className="font-mono text-[11px] uppercase text-white/50">
              Active Experience:
            </label>
            <select
              id="experience-switcher"
              value={selectedSlug}
              onChange={(e) => selectExperienceAndSync(e.target.value)}
              className="bg-[#161B26] border border-white/15 text-xs font-mono px-3 py-2 text-[#F3F1EC] focus:outline-none focus:border-[#C89D54]"
            >
              {experiences.map((exp) => (
                <option key={exp.slug} value={exp.slug}>
                  {exp.input.fullName} — ({exp.intelligence.creativeDirection.archetypeName})
                </option>
              ))}
            </select>

            {currentExperience && (
              <Link
                href={`/e/${currentExperience.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase bg-[#161B26] border border-white/15 hover:border-[#C89D54] text-[#C89D54] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Full Page (/e/{currentExperience.slug})
              </Link>
            )}
          </div>

          {/* Studio Mode Navigation Tabs */}
          <nav className="flex flex-wrap items-center gap-1" aria-label="Studio Workspace Modes">
            {[
              { id: 'preview', label: 'Live Preview', icon: Eye },
              { id: 'generator', label: '+ New Experience', icon: Sparkles },
              { id: 'pipeline', label: '16-Step Pipeline', icon: Layers },
              { id: 'intelligence', label: '14 AI Modules', icon: Cpu },
              { id: 'editor', label: 'Edit & Regenerate', icon: Sliders },
              { id: 'export_deploy', label: 'Export / GitHub / Vercel', icon: Code2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`studio-tab-${tab.id}`}
                  type="button"
                  onClick={() => setActiveTab(tab.id as StudioTab)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase transition-colors border ${
                    isActive
                      ? 'bg-[#C89D54] text-[#0D1017] border-[#C89D54] font-semibold'
                      : 'bg-[#161B26] text-white/75 border-white/10 hover:border-white/30'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* MAIN WORKSPACE CONTENT */}
      <div className="flex-1 w-full">
        {/* TAB 1: LIVE EMBEDDED EXPERIENCE PREVIEW */}
        {activeTab === 'preview' && currentExperience && (
          <div className="relative">
            {/* Sub-bar showing current experience telemetry and quick actions */}
            <div className="bg-[#141821] border-b border-white/10 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-[#C89D54]">
                  ● LIVE ART-DIRECTED EXPERIENCE: {currentExperience.input.fullName.toUpperCase()}
                </span>
                <span className="text-white/60">
                  Archetype: {currentExperience.intelligence.creativeDirection.archetypeName}
                </span>
                <span className="text-white/60">
                  3D Scene: {currentExperience.intelligence.interactions.threeSceneMode}
                </span>
                <span className="text-white/60">
                  Verified Claims: {currentExperience.intelligence.verification.breakdown.verifiedFactsCount}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-white/50 hidden lg:inline">Switch Person:</span>
                {experiences.slice(0, 4).map((exp) => (
                  <button
                    key={exp.slug}
                    type="button"
                    onClick={() => selectExperienceAndSync(exp.slug)}
                    className={`px-2.5 py-1 border text-[11px] uppercase transition-colors ${
                      exp.slug === currentExperience.slug
                        ? 'border-[#C89D54] text-[#C89D54] bg-[#C89D54]/10'
                        : 'border-white/15 text-white/70 hover:border-white/40'
                    }`}
                  >
                    {exp.input.fullName}
                  </button>
                ))}
              </div>
            </div>

            <ExperienceRenderer
              experience={currentExperience}
              isEmbeddedPreview={false}
              onOpenStudioEditor={() => setActiveTab('editor')}
            />
          </div>
        )}

        {/* TAB 2: NEW EXPERIENCE GENERATOR & SAVED PROJECTS */}
        {activeTab === 'generator' && (
          <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="border border-white/15 bg-[#141821] p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <div className="font-mono text-xs uppercase tracking-widest text-[#C89D54]">
                      PERSONALIZED DIGITAL EXPERIENCE GENERATOR
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-semibold mt-1">
                      Create an Original Individual Experience
                    </h2>
                    <p className="text-sm text-white/65 mt-1">
                      Enter a person’s name and optional biographical, cultural, or creative notes. The 14-module intelligence engine will synthesize a unique visual system, 3D scene, and narrative.
                    </p>
                  </div>

                  {/* Quick Sample Presets */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyQuickPreset('fatima')}
                      className="px-2.5 py-1.5 text-[11px] font-mono uppercase border border-white/20 hover:border-[#C89D54] text-white/80"
                    >
                      Preset: Fatima
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickPreset('alexander')}
                      className="px-2.5 py-1.5 text-[11px] font-mono uppercase border border-white/20 hover:border-[#C89D54] text-white/80"
                    >
                      Preset: Alexander
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickPreset('maya')}
                      className="px-2.5 py-1.5 text-[11px] font-mono uppercase border border-white/20 hover:border-[#C89D54] text-white/80"
                    >
                      Preset: Maya
                    </button>
                  </div>
                </div>

                {generationError && (
                  <div className="p-4 border border-red-500/50 bg-red-500/10 text-red-200 text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{generationError}</span>
                  </div>
                )}

                <form onSubmit={handleGenerateExperience} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label htmlFor="input-fullname" className="block font-mono text-xs uppercase text-[#C89D54] mb-1.5">
                        Individual’s Full Name *
                      </label>
                      <input
                        id="input-fullname"
                        type="text"
                        required
                        placeholder="e.g., Fatima Al-Fihri, Kenjiro Takahashi, Zayd..."
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0D1017] border border-white/20 text-base text-white focus:outline-none focus:border-[#C89D54]"
                      />
                    </div>

                    <div>
                      <label htmlFor="input-birthdate" className="block font-mono text-xs uppercase text-white/70 mb-1.5">
                        Date of Birth (Optional, YYYY-MM-DD)
                      </label>
                      <input
                        id="input-birthdate"
                        type="text"
                        placeholder="1998-10-14"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C89D54]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="input-birthyear" className="block font-mono text-xs uppercase text-white/70 mb-1.5">
                          Birth Year
                        </label>
                        <input
                          id="input-birthyear"
                          type="number"
                          placeholder="1998"
                          value={birthYear}
                          onChange={(e) => setBirthYear(e.target.value)}
                          className="w-full px-3 py-2.5 bg-[#0D1017] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C89D54]"
                        />
                      </div>
                      <div>
                        <label htmlFor="input-birthtime" className="block font-mono text-xs uppercase text-white/70 mb-1.5">
                          Birth Time
                        </label>
                        <input
                          id="input-birthtime"
                          type="text"
                          placeholder="06:42"
                          value={birthTime}
                          onChange={(e) => setBirthTime(e.target.value)}
                          className="w-full px-3 py-2.5 bg-[#0D1017] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C89D54]"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="input-birthplace" className="block font-mono text-xs uppercase text-white/70 mb-1.5">
                        Birthplace / City (Optional)
                      </label>
                      <input
                        id="input-birthplace"
                        type="text"
                        placeholder="e.g., Fez, Lahore, Kyoto, Florence"
                        value={birthplace}
                        onChange={(e) => setBirthplace(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C89D54]"
                      />
                    </div>

                    <div>
                      <label htmlFor="input-country" className="block font-mono text-xs uppercase text-white/70 mb-1.5">
                        Country / Cultural Heritage (Optional)
                      </label>
                      <input
                        id="input-country"
                        type="text"
                        placeholder="e.g., Morocco, Pakistan, Japan, Italy"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C89D54]"
                      />
                    </div>

                    <div>
                      <label htmlFor="input-interests" className="block font-mono text-xs uppercase text-white/70 mb-1.5">
                        Interests (Comma-separated)
                      </label>
                      <input
                        id="input-interests"
                        type="text"
                        placeholder="Architecture, Astronomy, Classical Poetry"
                        value={interestsInput}
                        onChange={(e) => setInterestsInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C89D54]"
                      />
                    </div>

                    <div>
                      <label htmlFor="input-hobbies" className="block font-mono text-xs uppercase text-white/70 mb-1.5">
                        Hobbies & Craft (Comma-separated)
                      </label>
                      <input
                        id="input-hobbies"
                        type="text"
                        placeholder="Calligraphy, Stargazing, Piano"
                        value={hobbiesInput}
                        onChange={(e) => setHobbiesInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C89D54]"
                      />
                    </div>

                    <div>
                      <label htmlFor="input-archetype" className="block font-mono text-xs uppercase text-white/70 mb-1.5">
                        Preferred Visual Direction
                      </label>
                      <select
                        id="input-archetype"
                        value={preferredVisualDirection}
                        onChange={(e) =>
                          setPreferredVisualDirection(e.target.value as ArchetypeId | 'auto')
                        }
                        className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C89D54]"
                      >
                        {ARCHETYPE_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="input-visibility" className="block font-mono text-xs uppercase text-white/70 mb-1.5">
                        Privacy & Sharing Visibility
                      </label>
                      <select
                        id="input-visibility"
                        value={visibility}
                        onChange={(e) =>
                          setVisibility(e.target.value as 'public' | 'unlisted' | 'private')
                        }
                        className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C89D54]"
                      >
                        <option value="public">Public (Shareable Slug)</option>
                        <option value="unlisted">Unlisted (Direct Link Only)</option>
                        <option value="private">Private (Studio Session Only)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="input-personality" className="block font-mono text-xs uppercase text-white/70 mb-1.5">
                        Personality Notes & Visual Preferences (Never inferred from name alone)
                      </label>
                      <textarea
                        id="input-personality"
                        rows={2}
                        placeholder="e.g., Warm, contemplative, loves courtyard architecture and acoustic serenity..."
                        value={personalityInfo}
                        onChange={(e) => setPersonalityInfo(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C89D54]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="input-additional" className="block font-mono text-xs uppercase text-white/70 mb-1.5">
                        Additional Dedication or Story Notes (Optional)
                      </label>
                      <input
                        id="input-additional"
                        type="text"
                        placeholder="Optional message, milestone, or dedication..."
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C89D54]"
                      />
                    </div>
                  </div>

                  {isGenerating && (
                    <div className="p-4 border border-[#C89D54]/50 bg-[#C89D54]/10 space-y-2">
                      <div className="flex items-center justify-between font-mono text-xs text-[#C89D54]">
                        <span>EXECUTING 16-STEP GENERATION PIPELINE...</span>
                        <span>STEP {generationStepIndex} / 16</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/50 overflow-hidden">
                        <div
                          className="h-full bg-[#C89D54] transition-all duration-150"
                          style={{ width: `${(generationStepIndex / 16) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    id="submit-generate-experience"
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-4 px-6 bg-[#C89D54] text-[#0D1017] font-mono text-sm font-bold uppercase tracking-wider hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {isGenerating
                      ? 'Synthesizing 14 Intelligence Modules & 3D Experience...'
                      : 'Generate Bespoke Digital Experience'}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Sidebar: Experience History & Multi-Tenant Projects */}
            <div className="lg:col-span-4 space-y-6">
              <div className="border border-white/15 bg-[#141821] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase text-[#C89D54]">
                    <History className="w-4 h-4" />
                    <span>Saved Experiences ({experiences.length})</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/50">MULTI-TENANT ISOLATED</span>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {experiences.map((exp) => {
                    const isSelected = exp.slug === currentExperience?.slug;
                    return (
                      <div
                        key={exp.slug}
                        className={`p-4 border transition-colors ${
                          isSelected
                            ? 'border-[#C89D54] bg-[#C89D54]/10'
                            : 'border-white/10 bg-[#0D1017] hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-base text-white">
                              {exp.input.fullName}
                            </div>
                            <div className="font-mono text-[11px] text-[#C89D54] mt-0.5">
                              {exp.intelligence.creativeDirection.archetypeName}
                            </div>
                          </div>
                          <span className="font-mono text-[10px] px-2 py-0.5 border border-white/15 uppercase text-white/60">
                            {exp.visibility}
                          </span>
                        </div>

                        <div className="mt-2 font-mono text-[11px] text-white/50">
                          Slug: /e/{exp.slug}
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlug(exp.slug);
                              setActiveTab('preview');
                            }}
                            className="flex-1 py-1.5 px-3 bg-[#C89D54] text-[#0D1017] font-mono text-[11px] font-semibold uppercase text-center"
                          >
                            Open Preview
                          </button>
                          <Link
                            href={`/e/${exp.slug}`}
                            className="py-1.5 px-2.5 border border-white/20 text-white/80 hover:border-white font-mono text-[11px]"
                            title="Open Standalone URL"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteExperience(exp.slug)}
                            className="py-1.5 px-2.5 border border-white/15 text-red-400 hover:border-red-400"
                            title="Delete Experience"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 16-STEP GENERATION PIPELINE TELEMETRY */}
        {activeTab === 'pipeline' && currentExperience && (
          <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
            <div className="border border-white/15 bg-[#141821] p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="font-mono text-xs uppercase tracking-widest text-[#C89D54]">
                    OBSERVABLE 16-STEP GENERATION WORKFLOW
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-semibold mt-1">
                    Pipeline Telemetry for {currentExperience.input.fullName}
                  </h2>
                </div>
                <div className="font-mono text-xs px-3 py-1.5 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                  16 / 16 STAGES VERIFIED
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentExperience.pipelineLogs.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-4 border border-white/10 bg-[#0D1017] flex items-start gap-3.5"
                  >
                    <div className="w-8 h-8 shrink-0 bg-[#C89D54]/15 border border-[#C89D54] text-[#C89D54] font-mono text-xs font-bold flex items-center justify-center">
                      {String(step.stepNumber).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-white">
                          {step.title}
                        </span>
                        <span className="font-mono text-[10px] text-emerald-400 uppercase">
                          {step.status} ({step.durationMs}ms)
                        </span>
                      </div>
                      <p className="text-xs text-white/65 mt-1 leading-relaxed">{step.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 14 INTELLIGENCE ENGINE MODULES INSPECTOR */}
        {activeTab === 'intelligence' && currentExperience && (
          <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
            <div className="border border-white/15 bg-[#141821] p-8 space-y-6">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-[#C89D54]">
                  MODULAR AI INTELLIGENCE ARCHITECTURE
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold mt-1">
                  14 Structured Intelligence Outputs — {currentExperience.input.fullName}
                </h2>
                <p className="text-sm text-white/65 mt-1">
                  Inspect the structured JSON intelligence synthesized across all 14 specialized engines, strictly separating verified facts, user inputs, celestial symbolism, and creative direction.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    num: '01',
                    title: 'Name Research Engine',
                    data: currentExperience.intelligence.nameResearch,
                  },
                  {
                    num: '02',
                    title: 'Name Meaning & Etymology Engine',
                    data: currentExperience.intelligence.nameMeaning,
                  },
                  {
                    num: '03',
                    title: 'Cultural Context Engine',
                    data: currentExperience.intelligence.culturalContext,
                  },
                  {
                    num: '04',
                    title: 'Birthday Intelligence Engine',
                    data: currentExperience.intelligence.birthday,
                  },
                  {
                    num: '05',
                    title: 'Zodiac Calculation Engine',
                    data: currentExperience.intelligence.zodiac,
                  },
                  {
                    num: '06',
                    title: 'Planetary Association Engine',
                    data: currentExperience.intelligence.planetary,
                  },
                  {
                    num: '07',
                    title: 'Interest Analysis Engine',
                    data: currentExperience.intelligence.interests,
                  },
                  {
                    num: '08',
                    title: 'Personality Input Analysis Engine',
                    data: currentExperience.intelligence.personality,
                  },
                  {
                    num: '09',
                    title: 'Creative Direction Engine',
                    data: currentExperience.intelligence.creativeDirection,
                  },
                  {
                    num: '10',
                    title: 'Storytelling Engine',
                    data: currentExperience.intelligence.storytelling,
                  },
                  {
                    num: '11',
                    title: 'Visual Design Intelligence',
                    data: currentExperience.intelligence.visualDesign,
                  },
                  {
                    num: '12',
                    title: 'Interaction Recommendation Engine',
                    data: currentExperience.intelligence.interactions,
                  },
                  {
                    num: '13',
                    title: 'Content Generation Engine',
                    data: currentExperience.intelligence.content,
                  },
                  {
                    num: '14',
                    title: 'Research Verification Engine',
                    data: currentExperience.intelligence.verification,
                  },
                ].map((mod) => (
                  <div key={mod.num} className="border border-white/10 bg-[#0D1017] p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <span className="font-mono text-xs font-bold text-[#C89D54]">
                        MODULE {mod.num} · {mod.title.toUpperCase()}
                      </span>
                      <span className="font-mono text-[10px] text-white/50">JSON SCHEMA</span>
                    </div>
                    <pre className="text-[11px] font-mono text-white/75 overflow-x-auto max-h-56 leading-relaxed">
                      {JSON.stringify(mod.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EDIT EXPERIENCE & REGENERATE SECTIONS */}
        {activeTab === 'editor' && currentExperience && (
          <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
            <div className="border border-white/15 bg-[#141821] p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="font-mono text-xs uppercase tracking-widest text-[#C89D54]">
                    LIVE ART DIRECTION & CONTENT EDITOR
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-semibold mt-1">
                    Edit & Regenerate — {currentExperience.input.fullName} (v{currentExperience.version})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="px-4 py-2 bg-[#C89D54] text-[#0D1017] font-mono text-xs font-bold uppercase"
                >
                  View Updated Experience →
                </button>
              </div>

              {/* Section Regeneration Quick Triggers */}
              <div className="space-y-2">
                <div className="font-mono text-xs uppercase text-white/70">
                  One-Click Section Regeneration
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={isSavingEdit}
                    onClick={() => handleSaveEdits({ regenerateSection: 'prologue' })}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#C89D54] text-[#C89D54] font-mono text-xs uppercase hover:bg-[#C89D54]/10"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate Prologue Manifesto
                  </button>
                  <button
                    type="button"
                    disabled={isSavingEdit}
                    onClick={() => handleSaveEdits({ regenerateSection: 'epistle' })}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#C89D54] text-[#C89D54] font-mono text-xs uppercase hover:bg-[#C89D54]/10"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate Personal Epistle
                  </button>
                  <button
                    type="button"
                    disabled={isSavingEdit}
                    onClick={() => handleSaveEdits({ regenerateSection: 'palette' })}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#C89D54] text-[#C89D54] font-mono text-xs uppercase hover:bg-[#C89D54]/10"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Cycle Accent Pigment
                  </button>
                </div>
              </div>

              {/* Switch Visual Archetype Live */}
              <div className="space-y-2 pt-2">
                <label className="block font-mono text-xs uppercase text-white/70">
                  Switch Complete Architectural Archetype (3D Scene, Palette & Typography)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ARCHETYPE_OPTIONS.filter((a) => a.id !== 'auto').map((arch) => {
                    const active =
                      currentExperience.intelligence.creativeDirection.archetypeId === arch.id;
                    return (
                      <button
                        key={arch.id}
                        type="button"
                        onClick={() => handleSaveEdits({ archetypeId: arch.id })}
                        className={`p-3.5 text-left border transition-colors ${
                          active
                            ? 'border-[#C89D54] bg-[#C89D54]/15'
                            : 'border-white/15 bg-[#0D1017] hover:border-white/35'
                        }`}
                      >
                        <div className="font-mono text-xs font-semibold text-white">
                          {arch.label}
                        </div>
                        <div className="text-[11px] text-white/60 mt-1">{arch.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct Editorial Copy & Accent Color Form */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div>
                  <label className="block font-mono text-xs uppercase text-white/70 mb-1">
                    Hero Display Headline
                  </label>
                  <input
                    type="text"
                    value={editHeroHeadline}
                    onChange={(e) => setEditHeroHeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/20 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-white/70 mb-1">
                    Hero Editorial Subheadline
                  </label>
                  <input
                    type="text"
                    value={editHeroSubheadline}
                    onChange={(e) => setEditHeroSubheadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/20 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-white/70 mb-1">
                    Prologue Manifesto
                  </label>
                  <textarea
                    rows={3}
                    value={editPrologue}
                    onChange={(e) => setEditPrologue(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/20 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-white/70 mb-1">
                    Personal Letter Opening Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={editLetterFirstPara}
                    onChange={(e) => setEditLetterFirstPara(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/20 text-sm text-white"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase text-white/70 mb-1">
                      Primary Accent Hex Color
                    </label>
                    <input
                      type="text"
                      value={editAccentColor}
                      onChange={(e) => setEditAccentColor(e.target.value)}
                      className="px-3.5 py-2 bg-[#0D1017] border border-white/20 text-sm font-mono text-white"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isSavingEdit}
                    onClick={() =>
                      handleSaveEdits({
                        heroHeadline: editHeroHeadline,
                        heroSubheadline: editHeroSubheadline,
                        prologueManifesto: editPrologue,
                        letterBodyFirstParagraph: editLetterFirstPara,
                        accentPrimary: editAccentColor,
                      })
                    }
                    className="mt-5 px-6 py-2.5 bg-[#C89D54] text-[#0D1017] font-mono text-xs font-bold uppercase"
                  >
                    {isSavingEdit ? 'Saving Changes...' : 'Save Editorial & Design Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SOURCE CODE EXPORT, GITHUB INTEGRATION & VERCEL DEPLOYMENT */}
        {activeTab === 'export_deploy' && currentExperience && (
          <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
            {/* 1. Source Code Export Inspector */}
            <div className="border border-white/15 bg-[#141821] p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="font-mono text-xs uppercase tracking-widest text-[#C89D54]">
                    STANDALONE SOURCE CODE EXPORT
                  </div>
                  <h2 className="text-2xl font-semibold mt-1">
                    Export Generated Website Bundle — {currentExperience.input.fullName}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`/api/experiences/${encodeURIComponent(currentExperience.slug)}/export?format=html`}
                    download={`${currentExperience.slug}-experience.html`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C89D54] text-[#0D1017] font-mono text-xs font-bold uppercase"
                  >
                    <Download className="w-4 h-4" />
                    Download Standalone HTML/3D Bundle
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(activeFileContent);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/20 text-white font-mono text-xs uppercase"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedCode ? 'Copied File!' : 'Copy Active File'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 space-y-2">
                  <div className="font-mono text-xs uppercase text-white/50 mb-2">
                    Generated Files ({exportFiles.length})
                  </div>
                  {exportFiles.map((f) => (
                    <button
                      key={f.path}
                      type="button"
                      onClick={() => setSelectedExportFile(f.path)}
                      className={`w-full text-left px-3.5 py-2.5 font-mono text-xs border transition-colors ${
                        selectedExportFile === f.path
                          ? 'border-[#C89D54] bg-[#C89D54]/15 text-[#C89D54]'
                          : 'border-white/10 bg-[#0D1017] text-white/75'
                      }`}
                    >
                      {f.path}
                    </button>
                  ))}
                </div>

                <div className="lg:col-span-9">
                  <pre className="p-5 bg-[#0D1017] border border-white/10 font-mono text-xs text-white/80 overflow-x-auto max-h-96 leading-relaxed">
                    {activeFileContent || 'Loading generated source bundle...'}
                  </pre>
                </div>
              </div>
            </div>

            {/* 2. GitHub & Vercel Integrations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* GITHUB INTEGRATION PANEL */}
              <div className="border border-white/15 bg-[#141821] p-8 space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-6 h-6 text-[#C89D54]" />
                    <div>
                      <div className="font-mono text-xs uppercase text-[#C89D54]">
                        GITHUB REPOSITORY INTEGRATION
                      </div>
                      <h3 className="text-xl font-semibold">
                        Push Generated Experience to GitHub
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2.5 py-1 border uppercase ${
                      ghStatus?.connected
                        ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                        : 'border-white/20 text-white/60'
                    }`}
                  >
                    {ghStatus?.connected
                      ? `Connected: @${ghStatus.account?.login}`
                      : 'Token / OAuth Ready'}
                  </span>
                </div>

                <p className="text-xs text-white/65 leading-relaxed">
                  Publish this individual’s generated source code (`index.html`, `package.json`, `README.md`, `src/experience-data.json`) to a GitHub repository. Access tokens are handled strictly server-side.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block font-mono text-xs uppercase text-white/70 mb-1">
                      Target Repository Name
                    </label>
                    <input
                      type="text"
                      value={ghRepoName}
                      onChange={(e) => setGhRepoName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/20 text-sm font-mono text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-xs uppercase text-white/70 mb-1">
                        Repository Visibility
                      </label>
                      <select
                        value={ghVisibility}
                        onChange={(e) => setGhVisibility(e.target.value as 'public' | 'private')}
                        className="w-full px-3 py-2.5 bg-[#0D1017] border border-white/20 text-sm text-white"
                      >
                        <option value="public">Public Repository</option>
                        <option value="private">Private Repository</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-xs uppercase text-white/70 mb-1">
                        Optional GitHub PAT Override
                      </label>
                      <input
                        type="password"
                        placeholder="Uses connected gh OAuth by default"
                        value={ghCustomToken}
                        onChange={(e) => setGhCustomToken(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#0D1017] border border-white/20 text-sm text-white"
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 text-xs text-white/80 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={ghExplicitConfirm}
                      onChange={(e) => setGhExplicitConfirm(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>
                      I explicitly confirm publishing the generated source files for{' '}
                      <strong>{currentExperience.input.fullName}</strong> to this GitHub repository.
                    </span>
                  </label>

                  {ghResult && (
                    <div
                      className={`p-3.5 border text-xs font-mono ${
                        ghResult.ok
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                          : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                      }`}
                    >
                      {ghResult.ok ? (
                        <div className="flex items-center justify-between">
                          <span>Successfully pushed source files to GitHub!</span>
                          {ghResult.repoUrl && (
                            <a
                              href={ghResult.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline font-bold"
                            >
                              Open Repo →
                            </a>
                          )}
                        </div>
                      ) : (
                        <span>{ghResult.error}</span>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={ghPublishing}
                    onClick={handlePushToGitHub}
                    className="w-full py-3 px-4 bg-[#C89D54] text-[#0D1017] font-mono text-xs font-bold uppercase tracking-wider"
                  >
                    {ghPublishing ? 'Publishing Commits to GitHub...' : 'Push Source Code to GitHub'}
                  </button>
                </div>
              </div>

              {/* VERCEL DEPLOYMENT PANEL */}
              <div className="border border-white/15 bg-[#141821] p-8 space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-[#C89D54]" />
                    <div>
                      <div className="font-mono text-xs uppercase text-[#C89D54]">
                        VERCEL EDGE DEPLOYMENT
                      </div>
                      <h3 className="text-xl font-semibold">
                        Deploy Experience to Vercel
                      </h3>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] px-2.5 py-1 border border-white/20 text-white/60 uppercase">
                    PREVIEW & PRODUCTION
                  </span>
                </div>

                <p className="text-xs text-white/65 leading-relaxed">
                  Deploy the standalone experience bundle directly to Vercel’s Edge Network via the Vercel REST API (`/v13/deployments`).
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block font-mono text-xs uppercase text-white/70 mb-1">
                      Vercel Project Name
                    </label>
                    <input
                      type="text"
                      value={vercelProjectName}
                      onChange={(e) => setVercelProjectName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0D1017] border border-white/20 text-sm font-mono text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-xs uppercase text-white/70 mb-1">
                        Environment Target
                      </label>
                      <select
                        value={vercelTarget}
                        onChange={(e) =>
                          setVercelTarget(e.target.value as 'production' | 'preview')
                        }
                        className="w-full px-3 py-2.5 bg-[#0D1017] border border-white/20 text-sm text-white"
                      >
                        <option value="production">Production Environment</option>
                        <option value="preview">Preview Staging URL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-xs uppercase text-white/70 mb-1">
                        Vercel Access Token
                      </label>
                      <input
                        type="password"
                        placeholder="Bearer token (server-side)"
                        value={vercelToken}
                        onChange={(e) => setVercelToken(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#0D1017] border border-white/20 text-sm text-white"
                      />
                    </div>
                  </div>

                  {vercelResult && (
                    <div
                      className={`p-3.5 border text-xs font-mono ${
                        vercelResult.ok
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                          : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                      }`}
                    >
                      {vercelResult.ok ? (
                        <div className="flex items-center justify-between">
                          <span>Deployed ({vercelResult.readyState}):</span>
                          {vercelResult.deploymentUrl && (
                            <a
                              href={vercelResult.deploymentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline font-bold"
                            >
                              {vercelResult.deploymentUrl} →
                            </a>
                          )}
                        </div>
                      ) : (
                        <span>{vercelResult.error}</span>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={vercelDeploying}
                    onClick={handleDeployToVercel}
                    className="w-full py-3 px-4 bg-[#C89D54] text-[#0D1017] font-mono text-xs font-bold uppercase tracking-wider"
                  >
                    {vercelDeploying ? 'Deploying to Vercel...' : 'Trigger Vercel Deployment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
