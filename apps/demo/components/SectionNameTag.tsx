"use client";

import React from "react";

type Props = {
  /** Nom affiché (ex. nom du composant ou fichier) */
  name: string;
  children: React.ReactNode;
  /** Décalage sous la barre de navigation fixe (px), en plus du safe-area. */
  navTopOffsetPx?: number;
  /** Remplit la hauteur du parent flex (section plein viewport). */
  layoutFill?: boolean;
};

/**
 * Bandeau fixe en haut à gauche du bloc pour repérer la section (démo / intégration).
 */
export default function SectionNameTag({
  name,
  children,
  navTopOffsetPx = 0,
  layoutFill = false,
}: Props) {
  const top = `max(${8 + navTopOffsetPx}px, env(safe-area-inset-top))`;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        ...(layoutFill
          ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }
          : { display: "block" }),
      }}
    >
      <div
        role="note"
        aria-label={`Section : ${name}`}
        style={{
          position: "absolute",
          top,
          left: "max(8px, env(safe-area-inset-left))",
          zIndex: 9998,
          maxWidth: "min(92vw, 420px)",
          padding: "5px 10px",
          borderRadius: 6,
          fontFamily:
            'ui-monospace, SFMono-Regular, "Cascadia Code", "Source Code Pro", Menlo, monospace',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.03em",
          lineHeight: 1.25,
          color: "rgba(255,255,255,0.95)",
          background: "rgba(18,18,22,0.78)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          pointerEvents: "none",
          boxShadow: "0 2px 14px rgba(0,0,0,0.28)",
          wordBreak: "break-word",
        }}
      >
        {name}
      </div>
      {children}
    </div>
  );
}
