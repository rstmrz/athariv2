"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  buildHeroOverlayGradient,
  FALLBACK_HERO_OVERLAY,
  HERO_BG_SRC,
  type Rgb,
} from "../lib/heroEdgeColor";

const navLinks = ["Home", "Our Story", "FAQ", "Policies"] as const;

const font = {
  serif: '"Cormorant Garamond", "Times New Roman", Georgia, serif',
  sans: '"Inter", system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

const shell: React.CSSProperties = {
  width: "100%",
  maxWidth: 1320,
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "max(clamp(16px, 4vw, 56px), env(safe-area-inset-left))",
  paddingRight: "max(clamp(16px, 4vw, 56px), env(safe-area-inset-right))",
  boxSizing: "border-box",
};

type Props = {
  edgeRgb: Rgb | null;
  /** Route « Expérience visuelle » : pas de header, badge, sous-titre ni CTA — seulement le titre. */
  visualOnly?: boolean;
  /** Clic sur le bouton (après le typewriter) : scroll suivant ou galerie. */
  onScrollCueClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** @deprecated Utiliser `onScrollCueClick`. */
  onGalleryScrollCueClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Texte du bouton bas (défaut : Défiler). */
  scrollCueLabel?: string;
  /** Typewriter : attendre `true` pour démarrer (heroes 2–3 hors écran au chargement). */
  typewriterActive?: boolean;
  /** Délai entre chaque caractère du typewriter (ms). */
  typewriterCharDelayMs?: number;
  /** Pause entre la ligne 1 et la ligne 2 (ms). */
  typewriterBetweenLinesMs?: number;
  /** Entrée douce du bloc titre + caret et CTA plus lents (ex. hero 1 après morph). */
  delicateVisual?: boolean;
  /** Fichier sous `/public` (défaut : hero standard). */
  backgroundSrc?: string;
  backgroundPosition?: string;
  /** Image + overlay plein écran, sans titre ni typewriter (slides avant le hero principal). */
  stackHero?: boolean;
  /** Nom accessible pour les slides `stackHero`. */
  stackAriaLabel?: string;
};

const TYPEWRITER_LINE1 = "Your next adventure starts here.";
const TYPEWRITER_LINE2 = "One app, endless horizons.";

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function VisualTypewriterTitle({
  baseStyle,
  onComplete,
  active = true,
  charDelayMs = 32,
  betweenLinesPauseMs = 280,
  delicateCaret = false,
}: {
  baseStyle: React.CSSProperties;
  /** Appelé une fois le typewriter terminé (ou tout de suite si reduced motion). */
  onComplete?: () => void;
  /** Quand false, titre vide et pas d’animation (réactivation repart de zéro). */
  active?: boolean;
  charDelayMs?: number;
  betweenLinesPauseMs?: number;
  delicateCaret?: boolean;
}) {
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setLine1("");
      setLine2("");
      setDone(false);
      return;
    }

    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLine1(TYPEWRITER_LINE1);
      setLine2(TYPEWRITER_LINE2);
      setDone(true);
      onComplete?.();
      return;
    }

    let cancelled = false;

    (async () => {
      for (let i = 1; i <= TYPEWRITER_LINE1.length && !cancelled; i++) {
        setLine1(TYPEWRITER_LINE1.slice(0, i));
        await sleep(charDelayMs);
      }
      if (cancelled) return;
      await sleep(betweenLinesPauseMs);
      for (let i = 1; i <= TYPEWRITER_LINE2.length && !cancelled; i++) {
        setLine2(TYPEWRITER_LINE2.slice(0, i));
        await sleep(charDelayMs);
      }
      if (!cancelled) {
        setDone(true);
        onComplete?.();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active, onComplete, charDelayMs, betweenLinesPauseMs]);

  return (
    <h1
      className="adventure-hero-title"
      style={{
        ...baseStyle,
        minHeight: "2.55em",
      }}
      aria-label={`${TYPEWRITER_LINE1} ${TYPEWRITER_LINE2}`}
    >
      {line1}
      {line1.length === TYPEWRITER_LINE1.length ? (
        <>
          <br />
          <span style={{ fontStyle: "italic", fontWeight: 500 }}>{line2}</span>
        </>
      ) : null}
      {!done ? (
        <span
          className={
            "adventure-hero-typewriter-caret" +
            (delicateCaret ? " adventure-hero-typewriter-caret--delicate" : "")
          }
          aria-hidden
        >
          |
        </span>
      ) : null}
    </h1>
  );
}

function LogoMark() {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.3)",
      }}
      aria-hidden
    >
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C8 6 4 10 4 14a8 8 0 1 0 16 0c0-4-4-8-8-12Z"
          stroke="white"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <circle cx={12} cy={14} r={2} fill="white" />
      </svg>
    </div>
  );
}

function NewsBadge() {
  return (
    <div
      className="adventure-hero-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px 10px 14px",
        borderRadius: 9999,
        background: "rgba(22, 22, 28, 0.58)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.14)",
        marginBottom: "clamp(1.35rem, 4.5vw, 2.75rem)",
        fontFamily: font.mono,
        fontSize: "clamp(10px, 2.2vw, 12px)",
        fontWeight: 500,
        letterSpacing: "0.12em",
        color: "rgba(255,255,255,0.92)",
        textTransform: "uppercase" as const,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 0 0 3px rgba(255,255,255,0.25)",
          flexShrink: 0,
        }}
        aria-hidden
      />
      <span>Overloop raises adventure fund</span>
      <span style={{ opacity: 0.85, letterSpacing: "0.08em" }}>{">"}</span>
    </div>
  );
}

export default function AdventureHero({
  edgeRgb,
  visualOnly = false,
  onScrollCueClick,
  onGalleryScrollCueClick,
  scrollCueLabel = "Appuyez ici",
  typewriterActive = true,
  typewriterCharDelayMs,
  typewriterBetweenLinesMs,
  delicateVisual = false,
  backgroundSrc = HERO_BG_SRC,
  backgroundPosition = "center 42%",
  stackHero = false,
  stackAriaLabel = "Visuel",
}: Props) {
  const handleScrollCueClick =
    onScrollCueClick ?? onGalleryScrollCueClick;
  const overlay = edgeRgb ? buildHeroOverlayGradient(edgeRgb) : FALLBACK_HERO_OVERLAY;
  const [heroTypewriterDone, setHeroTypewriterDone] = useState(false);
  const onHeroTypewriterComplete = useCallback(() => setHeroTypewriterDone(true), []);
  const isStackHero = stackHero === true;

  return (
    <>
      <style>{`
        .adventure-hero-root {
          min-height: 100vh;
          min-height: 100dvh;
        }
        .adventure-hero-typewriter-caret {
          display: inline-block;
          margin-left: 0.04em;
          font-weight: 300;
          opacity: 1;
          animation: adventure-hero-caret-blink 0.95s steps(1, end) infinite;
        }
        @keyframes adventure-hero-caret-blink {
          50% {
            opacity: 0;
          }
        }
        .adventure-hero-typewriter-caret.adventure-hero-typewriter-caret--delicate {
          animation: adventure-hero-caret-blink 1.28s steps(1, end) infinite;
        }
        /* Plus spécifique que .adventure-hero-main seul : évite d’être écrasé par les @media ci-dessous */
        .adventure-hero-main.adventure-hero-main--visual-only {
          padding-top: max(clamp(52px, 10vh, 88px), env(safe-area-inset-top)) !important;
        }
        @media (max-width: 599px) {
          .adventure-hero-header-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .adventure-hero-nav ul {
            justify-content: center !important;
            width: 100%;
            gap: 6px 16px !important;
          }
          .adventure-hero-nav a {
            display: inline-flex !important;
            align-items: center !important;
            min-height: 44px !important;
            padding: 0 12px !important;
            box-sizing: border-box;
          }
          .adventure-hero-main {
            padding-bottom: max(20px, env(safe-area-inset-bottom)) !important;
          }
          .adventure-hero-cta {
            min-height: 48px !important;
            width: min(100%, 340px);
            max-width: 100%;
            box-sizing: border-box;
          }
        }
        @media (min-width: 1024px) {
          .adventure-hero-main {
            padding-top: min(7vh, 5rem) !important;
            padding-bottom: min(9vh, 6.5rem) !important;
          }
          .adventure-hero-main.adventure-hero-main--visual-only {
            padding-top: max(clamp(56px, 9vh, 96px), env(safe-area-inset-top)) !important;
          }
          .adventure-hero-title {
            max-width: min(52rem, 88vw) !important;
            font-size: clamp(3rem, 3.8vw, 4.75rem) !important;
            line-height: 1.06 !important;
            margin-bottom: 1.5rem !important;
          }
          .adventure-hero-sub {
            max-width: min(38rem, 72vw) !important;
            font-size: 1.125rem !important;
            line-height: 1.7 !important;
            margin-bottom: 2.5rem !important;
          }
          .adventure-hero-badge {
            margin-bottom: 2.5rem !important;
          }
        }
        @media (min-width: 1440px) {
          .adventure-hero-title {
            max-width: min(58rem, 82vw) !important;
            font-size: clamp(3.35rem, 3.4vw, 5.25rem) !important;
          }
          .adventure-hero-sub {
            max-width: min(42rem, 65vw) !important;
            font-size: 1.2rem !important;
          }
          .adventure-hero-main {
            padding-top: min(8vh, 5.5rem) !important;
            padding-bottom: min(10vh, 7rem) !important;
          }
          .adventure-hero-main.adventure-hero-main--visual-only {
            padding-top: max(clamp(60px, 8vh, 104px), env(safe-area-inset-top)) !important;
          }
        }
        .adventure-hero-main.adventure-hero-main--stack {
          padding-top: max(clamp(48px, 8vh, 80px), env(safe-area-inset-top)) !important;
          padding-bottom: max(clamp(24px, 4vh, 48px), env(safe-area-inset-bottom)) !important;
        }
      `}</style>

      <section
        className="adventure-hero-root"
        aria-label={isStackHero ? stackAriaLabel : undefined}
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
          fontFamily: font.sans,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("${backgroundSrc}")`,
            backgroundSize: "cover",
            backgroundPosition,
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: overlay,
            pointerEvents: "none",
            transition: "background 0.6s ease",
          }}
          aria-hidden
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            color: "#fff",
          }}
        >
          {!visualOnly && !isStackHero ? (
            <header
              style={{
                ...shell,
                paddingTop: "max(clamp(16px, 3vw, 28px), env(safe-area-inset-top))",
                paddingBottom: 0,
              }}
            >
              <div
                className="adventure-hero-header-bar"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }} aria-label="Accueil">
                  <LogoMark />
                </a>
                <nav className="adventure-hero-nav" aria-label="Principal">
                  <ul
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "clamp(16px, 3vw, 36px)",
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                      justifyContent: "flex-end",
                      fontFamily: font.sans,
                    }}
                  >
                    {navLinks.map((label) => (
                      <li key={label}>
                        <a
                          href="#"
                          style={{
                            color: "rgba(255,255,255,0.9)",
                            textDecoration: "none",
                            fontSize: "clamp(13px, 1.5vw, 15px)",
                            fontWeight: 500,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </header>
          ) : null}

          <div
            className={
              "adventure-hero-main" +
              (isStackHero
                ? " adventure-hero-main--stack"
                : visualOnly
                  ? " adventure-hero-main--visual-only"
                  : "")
            }
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              paddingTop:
                isStackHero || visualOnly ? undefined : "clamp(1.5rem, 5vh, 3rem)",
              paddingBottom: isStackHero ? undefined : "clamp(2rem, 7vh, 4rem)",
              ...shell,
            }}
          >
            {!visualOnly && !isStackHero ? <NewsBadge /> : null}

            {isStackHero ? null : visualOnly ? (
              <div
                style={
                  delicateVisual
                    ? {
                        opacity: typewriterActive ? 1 : 0,
                        transition:
                          "opacity 2s cubic-bezier(0.2, 0.82, 0.22, 1)",
                      }
                    : undefined
                }
              >
                <VisualTypewriterTitle
                  active={typewriterActive}
                  onComplete={onHeroTypewriterComplete}
                  charDelayMs={typewriterCharDelayMs ?? 32}
                  betweenLinesPauseMs={typewriterBetweenLinesMs ?? 280}
                  delicateCaret={delicateVisual}
                  baseStyle={{
                    margin: "0 0 1.15rem",
                    fontFamily: font.serif,
                    fontSize: "clamp(2.2rem, 6.5vw, 4rem)",
                    fontWeight: 600,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    color: "#fff",
                    textShadow: "0 4px 48px rgba(0,0,0,0.38)",
                    maxWidth: "min(22rem, 92vw)",
                  }}
                />
              </div>
            ) : (
              <h1
                className="adventure-hero-title"
                style={{
                  margin: "0 0 1.15rem",
                  fontFamily: font.serif,
                  fontSize: "clamp(2.2rem, 6.5vw, 4rem)",
                  fontWeight: 600,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: "#fff",
                  textShadow: "0 4px 48px rgba(0,0,0,0.38)",
                  maxWidth: "min(22rem, 92vw)",
                }}
              >
                Your next adventure starts here.
                <br />
                <span style={{ fontStyle: "italic", fontWeight: 500 }}>One app, endless horizons.</span>
              </h1>
            )}

            {!visualOnly && !isStackHero ? (
              <>
                <p
                  className="adventure-hero-sub"
                  style={{
                    margin: "0 0 2rem",
                    fontFamily: font.sans,
                    fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.74)",
                    maxWidth: "min(34em, 94%)",
                  }}
                >
                  Smart trips for curious travelers — discover hidden gems, plan routes, and explore with clarity.
                </p>

                <a
                  className="adventure-hero-cta"
                  href="#continue"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14px 36px",
                    minHeight: 48,
                    borderRadius: 9999,
                    background: "#fff",
                    color: "#141414",
                    fontFamily: font.sans,
                    fontWeight: 600,
                    fontSize: "clamp(0.875rem, 1.8vw, 1rem)",
                    letterSpacing: "0.01em",
                    textDecoration: "none",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.22)";
                  }}
                >
                  Talk to us
                </a>
              </>
            ) : null}
          </div>
        </div>
        {!isStackHero && visualOnly && heroTypewriterDone ? (
          <button
            type="button"
            className={
              "adventure-hero-scroll-cue adventure-hero-scroll-cue--pinned" +
              (delicateVisual ? " adventure-hero-scroll-cue--delicate" : "")
            }
            aria-label={scrollCueLabel}
            onClick={(e) => handleScrollCueClick?.(e)}
          >
            <span className="adventure-hero-scroll-cue__label">{scrollCueLabel}</span>
            <svg
              className="adventure-hero-scroll-cue__icon"
              width={32}
              height={32}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        ) : null}
      </section>
    </>
  );
}
