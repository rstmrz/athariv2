import type { NextPageContext } from "next";
import { ErrorPageLayout } from "../components/ErrorPageLayout";

type ErrorPageProps = {
  statusCode?: number;
  /** Renseigné côté serveur quand err est passé à getInitialProps */
  message?: string;
};

/**
 * Erreurs Next (500, erreur pendant getServerSideProps, etc.) et fallback
 * quand aucune page ne correspond (selon contexte Next).
 * Les 404 « normales » utilisent surtout pages/404.tsx.
 */
function ErrorPage({ statusCode, message }: ErrorPageProps) {
  const code = statusCode ?? "—";
  const devHint =
    process.env.NODE_ENV === "development" && message
      ? `statusCode: ${statusCode}\n${message}`
      : process.env.NODE_ENV === "development"
        ? `statusCode: ${statusCode}`
        : undefined;

  const isServerSide = typeof statusCode === "number" && statusCode >= 500;

  return (
    <ErrorPageLayout
      title={`Erreur ${code}`}
      devHint={devHint}
    >
      <p style={{ margin: "0 0 8px" }}>
        {isServerSide
          ? "Le serveur n’a pas pu répondre correctement pour cette requête."
          : typeof statusCode === "number" && statusCode === 404
            ? "Ressource introuvable."
            : "Quelque chose s’est mal passé."}
      </p>
      <p style={{ margin: 0, fontSize: 14, color: "rgba(232,232,236,0.6)" }}>
        Si tu viens d’ajouter une route, redémarre le serveur de dev. Vérifie aussi que tu es
        sur le bon port (voir le terminal).
      </p>
    </ErrorPageLayout>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res
    ? res.statusCode
    : err
      ? (err as { statusCode?: number }).statusCode || 500
      : 404;

  const message = err?.message;

  return { statusCode, message };
};

export default ErrorPage;
