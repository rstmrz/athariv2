"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Rgb } from "../lib/heroEdgeColor";
import { darkenRgb } from "../lib/heroEdgeColor";

const font = {
  serif: '"Cormorant Garamond", "Times New Roman", Georgia, serif',
  sans: '"Inter", system-ui, -apple-system, sans-serif',
} as const;

const CARD_IMG = "/nuit.png";

const DEFAULT_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const shell: React.CSSProperties = {
  width: "100%",
  maxWidth: 1320,
  marginLeft: "auto",
  marginRight: "auto",
  boxSizing: "border-box",
};

function sectionBg(edgeRgb: Rgb | null): string {
  if (!edgeRgb) {
    return "linear-gradient(180deg, #0b0b0e 0%, #050506 50%, #020203 100%)";
  }
  const a = darkenRgb(edgeRgb.r, edgeRgb.g, edgeRgb.b, 0.08);
  const b = darkenRgb(edgeRgb.r, edgeRgb.g, edgeRgb.b, 0.04);
  return `linear-gradient(180deg, rgb(${a.r},${a.g},${a.b}) 0%, rgb(${b.r},${b.g},${b.b}) 55%, #030304 100%)`;
}

type Props = {
  edgeRgb: Rgb | null;
  videoSrc?: string;
  /** Mode intégré dans une section existante (ex: transitions /experience). */
  embedded?: boolean;
  /** Format visuel de la card dans les transitions. */
  format?: "landscape" | "story";
};

export default function VisionCardSection({
  edgeRgb,
  videoSrc = DEFAULT_VIDEO,
  embedded = false,
  format = "landscape",
}: Props) {
  const [playerPhase, setPlayerPhase] = useState<
    "closed" | "opening" | "open" | "closing"
  >("closed");
  const videoRef = useRef<HTMLVideoElement>(null);
  const OPEN_MS = 680;
  const CLOSE_MS = 520;

  const isStoryVideo = embedded && format === "story";
  const isLandscapeVideo = embedded && format === "landscape";
  const isClosed = playerPhase === "closed";
  const isOpening = playerPhase === "opening";
  const isOpen = playerPhase === "open";
  const isClosing = playerPhase === "closing";
  const showBaseCard = isClosed || isOpening;
  const showVideoLayer = isOpen || isClosing;

  const openPlayer = useCallback(() => {
    if (!isClosed) return;
    setPlayerPhase("opening");
  }, [isClosed]);

  const closePlayer = useCallback(() => {
    if (!isOpen) return;
    setPlayerPhase("closing");
  }, [isOpen]);

  useEffect(() => {
    if (playerPhase !== "opening") return;
    const id = window.setTimeout(() => setPlayerPhase("open"), OPEN_MS);
    return () => window.clearTimeout(id);
  }, [playerPhase]);

  useEffect(() => {
    if (playerPhase !== "closing") return;
    const id = window.setTimeout(() => setPlayerPhase("closed"), CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [playerPhase]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isOpen) {
      v.currentTime = 0;
      void v.play().catch(() => {});
      return;
    }
    if (playerPhase === "closed") {
      v.pause();
    }
  }, [isOpen, playerPhase]);

  const expandLandscape = isLandscapeVideo && (isOpen || isOpening || isClosing);
  /** Réduit d’~20 % en mode intégré, proportions inchangées. */
  const embedBox = (cssLength: string) =>
    embedded ? `calc(${cssLength} * 0.8)` : cssLength;

  const articleWidth = embedded
    ? expandLandscape
      ? "100%"
      : embedBox("min(420px, 94vw)")
    : "100%";
  const articleMaxWidth = embedded
    ? expandLandscape
      ? embedBox("min(1240px, 98%)")
      : embedBox("min(420px, 94vw)")
    : undefined;
  const mediaHeight = embedded
    ? isStoryVideo
      ? embedBox("clamp(420px, min(72vh, 76vw), 760px)")
      : expandLandscape
        ? embedBox("clamp(230px, min(46vw, 44vh), 500px)")
        : embedBox("clamp(420px, min(72vh, 76vw), 760px)")
    : "clamp(150px, min(28vw, 26vh), 280px)";

  return (
    <div
      id="vision-card"
      style={{
        minHeight: embedded ? "100%" : "auto",
        width: "100%",
        boxSizing: "border-box",
        background: embedded ? "transparent" : sectionBg(edgeRgb),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: embedded
          ? "clamp(18px, 3.2vw, 34px) max(clamp(18px, 4.2vw, 42px), env(safe-area-inset-right)) clamp(16px, 2.6vw, 26px) max(clamp(18px, 4.2vw, 42px), env(safe-area-inset-left))"
          : "max(clamp(1.1rem, 3.5vw, 2rem), env(safe-area-inset-top)) max(clamp(16px, 3.5vw, 28px), env(safe-area-inset-right)) max(clamp(0.5rem, 1.4vw, 0.85rem), env(safe-area-inset-bottom)) max(clamp(16px, 3.5vw, 28px), env(safe-area-inset-left))",
        transition: "background 0.65s ease",
        scrollMarginTop: 0,
      }}
    >
      <div
        style={{
          ...shell,
          display: "flex",
          justifyContent: embedded ? "center" : "stretch",
        }}
      >
        <article
          style={{
            position: "relative",
            width: articleWidth,
            maxWidth: articleMaxWidth,
            borderRadius: embedded ? 22 : 28,
            overflow: "hidden",
            background: "#0a0a0a",
            boxShadow:
              "0 32px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
            transition:
              "width 680ms cubic-bezier(0.22, 1, 0.36, 1), max-width 680ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div
            style={{
              opacity: showBaseCard ? 1 : 0,
              transform: showBaseCard
                ? "translateY(0) scale(1)"
                : "translateY(10px) scale(0.99)",
              filter: showBaseCard ? "blur(0)" : "blur(4px)",
              pointerEvents: showBaseCard ? "auto" : "none",
              transition:
                "opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1), filter 420ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: mediaHeight,
                minHeight: embedded ? 112 : 140,
                transition:
                  "height 680ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url("${CARD_IMG}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center 25%",
                }}
              />
              <div className="vision-card-grain" aria-hidden />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(6,6,8,0.1) 0%, transparent 28%, transparent 42%, rgba(8,8,10,0.55) 68%, rgba(10,10,12,0.92) 88%, #0a0a0a 100%)",
                }}
                aria-hidden
              />
              <p
                style={{
                  position: "absolute",
                  top: "clamp(16px, 3vw, 22px)",
                  left: "clamp(18px, 4vw, 28px)",
                  right: "clamp(18px, 4vw, 28px)",
                  margin: 0,
                  fontFamily: font.serif,
                  fontSize: "clamp(11px, 2.4vw, 12px)",
                  fontWeight: 500,
                  fontStyle: "italic",
                  letterSpacing: "0.02em",
                  color: "rgba(255,255,255,0.95)",
                  textShadow: "0 2px 16px rgba(0,0,0,0.45)",
                }}
              >
                Work fast. Live slow.
              </p>
            </div>

            <div
              className="vision-card-lower"
              style={{
                background: "#0a0a0a",
                padding:
                  "clamp(14px, 2.8vw, 18px) clamp(18px, 3.5vw, 28px) clamp(10px, 2vw, 14px)",
                marginTop: -2,
              }}
            >
            <h2
              style={{
                margin: "0 0 8px",
                fontFamily: font.serif,
                fontSize: "clamp(1.2rem, 3.2vw, 1.5rem)",
                fontWeight: 600,
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
                color: "#fafafa",
              }}
            >
              Create your digital reality.
            </h2>
            <p
              style={{
                margin: 0,
                fontFamily: font.sans,
                fontSize: "clamp(11.5px, 2.2vw, 12.5px)",
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.58)",
                fontWeight: 400,
              }}
            >
              From nothing to everything, let&apos;s bring your vision to life.
            </p>

            <button
              type="button"
              onClick={openPlayer}
              disabled={!isClosed}
              style={{
                display: "inline-flex",
                marginTop: 12,
                padding: "11px 20px",
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 9999,
                border: "1px solid rgba(168, 124, 88, 0.42)",
                background: "rgba(26, 22, 20, 0.82)",
                color: "rgba(255,255,255,0.92)",
                fontFamily: font.sans,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.02em",
                cursor: isClosed ? "pointer" : "default",
                boxShadow:
                  "0 0 0 1px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 28px rgba(90, 55, 35, 0.18)",
                opacity: isClosed ? 1 : 0.6,
              }}
            >
              Lire la vidéo
            </button>

            <div
              className="vision-card-footer"
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                marginTop: 14,
                paddingTop: 10,
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                style={{
                  fontFamily: font.sans,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  color: "rgba(255,255,255,0.48)",
                }}
              >
                sukoya.design
              </span>
              <span
                style={{
                  fontFamily: font.sans,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                web + product + brand
              </span>
            </div>
          </div>
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: showVideoLayer ? 1 : 0,
              transform: showVideoLayer ? "scale(1)" : "scale(1.015)",
              pointerEvents: showVideoLayer ? "auto" : "none",
              transition:
                "opacity 460ms cubic-bezier(0.22, 1, 0.36, 1), transform 680ms cubic-bezier(0.22, 1, 0.36, 1)",
              background: "#000",
              display: "flex",
              alignItems: "stretch",
              justifyContent: "stretch",
            }}
          >
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              playsInline
              preload="metadata"
              controlsList="nofullscreen noremoteplayback nodownload"
              disablePictureInPicture
              disableRemotePlayback
              className="vision-card-video-frame"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                background: "#000",
              }}
            />
            <button
              type="button"
              onClick={closePlayer}
              aria-label="Fermer la vidéo"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 36,
                height: 36,
                padding: 0,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(8,8,10,0.66)",
                color: "#fff",
                fontFamily: font.sans,
                fontSize: 18,
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        </article>
      </div>

    </div>
  );
}
