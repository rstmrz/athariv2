"use client";

import React from "react";

type Props = {
  canGoUp: boolean;
  canGoDown: boolean;
  onGoUp: () => void;
  onGoDown: () => void;
  /** Index de section courante (0 … sectionCount-1), pour la position du pouce sur la piste. */
  sectionIndex: number;
  sectionCount: number;
};

function ChevronUp() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M12 6l-7 7h14L12 6z"
        fill="currentColor"
        opacity="0.92"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M12 18l7-7H5l7 7z"
        fill="currentColor"
        opacity="0.92"
      />
    </svg>
  );
}

/**
 * Desktop : droite centrée. Mobile : bas centré, plus compact, flèches en ligne + mini piste (style scroll).
 */
export default function ExperienceSectionNavigator({
  canGoUp,
  canGoDown,
  onGoUp,
  onGoDown,
  sectionIndex,
  sectionCount,
}: Props) {
  const thumbPos =
    sectionCount > 1
      ? Math.min(1, Math.max(0, sectionIndex / (sectionCount - 1)))
      : 0;

  return (
    <nav
      className="experience-section-nav"
      aria-label="Navigation entre les sections"
    >
      <div
        className="experience-section-nav__rail"
        style={
          {
            ["--exp-nav-thumb" as string]: String(thumbPos),
          } as React.CSSProperties
        }
      >
        <button
          type="button"
          className="experience-section-nav__btn experience-section-nav__btn--up"
          disabled={!canGoUp}
          onClick={onGoUp}
          aria-label="Section précédente"
        >
          <ChevronUp />
        </button>
        <span className="experience-section-nav__track" aria-hidden>
          <span className="experience-section-nav__track-thumb" />
        </span>
        <button
          type="button"
          className="experience-section-nav__btn experience-section-nav__btn--down"
          disabled={!canGoDown}
          onClick={onGoDown}
          aria-label="Section suivante"
        >
          <ChevronDown />
        </button>
      </div>
    </nav>
  );
}
