"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { flushSync } from "react-dom";

const DEFAULT_VIDEO_SRC =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const INTRO_SESSION_KEY = "biblio_arc_gallery_intro_once";

export type ArcGalleryGoldItem = {
  src: string;
  title: string;
  years: string;
  meta: string;
  rating: string;
  universeColor: string;
  platform?: string;
};

const INTRO_TITLE = "Et plein d'autres…";

function buildSpotlight(item: ArcGalleryGoldItem | undefined) {
  const base = item ?? {
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=640&h=960&fit=crop&q=80",
    title: "Aperçu",
    years: "2024",
    meta: "Saison 1",
    rating: "8.4",
    universeColor: "#0f4a5c",
  };
  return {
    poster: base.src,
    title: base.title,
    years: base.years,
    meta: base.meta,
    rating: base.rating,
    videoSrc: DEFAULT_VIDEO_SRC,
    accent: base.universeColor,
    synopsis:
      "Une immersion visuelle pensée comme le reste de la page : même rigueur sur les cadres, les ombres et le contraste. Ici, un seul titre pour valider le flux — fiche, lecture, fermeture — avant de multiplier les cartes.",
  };
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function PlayIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

const CARD_SHELL_SHADOW =
  "0 32px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)";

export type ArcGalleryGoldMarqueeProps = {
  items: ArcGalleryGoldItem[];
  reduceMotion: boolean;
  narrowMobile: boolean;
  viewportWidth: number;
  fontSerif: string;
  fontSans: string;
  sectionActive: boolean;
  onExposeClose?: (close: () => void) => void;
  overlayOpenRef?: React.MutableRefObject<boolean>;
};

type Panel = "closed" | "detail" | "video";

function markIntroDoneInSession() {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

function hasIntroPlayedInSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export default function ArcGalleryGoldMarquee({
  items,
  reduceMotion,
  narrowMobile,
  viewportWidth,
  fontSerif,
  fontSans,
  sectionActive,
  onExposeClose,
  overlayOpenRef,
}: ArcGalleryGoldMarqueeProps) {
  const [introPhase, setIntroPhase] = useState<"idle" | "a" | "b" | "c">("idle");
  const [panel, setPanel] = useState<Panel>("closed");
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollYLockRef = useRef(0);
  const [viewportH, setViewportH] = useState(800);

  const spotlight = buildSpotlight(items[0]);

  const isLandscapeNarrow = viewportWidth > viewportH && viewportH < 520;
  const cardW = narrowMobile
    ? Math.round(Math.min(200, Math.max(132, viewportWidth * 0.42)))
    : Math.round(Math.min(240, Math.max(168, viewportWidth * 0.18)));

  useLayoutEffect(() => {
    if (hasIntroPlayedInSession()) setIntroPhase("c");
  }, []);

  useLayoutEffect(() => {
    const ro = () => setViewportH(window.innerHeight);
    ro();
    window.addEventListener("resize", ro);
    return () => window.removeEventListener("resize", ro);
  }, []);

  const unlockScroll = useCallback(() => {
    const y = scrollYLockRef.current;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.documentElement.style.overflow = "";
    document.documentElement.removeAttribute("data-arc-gallery-scroll-lock");
    requestAnimationFrame(() => {
      window.scrollTo(0, y);
    });
  }, []);

  const lockScroll = useCallback(() => {
    scrollYLockRef.current = window.scrollY;
    const y = scrollYLockRef.current;
    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.setAttribute("data-arc-gallery-scroll-lock", "1");
  }, []);

  const closeAll = useCallback(() => {
    flushSync(() => {
      setPanel("closed");
    });
    unlockScroll();
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }, [unlockScroll]);

  const openDetail = useCallback(() => {
    lockScroll();
    setPanel("detail");
  }, [lockScroll]);

  const openVideo = useCallback(() => {
    setPanel("video");
  }, []);

  useEffect(() => {
    onExposeClose?.(closeAll);
    return () => onExposeClose?.(() => {});
  }, [onExposeClose, closeAll]);

  useLayoutEffect(() => {
    if (overlayOpenRef) overlayOpenRef.current = panel !== "closed";
  }, [panel, overlayOpenRef]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (panel === "video") {
      v.currentTime = 0;
      void v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [panel]);

  /** Après sortie du plein écran natif du player : figer la page (pas de saut de scroll). */
  useEffect(() => {
    if (panel === "closed") return;
    const onFs = () => {
      if (document.fullscreenElement || (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement) {
        return;
      }
      const y = scrollYLockRef.current;
      requestAnimationFrame(() => {
        window.scrollTo(0, y);
        lockScroll();
      });
    };
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs as EventListener);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs as EventListener);
    };
  }, [panel, lockScroll]);

  useEffect(() => {
    return () => {
      if (document.documentElement.hasAttribute("data-arc-gallery-scroll-lock")) {
        unlockScroll();
      }
    };
  }, [unlockScroll]);

  useEffect(() => {
    if (hasIntroPlayedInSession()) {
      setIntroPhase("c");
      return;
    }
    if (!sectionActive) return;
    if (reduceMotion) {
      setIntroPhase("c");
      markIntroDoneInSession();
      return;
    }
    let cancelled = false;
    const run = async () => {
      setIntroPhase("a");
      await sleep(520);
      if (cancelled) return;
      await sleep(1500);
      if (cancelled) return;
      setIntroPhase("b");
      await sleep(420);
      if (cancelled) return;
      setIntroPhase("c");
      markIntroDoneInSession();
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [sectionActive, reduceMotion]);

  const showIntroText = introPhase === "a" || introPhase === "b";
  const showDeck = introPhase === "c";

  const heroBandH = isLandscapeNarrow
    ? "min(36dvh, 200px)"
    : "min(42dvh, min(280px, 38svh))";

  const layoutEase = [0.22, 1, 0.36, 1] as const;

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        minWidth: 0,
        flexDirection: "column",
        alignItems: "center",
        fontFamily: fontSans,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          minHeight: introPhase === "c" ? 0 : "2.6em",
          width: "100%",
          maxWidth: 900,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AnimatePresence>
          {showIntroText ? (
            <motion.h2
              key="intro"
              style={{
                margin: 0,
                maxWidth: 900,
                width: "100%",
                textAlign: "center",
                fontSize: "clamp(1.5rem, 4vw, 2.75rem)",
                fontWeight: 700,
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                color: "rgba(255,255,255,0.95)",
                fontFamily: fontSerif,
                textShadow: "0 2px 24px rgba(0,0,0,0.45)",
              }}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={
                introPhase === "a"
                  ? { opacity: 1, y: 0 }
                  : introPhase === "b"
                    ? { opacity: 0, scale: 0.95, y: 0 }
                    : { opacity: 0, y: 0 }
              }
              transition={
                introPhase === "b"
                  ? { duration: 0.42, ease: layoutEase }
                  : { duration: 0.55, ease: layoutEase }
              }
              exit={
                reduceMotion
                  ? undefined
                  : { opacity: 0, scale: 0.95, transition: { duration: 0.35 } }
              }
            >
              {INTRO_TITLE}
            </motion.h2>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showDeck ? (
          <motion.div
            key="deck"
            style={{
              marginTop: 20,
              width: "100%",
              minWidth: 0,
              flex: "1 1 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            initial={reduceMotion ? false : { opacity: 0, y: 56 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: layoutEase }}
          >
            <p
              style={{
                margin: "0 0 14px",
                width: "100%",
                maxWidth: 960,
                paddingLeft: "max(16px, env(safe-area-inset-left))",
                paddingRight: "max(16px, env(safe-area-inset-right))",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.42)",
              }}
            >
              À la une
            </p>
            <div
              style={{
                width: "100%",
                maxWidth: 960,
                paddingLeft: "max(16px, env(safe-area-inset-left))",
                paddingRight: "max(16px, env(safe-area-inset-right))",
              }}
            >
              <motion.button
                type="button"
                aria-label={`${spotlight.title}, ouvrir la fiche`}
                onClick={openDetail}
                whileHover={reduceMotion ? undefined : { scale: 1.035, y: -3 }}
                whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                style={{
                  position: "relative",
                  width: cardW,
                  padding: 0,
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 22,
                  overflow: "hidden",
                  background: "#0a0a0a",
                  boxShadow: CARD_SHELL_SHADOW,
                  WebkitTapHighlightColor: "transparent",
                  aspectRatio: "2 / 3",
                }}
              >
                <img
                  src={spotlight.poster}
                  alt=""
                  draggable={false}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, transparent 42%, rgba(0,0,0,0.75) 100%)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 12,
                    right: 12,
                    bottom: 12,
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "clamp(0.95rem, 3.2vw, 1.05rem)",
                      fontWeight: 700,
                      color: "#fff",
                      textShadow: "0 2px 14px rgba(0,0,0,0.85)",
                      lineHeight: 1.2,
                    }}
                  >
                    {spotlight.title}
                  </span>
                  <span
                    style={{
                      display: "block",
                      marginTop: 4,
                      fontSize: 12,
                      color: "rgba(255,255,255,0.72)",
                    }}
                  >
                    {spotlight.years} · {spotlight.meta}
                  </span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {panel !== "closed" ? (
          <>
            <motion.div
              key="backdrop"
              role="presentation"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              onClick={closeAll}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 10059,
                background: "rgba(0,0,0,0.88)",
              }}
            />
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 10060,
                display: "flex",
                flexDirection: "column",
                alignItems: panel === "video" ? "center" : "stretch",
                justifyContent: panel === "video" ? "center" : "flex-start",
                paddingTop: "env(safe-area-inset-top, 0px)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
                paddingLeft: "env(safe-area-inset-left, 0px)",
                paddingRight: "env(safe-area-inset-right, 0px)",
                pointerEvents: "none",
                boxSizing: "border-box",
              }}
            >
              <motion.div
                layout
                role="dialog"
                aria-modal="true"
                aria-labelledby="arc-spotlight-title"
                transition={{
                  layout: { duration: reduceMotion ? 0.2 : 0.52, ease: layoutEase },
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  pointerEvents: "auto",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  background: "#0c0c0f",
                  boxSizing: "border-box",
                  ...(panel === "detail"
                    ? {
                        width: "100%",
                        height: "100%",
                        maxWidth: "100%",
                        borderRadius: 0,
                        margin: 0,
                        flex: "1 1 auto",
                        minHeight: 0,
                        boxShadow: "none",
                      }
                    : {
                        width: "min(calc(100vw - max(32px, env(safe-area-inset-left) + env(safe-area-inset-right))), 640px)",
                        maxWidth: 640,
                        maxHeight: "min(calc(100dvh - max(24px, env(safe-area-inset-top) + env(safe-area-inset-bottom))), 720px)",
                        height: "auto",
                        borderRadius: 24,
                        margin: "auto",
                        flex: "0 1 auto",
                        boxShadow:
                          "0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.05)",
                      }),
                }}
              >
                <AnimatePresence mode="wait">
                  {panel === "detail" ? (
                    <motion.div
                      key="detail"
                      role="presentation"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: "1 1 auto",
                        minHeight: 0,
                        height: "100%",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          flexShrink: 0,
                          height: heroBandH,
                          minHeight: 160,
                          background: "#141418",
                        }}
                      >
                        <img
                          src={spotlight.poster}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center top",
                          }}
                        />
                        <div
                          aria-hidden
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: `linear-gradient(180deg, transparent 20%, ${spotlight.accent}55 55%, #0c0c0f 100%)`,
                          }}
                        />
                        <button
                          type="button"
                          aria-label="Fermer"
                          onClick={closeAll}
                          style={{
                            position: "absolute",
                            top: "max(10px, env(safe-area-inset-top))",
                            right: "max(10px, env(safe-area-inset-right))",
                            width: 40,
                            height: 40,
                            borderRadius: 999,
                            border: "1px solid rgba(255,255,255,0.2)",
                            background: "rgba(0,0,0,0.5)",
                            color: "#fff",
                            fontSize: 22,
                            lineHeight: 1,
                            cursor: "pointer",
                            backdropFilter: "blur(8px)",
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <div
                        style={{
                          flex: "1 1 auto",
                          minHeight: 0,
                          overflowY: "auto",
                          WebkitOverflowScrolling: "touch",
                          padding: "18px max(18px, env(safe-area-inset-right)) max(22px, env(safe-area-inset-bottom)) max(18px, env(safe-area-inset-left))",
                        }}
                      >
                        <h2
                          id="arc-spotlight-title"
                          style={{
                            margin: "0 0 8px",
                            fontSize: "clamp(1.35rem, 4vw, 1.65rem)",
                            fontWeight: 700,
                            color: "#f5f5f7",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {spotlight.title}
                        </h2>
                        <p
                          style={{
                            margin: "0 0 16px",
                            fontSize: 13,
                            color: "rgba(255,255,255,0.55)",
                          }}
                        >
                          {spotlight.years} · {spotlight.meta} ·{" "}
                          <span style={{ color: "#46d369" }}>{spotlight.rating}</span>{" "}
                          note utilisateurs
                        </p>
                        <p
                          style={{
                            margin: "0 0 22px",
                            fontSize: 14,
                            lineHeight: 1.55,
                            color: "rgba(255,255,255,0.78)",
                          }}
                        >
                          {spotlight.synopsis}
                        </p>
                        <button
                          type="button"
                          onClick={openVideo}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "12px 28px",
                            borderRadius: 4,
                            border: "none",
                            cursor: "pointer",
                            background: "#e50914",
                            color: "#fff",
                            fontSize: 15,
                            fontWeight: 700,
                            boxShadow: "0 8px 24px rgba(229,9,20,0.35)",
                          }}
                        >
                          <PlayIcon />
                          Lecture
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="video"
                      role="presentation"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.28, ease: layoutEase }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: "1 1 auto",
                        minHeight: 0,
                        maxHeight: "100%",
                        background: "#000",
                      }}
                    >
                      <div
                        style={{
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          padding: "10px max(12px, env(safe-area-inset-right)) 10px max(12px, env(safe-area-inset-left))",
                          borderBottom: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "rgba(255,255,255,0.9)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {spotlight.title}
                        </span>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button
                            type="button"
                            aria-label="Retour à la fiche"
                            onClick={() => setPanel("detail")}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              border: "1px solid rgba(255,255,255,0.2)",
                              background: "rgba(255,255,255,0.06)",
                              color: "#fff",
                              fontSize: 13,
                              cursor: "pointer",
                            }}
                          >
                            Retour
                          </button>
                          <button
                            type="button"
                            aria-label="Fermer"
                            onClick={closeAll}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 999,
                              border: "1px solid rgba(255,255,255,0.2)",
                              background: "rgba(255,255,255,0.06)",
                              color: "#fff",
                              fontSize: 18,
                              lineHeight: 1,
                              cursor: "pointer",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div
                        style={{
                          flex: "1 1 auto",
                          minHeight: isLandscapeNarrow ? 120 : 180,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#050508",
                          padding: "0 max(0px, env(safe-area-inset-left)) 0 max(0px, env(safe-area-inset-right))",
                        }}
                      >
                        <video
                          ref={videoRef}
                          src={spotlight.videoSrc}
                          controls
                          playsInline
                          style={{
                            width: "100%",
                            height: "100%",
                            maxHeight: isLandscapeNarrow ? "min(70dvh, 100%)" : "min(58dvh, 520px)",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
