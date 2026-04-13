"use client";

import React, { useCallback, useRef, useState } from "react";

const fontSerif =
  '"Cormorant Garamond", "Times New Roman", Georgia, serif';

const LINE1 = "Bienvenue dans cette expérience";
const LINE2 = "Préparez-vous à vivre une expérience que vous n'avez jamais vue";
const LABEL_FADE_MS = 380;

const easeOutSoft = "cubic-bezier(0.28, 0.88, 0.32, 1)";

type Props = {
  onDiscoverMorph: (buttonRect: DOMRect) => void;
};

export default function ExperienceOriginHero({ onDiscoverMorph }: Props) {
  const [buttonPhase, setButtonPhase] = useState<"visible" | "leaving">(
    "visible"
  );
  const [showDiscoverLabel, setShowDiscoverLabel] = useState(true);
  const [shellHandedOff, setShellHandedOff] = useState(false);
  const continuedRef = useRef(false);
  const shellRef = useRef<HTMLSpanElement>(null);

  const onDiscoverClick = useCallback(() => {
    if (buttonPhase !== "visible" || continuedRef.current) return;
    const shell = shellRef.current;
    if (!shell) return;
    continuedRef.current = true;
    setButtonPhase("leaving");
    const rect = shell.getBoundingClientRect();
    setShowDiscoverLabel(false);
    onDiscoverMorph(rect);
    requestAnimationFrame(() => {
      setShellHandedOff(true);
    });
  }, [buttonPhase, onDiscoverMorph]);

  const lineStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: fontSerif,
    fontWeight: 600,
    lineHeight: 1.35,
    textAlign: "center",
    textShadow: "0 2px 48px rgba(0,0,0,0.75)",
    opacity: 1,
    filter: "none",
    transform: "translateY(0) scale(1)",
    pointerEvents: "none",
  };

  return (
    <section
      aria-label="Introduction à l’expérience"
      className="experience-origin-root"
      style={{
        position: "relative",
        flex: 1,
        minHeight: 0,
        width: "100%",
        background: "#000000",
        color: "#f2f2f7",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        boxSizing: "border-box",
        paddingTop: "max(24px, env(safe-area-inset-top))",
        paddingBottom: "max(32px, env(safe-area-inset-bottom))",
        paddingLeft: "max(clamp(28px, 7vw, 100px), env(safe-area-inset-left))",
        paddingRight:
          "max(clamp(28px, 7vw, 100px), env(safe-area-inset-right))",
      }}
    >
      <div
        className="experience-origin-stack"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(1.35rem, 3.2vh, 1.85rem)",
          width: "100%",
          maxWidth: "min(56rem, 100%)",
        }}
      >
        <div
          aria-live="polite"
          className="experience-origin-text-slot"
          style={{
            minHeight: "clamp(4.5em, 18vh, 7.5em)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <div className="experience-origin-text-slot-inner experience-origin-text-slot-inner--stacked">
            <p
              className="experience-origin-line-heading"
              style={lineStyle}
            >
              {LINE1}
            </p>
            <p
              className="experience-origin-line-heading"
              style={lineStyle}
            >
              {LINE2}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {buttonPhase ? (
            <span
              ref={shellRef}
              className={
                "experience-origin-discover-shell" +
                (buttonPhase === "visible" && !shellHandedOff
                  ? " experience-origin-btn-reveal"
                  : "")
              }
              style={{
                visibility: shellHandedOff ? "hidden" : "visible",
                opacity: shellHandedOff ? 0 : 1,
                transition: `opacity ${LABEL_FADE_MS}ms ease, visibility 0s linear ${shellHandedOff ? LABEL_FADE_MS : 0}ms`,
              }}
            >
              <button
                type="button"
                className="experience-origin-discover"
                onClick={onDiscoverClick}
                disabled={buttonPhase !== "visible"}
                style={{
                  position: "relative",
                  zIndex: 1,
                  padding: "14px 40px",
                  minHeight: 48,
                  minWidth: 160,
                  borderRadius: 1,
                  border: "none",
                  background: "#000000",
                  color: "#ffffff",
                  fontFamily:
                    '"Inter", system-ui, -apple-system, sans-serif',
                  fontSize: "clamp(0.8rem, 2vw, 0.92rem)",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: buttonPhase === "visible" ? "pointer" : "default",
                  pointerEvents: buttonPhase === "visible" ? "auto" : "none",
                  opacity: buttonPhase === "visible" ? 1 : 0,
                  transform:
                    buttonPhase === "visible"
                      ? "translateY(0)"
                      : "translateY(-6px)",
                  transition:
                    "opacity 280ms ease, transform 380ms cubic-bezier(0.22, 1, 0.36, 1)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    opacity: showDiscoverLabel ? 1 : 0,
                    transform: showDiscoverLabel
                      ? "translateY(0)"
                      : "translateY(-5px)",
                    transition: `opacity ${LABEL_FADE_MS}ms ${easeOutSoft}, transform ${LABEL_FADE_MS}ms ${easeOutSoft}`,
                  }}
                >
                  Découvrir
                </span>
              </button>
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
