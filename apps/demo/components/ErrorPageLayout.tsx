import Link from "next/link";
import type { ReactNode } from "react";

const shell: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: 'system-ui, "Segoe UI", sans-serif',
  padding: 24,
  textAlign: "center",
  background: "#0a0a0c",
  color: "#e8e8ec",
};

const linkStyle: React.CSSProperties = {
  color: "#7ab8ff",
  fontWeight: 600,
  textDecoration: "none",
};

const quickLinks = [
  { href: "/", label: "Bibliothèque" },
  { href: "/landing", label: "Landing" },
  { href: "/hub", label: "/hub (carte)" },
  { href: "/experience", label: "Expérience visuelle" },
  { href: "/landing#ai-gallery-arc", label: "Galerie (#)" },
] as const;

type ErrorPageLayoutProps = {
  title: string;
  children: ReactNode;
  /** Affiché en petit en dev pour debug sans copier-coller depuis le navigateur */
  devHint?: string;
};

export function ErrorPageLayout({ title, children, devHint }: ErrorPageLayoutProps) {
  const showDev = process.env.NODE_ENV === "development" && devHint;

  return (
    <main style={shell}>
      <h1 style={{ margin: "0 0 12px", fontSize: "1.5rem" }}>{title}</h1>
      <div
        style={{
          margin: "0 0 20px",
          maxWidth: 460,
          color: "rgba(232,232,236,0.72)",
          fontSize: 15,
          lineHeight: 1.55,
        }}
      >
        {children}
      </div>
      {showDev ? (
        <pre
          style={{
            margin: "0 0 20px",
            maxWidth: 560,
            width: "100%",
            padding: 12,
            borderRadius: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fca5a5",
            fontSize: 11,
            textAlign: "left",
            overflow: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {devHint}
        </pre>
      ) : null}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {quickLinks.map(({ href, label }) => (
          <Link key={href} href={href} style={linkStyle}>
            {label}
          </Link>
        ))}
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "rgba(232,232,236,0.45)" }}>
        Mauvais port ? Vérifie le terminal : Next affiche l’URL exacte (3000, 3001…).
      </p>
    </main>
  );
}
