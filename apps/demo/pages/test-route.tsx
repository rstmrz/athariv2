/**
 * Page minimale : si tu vois le bandeau vert, Next répond bien sur cette URL.
 */
export default function TestRoutePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        margin: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#14532d",
        color: "#ecfdf5",
        fontFamily: "system-ui, sans-serif",
        padding: 24,
        textAlign: "center",
      }}
    >
      <h1 style={{ margin: "0 0 12px", fontSize: "1.75rem" }}>Route OK</h1>
      <p style={{ margin: 0, maxWidth: 420, lineHeight: 1.5 }}>
        Si tu lis ça, le serveur Next et l’URL sont bons. Utilise la barre du haut
        pour <strong>/experience</strong> (expérience visuelle) ou la{" "}
        <strong>bibliothèque</strong>.
      </p>
    </main>
  );
}
