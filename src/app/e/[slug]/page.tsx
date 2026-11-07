import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getExperienceBySlug } from '@/lib/storage/experienceStore';
import PortraitView from '@/components/portrait/PortraitView';
import ExperienceRenderer from '@/components/experience/ExperienceRenderer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const exp = await getExperienceBySlug(slug);
  if (!exp) {
    return {
      title: 'Experience Not Found — Atelier Persona Engine',
    };
  }
  const pt = exp.intelligence.portrait;
  if (pt) return { title: `${pt.title.en} — Atelier`, description: pt.opening.en.slice(0, 160) };
  return {
    title: `${exp.intelligence.storytelling.heroHeadline} — Personalized Digital Experience`,
    description: exp.intelligence.storytelling.heroSubheadline,
  };
}

export default async function ExperienceStandalonePage({ params }: PageProps) {
  const { slug } = await params;
  const exp = await getExperienceBySlug(slug);

  if (!exp) {
    notFound();
  }

  if (exp.intelligence.portrait) {
    return <PortraitView portrait={exp.intelligence.portrait} name={exp.input.fullName} />;
  }

  return (
    <div className="relative">
      {/* Floating Return-to-Studio Pill */}
      <div className="fixed bottom-5 left-5 z-40">
        <Link
          href={`/?slug=${encodeURIComponent(exp.slug)}`}
          className="px-4 py-2 text-xs font-mono uppercase tracking-wider shadow-lg border backdrop-blur-md transition-transform hover:-translate-y-0.5 inline-flex items-center gap-2"
          style={{
            backgroundColor: exp.intelligence.visualDesign.colorPalette.backgroundElevated,
            color: exp.intelligence.visualDesign.colorPalette.textPrimary,
            borderColor: exp.intelligence.visualDesign.colorPalette.accentPrimary,
          }}
        >
          ← Studio & Code Export ({exp.input.fullName})
        </Link>
      </div>

      <ExperienceRenderer experience={exp} />
    </div>
  );
}
