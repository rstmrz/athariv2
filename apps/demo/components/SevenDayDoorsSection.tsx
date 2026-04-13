"use client";

import React, { useCallback, useState } from "react";

const font = {
  serif: '"Cormorant Garamond", "Times New Roman", Georgia, serif',
  sans: '"Inter", system-ui, -apple-system, sans-serif',
} as const;

type DayDoor = {
  id: number;
  label: string;
  shortLabel: string;
  surprise: string;
  universe: string;
  description: string;
  accent: string;
};

const DAYS: DayDoor[] = [
  {
    id: 1,
    label: "1er jour",
    shortLabel: "1",
    surprise: "Brume salée",
    universe: "L’océan au petit matin",
    description:
      "Tu soulèves la première petite porte du boîtier : un souffle froid et iodé t’atteint, comme si la mer s’était glissée dans la pièce. C’est le calme avant l’exploration — une invitation à ralentir, respirer, et accepter que chaque case ouverte raconte une partie d’un même voyage.",
    accent: "linear-gradient(160deg, #1a4a5c 0%, #0d2830 100%)",
  },
  {
    id: 2,
    label: "2e jour",
    shortLabel: "2",
    surprise: "Néons lointains",
    universe: "La ville qui ne dort jamais",
    description:
      "Deuxième case : des reflets violets et bleus pulsent derrière le verre dépoli. Ce jour t’ouvre un univers urbain, presque cinématographique — celui des possibilités nocturnes, des idées qui brillent mieux quand tout le monde s’endort.",
    accent: "linear-gradient(160deg, #3d1f55 0%, #1a0d24 100%)",
  },
  {
    id: 3,
    label: "3e jour",
    shortLabel: "3",
    surprise: "Sable tiède",
    universe: "Le désert silencieux",
    description:
      "Troisième porte : le silence devient presque tangible. Les tons sable et ciel pâle t’entourent — un espace minimaliste où l’essentiel ressort. Ici, la surprise n’est pas un bruit : c’est la clarté que tu gagnes quand tu enlèves le superflu.",
    accent: "linear-gradient(160deg, #6b5344 0%, #3d2e22 100%)",
  },
  {
    id: 4,
    label: "4e jour",
    shortLabel: "4",
    surprise: "Lumière verte",
    universe: "Sous-bois au lever du jour",
    description:
      "Quatrième case : la lumière filtre à travers des feuilles imaginaires. C’est un univers organique, rassurant — celui des reprises douces, des projets qui poussent sans que tu aies crié victoire trop tôt.",
    accent: "linear-gradient(160deg, #1e4a38 0%, #0f261c 100%)",
  },
  {
    id: 5,
    label: "5e jour",
    shortLabel: "5",
    surprise: "Poussière d’or",
    universe: "La bibliothèque oubliée",
    description:
      "Cinquième jour : le bois ancien, le papier, le temps suspendu. Ce tiroir te rappelle que les surprises peuvent être des mots, des images, des souvenirs — pas seulement des objets. Tu inventories ce que tu veux vraiment garder.",
    accent: "linear-gradient(160deg, #5c4a32 0%, #2a2218 100%)",
  },
  {
    id: 6,
    label: "6e jour",
    shortLabel: "6",
    surprise: "Constellations",
    universe: "Le ciel sans plafond",
    description:
      "Sixième porte : le noir profond parsemé de points lumineux. Un univers vaste, presque intimidant, mais beau. C’est la veille de la fin du calendrier : tout ce que tu as ouvert jusqu’ici forme une carte pour ce dernier pas.",
    accent: "linear-gradient(160deg, #1a2440 0%, #0a0e18 100%)",
  },
  {
    id: 7,
    label: "7e jour",
    shortLabel: "7",
    surprise: "La dernière clé",
    universe: "Tout s’assemble",
    description:
      "Septième case : plus une surprise isolée — une synthèse. Le boîtier n’était qu’une métaphore : chaque jour était une porte vers un état d’esprit, une ambiance, un fragment d’histoire. Tu refermes le couvercle en sachant que le vrai cadeau, c’est la suite que tu choisis d’écrire.",
    accent: "linear-gradient(160deg, #4a3038 0%, #1c1218 100%)",
  },
];

const glass = {
  panel:
    "linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 45%, rgba(12,14,20,0.55) 100%)",
  border: "1px solid rgba(255,255,255,0.18)",
  blur: "blur(22px) saturate(160%)",
} as const;

export default function SevenDayDoorsSection() {
  const [opened, setOpened] = useState<Set<number>>(() => new Set());
  const [activeId, setActiveId] = useState<number | null>(null);

  const openDoor = useCallback((id: number) => {
    setOpened((prev) => new Set(prev).add(id));
    setActiveId(id);
  }, []);

  const active = activeId != null ? DAYS.find((d) => d.id === activeId) : null;

  return (
    <section
      id="seven-day-doors"
      style={{
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        paddingTop: "max(clamp(40px, 8vh, 88px), env(safe-area-inset-top))",
        paddingBottom: "max(clamp(44px, 9vh, 96px), env(safe-area-inset-bottom))",
        paddingLeft: "max(clamp(16px, 4vw, 40px), env(safe-area-inset-left))",
        paddingRight: "max(clamp(16px, 4vw, 40px), env(safe-area-inset-right))",
        fontFamily: font.sans,
        color: "rgba(248,250,252,0.96)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "scale(1.04)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(8,10,16,0.45) 0%, rgba(6,8,14,0.72) 45%, rgba(4,5,10,0.88) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1200,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <p
          style={{
            margin: 0,
            marginBottom: 10,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          Calendrier
        </p>
        <h2
          style={{
            margin: 0,
            marginBottom: 16,
            fontFamily: font.serif,
            fontSize: "clamp(1.85rem, 4.2vw, 2.85rem)",
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            textShadow: "0 4px 32px rgba(0,0,0,0.35)",
          }}
        >
          Sept portes, sept univers
        </h2>
        <p
          style={{
            margin: 0,
            marginBottom: 36,
            maxWidth: 620,
            fontSize: "clamp(15px, 1.9vw, 17px)",
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.78)",
          }}
        >
          Imagine un petit boîtier posé à côté de toi : à l’intérieur, sept cases à
          ouvrir — une par jour. Chaque porte laisse entrevoir une surprise et un
          univers différent. Clique sur un jour pour l’ouvrir : le descriptif à
          droite raconte ce que tu viens de découvrir.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 420px)",
            gap: "clamp(24px, 4vw, 40px)",
            alignItems: "start",
          }}
          className="seven-day-doors-grid"
        >
          <div>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Les cases du boîtier
            </p>
            <ul
              aria-label="Sept jours à ouvrir"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                justifyContent: "flex-start",
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
              className="seven-day-doors-strip"
            >
              {DAYS.map((day) => {
                const isOpen = opened.has(day.id);
                const isActive = activeId === day.id;
                return (
                  <li key={day.id} style={{ flexShrink: 0 }}>
                  <button
                    type="button"
                    aria-pressed={isOpen}
                    aria-expanded={isOpen}
                    aria-label={`${day.label}, ${isOpen ? "ouvert" : "fermé"}`}
                    onClick={() => openDoor(day.id)}
                    style={{
                      position: "relative",
                      width: "clamp(76px, 11vw, 104px)",
                      minHeight: 148,
                      padding: "12px 10px",
                      borderRadius: 28,
                      border: glass.border,
                      cursor: "pointer",
                      textAlign: "center",
                      overflow: "hidden",
                      background: glass.panel,
                      backdropFilter: glass.blur,
                      WebkitBackdropFilter: glass.blur,
                      boxShadow: isActive
                        ? "0 0 0 2px rgba(255,255,255,0.35), 0 16px 48px rgba(0,0,0,0.35)"
                        : "0 8px 32px rgba(0,0,0,0.22)",
                      transform: isActive ? "translateY(-2px)" : "none",
                      transition:
                        "box-shadow 0.35s cubic-bezier(0.22,1,0.36,1), transform 0.35s cubic-bezier(0.22,1,0.36,1)",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: day.accent,
                        opacity: isOpen ? 0.92 : 0,
                        transition: "opacity 0.45s cubic-bezier(0.22,1,0.36,1)",
                      }}
                    />
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 40%)",
                        opacity: isOpen ? 0.5 : 1,
                        transition: "opacity 0.4s ease",
                      }}
                    />
                    <span
                      style={{
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: isOpen
                            ? "rgba(255,255,255,0.95)"
                            : "rgba(255,255,255,0.65)",
                        }}
                      >
                        {day.label}
                      </span>
                      {!isOpen ? (
                        <span
                          style={{
                            fontFamily: font.serif,
                            fontSize: 36,
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.9)",
                            lineHeight: 1,
                          }}
                        >
                          {day.shortLabel}
                        </span>
                      ) : (
                        <>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: "rgba(255,255,255,0.75)",
                            }}
                          >
                            Surprise
                          </span>
                          <span
                            style={{
                              fontFamily: font.serif,
                              fontSize: 15,
                              fontWeight: 700,
                              lineHeight: 1.25,
                              color: "#fff",
                              textShadow: "0 2px 12px rgba(0,0,0,0.35)",
                            }}
                          >
                            {day.surprise}
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside
            aria-live="polite"
            style={{
              borderRadius: 28,
              border: glass.border,
              background: glass.panel,
              backdropFilter: glass.blur,
              WebkitBackdropFilter: glass.blur,
              padding: "clamp(22px, 3.5vw, 32px)",
              minHeight: 280,
              boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
            }}
          >
            {!active ? (
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.62)",
                }}
              >
                Ouvre une case du calendrier pour lire le descriptif de la surprise
                et l’univers du jour.
              </p>
            ) : (
              <>
                <p
                  style={{
                    margin: 0,
                    marginBottom: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {active.label} · ouvert
                </p>
                <h3
                  style={{
                    margin: 0,
                    marginBottom: 6,
                    fontFamily: font.serif,
                    fontSize: "clamp(1.35rem, 2.8vw, 1.75rem)",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: "#fff",
                  }}
                >
                  {active.universe}
                </h3>
                <p
                  style={{
                    margin: "0 0 18px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "rgba(212,175,55,0.95)",
                  }}
                >
                  Surprise : {active.surprise}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "clamp(14px, 1.85vw, 16px)",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.82)",
                  }}
                >
                  {active.description}
                </p>
              </>
            )}
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .seven-day-doors-grid {
            grid-template-columns: 1fr !important;
          }
          .seven-day-doors-strip {
            flex-wrap: nowrap !important;
            overflow-x: auto;
            padding-bottom: 10px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
          }
        }
      `}</style>
    </section>
  );
}
