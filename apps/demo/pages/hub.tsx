/**
 * Carte des URLs locales — une seule origine : http://localhost:PORT
 * (souvent PORT=3000). Ce qui change, c’est le chemin après le domaine.
 */
export default function HubPage() {
  const rows: { path: string; title: string; detail: string }[] = [
    {
      path: "/",
      title: "Bibliothèque (accueil)",
      detail:
        "Hub d’entrée : cartes vers la landing complète, la vue courte hero+galerie, la carte des URLs, etc.",
    },
    {
      path: "/landing",
      title: "Landing adventure complète",
      detail:
        "AdventureHero, ArcAiGallerySection, blocs texte, DoorVideo, VisionCard, GlassProfileCards, SevenDayDoors…",
    },
    {
      path: "/landing#ai-gallery-arc",
      title: "Même landing, scroll vers la galerie",
      detail:
        "Tu restes sur la landing : le navigateur descend jusqu’à la section galerie (id ai-gallery-arc).",
    },
    {
      path: "/experience",
      title: "Expérience visuelle (hero + galerie arc)",
      detail:
        "Route dédiée : import statique, pas de paramètre sur l’accueil. /gallery et /hero-gallery redirigent ici ; ?view=visual sur / aussi.",
    },
    {
      path: "/hero",
      title: "Alias de /landing",
      detail: "Même contenu que la landing complète (lien historique).",
    },
    {
      path: "/test-route",
      title: "Test minimal",
      detail: "Vérifie que Next répond (bandeau vert).",
    },
    {
      path: "/sections",
      title: "Placeholder",
      detail: "Page « retirée » avec lien retour bibliothèque.",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "clamp(20px, 4vw, 48px)",
        background: "#0c0c10",
        color: "#ececf1",
        fontFamily: 'system-ui, "Segoe UI", sans-serif',
        lineHeight: 1.5,
        maxWidth: 720,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <h1 style={{ marginTop: 0, fontSize: "clamp(1.35rem, 3vw, 1.75rem)" }}>
        URLs en local — un seul localhost
      </h1>
      <p style={{ color: "rgba(236,236,241,0.75)", marginBottom: 28 }}>
        Tu n’as <strong>pas</strong> plusieurs localhost différents pour des « onglets » de
        pages : tu as <strong>une adresse</strong>, par exemple{" "}
        <code style={{ color: "#93c5fd" }}>http://localhost:3000</code>, et tu changes
        seulement le <strong>chemin</strong> : <code>/</code>, <code>/experience</code>,{" "}
        <code>/landing</code>, etc. Si le port est pris, Next peut afficher <code>3001</code>{" "}
        dans le terminal — c’est toujours la même idée : <strong>un port = toute l’app</strong>.
      </p>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {rows.map((r) => (
          <li
            key={r.path}
            style={{
              marginBottom: 18,
              padding: 16,
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <a
              href={r.path}
              style={{
                fontWeight: 700,
                color: "#86efac",
                textDecoration: "none",
                fontSize: 16,
              }}
            >
              {r.path}
            </a>
            <div style={{ fontWeight: 600, marginTop: 6, color: "#fff" }}>{r.title}</div>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(236,236,241,0.7)" }}>
              {r.detail}
            </p>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 32, fontSize: 14, color: "rgba(236,236,241,0.55)" }}>
        La barre discrète en haut permet de naviguer rapidement entre les pages courantes.
      </p>
      <p style={{ marginTop: 12 }}>
        <a href="/" style={{ color: "#93c5fd" }}>
          ← Retour bibliothèque
        </a>
      </p>
    </main>
  );
}
