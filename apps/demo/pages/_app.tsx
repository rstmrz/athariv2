import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ClientChunkGuard } from '../components/ClientChunkGuard';
import { DemoTopNav } from '../components/DemoTopNav';
import { RouterKeyedErrorBoundary } from '../components/RouterKeyedErrorBoundary';

/** Rappel discret en dev uniquement (les liens sont dans la barre du haut). */
function DevHint() {
  if (process.env.NODE_ENV !== 'development') return null;
  return (
    <div
      className="demo-dev-hint"
      aria-hidden
    >
      dev — port dans le terminal (3000, 3001…)
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Hors boundary : reste cliquable même si la page plante */}
      <DemoTopNav />
      <ClientChunkGuard />
      <RouterKeyedErrorBoundary>
        <DevHint />
        <Component {...pageProps} />
      </RouterKeyedErrorBoundary>
    </>
  );
}
