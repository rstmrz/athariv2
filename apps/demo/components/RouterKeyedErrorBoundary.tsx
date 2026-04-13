"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/router";
import { AppErrorBoundary } from "./AppErrorBoundary";

/**
 * Remonte un nouveau AppErrorBoundary à chaque **pathname** (sans query) : une erreur sur
 * `/experience` ne colle pas quand tu reviens sur `/`.
 *
 * On évite `asPath` : avec redirects / hydratation, il peut différer du serveur au client
 * et forcer un remount + écran blanc.
 */
export function RouterKeyedErrorBoundary({ children }: { children: ReactNode }) {
  const router = useRouter();
  const key = router.pathname || "/";

  return <AppErrorBoundary key={key}>{children}</AppErrorBoundary>;
}
