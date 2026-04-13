import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { ErrorPageLayout } from "./ErrorPageLayout";

type Props = { children: ReactNode };

type State = { error: Error | null; errorInfo: ErrorInfo | null };

/**
 * Attrape les erreurs React côté client (render, lifecycle, enfants).
 * Les erreurs SSR passent par pages/_error.tsx.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    if (process.env.NODE_ENV === "development") {
      console.error("[AppErrorBoundary]", error, errorInfo);
    }
  }

  render() {
    const { error, errorInfo } = this.state;
    if (!error) return this.props.children;

    const devHint =
      process.env.NODE_ENV === "development"
        ? `${error.name}: ${error.message}${errorInfo?.componentStack ? `\n${errorInfo.componentStack}` : ""}`
        : undefined;

    return (
      <ErrorPageLayout title="Erreur — cette page a planté" devHint={devHint}>
        <p style={{ margin: "0 0 12px" }}>
          Une erreur React s’est produite dans l’interface. Tu peux recharger la page ou
          repartir sur l’accueil.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8,
            padding: "10px 18px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#e8e8ec",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Recharger
        </button>
      </ErrorPageLayout>
    );
  }
}
