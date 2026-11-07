'use client';

import React, { useState, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Mail,
  Send,
  Compass,
  Lock,
  Unlock,
  CheckCircle2,
  RotateCcw,
  Mic,
} from 'lucide-react';
import { PersonalizedExperience } from '@/types/experience';

interface ModuleProps {
  experience: PersonalizedExperience;
}

/**
 * 1. Interactive Character / Totem & Web Audio Harmonic + Voice Module
 */
export function CharacterAndHarmonicModule({ experience }: ModuleProps) {
  const { interactions, planetary, nameResearch, visualDesign, storytelling } =
    experience.intelligence;
  const p = visualDesign.colorPalette;
  const freq = planetary.rulingBody.value.harmonicFrequencyHz;

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [totemAngle, setTotemAngle] = useState(0);
  const [activeHarmonicIndex, setActiveHarmonicIndex] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const triggerHarmonicChime = (multiplier = 1, idx = 0) => {
    setActiveHarmonicIndex(idx);
    setTotemAngle((prev) => prev + 45);
    setTimeout(() => setActiveHarmonicIndex(null), 700);

    try {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * multiplier, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.45);
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 1400);
    } catch {
      // Fallback visual pulse if audio blocked
    }
  };

  const toggleVoiceNarration = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `${storytelling.heroHeadline}. ${storytelling.heroSubheadline}. ${storytelling.prologueManifesto}`
    );
    utterance.rate = 0.94;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const harmonicRatios = [
    { label: 'Fundamental (1:1)', ratio: 1, hz: (freq * 1).toFixed(1) },
    { label: 'Perfect Fourth (4:3)', ratio: 4 / 3, hz: (freq * (4 / 3)).toFixed(1) },
    { label: 'Perfect Fifth (3:2)', ratio: 1.5, hz: (freq * 1.5).toFixed(1) },
    { label: 'Octave (2:1)', ratio: 2, hz: (freq * 2).toFixed(1) },
  ];

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 border"
      style={{
        backgroundColor: p.backgroundElevated,
        borderColor: p.borderSubtle,
        borderRadius: visualDesign.borderRadiusToken,
      }}
    >
      {/* Interactive SVG Character / Totem Avatar */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 relative">
        <div
          onClick={() => triggerHarmonicChime(1, 0)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && triggerHarmonicChime(1, 0)}
          aria-label={`Interact with ${interactions.characterTotem.name}`}
          className="cursor-pointer group relative flex items-center justify-center w-64 h-64"
        >
          <svg
            viewBox="0 0 260 260"
            className="w-full h-full transition-transform duration-700 ease-out"
            style={{ transform: `rotate(${totemAngle}deg)` }}
          >
            <circle
              cx="130"
              cy="130"
              r="116"
              fill="none"
              stroke={p.accentPrimary}
              strokeWidth="1.2"
              strokeDasharray="4 6"
            />
            <circle
              cx="130"
              cy="130"
              r="88"
              fill="none"
              stroke={p.accentSecondary}
              strokeWidth="1.5"
              opacity="0.7"
            />
            {/* Eight-pointed geometric star / totem */}
            <rect
              x="68"
              y="68"
              width="124"
              height="124"
              fill="none"
              stroke={p.accentPrimary}
              strokeWidth="1.5"
            />
            <rect
              x="68"
              y="68"
              width="124"
              height="124"
              fill="none"
              stroke={p.accentSecondary}
              strokeWidth="1.5"
              transform="rotate(45 130 130)"
            />
            <circle
              cx="130"
              cy="130"
              r="34"
              fill={activeHarmonicIndex !== null ? p.accentPrimary : 'transparent'}
              stroke={p.accentPrimary}
              strokeWidth="2"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="text-2xl font-bold"
              style={{
                fontFamily: visualDesign.typography.displayFont,
                color: activeHarmonicIndex !== null ? p.backgroundPrimary : p.textPrimary,
              }}
            >
              {planetary.rulingBody.value.classicalSymbol}
            </span>
          </div>
        </div>
        <p
          className="mt-3 text-xs font-mono tracking-wider uppercase text-center"
          style={{ color: p.accentPrimary }}
        >
          Click Totem to Resonate ({freq} Hz)
        </p>
      </div>

      {/* Totem Lore & Interactive Harmonic Synthesizer */}
      <div className="lg:col-span-7 space-y-5">
        <div className="font-mono text-xs uppercase tracking-widest" style={{ color: p.accentPrimary }}>
          PERSONALIZED TOTEM & HARMONIC SYNTHESIZER
        </div>
        <h3
          className="text-3xl font-semibold"
          style={{ fontFamily: visualDesign.typography.displayFont }}
        >
          {interactions.characterTotem.name}
        </h3>
        <p className="text-base leading-relaxed" style={{ color: p.textSecondary }}>
          {interactions.characterTotem.symbolism} Tuned to the cosmic octave of{' '}
          <strong>{planetary.rulingBody.value.name}</strong> ({freq} Hz) and the{' '}
          <strong>{nameResearch.syllableCount}-syllable</strong> prosodic rhythm of{' '}
          <em>{nameResearch.firstName}</em> ({nameResearch.phoneticIPA.value}).
        </p>

        {/* Harmonic Chord Pads */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {harmonicRatios.map((item, idx) => (
            <button
              key={item.label}
              type="button"
              onClick={() => triggerHarmonicChime(item.ratio, idx)}
              className="p-3 text-left border transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor:
                  activeHarmonicIndex === idx ? `${p.accentPrimary}22` : p.backgroundPrimary,
                borderColor: activeHarmonicIndex === idx ? p.accentPrimary : p.borderSubtle,
                borderRadius: visualDesign.borderRadiusToken,
              }}
            >
              <div className="font-mono text-[11px]" style={{ color: p.accentPrimary }}>
                {item.hz} Hz
              </div>
              <div className="text-xs font-medium mt-1" style={{ color: p.textPrimary }}>
                {item.label}
              </div>
            </button>
          ))}
        </div>

        {/* Audio & Voice Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => triggerHarmonicChime(1, 0)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider border transition-opacity hover:opacity-90"
            style={{
              backgroundColor: p.accentPrimary,
              color: p.backgroundPrimary,
              borderColor: p.accentPrimary,
              borderRadius: visualDesign.borderRadiusToken,
            }}
          >
            {isPlayingAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            Play Planetary Chord ({freq} Hz)
          </button>

          <button
            type="button"
            onClick={toggleVoiceNarration}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider border transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: p.textPrimary,
              borderColor: p.borderSubtle,
              borderRadius: visualDesign.borderRadiusToken,
            }}
          >
            <Mic className="w-4 h-4" style={{ color: p.accentPrimary }} />
            {isSpeaking ? 'Stop Voice Narration' : 'Narrate Monograph Aloud'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Interactive Constellation Alignment Mini-Game
 */
export function ConstellationMiniGameModule({ experience }: ModuleProps) {
  const { content, visualDesign } = experience.intelligence;
  const p = visualDesign.colorPalette;
  const game = content.miniGameConfig;

  const [unlockedIds, setUnlockedIds] = useState<string[]>([game.targetNodes[0]?.id || 'node-1']);

  const handleNodeClick = (nodeId: string) => {
    if (!unlockedIds.includes(nodeId)) {
      setUnlockedIds((prev) => [...prev, nodeId]);
    }
  };

  const resetConstellation = () => {
    setUnlockedIds([game.targetNodes[0]?.id || 'node-1']);
  };

  const allCompleted = unlockedIds.length >= game.targetNodes.length;

  return (
    <div
      className="p-8 border space-y-6"
      style={{
        backgroundColor: p.backgroundElevated,
        borderColor: p.borderSubtle,
        borderRadius: visualDesign.borderRadiusToken,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest" style={{ color: p.accentPrimary }}>
            INTERACTIVE CONSTELLATION SIGIL MINI-GAME
          </div>
          <h3
            className="text-2xl sm:text-3xl font-semibold mt-1"
            style={{ fontFamily: visualDesign.typography.displayFont }}
          >
            {game.title}
          </h3>
          <p className="text-sm mt-1" style={{ color: p.textSecondary }}>
            {game.instruction} ({unlockedIds.length} / {game.targetNodes.length} stars aligned)
          </p>
        </div>

        <button
          type="button"
          onClick={resetConstellation}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase border"
          style={{
            borderColor: p.borderSubtle,
            color: p.textSecondary,
            borderRadius: visualDesign.borderRadiusToken,
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Stars
        </button>
      </div>

      {/* Interactive SVG Star Chart */}
      <div
        className="relative w-full h-72 sm:h-80 border overflow-hidden select-none"
        style={{
          backgroundColor: p.backgroundPrimary,
          borderColor: p.borderSubtle,
          borderRadius: visualDesign.borderRadiusToken,
        }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          {/* Constellation connecting lines */}
          {game.targetNodes.map((node, i) => {
            if (i === 0) return null;
            const prev = game.targetNodes[i - 1];
            const isConnected =
              unlockedIds.includes(node.id) && unlockedIds.includes(prev.id);
            return (
              <line
                key={`${prev.id}-${node.id}`}
                x1={prev.x}
                y1={prev.y}
                x2={node.x}
                y2={node.y}
                stroke={isConnected ? p.accentPrimary : p.borderSubtle}
                strokeWidth={isConnected ? '0.8' : '0.35'}
                strokeDasharray={isConnected ? undefined : '1.5 1.5'}
              />
            );
          })}
          {allCompleted && game.targetNodes.length > 2 && (
            <line
              x1={game.targetNodes[game.targetNodes.length - 1].x}
              y1={game.targetNodes[game.targetNodes.length - 1].y}
              x2={game.targetNodes[0].x}
              y2={game.targetNodes[0].y}
              stroke={p.accentPrimary}
              strokeWidth="0.6"
              opacity="0.6"
            />
          )}
        </svg>

        {/* Interactive Star Nodes */}
        {game.targetNodes.map((node, index) => {
          const isUnlocked = unlockedIds.includes(node.id);
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => handleNodeClick(node.id)}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute group flex flex-col items-center focus:outline-none"
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-transform group-hover:scale-125"
                style={{
                  backgroundColor: isUnlocked ? p.accentPrimary : p.backgroundElevated,
                  color: isUnlocked ? p.backgroundPrimary : p.textPrimary,
                  borderColor: p.accentPrimary,
                }}
              >
                {index + 1}
              </span>
              <span
                className="mt-1 px-2 py-0.5 text-[10px] font-mono whitespace-nowrap rounded"
                style={{
                  backgroundColor: `${p.backgroundElevated}E6`,
                  color: isUnlocked ? p.accentPrimary : p.textMuted,
                }}
              >
                {node.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Unlocked Insights Feed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {game.targetNodes.map((node) => {
          const isUnlocked = unlockedIds.includes(node.id);
          return (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              className="p-3 border cursor-pointer transition-opacity"
              style={{
                backgroundColor: p.backgroundPrimary,
                borderColor: isUnlocked ? p.accentPrimary : p.borderSubtle,
                opacity: isUnlocked ? 1 : 0.55,
                borderRadius: visualDesign.borderRadiusToken,
              }}
            >
              <div className="font-mono text-[10px] uppercase" style={{ color: p.accentPrimary }}>
                {node.label}
              </div>
              <div className="text-xs mt-1" style={{ color: p.textPrimary }}>
                {isUnlocked ? node.unlockedInsight : 'Click star node to unlock insight'}
              </div>
            </div>
          );
        })}
      </div>

      {allCompleted && (
        <div
          className="p-4 border flex items-start gap-3"
          style={{
            backgroundColor: `${p.accentPrimary}18`,
            borderColor: p.accentPrimary,
            borderRadius: visualDesign.borderRadiusToken,
          }}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: p.accentPrimary }} />
          <div>
            <div className="font-mono text-xs uppercase font-semibold" style={{ color: p.accentPrimary }}>
              Constellation Complete — Archival Inscription Unlocked
            </div>
            <p
              className="mt-1 text-base italic"
              style={{ fontFamily: visualDesign.typography.serifFont, color: p.textPrimary }}
            >
              “{game.completionRewardQuote}”
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 3. Personal Letter Envelope & Interactive Digital Postcard Studio
 */
export function PersonalEpistleAndPostcardModule({ experience }: ModuleProps) {
  const { storytelling, content, visualDesign } = experience.intelligence;
  const p = visualDesign.colorPalette;
  const postcard = content.interactivePostcard;

  const [envelopeOpen, setEnvelopeOpen] = useState(true);
  const [customPostcardText, setCustomPostcardText] = useState(postcard.defaultMessage);
  const [senderSignature, setSenderSignature] = useState('A Fellow Voyager');
  const [copiedPostcard, setCopiedPostcard] = useState(false);

  const handleCopyPostcard = () => {
    const text = `Postcard [${postcard.stampCode}] — To ${postcard.destinationLabel}: "${customPostcardText}" — Signed, ${senderSignature}`;
    navigator.clipboard?.writeText(text);
    setCopiedPostcard(true);
    setTimeout(() => setCopiedPostcard(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Personal Wax-Sealed Letter */}
      <div
        className="lg:col-span-7 p-8 sm:p-10 border flex flex-col justify-between"
        style={{
          backgroundColor: p.backgroundElevated,
          borderColor: p.borderSubtle,
          borderRadius: visualDesign.borderRadiusToken,
        }}
      >
        <div>
          <div className="flex items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: p.borderSubtle }}>
            <div>
              <div className="font-mono text-xs uppercase tracking-widest" style={{ color: p.accentPrimary }}>
                PERSONALIZED EPISTLE
              </div>
              <h3
                className="text-2xl sm:text-3xl font-semibold mt-1"
                style={{ fontFamily: visualDesign.typography.displayFont }}
              >
                {storytelling.personalLetter.salutation}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setEnvelopeOpen((prev) => !prev)}
              className="px-3.5 py-2 text-xs font-mono uppercase tracking-wider border inline-flex items-center gap-2"
              style={{
                backgroundColor: p.accentPrimary,
                color: p.backgroundPrimary,
                borderColor: p.accentPrimary,
                borderRadius: visualDesign.borderRadiusToken,
              }}
            >
              <Mail className="w-3.5 h-3.5" />
              {envelopeOpen ? 'Fold Epistle' : 'Unseal Epistle'}
            </button>
          </div>

          {envelopeOpen ? (
            <div className="py-6 space-y-4">
              {storytelling.personalLetter.bodyParagraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-lg sm:text-xl leading-relaxed"
                  style={{
                    fontFamily: visualDesign.typography.serifFont,
                    color: p.textPrimary,
                  }}
                >
                  {paragraph}
                </p>
              ))}
              <div className="pt-4">
                <p className="text-sm italic" style={{ color: p.textSecondary }}>
                  {storytelling.personalLetter.valediction}
                </p>
                <p
                  className="text-xl font-semibold mt-1"
                  style={{ fontFamily: visualDesign.typography.displayFont, color: p.accentPrimary }}
                >
                  {storytelling.personalLetter.signature}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <Sparkles className="w-8 h-8 mx-auto" style={{ color: p.accentPrimary }} />
              <p className="font-mono text-xs uppercase tracking-widest" style={{ color: p.textSecondary }}>
                Sealed Personal Monograph Epistle — Click “Unseal Epistle” to Read
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Digital Postcard Composer */}
      <div
        className="lg:col-span-5 p-8 border flex flex-col justify-between space-y-6"
        style={{
          backgroundColor: p.backgroundElevated,
          borderColor: p.borderSubtle,
          borderRadius: visualDesign.borderRadiusToken,
        }}
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2 border-b pb-4" style={{ borderColor: p.borderSubtle }}>
            <div>
              <div className="font-mono text-xs uppercase tracking-widest" style={{ color: p.accentPrimary }}>
                DIGITAL POSTCARD STUDIO
              </div>
              <div className="text-xs font-mono mt-1" style={{ color: p.textMuted }}>
                ORIGIN: {postcard.originLabel}
              </div>
            </div>
            <div
              className="px-2.5 py-1.5 border font-mono text-[10px] tracking-widest uppercase"
              style={{ borderColor: p.accentPrimary, color: p.accentPrimary }}
            >
              {postcard.stampCode}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-[11px] uppercase" style={{ color: p.textSecondary }}>
              Inscribe Personalized Postcard Note:
            </label>
            <textarea
              rows={4}
              value={customPostcardText}
              onChange={(e) => setCustomPostcardText(e.target.value)}
              className="w-full p-3 text-sm border bg-transparent focus:outline-none"
              style={{
                borderColor: p.borderSubtle,
                color: p.textPrimary,
                fontFamily: visualDesign.typography.serifFont,
                fontSize: '1.05rem',
                borderRadius: visualDesign.borderRadiusToken,
              }}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {postcard.prompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCustomPostcardText(prompt)}
                className="text-[11px] font-mono px-2.5 py-1 border transition-opacity hover:opacity-80"
                style={{
                  borderColor: p.borderSubtle,
                  color: p.textSecondary,
                  borderRadius: visualDesign.borderRadiusToken,
                }}
              >
                Prompt {idx + 1}
              </button>
            ))}
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase mb-1" style={{ color: p.textSecondary }}>
              Signed By:
            </label>
            <input
              type="text"
              value={senderSignature}
              onChange={(e) => setSenderSignature(e.target.value)}
              className="w-full px-3 py-2 text-sm border bg-transparent focus:outline-none"
              style={{
                borderColor: p.borderSubtle,
                color: p.textPrimary,
                borderRadius: visualDesign.borderRadiusToken,
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyPostcard}
          className="w-full py-2.5 px-4 text-xs font-mono uppercase tracking-wider border inline-flex items-center justify-center gap-2"
          style={{
            backgroundColor: p.accentPrimary,
            color: p.backgroundPrimary,
            borderColor: p.accentPrimary,
            borderRadius: visualDesign.borderRadiusToken,
          }}
        >
          <Send className="w-3.5 h-3.5" />
          {copiedPostcard ? 'Postcard Inscription Copied!' : 'Copy Digital Postcard to Share'}
        </button>
      </div>
    </div>
  );
}

/**
 * 4. Easter Egg Cipher Vault
 */
export function EasterEggVaultModule({ experience }: ModuleProps) {
  const { content, visualDesign } = experience.intelligence;
  const p = visualDesign.colorPalette;
  const egg = content.easterEgg;

  const [sealClicks, setSealClicks] = useState(0);
  const [cipherInput, setCipherInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  const handleSealClick = () => {
    const next = sealClicks + 1;
    setSealClicks(next);
    if (next >= 3) {
      setUnlocked(true);
    }
  };

  const handleCipherChange = (val: string) => {
    setCipherInput(val);
    if (val.trim().toUpperCase() === egg.secretKeyphrase.toUpperCase()) {
      setUnlocked(true);
    }
  };

  return (
    <div
      className="p-6 border flex flex-col sm:flex-row items-center justify-between gap-6"
      style={{
        backgroundColor: p.backgroundElevated,
        borderColor: unlocked ? p.accentPrimary : p.borderSubtle,
        borderRadius: visualDesign.borderRadiusToken,
      }}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={handleSealClick}
          title="Monograph Colophon Seal (Click 3 times)"
          className="w-12 h-12 shrink-0 flex items-center justify-center border transition-transform active:scale-95"
          style={{
            borderColor: p.accentPrimary,
            color: p.accentPrimary,
            borderRadius: visualDesign.borderRadiusToken,
          }}
        >
          {unlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
        </button>

        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest" style={{ color: p.accentPrimary }}>
            {unlocked ? egg.revealedArtifactTitle : 'ARCHIVAL CIPHER VAULT (EASTER EGG)'}
          </div>
          <p className="text-sm mt-1" style={{ color: unlocked ? p.textPrimary : p.textSecondary }}>
            {unlocked ? egg.revealedMessage : egg.triggerHint}
          </p>
        </div>
      </div>

      {!unlocked && (
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={`Type "${egg.secretKeyphrase}"`}
            value={cipherInput}
            onChange={(e) => handleCipherChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono uppercase border bg-transparent focus:outline-none"
            style={{
              borderColor: p.borderSubtle,
              color: p.textPrimary,
              borderRadius: visualDesign.borderRadiusToken,
            }}
          />
          <Compass className="w-4 h-4" style={{ color: p.accentPrimary }} />
        </div>
      )}
    </div>
  );
}
