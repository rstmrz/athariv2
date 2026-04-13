"use client";

import React, { useEffect, useState } from "react";
import AdventureHero from "./AdventureHero";
import ContinuationTextSection from "./ContinuationTextSection";
import DoorVideoSection from "./DoorVideoSection";
import VisionCardSection from "./VisionCardSection";
import GlassProfileCardsSection from "./GlassProfileCardsSection";
import ArcAiGallerySection from "./ArcAiGallerySection";
import SevenDayDoorsSection from "./SevenDayDoorsSection";
import SectionNameTag from "./SectionNameTag";
import { HERO_BG_SRC, sampleBottomRowRgb, type Rgb } from "../lib/heroEdgeColor";

export default function AdventureLanding() {
  const [edgeRgb, setEdgeRgb] = useState<Rgb | null>(null);

  useEffect(() => {
    let cancelled = false;
    sampleBottomRowRgb(HERO_BG_SRC)
      .then((rgb) => {
        if (!cancelled) setEdgeRgb(rgb);
      })
      .catch(() => {
        if (!cancelled) setEdgeRgb(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SectionNameTag name="AdventureHero">
        <AdventureHero edgeRgb={edgeRgb} />
      </SectionNameTag>
      <SectionNameTag name="ArcAiGallerySection">
        <ArcAiGallerySection />
      </SectionNameTag>
      <SectionNameTag name="ContinuationTextSection · id=continue">
        <ContinuationTextSection
          edgeRgb={edgeRgb}
          id="continue"
          kicker="Next"
          title="Built on the same horizon."
          body="Le fond de cette section reprend la couleur mesurée en bas de ton image (dernière ligne de pixels), puis s’assombrit encore pour garder une continuité avec le hero — sans rupture de teinte."
          linkText="En savoir plus"
          linkHref="#doors"
        />
      </SectionNameTag>
      <SectionNameTag name="DoorVideoSection">
        <DoorVideoSection edgeRgb={edgeRgb} />
      </SectionNameTag>
      <SectionNameTag name="VisionCardSection">
        <VisionCardSection edgeRgb={edgeRgb} />
      </SectionNameTag>
      <SectionNameTag name="GlassProfileCardsSection">
        <GlassProfileCardsSection />
      </SectionNameTag>
      <SectionNameTag name="SevenDayDoorsSection">
        <SevenDayDoorsSection />
      </SectionNameTag>
      <SectionNameTag name="ContinuationTextSection · id=suite">
        <ContinuationTextSection
          edgeRgb={edgeRgb}
          id="suite"
          kicker="Next"
          title="La suite du récit."
          body="Même structure que la section précédente : dégradé calculé comme la section 2, typo et rythme alignés pour une page cohérente de bout en bout."
          linkText="Retour en haut"
          linkHref="#"
        />
      </SectionNameTag>
    </>
  );
}
