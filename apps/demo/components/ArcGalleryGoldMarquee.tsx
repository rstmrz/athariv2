"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { flushSync } from "react-dom";

/** Même source courte que VisionCardSection (CC0 MDN). */
const DEFAULT_VIDEO_SRC =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

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

/** Fiche : une seule entrée pour l’instant (à dupliquer ensuite). */
function buildSpotlight(
  item: ArcGalleryGoldItem | undefined
): {
  poster: string;
  title: string;
  years: string;
  meta: string;
  rating: string;
  synopsis: string;
  videoSrc: string;
  accent: string;
} {
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

/** Ombre / bordure proches de VisionCardSection (carte sombre). */
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

  const spotlight = buildSpotlight(items[0]);

  const cardW = narrowMobile
    ? Math.round(Math.min(200, Math.max(132, viewportWidth * 0.42)))
    : Math.round(Math.min(240, Math.max(168, viewportWidth * 0.18)));

  const closeAll = useCallback(() => {
    flushSync(() => {
      setPanel("closed");
    });
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }, []);

  const openDetail = useCallback(() => {
    setPanel("detail");
  }, []);

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

  useEffect(() => {
    if (!sectionActive) {
      setIntroPhase((prev) => (panel !== "closed" ? "c" : "idle"));
      return;
    }
    if (reduceMotion) {
      setIntroPhase("c");
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
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [sectionActive, reduceMotion, panel]);

  const showIntroText = introPhase === "a" || introPhase === "b";
  const showDeck = introPhase === "c";

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
          minHeight: "2.6em",
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
                  ? { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
                  : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
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
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
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
              transition={{ duration: 0.25 }}
              onClick={closeAll}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 10059,
                background: "rgba(0,0,0,0.72)",
              }}
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="arc-spotlight-title"
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                left: "max(16px, env(safe-area-inset-left))",
                right: "max(16px, env(safe-area-inset-right))",
                top: "max(24px, env(safe-area-inset-top))",
                bottom: "max(24px, env(safe-area-inset-bottom))",
                zIndex: 10060,
                margin: "auto",
                maxWidth: 640,
                maxHeight: "min(88dvh, 720px)",
                overflow: "hidden",
                borderRadius: 24,
                background: "#0c0c0f",
                boxShadow:
                  "0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.05)",
                display: "flex",
                flexDirection: "column",
                pointerEvents: "auto",
              }}
            >
              {panel === "detail" ? (
                <>
                  <div
                    style={{
                      position: "relative",
                      flexShrink: 0,
                      height: "min(38vh, 240px)",
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
                        top: 10,
                        right: 10,
                        width: 36,
                        height: 36,
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "rgba(0,0,0,0.45)",
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
                      padding: "20px 22px 22px",
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
                </>
              ) : (
                <div
                  style={{
                    flex: "1 1 auto",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    background: "#000",
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.9)",
                      }}
                    >
                      {spotlight.title}
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
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
                      minHeight: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#050508",
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
                        maxHeight: "min(62dvh, 480px)",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
