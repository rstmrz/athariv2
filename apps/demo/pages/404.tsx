import { ErrorPageLayout } from "../components/ErrorPageLayout";

export default function NotFoundPage() {
  return (
    <ErrorPageLayout title="404 — page introuvable">
      <p style={{ margin: "0 0 8px" }}>
        Cette URL n’existe pas dans l’app démo. Cause fréquente : tu es sur le{" "}
        <strong>mauvais port</strong> (un autre programme sur 3000 renvoie 404 alors que Next
        tourne sur <strong>3001</strong> — regarde l’URL dans le terminal).
      </p>
      <p style={{ margin: 0, fontSize: 14, color: "rgba(232,232,236,0.55)" }}>
        Lance <code style={{ color: "#a5c8ff" }}>npm run dev</code> depuis la racine du repo ou{" "}
        <code style={{ color: "#a5c8ff" }}>apps/demo</code> et ouvre exactement l’URL affichée.
      </p>
    </ErrorPageLayout>
  );
}
