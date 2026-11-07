import React from 'react';
import { getAllExperiences } from '@/lib/storage/experienceStore';
import StudioDashboard from '@/components/studio/StudioDashboard';

export const dynamic = 'force-dynamic';

interface HomePageProps {
  searchParams: Promise<{ slug?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const experiences = await getAllExperiences();
  const resolvedParams = await searchParams;
  const requestedSlug = resolvedParams?.slug;

  return (
    <StudioDashboard
      initialExperiences={experiences}
      initialSelectedSlug={requestedSlug}
    />
  );
}
