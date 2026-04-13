/**
 * Navigation sans useRouter ni Link : évite les plantages / hydratation liés au routeur
 * sur certaines configs (écran blanc sur /).
 */
export function DemoTopNav() {
  return (
    <nav className="demo-top-nav" aria-label="Navigation démo">
      <a href="/" className="demo-top-nav__link">
        Bibliothèque
      </a>
      <a href="/experience" className="demo-top-nav__link">
        Expérience visuelle
      </a>
      <a href="/landing#ai-gallery-arc" className="demo-top-nav__link">
        Sections divers
      </a>
    </nav>
  );
}
