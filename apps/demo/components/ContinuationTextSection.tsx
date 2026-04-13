"use client";

import React from "react";
import type { Rgb } from "../lib/heroEdgeColor";
import { buildSectionTwoGradient } from "../lib/heroEdgeColor";

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

export type ContinuationTextSectionProps = {
  edgeRgb: Rgb | null;
  id: string;
  kicker: string;
  title: string;
  body: string;
  linkText?: string;
  linkHref?: string;
};

export default function ContinuationTextSection({
  edgeRgb,
  id,
  kicker,
  title,
  body,
  linkText = "En savoir plus",
  linkHref = "#",
}: ContinuationTextSectionProps) {
  const bg = buildSectionTwoGradient(edgeRgb);

  return (
    <section
      id={id}
      style={{
        position: "relative",
        zIndex: 2,
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        background: bg,
        color: "rgba(255,255,255,0.92)",
        transition: "background 0.65s ease",
        scrollMarginTop: 0,
      }}
    >
      <div
        style={{
          ...shell,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: "max(clamp(2.25rem, 8vh, 6rem), env(safe-area-inset-top))",
          paddingBottom: "max(clamp(2.25rem, 8vh, 6rem), env(safe-area-inset-bottom))",
        }}
      >
        <p
          style={{
            fontFamily: font.mono,
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            margin: "0 0 1rem",
          }}
        >
          {kicker}
        </p>
        <h2
          style={{
            fontFamily: font.serif,
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 600,
            lineHeight: 1.12,
            margin: "0 0 1.25rem",
            maxWidth: "min(18ch, 100%)",
            color: "#fff",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: font.sans,
            fontSize: "clamp(1rem, 2.2vw, 1.15rem)",
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.62)",
            maxWidth: "min(36rem, 100%)",
            margin: "0 0 2rem",
          }}
        >
          {body}
        </p>
        <a
          href={linkHref}
          style={{
            fontFamily: font.sans,
            fontSize: 15,
            fontWeight: 600,
            color: "#fff",
            textDecoration: "none",
            borderBottom: "1px solid rgba(255,255,255,0.35)",
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            minHeight: 44,
            padding: "8px 2px",
            boxSizing: "border-box",
          }}
        >
          {linkText}
        </a>
      </div>
    </section>
  );
}
