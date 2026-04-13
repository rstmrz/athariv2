"use client";

import React, { useCallback, useEffect, useRef } from "react";

const font = { sans: '"Inter", system-ui, -apple-system, sans-serif' } as const;

async function exitFullscreenSafe() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }
  } catch {
    /* ignore */
  }
}

export type VideoPlayerOverlayProps = {
  open: boolean;
  onClose: () => void;
  videoSrc: string;
};

export default function VideoPlayerOverlay({ open, onClose, videoSrc }: VideoPlayerOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fsWrapRef = useRef<HTMLDivElement>(null);
  const reduceBtnRef = useRef<HTMLButtonElement>(null);

  const closePlayer = useCallback(async () => {
    await exitFullscreenSafe();
    const v = videoRef.current;
    if (v) v.pause();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    reduceBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        void closePlayer();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closePlayer]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (open) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [open]);

  const enterFullscreen = useCallback(async () => {
    const v = videoRef.current;
    const wrap = fsWrapRef.current;
    if (!v) return;
    try {
      const anyV = v as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
      if (typeof anyV.webkitEnterFullscreen === "function") {
        anyV.webkitEnterFullscreen();
        return;
      }
      const el = wrap ?? v;
      const anyEl = el as unknown as {
        requestFullscreen?: () => Promise<void>;
        webkitRequestFullscreen?: () => void;
      };
      if (typeof anyEl.requestFullscreen === "function") {
        await anyEl.requestFullscreen();
      } else if (typeof anyEl.webkitRequestFullscreen === "function") {
        anyEl.webkitRequestFullscreen();
      }
    } catch {
      /* unsupported */
    }
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lecture vidéo"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "center",
        padding:
          "max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left))",
        background: "rgba(2,2,4,0.92)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: 12,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          ref={reduceBtnRef}
          onClick={() => void closePlayer()}
          style={{
            minHeight: 44,
            minWidth: 44,
            padding: "0 18px",
            borderRadius: 9999,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontFamily: font.sans,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Réduire
        </button>
        <button
          type="button"
          onClick={() => void enterFullscreen()}
          style={{
            minHeight: 44,
            minWidth: 44,
            padding: "0 18px",
            borderRadius: 9999,
            border: "1px solid rgba(168, 124, 88, 0.45)",
            background: "rgba(26, 22, 20, 0.85)",
            color: "rgba(255,255,255,0.95)",
            fontFamily: font.sans,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Plein écran
        </button>
      </div>

      <div
        ref={fsWrapRef}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          overflow: "hidden",
          background: "#000",
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          controls
          playsInline
          preload="metadata"
          style={{
            width: "100%",
            height: "100%",
            maxHeight: "min(85dvh, 100%)",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
}
