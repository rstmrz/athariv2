"use client";

import { useEffect } from "react";
import Router from "next/router";

const CHUNK_RELOAD_KEY = "demo_chunk_reload_attempted";

function looksLikeChunkFailure(msg: string) {
  const m = msg.toLowerCase();
  return (
    m.includes("chunkloaderror") ||
    m.includes("loading chunk") ||
    m.includes("failed to fetch dynamically imported module") ||
    m.includes("importing a module script failed") ||
    m.includes("failed to load module script") ||
    m.includes("error loading dynamically imported module")
  );
}

function reloadOnceForChunkFailure() {
  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1") return;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
  } catch {
    /* private mode */
  }
  window.location.reload();
}

/**
 * Recharge une fois si un chunk JS n’a pas pu se charger (souvent après un changement de code
 * pendant que le serveur tournait) — évite l’écran blanc sans message.
 * Une seule tentative par onglet (sessionStorage) pour éviter une boucle de reload.
 */
export function ClientChunkGuard() {
  useEffect(() => {
    const clearReloadFlag = window.setTimeout(() => {
      try {
        sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      } catch {
        /* ignore */
      }
    }, 2500);

    const onWindowError = (ev: ErrorEvent) => {
      const msg = String(ev.message ?? "");
      if (looksLikeChunkFailure(msg)) {
        reloadOnceForChunkFailure();
      }
    };
    const onRejection = (ev: PromiseRejectionEvent) => {
      const reason = ev.reason;
      const msg =
        typeof reason === "object" && reason !== null && "message" in reason
          ? String((reason as Error).message)
          : String(reason);
      if (looksLikeChunkFailure(msg)) {
        reloadOnceForChunkFailure();
      }
    };
    const onRouteChangeError = (err: Error) => {
      const msg = err?.message ?? "";
      if (looksLikeChunkFailure(msg)) {
        reloadOnceForChunkFailure();
      }
    };

    window.addEventListener("error", onWindowError);
    window.addEventListener("unhandledrejection", onRejection);
    Router.events.on("routeChangeError", onRouteChangeError);
    return () => {
      window.clearTimeout(clearReloadFlag);
      window.removeEventListener("error", onWindowError);
      window.removeEventListener("unhandledrejection", onRejection);
      Router.events.off("routeChangeError", onRouteChangeError);
    };
  }, []);

  return null;
}
