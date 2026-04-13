import LibraryHome from "../components/LibraryHome";

/** Bibliothèque — page statique (pas de getServerSideProps) pour un rafraîchissement fiable sur `/`. */
export default function Home() {
  return <LibraryHome />;
}
