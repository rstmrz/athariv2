"use client";

import React, {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import AdventureHero from "./AdventureHero";
import ArcAiGallerySection, {
  EXPERIENCE_ARC_SCROLL_STACKED_P,
} from "./ArcAiGallerySection";
import ExperienceOriginHero from "./ExperienceOriginHero";
import ExperienceSectionNavigator from "./ExperienceSectionNavigator";
import OriginDiscoverMorphOverlay from "./OriginDiscoverMorphOverlay";
import SectionNameTag from "./SectionNameTag";
import VisionCardSection from "./VisionCardSection";
import {
  HERO_BG_1_SRC,
  HERO_BG_2_SRC,
  HERO_BG_SRC,
  sampleBottomRowRgb,
  type Rgb,
} from "../lib/heroEdgeColor";

/**
 * Quand tu voudras du scroll libre (nouvelles sections, etc.), passe cette constante à `false`.
 * Le verrou (molette / tactile / flèches vers le bas) ne s’applique plus.
 */
const EXPERIENCE_SCROLL_GATE_ENABLED = true;

/** Dernière section scrollable de /experience (0 = hero originel … 6 = galerie). */
const EXPERIENCE_SECTION_LAST_INDEX = 6;

/** Index de section courant : même règle que la barre de nav (ancre = haut viewport + 22% vh). */
function experienceAnchorSectionIndex(
  getSection: (i: number) => HTMLElement | null
): number {
  if (typeof window === "undefined") return 0;
  const sy = window.scrollY;
  const vh = window.innerHeight;
  const anchor = sy + vh * 0.22;
  let best = 0;
  for (let i = 0; i <= EXPERIENCE_SECTION_LAST_INDEX; i++) {
    const el = getSection(i);
    if (!el) continue;
    const docTop = el.getBoundingClientRect().top + sy;
    if (docTop <= anchor) best = i;
  }
  return best;
}

class GalleryErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[HeroGallery]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main
          style={{
            minHeight: "100vh",
            background: "#1a0808",
            color: "#fecaca",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ marginTop: 0 }}>Erreur d’affichage</h1>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>
            {this.state.error.message}
          </pre>
          <p style={{ color: "#fca5a5", fontSize: 14 }}>
            Copie ce message et envoie-le si tu demandes de l’aide.
          </p>
        </main>
      );
    }
    return this.props.children;
  }
}

type ReleasedState = { h1: boolean; h2: boolean; h3: boolean };

export default function HeroGalleryInner() {
  const [edgeHero1, setEdgeHero1] = useState<Rgb | null>(null);
  const [edgeHero2, setEdgeHero2] = useState<Rgb | null>(null);
  const [edgeHeroMain, setEdgeHeroMain] = useState<Rgb | null>(null);
  const [galleryEntranceFromCue, setGalleryEntranceFromCue] = useState(false);
  const [introOriginDone, setIntroOriginDone] = useState(false);
  const [morphActive, setMorphActive] = useState(false);
  const [morphRect, setMorphRect] = useState<DOMRect | null>(null);
  const [morphReverse, setMorphReverse] = useState(false);
  const [morphInstanceKey, setMorphInstanceKey] = useState(0);
  const [originSnapRatio, setOriginSnapRatio] = useState(0);
  const [originCycleKey, setOriginCycleKey] = useState(0);
  const [typewriterHero1, setTypewriterHero1] = useState(false);

  const [released, setReleased] = useState<ReleasedState>({
    h1: false,
    h2: false,
    h3: false,
  });

  const [primaryHero, setPrimaryHero] = useState<0 | 1 | 2 | 3>(1);
  const [typewriterHero2, setTypewriterHero2] = useState(false);
  const [typewriterHero3, setTypewriterHero3] = useState(false);
  const [experienceScrollY, setExperienceScrollY] = useState(0);

  const savedDiscoverRectRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const forwardMorphCompleteRef = useRef(false);
  const prevOriginRatioRef = useRef(0);
  const morphReverseStartingRef = useRef(false);
  const startReverseMorphRef = useRef<(() => void) | null>(null);
  const galleryArrowRafRef = useRef(0);

  const hero1Ref = useRef<HTMLDivElement>(null);
  const originSectionRef = useRef<HTMLDivElement>(null);
  const spacerAfterHero1Ref = useRef<HTMLDivElement>(null);
  const hero2Ref = useRef<HTMLDivElement>(null);
  const spacerAfterHero2Ref = useRef<HTMLDivElement>(null);
  const hero3Ref = useRef<HTMLDivElement>(null);

  const ratiosRef = useRef<Record<1 | 2 | 3, number>>({ 1: 0, 2: 0, 3: 0 });

  const getExpSection = (index: number): HTMLElement | null => {
    switch (index) {
      case 0:
        return originSectionRef.current;
      case 1:
        return hero1Ref.current;
      case 2:
        return spacerAfterHero1Ref.current;
      case 3:
        return hero2Ref.current;
      case 4:
        return spacerAfterHero2Ref.current;
      case 5:
        return hero3Ref.current;
      case 6: {
        if (typeof document === "undefined") return null;
        /* Piste scroll / snap = wrapper runway ; la section #ai-gallery-arc est sticky dedans. */
        return (
          document.getElementById("experience-gallery-runway") ??
          document.getElementById("ai-gallery-arc")
        );
      }
      default:
        return null;
    }
  };

  const experienceNavIndex = useMemo(() => {
    return experienceAnchorSectionIndex(getExpSection);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recalcul quand scrollY state change ; getSection lit les refs
  }, [experienceScrollY]);

  const experienceNavVisible = introOriginDone && !morphActive;

  const experienceNavCanGoUp = useMemo(
    () => experienceNavVisible && experienceNavIndex > 0,
    [experienceNavVisible, experienceNavIndex]
  );

  const experienceNavCanGoDown = useMemo(() => {
    if (!experienceNavVisible) return false;
    if (experienceNavIndex >= EXPERIENCE_SECTION_LAST_INDEX) return false;
    return true;
  }, [experienceNavVisible, experienceNavIndex]);

  const experienceScrollBehavior = useCallback((): ScrollBehavior => {
    if (typeof window === "undefined") return "smooth";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? ("instant" as ScrollBehavior)
      : "smooth";
  }, []);

  /** scroll-snap + scroll-behavior sur html cassent souvent scrollIntoView(smooth) : snap off + scrollTo. */
  const navJumpTokenRef = useRef(0);
  const scrollExpSectionIntoView = useCallback(
    (el: HTMLElement | null) => {
      if (!el || typeof window === "undefined") return;
      const html = document.documentElement;
      const behavior = experienceScrollBehavior();
      const token = ++navJumpTokenRef.current;
      const marginTop = parseFloat(window.getComputedStyle(el).scrollMarginTop) || 0;
      const targetTop = Math.max(
        0,
        window.scrollY + el.getBoundingClientRect().top - marginTop
      );

      html.classList.add("hero-gallery-nav-jump");

      const finish = () => {
        if (navJumpTokenRef.current !== token) return;
        html.classList.remove("hero-gallery-nav-jump");
      };

      window.scrollTo({ top: targetTop, left: 0, behavior });

      if (behavior === ("instant" as ScrollBehavior)) {
        requestAnimationFrame(() => requestAnimationFrame(finish));
        return;
      }

      let tid = 0;
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        window.removeEventListener("scrollend", settle);
        window.clearTimeout(tid);
        finish();
      };
      tid = window.setTimeout(settle, 1300);
      window.addEventListener("scrollend", settle, { passive: true });
    },
    [experienceScrollBehavior]
  );

  /**
   * L’entrée galerie est pilotée par la position dans le runway (progress 0→1).
   * Un seul saut au début laisse progress≈0 : on anime le scroll sur ~STACKED_P pour rejouer titrage / lift / cartes.
   */
  const runArcGalleryEntranceFromArrow = useCallback((runway: HTMLElement) => {
    if (typeof window === "undefined") return;
    const html = document.documentElement;
    const token = ++navJumpTokenRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const runwayDocTop = runway.getBoundingClientRect().top + window.scrollY;
    const vh = window.innerHeight;
    const range = Math.max(runway.offsetHeight - vh, 1);
    let endY = runwayDocTop + EXPERIENCE_ARC_SCROLL_STACKED_P * range;
    const maxScroll = Math.max(
      0,
      (document.scrollingElement?.scrollHeight ??
        document.documentElement.scrollHeight) - vh
    );
    endY = Math.min(endY, maxScroll);
    const startY = window.scrollY;

    const finish = () => {
      if (navJumpTokenRef.current !== token) return;
      if (galleryArrowRafRef.current) {
        cancelAnimationFrame(galleryArrowRafRef.current);
        galleryArrowRafRef.current = 0;
      }
      html.classList.remove("hero-gallery-nav-jump");
    };

    html.classList.add("hero-gallery-nav-jump");

    if (reduceMotion || Math.abs(endY - startY) < 6) {
      window.scrollTo({
        top: endY,
        left: 0,
        behavior: "instant" as ScrollBehavior,
      });
      requestAnimationFrame(() => requestAnimationFrame(finish));
      return;
    }

    const duration = 2200;
    const t0 = performance.now();
    const easeOut = (t: number) => 1 - (1 - t) ** 2.35;

    const step = (now: number) => {
      if (navJumpTokenRef.current !== token) return;
      const u = Math.min(1, (now - t0) / duration);
      const y = startY + (endY - startY) * easeOut(u);
      window.scrollTo({
        top: y,
        left: 0,
        behavior: "instant" as ScrollBehavior,
      });
      if (u < 1) {
        galleryArrowRafRef.current = requestAnimationFrame(step);
      } else {
        galleryArrowRafRef.current = 0;
        requestAnimationFrame(finish);
      }
    };
    galleryArrowRafRef.current = requestAnimationFrame(step);
  }, []);

  const onExperienceNavPrev = useCallback(() => {
    if (!experienceNavVisible) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const idx = experienceAnchorSectionIndex(getExpSection);
        if (idx <= 0) return;
        if (idx === 1) {
          if (
            savedDiscoverRectRef.current &&
            forwardMorphCompleteRef.current &&
            !morphReverseStartingRef.current
          ) {
            startReverseMorphRef.current?.();
            return;
          }
        }
        const prevEl = getExpSection(idx - 1);
        scrollExpSectionIntoView(prevEl);
      });
    });
  }, [experienceNavVisible, scrollExpSectionIntoView]);

  const onExperienceNavNext = useCallback(() => {
    if (!experienceNavVisible) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const idx = experienceAnchorSectionIndex(getExpSection);
        if (idx >= EXPERIENCE_SECTION_LAST_INDEX) return;
        if (EXPERIENCE_SCROLL_GATE_ENABLED) {
          if (idx === 1 && !released.h1) {
            flushSync(() =>
              setReleased((r) => ({ ...r, h1: true }))
            );
          }
          if (idx === 3 && !released.h2) {
            flushSync(() =>
              setReleased((r) => ({ ...r, h2: true }))
            );
          }
          if (idx === 5 && !released.h3) {
            flushSync(() =>
              setReleased((r) => ({ ...r, h3: true }))
            );
          }
        }
        if (idx === 5) {
          const runway = document.getElementById("experience-gallery-runway");
          if (runway) {
            runArcGalleryEntranceFromArrow(runway);
            return;
          }
        }
        const nextEl = getExpSection(idx + 1);
        scrollExpSectionIntoView(nextEl);
      });
    });
  }, [
    experienceNavVisible,
    released.h1,
    released.h2,
    released.h3,
    scrollExpSectionIntoView,
    runArcGalleryEntranceFromArrow,
  ]);

  useEffect(() => {
    const upd = () => setExperienceScrollY(window.scrollY);
    upd();
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        upd();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", upd);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", upd);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const onMorphExpandComplete = useCallback(() => {
    /* already synced to hero 1 before morph starts */
  }, []);

  const onMorphFullyDone = useCallback(() => {
    setMorphRect(null);
    setMorphActive(false);
    setMorphReverse(false);
    setTypewriterHero1(true);
    forwardMorphCompleteRef.current = true;
  }, []);

  const onReverseMorphFullyDone = useCallback(() => {
    setMorphRect(null);
    setMorphActive(false);
    setMorphReverse(false);
    morphReverseStartingRef.current = false;
    forwardMorphCompleteRef.current = false;
    prevOriginRatioRef.current = 0;
    setIntroOriginDone(false);
    setTypewriterHero1(false);
    setOriginCycleKey((k) => k + 1);
  }, []);

  const getHero1DocumentTop = useCallback((): number | null => {
    const el = hero1Ref.current;
    if (!el) return null;
    return el.getBoundingClientRect().top + window.scrollY;
  }, []);

  const onReverseScrollToOrigin = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const startReverseMorph = useCallback(() => {
    const saved = savedDiscoverRectRef.current;
    if (!saved) return;
    if (!forwardMorphCompleteRef.current) return;
    if (morphReverseStartingRef.current) return;
    morphReverseStartingRef.current = true;

    const hero1Top = getHero1DocumentTop();
    if (hero1Top != null) {
      window.scrollTo({
        top: hero1Top,
        left: 0,
        behavior: "instant" as ScrollBehavior,
      });
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMorphInstanceKey((k) => k + 1);
        setMorphReverse(true);
        setMorphActive(true);
        setMorphRect(new DOMRect(saved.x, saved.y, saved.width, saved.height));
      });
    });
  }, [getHero1DocumentTop]);

  startReverseMorphRef.current = startReverseMorph;

  useEffect(() => {
    if (!morphRect) return;
    document.documentElement.classList.add("hero-gallery-morph-no-snap");
    return () => {
      document.documentElement.classList.remove("hero-gallery-morph-no-snap");
    };
  }, [morphRect]);

  const onDiscoverMorph = useCallback((buttonRect: DOMRect) => {
    forwardMorphCompleteRef.current = false;
    savedDiscoverRectRef.current = {
      x: buttonRect.x,
      y: buttonRect.y,
      width: buttonRect.width,
      height: buttonRect.height,
    };
    setMorphInstanceKey((k) => k + 1);
    setMorphReverse(false);
    setIntroOriginDone(true);
    setMorphActive(true);
    setMorphRect(
      new DOMRect(
        buttonRect.x,
        buttonRect.y,
        buttonRect.width,
        buttonRect.height
      )
    );
    /* Après 2 rAF : le trou est peint sur l’intro, puis scroll pour aligner Hero 1 sous le trou. */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const hero1Top = getHero1DocumentTop();
        if (hero1Top != null) {
          window.scrollTo({
            top: hero1Top,
            left: 0,
            behavior: "instant" as ScrollBehavior,
          });
        }
      });
    });
  }, [getHero1DocumentTop]);

  const onHero1Cue = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setReleased((r) => ({ ...r, h1: true }));
    requestAnimationFrame(() => {
      spacerAfterHero1Ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  const onHero2Cue = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setReleased((r) => ({ ...r, h2: true }));
    requestAnimationFrame(() => {
      spacerAfterHero2Ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  const onHero3Cue = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setReleased((r) => ({ ...r, h3: true }));
      setGalleryEntranceFromCue(true);
      requestAnimationFrame(() => {
        const galleryScrollTarget =
          document.getElementById("experience-gallery-runway") ??
          document.getElementById("ai-gallery-arc");
        scrollExpSectionIntoView(galleryScrollTarget);
      });
    },
    [scrollExpSectionIntoView]
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      sampleBottomRowRgb(HERO_BG_1_SRC).catch(() => null),
      sampleBottomRowRgb(HERO_BG_2_SRC).catch(() => null),
      sampleBottomRowRgb(HERO_BG_SRC).catch(() => null),
    ]).then(([rgb1, rgb2, rgbMain]) => {
      if (cancelled) return;
      setEdgeHero1(rgb1);
      setEdgeHero2(rgb2);
      setEdgeHeroMain(rgbMain);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("hero-gallery-experience-scroll");
    return () => {
      document.documentElement.classList.remove("hero-gallery-experience-scroll");
    };
  }, []);

  const viewportScrollLocked = !introOriginDone || morphActive;

  useEffect(() => {
    if (!EXPERIENCE_SCROLL_GATE_ENABLED) return;
    const root = document.documentElement;
    if (viewportScrollLocked) {
      root.classList.add("hero-gallery-intro-scroll-lock");
      if (!introOriginDone) window.scrollTo(0, 0);
    } else {
      root.classList.remove("hero-gallery-intro-scroll-lock");
    }
    return () => {
      root.classList.remove("hero-gallery-intro-scroll-lock");
    };
  }, [viewportScrollLocked, introOriginDone]);

  useEffect(() => {
    const el = originSectionRef.current;
    if (!el) return;
    const thresholds = [0, 0.15, 0.35, 0.5, 0.52, 0.6, 0.75, 1];
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e) setOriginSnapRatio(e.intersectionRatio);
      },
      { threshold: thresholds }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (morphActive) return;
    if (!introOriginDone) return;
    if (!forwardMorphCompleteRef.current) return;
    if (morphReverseStartingRef.current) return;

    const prev = prevOriginRatioRef.current;
    const now = originSnapRatio;
    const nearTop = window.scrollY < window.innerHeight * 0.48;
    if (prev < 0.52 && now >= 0.52 && nearTop) {
      startReverseMorph();
    }
    prevOriginRatioRef.current = now;
  }, [
    originSnapRatio,
    morphActive,
    introOriginDone,
    startReverseMorph,
  ]);

  useEffect(() => {
    const h1 = hero1Ref.current;
    const h2 = hero2Ref.current;
    const h3 = hero3Ref.current;
    if (!h1 || !h2 || !h3) return;

    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
    const ratios = ratiosRef.current;

    const flush = () => {
      let winner: 0 | 1 | 2 | 3 = 0;
      let max = 0.38;
      for (const idx of [1, 2, 3] as const) {
        if (ratios[idx] > max) {
          max = ratios[idx];
          winner = idx;
        }
      }
      setPrimaryHero(winner);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const raw = entry.target.getAttribute("data-experience-hero-snap");
          const idx = Number(raw) as 1 | 2 | 3;
          if (idx >= 1 && idx <= 3) {
            ratios[idx] = entry.intersectionRatio;
          }
        }
        flush();
      },
      { threshold: thresholds }
    );

    obs.observe(h1);
    obs.observe(h2);
    obs.observe(h3);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (primaryHero === 2) setTypewriterHero2(true);
  }, [primaryHero]);

  useEffect(() => {
    if (primaryHero === 3) setTypewriterHero3(true);
  }, [primaryHero]);

  useEffect(() => {
    if (!EXPERIENCE_SCROLL_GATE_ENABLED) return;

    const lockedScrollDown = () => {
      if (!introOriginDone) return true;
      if (primaryHero === 1 && !released.h1) return true;
      if (primaryHero === 2 && !released.h2) return true;
      if (primaryHero === 3 && !released.h3) return true;
      return false;
    };

    const introLocked = () => !introOriginDone || morphActive;

    const onWheel = (e: WheelEvent) => {
      if (introLocked()) {
        e.preventDefault();
        return;
      }
      if (e.deltaY <= 0) return;
      if (lockedScrollDown()) e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (introLocked()) {
        if (
          e.key === " " ||
          e.key === "PageDown" ||
          e.key === "PageUp" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "Home" ||
          e.key === "End"
        ) {
          e.preventDefault();
        }
        return;
      }
      if (!lockedScrollDown()) return;
      if (
        e.key === " " ||
        e.key === "PageDown" ||
        e.key === "ArrowDown" ||
        e.key === "End"
      ) {
        e.preventDefault();
      }
    };

    let touchStartY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (introLocked()) {
        const y = e.touches[0]?.clientY;
        if (
          touchStartY != null &&
          y != null &&
          Math.abs(y - touchStartY) > 12
        ) {
          e.preventDefault();
        }
        return;
      }
      if (touchStartY == null || !lockedScrollDown()) return;
      const y = e.touches[0]?.clientY ?? touchStartY;
      if (touchStartY - y > 14) e.preventDefault();
    };
    const onTouchEnd = () => {
      touchStartY = null;
    };

    const doc = document;
    doc.addEventListener("wheel", onWheel, { passive: false, capture: true });
    doc.addEventListener("keydown", onKeyDown, { capture: true });
    doc.addEventListener("touchstart", onTouchStart, {
      passive: true,
      capture: true,
    });
    doc.addEventListener("touchmove", onTouchMove, {
      passive: false,
      capture: true,
    });
    doc.addEventListener("touchend", onTouchEnd, { capture: true });

    return () => {
      doc.removeEventListener("wheel", onWheel, { capture: true } as const);
      doc.removeEventListener("keydown", onKeyDown, { capture: true } as const);
      doc.removeEventListener("touchstart", onTouchStart, {
        capture: true,
      } as const);
      doc.removeEventListener("touchmove", onTouchMove, {
        capture: true,
      } as const);
      doc.removeEventListener("touchend", onTouchEnd, { capture: true } as const);
    };
  }, [released, primaryHero, introOriginDone, morphActive]);

  return (
    <GalleryErrorBoundary>
      {morphRect ? (
        <OriginDiscoverMorphOverlay
          key={morphInstanceKey}
          direction={morphReverse ? "reverse" : "forward"}
          initialRect={morphRect}
          onReverseScrollToOrigin={
            morphReverse ? onReverseScrollToOrigin : undefined
          }
          reverseHeroBackgroundSrc={
            morphReverse ? HERO_BG_1_SRC : undefined
          }
          reverseBackgroundPosition="center 42%"
          onExpandComplete={
            morphReverse ? undefined : onMorphExpandComplete
          }
          onFullyDone={
            morphReverse ? onReverseMorphFullyDone : onMorphFullyDone
          }
        />
      ) : null}
      {experienceNavVisible ? (
        <ExperienceSectionNavigator
          canGoUp={experienceNavCanGoUp}
          canGoDown={experienceNavCanGoDown}
          onGoUp={onExperienceNavPrev}
          onGoDown={onExperienceNavNext}
          sectionIndex={experienceNavIndex}
          sectionCount={EXPERIENCE_SECTION_LAST_INDEX + 1}
        />
      ) : null}
      <main
        id="hero-gallery-main"
        style={{ minHeight: "100vh", background: "#050508", color: "#fff" }}
      >
        <div
          ref={originSectionRef}
          className="hero-gallery-snap-hero hero-gallery-origin"
        >
          <SectionNameTag
            name="Hero originel"
            navTopOffsetPx={44}
            layoutFill
          >
            <ExperienceOriginHero
              key={originCycleKey}
              onDiscoverMorph={onDiscoverMorph}
            />
          </SectionNameTag>
        </div>
        <div
          ref={hero1Ref}
          className="hero-gallery-snap-hero"
          data-experience-hero-snap="1"
        >
          <SectionNameTag name="Hero 1 · fond-bg1" navTopOffsetPx={44}>
            <AdventureHero
              edgeRgb={edgeHero1}
              visualOnly
              typewriterActive={typewriterHero1}
              typewriterCharDelayMs={58}
              typewriterBetweenLinesMs={560}
              delicateVisual
              backgroundSrc={HERO_BG_1_SRC}
              onScrollCueClick={onHero1Cue}
            />
          </SectionNameTag>
        </div>
        <div ref={spacerAfterHero1Ref} className="hero-gallery-spacer-black">
          <VisionCardSection edgeRgb={edgeHero1} embedded />
        </div>
        <div
          ref={hero2Ref}
          className="hero-gallery-snap-hero"
          data-experience-hero-snap="2"
        >
          <SectionNameTag name="Hero 2 · fond-bg2" navTopOffsetPx={44}>
            <AdventureHero
              edgeRgb={edgeHero2}
              visualOnly
              typewriterActive={typewriterHero2}
              backgroundSrc={HERO_BG_2_SRC}
              onScrollCueClick={onHero2Cue}
            />
          </SectionNameTag>
        </div>
        <div ref={spacerAfterHero2Ref} className="hero-gallery-spacer-black">
          <VisionCardSection edgeRgb={edgeHero2} embedded format="story" />
        </div>
        <div
          ref={hero3Ref}
          className="hero-gallery-snap-hero"
          data-experience-hero-snap="3"
        >
          <SectionNameTag name="Hero 3 · expérience" navTopOffsetPx={44}>
            <AdventureHero
              edgeRgb={edgeHeroMain}
              visualOnly
              typewriterActive={typewriterHero3}
              onScrollCueClick={onHero3Cue}
            />
          </SectionNameTag>
        </div>
        <ArcAiGallerySection
          scrollEntrance
          entranceAutoSequence={galleryEntranceFromCue}
          sectionTag="Galerie arc — vignettes"
        />
      </main>
    </GalleryErrorBoundary>
  );
}
