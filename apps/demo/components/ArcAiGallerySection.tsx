"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ArcGalleryGoldMarquee from "./ArcGalleryGoldMarquee";
import SectionNameTag from "./SectionNameTag";

const font = {
  serif: '"Cormorant Garamond", "Times New Roman", Georgia, serif',
  sans: '"Inter", system-ui, -apple-system, sans-serif',
} as const;

type Platform = "netflix" | "hbo" | "prime";

type GalleryItem = {
  src: string;
  title: string;
  years: string;
  meta: string;
  rating: string;
  platform: Platform;
  /** Teinte « univers » du visuel : dégradé transparent (haut) → cette couleur pleine (bas). */
  universeColor: string;
};

const GALLERY: GalleryItem[] = [
  {
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=480&h=600&fit=crop&q=80",
    title: "Coastal Drift",
    years: "2021–2025",
    meta: "3 seasons",
    rating: "8.2",
    platform: "netflix",
    universeColor: "#0f4a5c",
  },
  {
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=480&h=600&fit=crop&q=80",
    title: "Neon Dreams",
    years: "2020–2024",
    meta: "2h 18m",
    rating: "7.9",
    platform: "hbo",
    universeColor: "#3d1f5c",
  },
  {
    src: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=480&h=600&fit=crop&q=80",
    title: "Desert Lines",
    years: "2019–2023",
    meta: "4 seasons",
    rating: "8.5",
    platform: "prime",
    universeColor: "#6b4420",
  },
  {
    src: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=480&h=600&fit=crop&q=80",
    title: "City Pulse",
    years: "2022–2025",
    meta: "1 season",
    rating: "7.6",
    platform: "netflix",
    universeColor: "#1a2840",
  },
  {
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=480&h=600&fit=crop&q=80",
    title: "Quiet House",
    years: "2018–2024",
    meta: "5 seasons",
    rating: "8.8",
    platform: "hbo",
    universeColor: "#4a3528",
  },
  {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=480&h=600&fit=crop&q=80",
    title: "Forest Path",
    years: "2020–2025",
    meta: "2h 06m",
    rating: "8.1",
    platform: "prime",
    universeColor: "#1a3d2e",
  },
  {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=600&fit=crop&q=80",
    title: "Night Run",
    years: "2023–2025",
    meta: "1 season",
    rating: "7.4",
    platform: "netflix",
    universeColor: "#141c2e",
  },
  {
    src: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=480&h=600&fit=crop&q=80",
    title: "Open Road",
    years: "2017–2022",
    meta: "6 seasons",
    rating: "8.6",
    platform: "hbo",
    universeColor: "#4a3020",
  },
];

/** Titre expérience scroll ; « autres » stylé quand le mot est entièrement visible. */
const GALLERY_SCROLL_TITLE = "Et pleins d'autres…";

/** Phases entrée pilotées au scroll (si pas de séquence auto). */
const ENTRANCE_CENTER_END = 0.28;
const ENTRANCE_LIFT_END = 0.44;
const ENTRANCE_CARDS_FADE = 0.09;
/** Fin de l’entrée scroll : cartes visibles en pile — ensuite « Ouvrir » obligatoire (pas d’ouverture carrousel au scroll). */
const SCROLL_CARDS_DONE = ENTRANCE_LIFT_END + ENTRANCE_CARDS_FADE;

/** Export : cible scroll (progression 0–1) pour arriver pile + bouton « Ouvrir » sans auto-séquence. */
export const EXPERIENCE_ARC_SCROLL_STACKED_P = SCROLL_CARDS_DONE;
const ENTRANCE_RUNWAY_PAD = "min(42vh, 460px)";

type AutoSeqState = {
  titleChars: number;
  liftT: number;
  blackOp: number;
  cardsReveal: number;
  deckBlend: number;
  /** Après apparition de la pile : attendre le clic « Découvrir » avant d’ouvrir le carrousel. */
  discoverPending: boolean;
  complete: boolean;
};

const AUTO_SEQ_INITIAL: AutoSeqState = {
  titleChars: 0,
  liftT: 0,
  blackOp: 1,
  cardsReveal: 0,
  deckBlend: 0,
  discoverPending: false,
  complete: false,
};

function seqSleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const GALLERY_SECTION_BG =
  "radial-gradient(ellipse 78% 68% at 50% 40%, rgba(130, 32, 44, 0.36) 0%, transparent 58%), radial-gradient(ellipse 100% 85% at 50% 100%, rgba(0,0,0,0.58) 0%, transparent 48%), linear-gradient(180deg, #0b0b0e 0%, #060608 48%, #030304 100%)";

function renderGalleryScrollTitle(
  visibleCount: number,
  showCaret: boolean,
  reduceMotion: boolean
): React.ReactNode {
  if (reduceMotion) {
    return (
      <>
        Et pleins d&apos;
        <span className="arc-gallery-autres">autres</span>
        …
      </>
    );
  }
  const full = GALLERY_SCROLL_TITLE;
  const idxAutres = full.indexOf("autres");
  const autresLen = 6;
  const end = Math.min(visibleCount, full.length);
  const beforeEnd = Math.min(end, idxAutres);
  const before = full.slice(0, beforeEnd);
  const autresSlice =
    end > idxAutres ? full.slice(idxAutres, Math.min(end, idxAutres + autresLen)) : "";
  const autresComplete = autresSlice.length === autresLen;
  const afterStart = idxAutres + autresLen;
  const after = afterStart < end ? full.slice(afterStart, end) : "";

  return (
    <>
      {before}
      {autresSlice ? (
        autresComplete ? (
          <span className="arc-gallery-autres">{autresSlice}</span>
        ) : (
          <span style={{ color: "rgba(255,255,255,0.96)" }}>{autresSlice}</span>
        )
      ) : null}
      {after}
      {showCaret && visibleCount < full.length ? (
        <span className="arc-gallery-scroll-caret" aria-hidden>
          |
        </span>
      ) : null}
    </>
  );
}

/** Dégradé bas teinté (transparent haut → couleur « univers » pleine en bas). */
function vignetteUniverseGradient(hex: string): string {
  const base =
    hex.startsWith("#") && (hex.length === 7 || hex.length === 9) ? hex.slice(0, 7) : "#1a1a1e";
  return `linear-gradient(180deg, transparent 0%, transparent 40%, ${base}2a 58%, ${base}b3 82%, ${base} 100%)`;
}

/** Aplat « masque calque » avant Découvrir (sans photo). */
function discoverFlatFace(hex: string): string {
  const base =
    hex.startsWith("#") && (hex.length === 7 || hex.length === 9) ? hex.slice(0, 7) : "#2d2d36";
  return `linear-gradient(168deg, ${base} 0%, #14141a 50%, ${base} 100%)`;
}

/** Courbe de transition organique type ease-out (décélération en fin de mouvement) */
const EASE_OUT_ORGANIC = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Écart actif ↔ première voisine (aéré, pas collé). */
const GAP_ACTIVE_TO_NEIGHBOR_PX = 356;
/** Écart entre deux inactives successives (plus court que vers l’actif, mais confortable). */
const STEP_INACTIVE_BETWEEN_PX = 248;

/** Distance signée la plus courte sur le « cercle » d’indices (pour mobile 3 cartes). */
function wrapDelta(i: number, active: number, len: number): number {
  let d = i - active;
  if (len <= 1) return 0;
  if (d > len / 2) d -= len;
  if (d < -len / 2) d += len;
  return d;
}

/** Écart horizontal entre centre actif et voisins sur mobile (px). */
const MOBILE_TRIPLE_STEP_PX = 218;

function translateXFromD(d: number, G: number, S: number): number {
  if (d === 0) return 0;
  if (d > 0) return G + (d - 1) * S;
  return -G + (d + 1) * S;
}

/**
 * Arc + deck : échelle selon la largeur (téléphone < 640 : pile plus serrée, même animation).
 */
function arcLayoutForViewport(vw: number): { gap: number; step: number; deckScale: number } {
  const G0 = GAP_ACTIVE_TO_NEIGHBOR_PX;
  const S0 = STEP_INACTIVE_BETWEEN_PX;
  const t = Math.min(1, Math.max(0, (vw - 640) / (1440 - 640)));
  const scaleWide = 0.42 + t * (1 - 0.42);
  const scale =
    vw < 640
      ? 0.32 + Math.min(1, Math.max(0, (vw - 320) / 320)) * (0.42 - 0.32)
      : scaleWide;
  return {
    gap: Math.round(G0 * scale),
    step: Math.round(S0 * scale),
    deckScale: Math.min(1, Math.max(0.45, scale)),
  };
}

function StreamingLogo({ platform }: { platform: Platform }) {
  const common = {
    width: 22,
    height: 22,
    display: "block" as const,
  };

  if (platform === "netflix") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden style={common} fill="none">
        <path
          fill="#E50914"
          d="M5.5 2L5.5 22L9.5 12L5.5 2ZM9.5 2L9.5 22L13.5 12L9.5 2ZM13.5 2L13.5 22L17.5 12L13.5 2Z"
        />
      </svg>
    );
  }

  if (platform === "hbo") {
    return (
      <svg viewBox="0 0 48 20" aria-hidden style={{ width: 40, height: 18, display: "block" }}>
        <rect width="48" height="20" rx="4" fill="#5B2A86" />
        <text
          x="24"
          y="14"
          textAnchor="middle"
          fill="#fff"
          fontSize="11"
          fontWeight="800"
          fontFamily="system-ui,sans-serif"
          letterSpacing="0.06em"
        >
          HBO
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 56 22" aria-hidden style={{ width: 48, height: 20, display: "block" }}>
      <path
        d="M4 16 Q14 6 28 10 T52 14"
        fill="none"
        stroke="#00A8E1"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <text
        x="6"
        y="19"
        fill="#fff"
        fontSize="9"
        fontWeight="700"
        fontFamily="system-ui,sans-serif"
      >
        prime
      </text>
    </svg>
  );
}

/** Rangée plane ; mobile = actif au centre + une carte à gauche et une à droite (wrap). */
function cardTransform(
  d: number,
  reduceMotion: boolean,
  narrowMobile: boolean,
  w: number,
  arcGap: number,
  arcStep: number
): {
  translateX: number;
  translateY: number;
  rotateDeg: number;
  scale: number;
  opacity: number;
  blurPx: number;
  zIndex: number;
  visibility: "visible" | "hidden";
  pointerEvents: "auto" | "none";
} {
  if (narrowMobile) {
    const aw = Math.abs(w);
    if (aw > 1) {
      return {
        translateX: 0,
        translateY: 0,
        rotateDeg: 0,
        scale: 1,
        opacity: 0,
        blurPx: 0,
        zIndex: 0,
        visibility: "hidden",
        pointerEvents: "none",
      };
    }
    if (w === 0) {
      return {
        translateX: 0,
        translateY: 0,
        rotateDeg: 0,
        scale: 1.1,
        opacity: 1,
        blurPx: 0,
        zIndex: 500,
        visibility: "visible",
        pointerEvents: "auto",
      };
    }
    return {
      translateX: w * MOBILE_TRIPLE_STEP_PX,
      translateY: 0,
      rotateDeg: 0,
      scale: 0.82,
      opacity: 0.92,
      blurPx: reduceMotion ? 0 : 0.65,
      zIndex: w < 0 ? 400 : 399,
      visibility: "visible",
      pointerEvents: "auto",
    };
  }

  const ad = Math.abs(d);
  const translateX = translateXFromD(d, arcGap, arcStep);
  const scale = d === 0 ? 1.2 : 0.8;
  const opacity = d === 0 ? 1 : Math.max(0.5, 0.78 - ad * 0.06);
  const blurPx =
    reduceMotion || d === 0
      ? 0
      : Math.min(4.2, 0.5 + ad * 0.95 + (ad - 1) * 0.28);
  const zIndex = d === 0 ? 500 : 320 - ad * 45 - (d > 0 ? 0 : 1);

  return {
    translateX,
    translateY: 0,
    rotateDeg: 0,
    scale,
    opacity,
    blurPx,
    zIndex,
    visibility: "visible",
    pointerEvents: "auto",
  };
}

function easeOutCubic(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - x, 3);
}

async function rampAutoSeq(
  setSeq: React.Dispatch<React.SetStateAction<AutoSeqState>>,
  epochRef: React.MutableRefObject<number>,
  epoch: number,
  durationMs: number,
  fn: (tSmooth: number) => Partial<AutoSeqState>
): Promise<void> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const step = () => {
      if (epochRef.current !== epoch) {
        resolve();
        return;
      }
      const u = Math.min(1, (performance.now() - t0) / durationMs);
      const patch = fn(easeOutCubic(u));
      setSeq((s) => ({ ...s, ...patch }));
      if (u < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

/** État « deck » : cartes centrées, chevauchement serré (pile) + léger éventail. */
function stackDeckTransform(i: number, n: number, deckScale = 1) {
  const mid = (n - 1) / 2;
  const stepY = 4.2 * deckScale;
  const fanX = (i - mid) * 1.2 * deckScale;
  return {
    translateX: fanX,
    translateY: -i * stepY,
    rotateDeg: (i - mid) * 2.4 * Math.min(1, deckScale + 0.12),
    scale: 0.9 - (n - 1 - i) * 0.009,
    opacity: 1,
    blurPx: 0,
    zIndex: 100 + i,
    visibility: "visible" as const,
    pointerEvents: "auto" as const,
  };
}

type CardTransformResult = ReturnType<typeof cardTransform>;

function blendDeckToCarousel(progress: number, stack: CardTransformResult, norm: CardTransformResult): CardTransformResult {
  const e = easeOutCubic(progress);
  const late = e > 0.93;
  const visibility = late ? norm.visibility : "visible";
  const pointerEvents = late ? norm.pointerEvents : "auto";
  let opacity = stack.opacity + (norm.opacity - stack.opacity) * e;
  if (norm.visibility === "hidden" && !late) {
    opacity = Math.max(opacity, 0.4);
  }
  return {
    translateX: stack.translateX + (norm.translateX - stack.translateX) * e,
    translateY: stack.translateY + (norm.translateY - stack.translateY) * e,
    rotateDeg: stack.rotateDeg + (norm.rotateDeg - stack.rotateDeg) * e,
    scale: stack.scale + (norm.scale - stack.scale) * e,
    opacity,
    blurPx: stack.blurPx + (norm.blurPx - stack.blurPx) * e,
    zIndex: Math.round(stack.zIndex + (norm.zIndex - stack.zIndex) * e),
    visibility,
    pointerEvents,
  };
}

const MOBILE_MAX_WIDTH = "(max-width: 639px)";

export default function ArcAiGallerySection({
  scrollEntrance = false,
  entranceAutoSequence = false,
  sectionTag,
  arcGalleryCloseRef,
  arcGalleryOverlayOpenRef,
}: {
  scrollEntrance?: boolean;
  /** Après clic « Défiler » : enchaîne typewriter → titre remonte → cartes → deck sans scrub au scroll. */
  entranceAutoSequence?: boolean;
  /** Libellé haut-gauche (expérience visuelle), à l’intérieur du sticky scroll. */
  sectionTag?: string;
  /** /experience : fermeture synchrone de l’aperçu carte (flèches nav). */
  arcGalleryCloseRef?: React.MutableRefObject<(() => void) | null>;
  arcGalleryOverlayOpenRef?: React.MutableRefObject<boolean>;
}) {
  const [active, setActive] = useState(Math.floor(GALLERY.length / 2));
  const [reduceMotion, setReduceMotion] = useState(false);
  const [narrowMobile, setNarrowMobile] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const suppressCardClickRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const pointerDragRef = useRef<{
    active: boolean;
    startX: number;
    moved: boolean;
    pointerId: number | null;
  }>({ active: false, startX: 0, moved: false, pointerId: null });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MAX_WIDTH);
    setNarrowMobile(mq.matches);
    const fn = () => setNarrowMobile(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useLayoutEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const gallerySectionRef = useRef<HTMLElement | null>(null);
  const [galleryIoVisible, setGalleryIoVisible] = useState(false);

  useEffect(() => {
    if (!scrollEntrance) {
      setGalleryIoVisible(false);
      return;
    }
    const el = gallerySectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        setGalleryIoVisible(e.isIntersecting && e.intersectionRatio >= 0.22);
      },
      { threshold: [0, 0.12, 0.22, 0.35, 0.55, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [scrollEntrance]);

  const go = useCallback((dir: -1 | 1) => {
    setActive((i) => {
      const n = GALLERY.length;
      return (i + dir + n) % n;
    });
  }, []);

  const selectCard = useCallback((index: number) => {
    if (suppressCardClickRef.current) return;
    setActive(index);
  }, []);

  const onCardPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      pointerDragRef.current = {
        active: true,
        startX: e.clientX,
        moved: false,
        pointerId: e.pointerId,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    []
  );

  const onCardPointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = pointerDragRef.current;
      if (!d.active || d.pointerId !== e.pointerId) return;
      if (Math.abs(e.clientX - d.startX) > 14) d.moved = true;
    },
    []
  );

  const onCardPointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = pointerDragRef.current;
      if (!d.active || d.pointerId !== e.pointerId) return;
      const el = e.currentTarget;
      const pid = e.pointerId;
      const dx = e.clientX - d.startX;
      const didSwipe = d.moved;
      d.active = false;
      d.pointerId = null;
      try {
        el.releasePointerCapture(pid);
      } catch {
        /* ignore */
      }
      if (didSwipe) {
        if (dx > 56) go(-1);
        else if (dx < -56) go(1);
        suppressCardClickRef.current = true;
        window.setTimeout(() => {
          suppressCardClickRef.current = false;
        }, 120);
      }
    },
    [go]
  );

  const onCardPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = pointerDragRef.current;
      if (d.pointerId === e.pointerId) {
        d.active = false;
        d.pointerId = null;
      }
    },
    []
  );

  useEffect(() => {
    if (scrollEntrance) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, scrollEntrance]);

  const cardRadius = "clamp(22px, 4.5vw, 30px)";
  const transitionDuration = reduceMotion ? "0.18s" : "0.82s";
  const transition = `${transitionDuration} ${EASE_OUT_ORGANIC}`;

  const runwayRef = useRef<HTMLDivElement>(null);
  const [entranceProgress, setEntranceProgress] = useState(0);
  const [autoSeq, setAutoSeq] = useState<AutoSeqState>(AUTO_SEQ_INITIAL);
  const autoEpochRef = useRef(0);
  /** Entrée pilotée au scroll : 0 = pile, 1 = carrousel (après clic « Ouvrir »). */
  const [scrollDeckBlend, setScrollDeckBlend] = useState(0);
  const scrollDeckEpochRef = useRef(0);
  const stickyTopPx = 48;

  const scrollDriveEntrance =
    scrollEntrance && !entranceAutoSequence && !reduceMotion;

  useLayoutEffect(() => {
    if (!scrollEntrance || reduceMotion) {
      setEntranceProgress(1);
      return;
    }
    if (entranceAutoSequence) {
      setEntranceProgress(1);
      return;
    }
    const update = () => {
      const el = runwayRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const outerH = el.offsetHeight;
      const vh = window.innerHeight;
      const range = Math.max(outerH - vh, 1);
      const raw = -top;
      const clamped = Math.min(Math.max(raw, 0), range);
      setEntranceProgress(clamped / range);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scrollEntrance, reduceMotion, entranceAutoSequence, viewportWidth]);

  useEffect(() => {
    if (!entranceAutoSequence || !scrollEntrance) return;

    if (reduceMotion) {
      setAutoSeq({
        titleChars: GALLERY_SCROLL_TITLE.length,
        liftT: 1,
        blackOp: 0,
        cardsReveal: 1,
        deckBlend: 1,
        discoverPending: false,
        complete: true,
      });
      return;
    }

    const epoch = ++autoEpochRef.current;
    setAutoSeq(AUTO_SEQ_INITIAL);

    let cancelled = false;
    const run = async () => {
      for (let c = 1; c <= GALLERY_SCROLL_TITLE.length; c++) {
        if (cancelled || autoEpochRef.current !== epoch) return;
        setAutoSeq((s) => ({ ...s, titleChars: c }));
        await seqSleep(34);
      }
      if (cancelled || autoEpochRef.current !== epoch) return;
      await seqSleep(380);
      await rampAutoSeq(setAutoSeq, autoEpochRef, epoch, 1050, (t) => ({
        liftT: t,
        blackOp: 1 - t,
      }));
      if (cancelled || autoEpochRef.current !== epoch) return;
      await rampAutoSeq(setAutoSeq, autoEpochRef, epoch, 720, (t) => ({
        cardsReveal: t,
      }));
      if (cancelled || autoEpochRef.current !== epoch) return;
      setAutoSeq((s) => ({
        ...s,
        discoverPending: true,
        deckBlend: 0,
      }));
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [entranceAutoSequence, scrollEntrance, reduceMotion]);

  useEffect(() => {
    if (!entranceAutoSequence) setAutoSeq(AUTO_SEQ_INITIAL);
  }, [entranceAutoSequence]);

  useEffect(() => {
    if (!scrollDriveEntrance) {
      setScrollDeckBlend(0);
      scrollDeckEpochRef.current += 1;
    }
  }, [scrollDriveEntrance]);

  /** Toujours utilisé pour l’échelle du deck (mobile inclus) ; gap/step seulement hors narrow. */
  const viewportArc = arcLayoutForViewport(viewportWidth);
  const arcLayout = narrowMobile ? null : viewportArc;

  const p = entranceProgress;
  const autoActive = scrollEntrance && entranceAutoSequence && !reduceMotion;

  let visibleTitleChars: number;
  let liftProgress: number;
  let deckAnimProgress: number;
  let cardsReveal: number;
  let blackOverlayOpacity: number;

  if (!scrollEntrance || reduceMotion) {
    visibleTitleChars = GALLERY_SCROLL_TITLE.length;
    liftProgress = 1;
    deckAnimProgress = 1;
    cardsReveal = 1;
    blackOverlayOpacity = 0;
  } else if (autoActive) {
    visibleTitleChars = Math.min(GALLERY_SCROLL_TITLE.length, autoSeq.titleChars);
    liftProgress = autoSeq.liftT;
    deckAnimProgress = autoSeq.deckBlend;
    cardsReveal = autoSeq.cardsReveal;
    blackOverlayOpacity = autoSeq.blackOp;
  } else {
    const textProgress = Math.min(1, p / ENTRANCE_CENTER_END);
    visibleTitleChars = Math.min(
      GALLERY_SCROLL_TITLE.length,
      Math.floor(textProgress * GALLERY_SCROLL_TITLE.length)
    );
    liftProgress =
      p <= ENTRANCE_CENTER_END
        ? 0
        : Math.min(1, (p - ENTRANCE_CENTER_END) / (ENTRANCE_LIFT_END - ENTRANCE_CENTER_END));
    deckAnimProgress = scrollDeckBlend;
    cardsReveal =
      p < ENTRANCE_LIFT_END
        ? 0
        : Math.min(1, (p - ENTRANCE_LIFT_END) / ENTRANCE_CARDS_FADE);
    blackOverlayOpacity =
      p < ENTRANCE_CENTER_END
        ? 1
        : p < ENTRANCE_LIFT_END
          ? Math.max(0, 1 - (p - ENTRANCE_CENTER_END) / (ENTRANCE_LIFT_END - ENTRANCE_CENTER_END))
          : 0;
  }

  const deckProgress = !scrollEntrance ? 1 : reduceMotion ? p : deckAnimProgress;

  const longScrollRunway = scrollDriveEntrance;
  const entranceRunwayPad = longScrollRunway ? ` + ${ENTRANCE_RUNWAY_PAD}` : "";

  const entranceMotionLive =
    scrollEntrance &&
    !reduceMotion &&
    ((!entranceAutoSequence &&
      (entranceProgress < 0.997 || scrollDeckBlend < 0.997)) ||
      (entranceAutoSequence && !autoSeq.complete));

  const onDiscoverDeckClick = useCallback(() => {
    let runAutoDeck = false;
    setAutoSeq((s) => {
      if (!s.discoverPending || s.complete) return s;
      runAutoDeck = true;
      return { ...s, discoverPending: false };
    });
    queueMicrotask(() => {
      if (runAutoDeck) {
        const epoch = autoEpochRef.current;
        void (async () => {
          await rampAutoSeq(setAutoSeq, autoEpochRef, epoch, 1320, (t) => ({
            deckBlend: t,
          }));
          if (autoEpochRef.current !== epoch) return;
          setAutoSeq((s) => ({ ...s, complete: true, deckBlend: 1 }));
        })();
        return;
      }
      if (!scrollDriveEntrance) return;
      setScrollDeckBlend((b) => {
        if (b > 0.02) return b;
        const epoch = ++scrollDeckEpochRef.current;
        const t0 = performance.now();
        const dur = 1320;
        const step = () => {
          if (scrollDeckEpochRef.current !== epoch) return;
          const u = Math.min(1, (performance.now() - t0) / dur);
          setScrollDeckBlend(easeOutCubic(u));
          if (u < 1) requestAnimationFrame(step);
          else setScrollDeckBlend(1);
        };
        requestAnimationFrame(step);
        return b;
      });
    });
  }, [scrollDriveEntrance]);

  const stickyFillStr = `max(calc(100dvh - ${stickyTopPx}px), calc(100svh - ${stickyTopPx}px))`;
  const oneScreenGallery = scrollEntrance && !longScrollRunway;
  const titleTypeProgress = Math.min(1, visibleTitleChars / GALLERY_SCROLL_TITLE.length);
  const showScrollDiscover =
    scrollDriveEntrance && entranceProgress >= SCROLL_CARDS_DONE && scrollDeckBlend < 0.05;
  const showDiscoverOverlay =
    (autoActive && autoSeq.discoverPending) || showScrollDiscover;
  /** Aplats sous « Ouvrir » ; puis fondu des photos avec l’ouverture du deck. */
  const discoverMaskFlat =
    (autoActive && autoSeq.discoverPending) ||
    (scrollDriveEntrance &&
      entranceProgress >= SCROLL_CARDS_DONE &&
      scrollDeckBlend < 0.02);
  const photoDeckReveal =
    autoActive && !autoSeq.discoverPending && !autoSeq.complete
      ? autoSeq.deckBlend
      : scrollDriveEntrance && scrollDeckBlend > 0 && scrollDeckBlend < 1
        ? scrollDeckBlend
        : 1;
  const titleDelicateOpacity =
    scrollEntrance && !reduceMotion
      ? 0.74 + 0.26 * titleTypeProgress * (0.86 + 0.14 * liftProgress)
      : 1;
  /** Espace au-dessus du titre : disparaît quand le titre remonte en tête de section (flux normal). */
  const titleAboveSpacerGrow = scrollEntrance && !reduceMotion ? Math.max(0, 1 - liftProgress) : 0;

  const sectionNode = (
    <section
      ref={gallerySectionRef}
      id="ai-gallery-arc"
      className="arc-ai-gallery-root"
      style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        boxSizing: "border-box",
        overflow: "visible",
        fontFamily: font.sans,
        color: "#f5f5f7",
        display: scrollEntrance ? "flex" : undefined,
        flexDirection: scrollEntrance ? "column" : undefined,
        flex: scrollEntrance ? "1 1 0" : undefined,
        minHeight: scrollEntrance ? stickyFillStr : undefined,
        minWidth: 0,
        paddingTop: scrollEntrance
          ? oneScreenGallery
            ? "max(clamp(10px, 2.2vh, 36px), env(safe-area-inset-top))"
            : "max(calc(clamp(28px, 5vh, 64px) + clamp(36px, 6vh, 80px)), env(safe-area-inset-top))"
          : "max(clamp(28px, 5vh, 64px), env(safe-area-inset-top))",
        paddingBottom: oneScreenGallery
          ? "max(clamp(8px, 1.8vh, 24px), env(safe-area-inset-bottom))"
          : "max(clamp(36px, 6vh, 80px), env(safe-area-inset-bottom))",
        paddingLeft: "max(clamp(12px, 3vw, 32px), env(safe-area-inset-left))",
        paddingRight: "max(clamp(12px, 3vw, 32px), env(safe-area-inset-right))",
        background: GALLERY_SECTION_BG,
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: scrollEntrance ? "1 1 0" : undefined,
          minHeight: scrollEntrance ? 0 : undefined,
          display: scrollEntrance ? "flex" : undefined,
          flexDirection: scrollEntrance ? "column" : undefined,
          gap:
            scrollEntrance && reduceMotion ? "min(12px, 2vh)" : undefined,
          minWidth: 0,
        }}
      >
        {scrollEntrance ? (
          <div
            style={{
              flex: "1 1 0",
              width: "100%",
              minHeight: 0,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <ArcGalleryGoldMarquee
              items={GALLERY}
              reduceMotion={reduceMotion}
              narrowMobile={narrowMobile}
              viewportWidth={viewportWidth}
              fontSerif={font.serif}
              fontSans={font.sans}
              sectionActive={galleryIoVisible}
              onExposeClose={
                arcGalleryCloseRef
                  ? (fn) => {
                      arcGalleryCloseRef.current = fn;
                    }
                  : undefined
              }
              overlayOpenRef={arcGalleryOverlayOpenRef}
            />
          </div>
        ) : (
          <>
            <h2
              style={{
                margin: 0,
                marginLeft: "auto",
                marginRight: "auto",
                marginBottom: "clamp(40px, 8vw, 96px)",
                maxWidth: 900,
                width: "100%",
                fontFamily: font.serif,
                fontSize: "clamp(1.62rem, 4.2vw, 2.82rem)",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "rgba(255,255,255,0.96)",
                textAlign: "center",
                textShadow: "0 2px 24px rgba(0,0,0,0.45)",
              }}
            >
              Create Stunning AI Generated Photos Instantly
            </h2>
            <div
              style={{
                opacity: cardsReveal,
                pointerEvents: cardsReveal < 0.04 ? "none" : "auto",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 1320,
                  minHeight: narrowMobile ? 200 : 220,
                  marginLeft: "auto",
                  marginRight: "auto",
                  position: "relative",
                }}
              >
                <div
                  className="arc-ai-carousel-viewport"
                  role="group"
                  aria-label="Galerie, cliquer une vignette pour la centrer ou glisser sur une carte"
                  style={{
                    position: "relative",
                    width: "100%",
                    height: narrowMobile
                      ? "clamp(360px, 56vh, 600px)"
                      : viewportWidth < 900
                        ? "clamp(380px, 58vh, 640px)"
                        : "clamp(400px, 66vh, 680px)",
                    marginLeft: "auto",
                    marginRight: "auto",
                    touchAction: "pan-y",
                    outline: "none",
                    boxShadow: "none",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: 0,
                      height: 0,
                    }}
                  >
                    {GALLERY.map((item, i) => {
                      const d = i - active;
                      const w = wrapDelta(i, active, GALLERY.length);
                      const norm = cardTransform(
                        d,
                        reduceMotion,
                        narrowMobile,
                        w,
                        arcLayout?.gap ?? GAP_ACTIVE_TO_NEIGHBOR_PX,
                        arcLayout?.step ?? STEP_INACTIVE_BETWEEN_PX
                      );
                      const stack = stackDeckTransform(
                        i,
                        GALLERY.length,
                        viewportArc.deckScale
                      );
                      const t =
                        deckProgress >= 0.999
                          ? norm
                          : blendDeckToCarousel(deckProgress, stack, norm);

                      const transform = `translate(-50%, -50%) translateX(${t.translateX}px) translateY(${t.translateY}px) rotate(${t.rotateDeg}deg) scale(${t.scale})`;

                      const scrollDriving = entranceMotionLive;

                      const shadowSoftFramed =
                        d === 0
                          ? "0 32px 64px rgba(0,0,0,0.52), 0 12px 28px rgba(0,0,0,0.32), 0 0 100px rgba(150, 38, 52, 0.16)"
                          : "0 12px 28px rgba(0,0,0,0.26), 0 4px 12px rgba(0,0,0,0.18)";
                      const shadowSoftFlat =
                        d === 0
                          ? "0 24px 52px rgba(0,0,0,0.5), 0 10px 28px rgba(0,0,0,0.32)"
                          : "0 10px 26px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.18)";
                      const shadowSoft = discoverMaskFlat
                        ? shadowSoftFlat
                        : shadowSoftFramed;

                      return (
                        <button
                          key={`${item.title}-${i}-alt`}
                          type="button"
                          className="arc-ai-carousel-card"
                          tabIndex={
                            narrowMobile && Math.abs(w) > 1 ? -1 : undefined
                          }
                          aria-hidden={
                            narrowMobile && Math.abs(w) > 1 ? true : undefined
                          }
                          aria-current={d === 0 ? "true" : undefined}
                          aria-label={`${item.title}, ${item.rating} stars`}
                          onClick={() => selectCard(i)}
                          onPointerDown={onCardPointerDown}
                          onPointerMove={onCardPointerMove}
                          onPointerUp={onCardPointerUp}
                          onPointerCancel={onCardPointerCancel}
                          onTouchStart={(e) => {
                            touchStartXRef.current =
                              e.touches[0]?.clientX ?? null;
                          }}
                          onTouchEnd={(e) => {
                            const start = touchStartXRef.current;
                            touchStartXRef.current = null;
                            if (start == null) return;
                            const dx = e.changedTouches[0].clientX - start;
                            if (Math.abs(dx) < 56) return;
                            if (dx > 56) go(-1);
                            else go(1);
                            suppressCardClickRef.current = true;
                            window.setTimeout(() => {
                              suppressCardClickRef.current = false;
                            }, 120);
                          }}
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: narrowMobile
                              ? "min(68vw, 252px)"
                              : viewportWidth < 900
                                ? "clamp(168px, 36vw, 272px)"
                                : "clamp(186px, 40vw, 304px)",
                            aspectRatio: "2 / 3",
                            padding: 0,
                            border: "none",
                            cursor:
                              narrowMobile
                                ? w === 0
                                  ? "default"
                                  : "pointer"
                                : d === 0
                                  ? "default"
                                  : "grab",
                            borderRadius: cardRadius,
                            overflow: "hidden",
                            transform,
                            opacity: t.opacity,
                            visibility: t.visibility,
                            pointerEvents: t.pointerEvents,
                            filter:
                              t.blurPx > 0
                                ? `blur(${t.blurPx}px)`
                                : "none",
                            zIndex: t.zIndex,
                            boxShadow: shadowSoft,
                            transition: scrollDriving
                              ? "none"
                              : `transform ${transition}, opacity ${transition}, filter ${transition}, box-shadow ${transition}`,
                            background: "#121218",
                            WebkitTapHighlightColor: "transparent",
                            touchAction: "manipulation",
                            willChange: reduceMotion
                              ? "auto"
                              : "transform, opacity, filter",
                          }}
                        >
                          <span
                            aria-hidden
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: discoverFlatFace(item.universeColor),
                              opacity: discoverMaskFlat
                                ? 1
                                : Math.max(0, 1 - photoDeckReveal),
                              transition: scrollDriving
                                ? "none"
                                : `opacity 0.55s ${EASE_OUT_ORGANIC}`,
                            }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              inset: 0,
                              backgroundImage: `url("${item.src}")`,
                              backgroundSize: "cover",
                              backgroundPosition: "center top",
                              opacity: discoverMaskFlat ? 0 : photoDeckReveal,
                              transition: scrollDriving
                                ? "none"
                                : `opacity 0.55s ${EASE_OUT_ORGANIC}`,
                            }}
                          />
                          <span
                            aria-hidden
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: vignetteUniverseGradient(
                                item.universeColor
                              ),
                              opacity: discoverMaskFlat ? 0 : photoDeckReveal,
                              transition: scrollDriving
                                ? "none"
                                : `opacity 0.45s ${EASE_OUT_ORGANIC}`,
                            }}
                          />

                          <span
                            style={{
                              position: "absolute",
                              top: 14,
                              left: 14,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "6px 8px",
                              borderRadius: 10,
                              background: "rgba(0,0,0,0.5)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              backdropFilter: "blur(8px)",
                              WebkitBackdropFilter: "blur(8px)",
                              opacity: discoverMaskFlat ? 0 : photoDeckReveal,
                              visibility: discoverMaskFlat ? "hidden" : "visible",
                            }}
                          >
                            <StreamingLogo platform={item.platform} />
                          </span>

                          <span
                            style={{
                              position: "absolute",
                              top: 14,
                              right: 14,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "5px 10px",
                              borderRadius: 10,
                              fontSize: 13,
                              fontWeight: 700,
                              color: "rgba(255,255,255,0.98)",
                              textShadow: "0 1px 8px rgba(0,0,0,0.85)",
                              background: "rgba(0,0,0,0.4)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              opacity: discoverMaskFlat ? 0 : photoDeckReveal,
                              visibility: discoverMaskFlat ? "hidden" : "visible",
                            }}
                          >
                            {item.rating}
                            <span style={{ fontSize: 12, lineHeight: 1 }} aria-hidden>
                              ★
                            </span>
                          </span>

                          <span
                            style={{
                              position: "absolute",
                              left: 16,
                              right: 16,
                              bottom: 16,
                              textAlign: "left",
                              opacity: discoverMaskFlat ? 0 : photoDeckReveal,
                              visibility: discoverMaskFlat ? "hidden" : "visible",
                            }}
                          >
                            <span
                              style={{
                                display: "block",
                                fontFamily: font.sans,
                                fontSize: "clamp(1.05rem, 2.9vw, 1.4rem)",
                                fontWeight: 800,
                                lineHeight: 1.12,
                                color: "#fff",
                                textShadow: "0 2px 14px rgba(0,0,0,0.85)",
                              }}
                            >
                              {item.title}
                            </span>
                            <span
                              style={{
                                display: "block",
                                marginTop: 6,
                                fontSize: "clamp(11px, 2.4vw, 13px)",
                                fontWeight: 500,
                                lineHeight: 1.35,
                                color: "rgba(255,255,255,0.76)",
                                textShadow: "0 1px 10px rgba(0,0,0,0.9)",
                              }}
                            >
                              {item.years} · {item.meta}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div
                role="group"
                aria-label="Position dans la galerie"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  marginTop: oneScreenGallery ? 6 : 14,
                }}
              >
                {GALLERY.map((item, i) => (
                  <button
                    key={`dot-alt-${i}`}
                    type="button"
                    aria-label={`${item.title}, vignette ${i + 1} sur ${GALLERY.length}`}
                    aria-current={i === active ? "true" : undefined}
                    onClick={() => setActive(i)}
                    style={{
                      padding: 0,
                      border: "none",
                      cursor: "pointer",
                      borderRadius: 4,
                      height: 7,
                      minWidth: 7,
                      width: i === active ? 24 : 7,
                      backgroundColor:
                        i === active
                          ? "rgba(255,255,255,0.88)"
                          : "rgba(255,255,255,0.22)",
                      transition: `width ${transitionDuration} ${EASE_OUT_ORGANIC}, background-color ${transitionDuration} ${EASE_OUT_ORGANIC}`,
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );

  if (!scrollEntrance) {
    return sectionNode;
  }

  return (
    <div
      id="experience-gallery-runway"
      ref={runwayRef}
      className="experience-gallery-runway"
      style={{
        position: "relative",
        width: "100%",
        minHeight: longScrollRunway
          ? viewportWidth < 640
            ? `calc(100vh + min(100vh, 820px)${entranceRunwayPad})`
            : viewportWidth < 768
              ? `calc(100vh + min(108vh, 880px)${entranceRunwayPad})`
              : viewportWidth < 1200
                ? `calc(100vh + min(128vh, 1140px)${entranceRunwayPad})`
                : `calc(100vh + min(140vh, 1280px)${entranceRunwayPad})`
          : "max(100dvh, 100svh)",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: stickyTopPx,
          zIndex: 1,
          width: "100%",
          minHeight: `max(calc(100dvh - ${stickyTopPx}px), calc(100svh - ${stickyTopPx}px))`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          boxSizing: "border-box",
        }}
      >
        {sectionTag ? (
          <SectionNameTag name={sectionTag} navTopOffsetPx={4} layoutFill>
            {sectionNode}
          </SectionNameTag>
        ) : (
          sectionNode
        )}
      </div>
    </div>
  );
}
