type Entry = {
  href: string;
  title: string;
  description: string;
  tag?: string;
};

const entries: Entry[] = [
  {
    href: "/landing",
    title: "Landing adventure",
    description:
      "Page longue : hero, galerie arc, suites de sections (vidéo, cartes, portes 7 jours…).",
    tag: "Démo complète",
  },
  {
    href: "/experience",
    title: "Hero + galerie arc",
    description: "Vue courte pour travailler ou présenter uniquement ces deux blocs.",
    tag: "Vue courte",
  },
  {
    href: "/landing#ai-gallery-arc",
    title: "Galerie sur la landing",
    description: "Même contenu que la landing, avec saut direct à la section galerie arc.",
    tag: "Ancre",
  },
  {
    href: "/hub",
    title: "Carte des URLs",
    description: "Liste commentée des routes utiles en local.",
    tag: "Référence",
  },
];

export default function LibraryHome() {
  return (
    <main
      id="library-home"
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "clamp(56px, 14vw, 88px) clamp(20px, 5vw, 48px) 48px",
        background: "linear-gradient(165deg, #f0f2f7 0%, #e8ebf2 45%, #f6f7fa 100%)",
        color: "#14151c",
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(20,21,28,0.45)",
          }}
        >
          biblio_composants
        </p>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700 }}>
          Bibliothèque
        </h1>
        <p
          style={{
            margin: "0 0 36px",
            maxWidth: 520,
            fontSize: 16,
            lineHeight: 1.55,
            color: "rgba(20,21,28,0.65)",
          }}
        >
          Choisis une démo à ouvrir. Les composants source vivent dans{" "}
          <code style={{ fontSize: 13, background: "rgba(20,21,28,0.06)", padding: "2px 6px", borderRadius: 4 }}>
            packages/components
          </code>
          .
        </p>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {entries.map((e) => (
            <li key={e.href}>
              <a
                href={e.href}
                style={{
                  display: "block",
                  height: "100%",
                  padding: 20,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(20,21,28,0.08)",
                  boxShadow: "0 8px 28px rgba(20,21,28,0.06)",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                {e.tag ? (
                  <span
                    style={{
                      display: "inline-block",
                      marginBottom: 10,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#3b5bdb",
                    }}
                  >
                    {e.tag}
                  </span>
                ) : null}
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: "#0d0e14" }}>{e.title}</div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "rgba(20,21,28,0.58)" }}>{e.description}</p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 14,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#2563eb",
                  }}
                >
                  Ouvrir →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
