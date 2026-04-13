"use client";

import React, { useState } from "react";
import VideoPlayerOverlay from "./VideoPlayerOverlay";

const font = { sans: '"Inter", system-ui, -apple-system, sans-serif' } as const;

const PHOTO = "/nuit.png";

const DEFAULT_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const shell: React.CSSProperties = {
  width: "100%",
  maxWidth: 1320,
  marginLeft: "auto",
  marginRight: "auto",
  boxSizing: "border-box",
};

/** Bordure extérieure commune (2px blanc) + padding contenu aligné entre les 3 cartes */
const CARD_BORDER = "2px solid #ffffff";
const CONTENT_PAD_X = 22;
const CONTENT_PAD_TOP = 20;
const CONTENT_PAD_BOTTOM = 22;
const CONTENT_GAP_AFTER_TITLE = 10;
const CONTENT_GAP_AFTER_BIO = 20;

function IconVerified({ variant }: { variant: "green" | "white" }) {
  const isWhite = variant === "white";
  return (
    <span
      aria-label="Compte vérifié"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: isWhite ? "#fff" : "#22c55e",
        flexShrink: 0,
        boxShadow: isWhite
          ? "0 1px 6px rgba(0,0,0,0.2)"
          : "0 1px 5px rgba(34,197,94,0.35)",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path
          d="M2.5 6L5 8.5L9.5 3.5"
          stroke={isWhite ? "#1a1d24" : "#fff"}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function IconUser({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconDoc({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 4h6l4 4v12a1 1 0 01-1 1H8a1 1 0 01-1-1V5a1 1 0 011-1z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 4v4h4" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

type Variant = "framed" | "glassLight" | "glassDark";

type CardDef = {
  variant: Variant;
  name: string;
  bio: string;
  followers: string;
  posts: string;
  verified?: boolean;
};

const CARDS: CardDef[] = [
  {
    variant: "framed",
    name: "Sophie Bennett",
    bio: "Product Designer who focuses on simplicity & usability.",
    followers: "312",
    posts: "48",
    verified: true,
  },
  {
    variant: "glassLight",
    name: "Sophie Bennett",
    bio: "Product Designer who focuses on simplicity & usability.",
    followers: "312",
    posts: "48",
    verified: true,
  },
  {
    variant: "glassDark",
    name: "Sophie Bennett",
    bio: "Product Designer who focuses on simplicity & usability.",
    followers: "312",
    posts: "48",
    verified: true,
  },
];

type Props = {
  videoSrc?: string;
};

export default function GlassProfileCardsSection({ videoSrc = DEFAULT_VIDEO }: Props) {
  const [playerOpen, setPlayerOpen] = useState(false);

  return (
    <section
      id="glass-profiles"
      style={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        background: "linear-gradient(180deg, #dfe3e8 0%, #e8ebf0 45%, #eef0f4 100%)",
        padding:
          "max(clamp(2.5rem, 7vw, 5rem), env(safe-area-inset-top)) max(clamp(16px, 4vw, 32px), env(safe-area-inset-right)) max(clamp(2.75rem, 8vw, 5.5rem), env(safe-area-inset-bottom)) max(clamp(16px, 4vw, 32px), env(safe-area-inset-left))",
        scrollMarginTop: 0,
      }}
    >
      <style>{`
        /* Mobile : colonne, écart vertical régulier */
        .glass-profile-grid {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: clamp(24px, 5vw, 36px);
        }
        .glass-profile-card-slot {
          display: flex;
          justify-content: center;
          align-items: stretch;
          min-width: 0;
          width: 100%;
        }
        .glass-profile-card {
          width: 100%;
          max-width: min(320px, 100%);
          min-height: 440px;
          box-sizing: border-box;
          align-self: stretch;
        }
        /* Desktop : une rangée, même écart entre chaque paire de cartes (comme la ref) */
        @media (min-width: 900px) {
          .glass-profile-grid {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            align-items: stretch;
            gap: clamp(36px, 5vw, 64px);
          }
          .glass-profile-card-slot {
            flex: 0 0 auto;
            width: min(320px, 100%);
          }
          .glass-profile-card {
            min-height: 600px;
          }
        }
      `}</style>
      <div style={shell}>
        <header style={{ marginBottom: "clamp(28px, 5vw, 40px)", textAlign: "center" }}>
          <p
            style={{
              margin: "0 0 8px",
              fontFamily: font.sans,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(30,32,38,0.45)",
            }}
          >
            Profils
          </p>
          <h2
            style={{
              margin: 0,
              fontFamily: font.sans,
              fontSize: "clamp(1.35rem, 3.5vw, 1.75rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#1a1d24",
            }}
          >
            Cartes glassmorphism
          </h2>
        </header>

        <div className="glass-profile-grid">
          {CARDS.map((c) => (
            <div key={c.variant} className="glass-profile-card-slot">
              <GlassProfileCard card={c} onWatch={() => setPlayerOpen(true)} />
            </div>
          ))}
        </div>
      </div>

      <VideoPlayerOverlay
        open={playerOpen}
        onClose={() => setPlayerOpen(false)}
        videoSrc={videoSrc}
      />
    </section>
  );
}

function CardContentBlock({
  name,
  bio,
  followers,
  posts,
  verified,
  textMain,
  textMuted,
  statIcon,
  verifiedStyle,
  btnStyle,
  onWatch,
}: {
  name: string;
  bio: string;
  followers: string;
  posts: string;
  verified?: boolean;
  textMain: string;
  textMuted: string;
  statIcon: string;
  verifiedStyle: "green" | "white";
  btnStyle: React.CSSProperties;
  onWatch: () => void;
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: CONTENT_GAP_AFTER_TITLE,
          flexWrap: "nowrap",
          minHeight: 28,
        }}
      >
        <h3
          style={{
            margin: 0,
            minWidth: 0,
            fontFamily: font.sans,
            fontSize: "clamp(1.05rem, 2.8vw, 1.2rem)",
            fontWeight: 700,
            color: textMain,
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
          }}
        >
          {name}
        </h3>
        {verified ? <IconVerified variant={verifiedStyle} /> : null}
      </div>
      <p
        style={{
          margin: `0 0 ${CONTENT_GAP_AFTER_BIO}px`,
          fontFamily: font.sans,
          fontSize: 14,
          lineHeight: 1.5,
          color: textMuted,
          fontWeight: 400,
          minHeight: "calc(1.5em * 2)",
        }}
      >
        {bio}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          alignItems: "center",
          columnGap: 12,
          rowGap: 10,
          minHeight: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            flexWrap: "nowrap",
            minWidth: 0,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: font.sans,
              fontSize: 13,
              fontWeight: 600,
              color: textMain,
            }}
          >
            <IconUser color={statIcon} />
            {followers}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: font.sans,
              fontSize: 13,
              fontWeight: 600,
              color: textMain,
            }}
          >
            <IconDoc color={statIcon} />
            {posts}
          </span>
        </div>
        <button
          type="button"
          onClick={onWatch}
          style={{
            ...btnStyle,
            fontFamily: font.sans,
            fontSize: 13,
            fontWeight: 600,
            padding: "12px 22px",
            minHeight: 48,
            borderRadius: 9999,
            cursor: "pointer",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          Lire la vidéo
        </button>
      </div>
    </>
  );
}

/** Carte 1 : cadre blanc autour de la photo, jonction nette avec le bloc texte blanc */
function FramedSplitCard({
  card,
  onWatch,
}: {
  card: CardDef;
  onWatch: () => void;
}) {
  const { name, bio, followers, posts, verified } = card;
  /** Cadre intérieur fin entre bordure carte et photo (plus léger qu’avant) */
  const innerFrame = 6;
  const imgRadius = "clamp(14px, 2.5vw, 18px)";

  return (
    <article
      className="glass-profile-card"
      style={{
        borderRadius: 28,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxShadow: "0 20px 50px rgba(15,18,28,0.1), 0 8px 24px rgba(15,18,28,0.06)",
        background: "#fff",
        border: CARD_BORDER,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: "1 1 0",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: `${innerFrame}px ${innerFrame}px 0`,
        }}
      >
        <div
          style={{
            borderRadius: `${imgRadius} ${imgRadius} 0 0`,
            overflow: "hidden",
            flex: "1 1 auto",
            minHeight: 200,
            backgroundColor: "#1a1d24",
            backgroundImage: `url("${PHOTO}")`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        />
      </div>
      <div
        style={{
          flexShrink: 0,
          padding: `${CONTENT_PAD_TOP}px ${CONTENT_PAD_X}px ${CONTENT_PAD_BOTTOM}px`,
          background: "#fff",
        }}
      >
        <CardContentBlock
          name={name}
          bio={bio}
          followers={followers}
          posts={posts}
          verified={verified}
          textMain="#14161c"
          textMuted="rgba(20,22,28,0.58)"
          statIcon="rgba(20,22,28,0.45)"
          verifiedStyle="green"
          btnStyle={{
            background: "#fff",
            color: "#1a1d24",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 6px 20px rgba(15,18,28,0.1)",
          }}
          onWatch={onWatch}
        />
      </div>
    </article>
  );
}

/** Cartes 2 & 3 : image plein cadre, bordure, dégradé + blur — pas de bloc opaque séparé */
function FullBleedGlassCard({
  card,
  onWatch,
  mode,
}: {
  card: CardDef;
  onWatch: () => void;
  mode: "light" | "dark";
}) {
  const { name, bio, followers, posts, verified } = card;
  const isDark = mode === "dark";

  const gradientOverlay = isDark
    ? "linear-gradient(180deg, transparent 0%, transparent 32%, rgba(0,0,0,0.35) 58%, rgba(0,0,0,0.78) 100%)"
    : "linear-gradient(180deg, transparent 0%, transparent 30%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0.92) 100%)";

  const frostStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: "28%",
    pointerEvents: "none",
    WebkitBackdropFilter: isDark ? "blur(16px)" : "blur(14px)",
    backdropFilter: isDark ? "blur(16px)" : "blur(14px)",
    background: isDark
      ? "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.5) 100%)"
      : "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.55) 100%)",
    maskImage: "linear-gradient(180deg, transparent 0%, black 28%, black 100%)",
    WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 28%, black 100%)",
  };

  return (
    <article
      className="glass-profile-card"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 24px 56px rgba(15,18,28,0.14), 0 8px 28px rgba(15,18,28,0.08)",
        border: CARD_BORDER,
        boxSizing: "border-box",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#1a1d24",
          backgroundImage: `url("${PHOTO}")`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: gradientOverlay,
          pointerEvents: "none",
        }}
      />
      <div aria-hidden style={frostStyle} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          marginTop: "auto",
          padding: `${CONTENT_PAD_TOP}px ${CONTENT_PAD_X}px ${CONTENT_PAD_BOTTOM}px`,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <CardContentBlock
          name={name}
          bio={bio}
          followers={followers}
          posts={posts}
          verified={verified}
          textMain={isDark ? "#fff" : "#14161c"}
          textMuted={isDark ? "rgba(255,255,255,0.78)" : "rgba(20,22,28,0.62)"}
          statIcon={isDark ? "rgba(255,255,255,0.8)" : "rgba(20,22,28,0.45)"}
          verifiedStyle={isDark ? "white" : "green"}
          btnStyle={
            isDark
              ? {
                  background: "rgba(255,255,255,0.95)",
                  color: "#1a1d24",
                  border: "none",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                }
              : {
                  background: "#fff",
                  color: "#1a1d24",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 6px 22px rgba(15,18,28,0.12)",
                }
          }
          onWatch={onWatch}
        />
      </div>
    </article>
  );
}

function GlassProfileCard({
  card,
  onWatch,
}: {
  card: CardDef;
  onWatch: () => void;
}) {
  if (card.variant === "framed") {
    return <FramedSplitCard card={card} onWatch={onWatch} />;
  }
  if (card.variant === "glassLight") {
    return <FullBleedGlassCard card={card} onWatch={onWatch} mode="light" />;
  }
  return <FullBleedGlassCard card={card} onWatch={onWatch} mode="dark" />;
}
