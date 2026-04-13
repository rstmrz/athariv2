"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const HOLE_HOLD_MS = 220;
const EXPAND_MS = 1800;
const PAUSE_AFTER_EXPAND_MS = 120;
const FADE_OUT_MS = 450;

const easeExpand = (u: number) =>
  1 - Math.pow(1 - u, 2.35);

type Props = {
  initialRect: DOMRect;
  direction?: "forward" | "reverse";
  /** Miroir du scroll Hero 1 pendant le hold avant : scroll vers l’origine après 2 rAF. */
  onReverseScrollToOrigin?: () => void;
  /** Retour : le visuel Hero 1 (fond) se réduit jusqu’au rectangle du bouton Découvrir. */
  reverseHeroBackgroundSrc?: string;
  reverseBackgroundPosition?: string;
  onExpandComplete?: () => void;
  onFullyDone: () => void;
};

/**
 * Forward : panneaux noirs + trou qui s’agrandit.
 * Reverse : calque image Hero 1 qui se réduit jusqu’au bouton (même géométrie que le trou).
 */
export default function OriginDiscoverMorphOverlay({
  initialRect,
  direction = "forward",
  onReverseScrollToOrigin,
  reverseHeroBackgroundSrc,
  reverseBackgroundPosition = "center 42%",
  onExpandComplete,
  onFullyDone,
}: Props) {
  const r0 = useRef(initialRect);
  const [t, setT] = useState(() => (direction === "reverse" ? 1 : 0));
  const [fadeOut, setFadeOut] = useState(false);
  const [dims, setDims] = useState({ vw: 0, vh: 0 });
  const doneRef = useRef(false);

  useEffect(() => {
    r0.current = initialRect;
  }, [initialRect]);

  useLayoutEffect(() => {
    setDims({ vw: window.innerWidth, vh: window.innerHeight });
  }, []);

  useEffect(() => {
    if (direction !== "forward") return;
    if (dims.vw <= 0) return;
    let start: number | null = null;
    let frame = 0;

    const step = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start - HOLE_HOLD_MS;
      if (elapsed < 0) {
        frame = requestAnimationFrame(step);
        return;
      }
      const u = Math.min(1, elapsed / EXPAND_MS);
      setT(easeExpand(u));
      if (u < 1) {
        frame = requestAnimationFrame(step);
      } else {
        onExpandComplete?.();
        window.setTimeout(() => setFadeOut(true), PAUSE_AFTER_EXPAND_MS);
        window.setTimeout(() => {
          if (doneRef.current) return;
          doneRef.current = true;
          onFullyDone();
        }, PAUSE_AFTER_EXPAND_MS + FADE_OUT_MS + 40);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [dims.vw, dims.vh, direction, onExpandComplete, onFullyDone]);

  useEffect(() => {
    if (direction !== "reverse") return;
    if (dims.vw <= 0) return;

    let cancelled = false;
    let rafScrollA = 0;
    let rafScrollB = 0;
    let frame = 0;
    let timeoutFade: number | undefined;
    let timeoutDone: number | undefined;

    rafScrollA = requestAnimationFrame(() => {
      rafScrollB = requestAnimationFrame(() => {
        if (cancelled) return;
        onReverseScrollToOrigin?.();
      });
    });

    let start: number | null = null;

    const step = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start - HOLE_HOLD_MS;
      if (elapsed < 0) {
        frame = requestAnimationFrame(step);
        return;
      }
      const u = Math.min(1, elapsed / EXPAND_MS);
      setT(1 - easeExpand(u));
      if (u < 1) {
        frame = requestAnimationFrame(step);
      } else {
        setT(0);
        timeoutFade = window.setTimeout(() => setFadeOut(true), PAUSE_AFTER_EXPAND_MS);
        timeoutDone = window.setTimeout(() => {
          if (doneRef.current) return;
          doneRef.current = true;
          onFullyDone();
        }, PAUSE_AFTER_EXPAND_MS + FADE_OUT_MS + 40);
      }
    };

    setT(1);
    frame = requestAnimationFrame(step);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafScrollA);
      cancelAnimationFrame(rafScrollB);
      cancelAnimationFrame(frame);
      if (timeoutFade != null) clearTimeout(timeoutFade);
      if (timeoutDone != null) clearTimeout(timeoutDone);
    };
  }, [dims.vw, dims.vh, direction, onReverseScrollToOrigin, onFullyDone]);

  const r = r0.current;
  const { vw, vh } = dims;

  const hx = r.left * (1 - t);
  const hy = r.top * (1 - t);
  const hw = r.width + (vw - r.width) * t;
  const hh = r.height + (vh - r.height) * t;

  const topH = hy;
  const bottomH = Math.max(0, vh - hy - hh);
  const bottomTop = hy + hh;
  const leftW = hx;
  const leftH = hh;
  const leftTop = hy;
  const rightW = Math.max(0, vw - hx - hw);
  const rightLeft = hx + hw;
  const rightH = hh;
  const rightTop = hy;

  const panelBg = "#030304";
  const reverseRadius = (1 - t) * 6;

  const node = (
    <div
      className="origin-discover-morph-portal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10060,
        pointerEvents: "none",
        opacity: fadeOut ? 0 : 1,
        transition: fadeOut
          ? `opacity ${FADE_OUT_MS}ms cubic-bezier(0.22, 0.88, 0.28, 1)`
          : "none",
      }}
      aria-hidden
    >
      {direction === "reverse" && reverseHeroBackgroundSrc ? (
        <div
          style={{
            position: "absolute",
            left: hx,
            top: hy,
            width: hw,
            height: hh,
            borderRadius: reverseRadius,
            overflow: "hidden",
            boxShadow: "0 16px 56px rgba(0,0,0,0.55)",
            backgroundColor: "#0b0c10",
            backgroundImage: `url("${reverseHeroBackgroundSrc}")`,
            backgroundSize: "cover",
            backgroundPosition: reverseBackgroundPosition,
            backgroundRepeat: "no-repeat",
          }}
        />
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: vw,
              height: topH,
              background: panelBg,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: bottomTop,
              width: vw,
              height: bottomH,
              background: panelBg,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: leftTop,
              width: leftW,
              height: leftH,
              background: panelBg,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: rightLeft,
              top: rightTop,
              width: rightW,
              height: rightH,
              background: panelBg,
            }}
          />
        </>
      )}
    </div>
  );

  if (typeof document === "undefined" || vw <= 0) return null;
  return createPortal(node, document.body);
}
