"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { flushSync } from "react-dom";

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

const MARQUEE_COPIES = 2;

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

type ScratchCanvasProps = {
  width: number;
  height: number;
  active: boolean;
};

/**
 * Couche dorée raster : effacement type « grattage » (souris / tactile).
 */
function GoldScratchCanvas({ width, height, active }: ScratchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const queueRef = useRef<Array<{ x: number; y: number }>>([]);

  const paintBase = useCallback(
    (ctx: CanvasRenderingContext2D, cssW: number, cssH: number) => {
      const g = ctx.createLinearGradient(0, 0, cssW, cssH);
      g.addColorStop(0, "#bf953f");
      g.addColorStop(0.38, "#fcf6ba");
      g.addColorStop(0.62, "#b38728");
      g.addColorStop(1, "#aa771c");
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.restore();
    },
    []
  );

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width < 2 || height < 2) return;
    const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintBase(ctx, width, height);
  }, [width, height, paintBase, active]);

  const flushQueue = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    const batch = queueRef.current;
    queueRef.current = [];
    const radius = 36;
    for (const p of batch) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    rafRef.current = 0;
  }, []);

  const enqueueScratch = useCallback(
    (x: number, y: number) => {
      queueRef.current.push({ x, y });
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flushQueue);
      }
    },
    [flushQueue]
  );

  const onPointerScratch = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!active) return;
      const rect = e.currentTarget.getBoundingClientRect();
      enqueueScratch(e.clientX - rect.left, e.clientY - rect.top);
    },
    [active, enqueueScratch]
  );

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        cursor: active ? "crosshair" : "default",
        touchAction: "none",
      }}
      onPointerDown={onPointerScratch}
      onPointerMove={(e) => {
        if (!active) return;
        if (e.pointerType === "mouse") {
          onPointerScratch(e);
          return;
        }
        if (e.buttons === 0) return;
        onPointerScratch(e);
      }}
    />
  );
}

type GoldRailCardProps = {
  flatIndex: number;
  item: ArcGalleryGoldItem;
  cardPx: number;
  gapPx: number;
  openFlatIndex: number | null;
  marqueePaused: boolean;
  onPick: (flat: number) => void;
};

function GoldRailCard({
  flatIndex,
  item,
  cardPx,
  gapPx,
  openFlatIndex,
  marqueePaused,
  onPick,
}: GoldRailCardProps) {
  const [shine, setShine] = useState({ x: 50, y: 42 });

  const layoutId =
    openFlatIndex === flatIndex && marqueePaused ? "arc-gold-expand" : undefined;

  return (
    <motion.button
      type="button"
      layoutId={layoutId}
      aria-label={`${item.title}, révéler`}
      style={{
        position: "relative",
        overflow: "hidden",
        width: cardPx,
        height: cardPx,
        marginRight: gapPx,
        flexShrink: 0,
        borderRadius: 14,
        boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
        WebkitTapHighlightColor: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        background: "transparent",
      }}
      transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.85 }}
      onClick={() => onPick(flatIndex)}
      onPointerMove={(e) => {
        const t = e.currentTarget;
        const r = t.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        setShine({ x, y });
      }}
    >
      <span
        aria-hidden
        className="arc-gallery-gold-gradient-bg"
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: 0.55,
          mixBlendMode: "screen",
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.92) 0%, rgba(255,252,235,0.22) 28%, transparent 52%)`,
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: 0.25,
          background:
            "linear-gradient(125deg, transparent 35%, rgba(255,255,255,0.55) 48%, transparent 62%)",
        }}
      />
    </motion.button>
  );
}

export type ArcGalleryGoldMarqueeProps = {
  items: ArcGalleryGoldItem[];
  reduceMotion: boolean;
  narrowMobile: boolean;
  viewportWidth: number;
  fontSerif: string;
  fontSans: string;
  /** Section visible (viewport) : déclenche la séquence d’entrée. */
  sectionActive: boolean;
  onExposeClose?: (close: () => void) => void;
  overlayOpenRef?: React.MutableRefObject<boolean>;
};

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
  const [openFlat, setOpenFlat] = useState<number | null>(null);
  const [marqueePaused, setMarqueePaused] = useState(false);
  const expandedBoxRef = useRef<HTMLDivElement>(null);
  const [expandedSize, setExpandedSize] = useState({ w: 360, h: 450 });

  const cardPx = narrowMobile
    ? Math.round(Math.min(92, Math.max(56, viewportWidth * 0.168)))
    : Math.round(Math.min(148, Math.max(96, viewportWidth * 0.112)));
  const gapPx = narrowMobile ? 10 : 16;

  const flatCells = useMemo(() => {
    const out: { item: ArcGalleryGoldItem; flat: number }[] = [];
    let k = 0;
    for (let c = 0; c < MARQUEE_COPIES; c++) {
      for (let i = 0; i < items.length; i++) {
        out.push({ item: items[i], flat: k++ });
      }
    }
    return out;
  }, [items]);

  const closeExpanded = useCallback(() => {
    flushSync(() => {
      setOpenFlat(null);
      setMarqueePaused(false);
    });
  }, []);

  useEffect(() => {
    onExposeClose?.(closeExpanded);
    return () => onExposeClose?.(() => {});
  }, [onExposeClose, closeExpanded]);

  useLayoutEffect(() => {
    if (overlayOpenRef) overlayOpenRef.current = openFlat !== null;
  }, [openFlat, overlayOpenRef]);

  useLayoutEffect(() => {
    const el = expandedBoxRef.current;
    if (!el || openFlat === null) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setExpandedSize({ w: Math.max(120, r.width), h: Math.max(120, r.height) });
    });
    ro.observe(el);
    const r0 = el.getBoundingClientRect();
    setExpandedSize({ w: Math.max(120, r0.width), h: Math.max(120, r0.height) });
    return () => ro.disconnect();
  }, [openFlat]);

  useEffect(() => {
    if (!sectionActive) {
      setIntroPhase((prev) => (openFlat !== null ? "c" : "idle"));
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
  }, [sectionActive, reduceMotion, openFlat]);

  const opened = openFlat !== null ? flatCells[openFlat] : null;

  const pick = useCallback((flat: number) => {
    if (openFlat !== null) return;
    setMarqueePaused(true);
    setOpenFlat(flat);
  }, [openFlat]);

  const showIntroText = introPhase === "a" || introPhase === "b";
  const showDeck = introPhase === "c";

  const overlay = opened ? (
    <>
      <motion.div
        role="presentation"
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10059,
          background: "rgba(0,0,0,0.58)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28 }}
        onClick={closeExpanded}
      />
      <div
        style={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          zIndex: 10060,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <motion.div
          layoutId="arc-gold-expand"
          ref={expandedBoxRef}
          style={{
            pointerEvents: "auto",
            position: "relative",
            width: "min(92vw, 420px)",
            maxWidth: 420,
            overflow: "hidden",
            borderRadius: 18,
            boxShadow: "0 40px 120px rgba(0,0,0,0.65)",
            aspectRatio: "4 / 5",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
        >
          <img
            src={opened.item.src}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <GoldScratchCanvas
            width={expandedSize.w}
            height={expandedSize.h}
            active={openFlat !== null}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 3,
              padding: "48px 16px 16px",
              fontFamily: fontSans,
              background:
                "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 38%, rgba(0,0,0,0.85) 100%)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "clamp(1.05rem, 3.8vw, 1.25rem)",
                fontWeight: 700,
                lineHeight: 1.25,
                color: "#fff",
                textShadow: "0 2px 12px rgba(0,0,0,0.85)",
              }}
            >
              {opened.item.title}
            </p>
            <p
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "rgba(255,255,255,0.78)",
              }}
            >
              {opened.item.years} · {opened.item.meta} · {opened.item.rating}★
            </p>
          </div>
          <button
            type="button"
            aria-label="Fermer l’aperçu"
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              zIndex: 4,
              display: "flex",
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.28)",
              background: "rgba(0,0,0,0.38)",
              color: "rgba(255,255,255,0.92)",
              fontSize: 22,
              lineHeight: 1,
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              closeExpanded();
            }}
          >
            ×
          </button>
        </motion.div>
      </div>
    </>
  ) : null;

  return (
    <LayoutGroup>
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
              style={{ marginTop: 16, width: "100%", minWidth: 0, flex: "1 1 auto" }}
              initial={reduceMotion ? false : { opacity: 0, y: 72 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="arc-gallery-marquee-clip"
                style={{
                  width: "100%",
                  maxWidth: narrowMobile ? "100%" : 1180,
                  marginLeft: "auto",
                  marginRight: "auto",
                  paddingTop: 8,
                  paddingBottom: 8,
                }}
              >
                <div
                  className={
                    "arc-gallery-marquee-shuttle" +
                    (marqueePaused ? " arc-gallery-marquee-shuttle--paused" : "")
                  }
                >
                  {Array.from({ length: MARQUEE_COPIES }).map((_, seg) => (
                    <div
                      key={seg}
                      className="arc-gallery-marquee-segment"
                      aria-hidden={seg > 0}
                    >
                      {items.map((item, i) => {
                        const flat = seg * items.length + i;
                        return (
                          <GoldRailCard
                            key={`${seg}-${i}`}
                            flatIndex={flat}
                            item={item}
                            cardPx={cardPx}
                            gapPx={gapPx}
                            openFlatIndex={openFlat}
                            marqueePaused={marqueePaused}
                            onPick={pick}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <p
                style={{
                  fontFamily: fontSans,
                  margin: "12px auto 0",
                  maxWidth: 576,
                  paddingLeft: 16,
                  paddingRight: 16,
                  textAlign: "center",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Frottez la surface dorée pour révéler l’image — ou touchez et glissez sur mobile.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {overlay}
    </LayoutGroup>
  );
}
