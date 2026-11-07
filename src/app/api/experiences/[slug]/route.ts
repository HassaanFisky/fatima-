import { NextRequest, NextResponse } from 'next/server';
import {
  deleteExperienceBySlug,
  getExperienceBySlug,
  saveExperience,
} from '@/lib/storage/experienceStore';
import { ARCHETYPE_BLUEPRINTS } from '@/lib/intelligence/modules/humanAndCreativeEngines';
import { ArchetypeId } from '@/types/experience';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const exp = await getExperienceBySlug(slug);
  if (!exp) {
    return NextResponse.json({ ok: false, error: 'Experience not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, experience: exp });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const existing = await getExperienceBySlug(slug);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Experience not found' }, { status: 404 });
    }

    const body = await req.json();
    const updated = structuredClone(existing);

    // 1. Update visibility / sharing settings
    if (body.visibility && ['public', 'unlisted', 'private'].includes(body.visibility)) {
      updated.visibility = body.visibility;
      updated.input.visibility = body.visibility;
    }

    // 2. Switch Archetype / Visual Direction live
    if (body.archetypeId && ARCHETYPE_BLUEPRINTS[body.archetypeId as ArchetypeId]) {
      const bp = ARCHETYPE_BLUEPRINTS[body.archetypeId as ArchetypeId];
      updated.intelligence.creativeDirection.archetypeId = bp.id;
      updated.intelligence.creativeDirection.archetypeName = bp.name;
      updated.intelligence.creativeDirection.artDirectionManifesto = bp.manifesto;
      updated.intelligence.creativeDirection.moodKeywords = bp.moodKeywords;
      updated.intelligence.creativeDirection.spatialArchitecture.gridSystem = bp.gridSystem;
      updated.intelligence.creativeDirection.lightingAndAtmosphere.themePolarity = bp.themePolarity;
      updated.intelligence.visualDesign.colorPalette = { ...bp.palette };
      updated.intelligence.visualDesign.typography = { ...bp.typography };
      updated.intelligence.visualDesign.borderRadiusToken = bp.borderRadiusToken;
      updated.intelligence.interactions.threeSceneMode = bp.threeSceneMode;
      updated.intelligence.interactions.cursorMode = bp.cursorMode;
      updated.intelligence.interactions.characterTotem.type = bp.totemType;
      updated.intelligence.interactions.characterTotem.name = bp.totemName;
      updated.intelligence.interactions.characterTotem.symbolism = bp.totemSymbolism;
    }

    // 3. Edit Hero / Prologue / Personal Letter copy
    if (typeof body.heroHeadline === 'string') {
      updated.intelligence.storytelling.heroHeadline = body.heroHeadline;
    }
    if (typeof body.heroSubheadline === 'string') {
      updated.intelligence.storytelling.heroSubheadline = body.heroSubheadline;
    }
    if (typeof body.prologueManifesto === 'string') {
      updated.intelligence.storytelling.prologueManifesto = body.prologueManifesto;
    }
    if (typeof body.letterBodyFirstParagraph === 'string') {
      updated.intelligence.storytelling.personalLetter.bodyParagraphs[0] = body.letterBodyFirstParagraph;
    }

    // 4. Regenerate specific section variation
    if (body.regenerateSection) {
      const section = body.regenerateSection as string;
      const firstName = updated.intelligence.nameResearch.firstName;
      const timestampTag = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (section === 'prologue') {
        const variations = [
          `Conceived as an architectural sanctuary for ${updated.input.fullName}, this edition unites ${updated.intelligence.nameResearch.linguisticFamily.value} prosody (${updated.intelligence.nameResearch.phoneticIPA.value}) with spatial precision and celestial harmonics.`,
          `In the quiet interval between spoken cadence and written monument, "${firstName}" emerges with a ${updated.intelligence.nameResearch.sonicProfile.value.cadence} rhythm—honoring both historical lineage and the open horizon of lived craft.`,
          `Synthesized at ${timestampTag}: A bespoke digital monograph exploring the etymological roots, cultural meridian, and harmonic frequency (${updated.intelligence.planetary.rulingBody.value.harmonicFrequencyHz} Hz) of ${updated.input.fullName}.`,
        ];
        updated.intelligence.storytelling.prologueManifesto =
          variations[(updated.version || 1) % variations.length];
      } else if (section === 'epistle') {
        const letterVariations = [
          `May the architecture of your days remain luminous and unhurried. Just as the root of ${firstName} carries centuries of scholarship and discernment, may your own craft continue to open new courtyards of wonder.`,
          `Across every meridian you traverse, carry the harmonic clarity of ${updated.intelligence.planetary.rulingBody.value.name} (${updated.intelligence.planetary.rulingBody.value.harmonicFrequencyHz} Hz) and the quiet confidence of your own curiosities.`,
        ];
        updated.intelligence.storytelling.personalLetter.bodyParagraphs[0] =
          letterVariations[(updated.version || 1) % letterVariations.length];
      } else if (section === 'palette') {
        const accents = ['#B67B32', '#2E6F40', '#C83E2B', '#3B82F6', '#D97706', '#8B5CF6'];
        updated.intelligence.visualDesign.colorPalette.accentPrimary =
          accents[(updated.version || 1) % accents.length];
      }
    }

    // 5. Custom accent color override
    if (typeof body.accentPrimary === 'string' && /^#[0-9A-Fa-f]{6}$/.test(body.accentPrimary)) {
      updated.intelligence.visualDesign.colorPalette.accentPrimary = body.accentPrimary;
    }

    updated.version = (updated.version || 1) + 1;
    const saved = await saveExperience(updated);

    return NextResponse.json({ ok: true, experience: saved });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed to update experience' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const deleted = await deleteExperienceBySlug(slug);
  if (!deleted) {
    return NextResponse.json({ ok: false, error: 'Experience not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, deletedSlug: slug });
}
