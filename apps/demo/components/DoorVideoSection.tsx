"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Rgb } from "../lib/heroEdgeColor";
import { buildSectionThreeGradient } from "../lib/heroEdgeColor";

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

/** Démo légère (tu peux remplacer par `/ta-video.mp4` dans public) */
const DEFAULT_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

type VideoFormat = "story" | "landscape";

type Props = {
  edgeRgb: Rgb | null;
  videoSrc?: string;
};

export default function DoorVideoSection({ edgeRgb, videoSrc = DEFAULT_VIDEO }: Props) {
  const [format, setFormat] = useState<VideoFormat>("landscape");
  const [open, setOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bg = buildSectionThreeGradient(edgeRgb);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (reduceMotion) setOpen(true);
  }, [reduceMotion]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || reduceMotion) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.intersectionRatio > 0.35) setOpen(true);
      },
      { threshold: [0, 0.35, 0.5] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (open) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [open]);

  const isStory = format === "story";
  const frameStyle: React.CSSProperties = {
    position: "relative",
    margin: "0 auto",
    width: "100%",
    maxWidth: isStory ? "min(340px, 88vw)" : "min(960px, 100%)",
    aspectRatio: isStory ? "9 / 16" : "16 / 9",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
    background: "#0a0a0c",
  };

  const doorTransition = reduceMotion ? "none" : "transform 1.05s cubic-bezier(0.4, 0, 0.2, 1)";
  const leftOpen = open ? "translateX(-102%) skewX(2deg)" : "translateX(0)";
  const rightOpen = open ? "translateX(102%) skewX(-2deg)" : "translateX(0)";

  return (
    <section
      id="doors"
      style={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        background: bg,
        color: "#fff",
        transition: "background 0.65s ease",
        paddingTop: "max(clamp(2rem, 6vh, 5rem), env(safe-area-inset-top))",
        paddingBottom: "max(clamp(2rem, 6vh, 5rem), env(safe-area-inset-bottom))",
        scrollMarginTop: 0,
      }}
    >
      <style>{`
        @media (max-width: 599px) {
          #doors .door-toolbar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          #doors .door-toolbar button {
            width: 100%;
            min-height: 48px !important;
            justify-content: center;
          }
          #doors .door-format-label {
            margin-right: 0 !important;
            margin-bottom: 2px;
          }
        }
      `}</style>
      <div style={shell}>
        <p
          style={{
            fontFamily: font.mono,
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            margin: "0 0 0.75rem",
          }}
        >
          Behind the doors
        </p>
        <h2
          style={{
            fontFamily: font.serif,
            fontSize: "clamp(1.85rem, 4.5vw, 2.75rem)",
            fontWeight: 600,
            margin: "0 0 0.5rem",
            maxWidth: "22ch",
          }}
        >
          Ouvre la porte
        </h2>
        <p
          style={{
            fontFamily: font.sans,
            fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
            color: "rgba(255,255,255,0.55)",
            maxWidth: "36rem",
            margin: "0 0 1.5rem",
            lineHeight: 1.55,
          }}
        >
          Choisis un format story (9:16) ou paysage (16:9). Les vantaux s’écartent au scroll ou via le bouton.
        </p>

        <div
          className="door-toolbar"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: "1.5rem",
            alignItems: "center",
          }}
        >
          <span
            className="door-format-label"
            style={{ fontFamily: font.sans, fontSize: 13, color: "rgba(255,255,255,0.5)", marginRight: 4 }}
          >
            Format
          </span>
          <button
            type="button"
            onClick={() => setFormat("story")}
            style={{
              fontFamily: font.sans,
              fontSize: 13,
              fontWeight: 600,
              padding: "10px 16px",
              minHeight: 44,
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.2)",
              background: format === "story" ? "rgba(255,255,255,0.18)" : "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Story 9:16
          </button>
          <button
            type="button"
            onClick={() => setFormat("landscape")}
            style={{
              fontFamily: font.sans,
              fontSize: 13,
              fontWeight: 600,
              padding: "10px 16px",
              minHeight: 44,
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.2)",
              background: format === "landscape" ? "rgba(255,255,255,0.18)" : "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Paysage 16:9
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            style={{
              fontFamily: font.sans,
              fontSize: 13,
              fontWeight: 600,
              padding: "10px 18px",
              minHeight: 48,
              borderRadius: 9999,
              border: "none",
              background: "#fff",
              color: "#111",
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            {open ? "Refermer" : "Ouvrir / fermer"}
          </button>
        </div>

        <div ref={wrapRef} style={frameStyle}>
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            controls={open}
            preload="metadata"
            suppressHydrationWarning
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              zIndex: 2,
              pointerEvents: open ? "none" : "auto",
            }}
          >
            <div
              style={{
                flex: 1,
                background: "linear-gradient(105deg, #1a1512 0%, #2d2620 45%, #1f1a16 100%)",
                borderRight: "2px solid rgba(255,255,255,0.12)",
                boxShadow: "inset -12px 0 24px rgba(0,0,0,0.35)",
                transform: leftOpen,
                transition: doorTransition,
                transformOrigin: "left center",
              }}
            />
            <div
              style={{
                flex: 1,
                background: "linear-gradient(-105deg, #1a1512 0%, #2d2620 45%, #1f1a16 100%)",
                borderLeft: "2px solid rgba(255,255,255,0.08)",
                boxShadow: "inset 12px 0 24px rgba(0,0,0,0.35)",
                transform: rightOpen,
                transition: doorTransition,
                transformOrigin: "right center",
              }}
            />
          </div>

          {!open && !reduceMotion && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 3,
                fontFamily: font.mono,
                fontSize: 10,
                letterSpacing: "0.25em",
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                pointerEvents: "none",
              }}
            >
              ■
            </div>
          )}
        </div>

        <p
          style={{
            fontFamily: font.sans,
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
            marginTop: "1.25rem",
            maxWidth: "40rem",
          }}
        >
          Remplace la source par un fichier dans <code style={{ color: "rgba(255,255,255,0.55)" }}>public/</code> et
          passe <code style={{ color: "rgba(255,255,255,0.55)" }}>videoSrc</code> à{" "}
          <code style={{ color: "rgba(255,255,255,0.55)" }}>/ton-fichier.mp4</code> depuis{" "}
          <code style={{ color: "rgba(255,255,255,0.55)" }}>AdventureLanding</code>.
        </p>
      </div>
    </section>
  );
}
