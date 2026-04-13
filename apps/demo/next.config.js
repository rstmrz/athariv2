// Configuration de base pour Next.js (TypeScript)
const path = require("path");

/** Monorepo : file tracing seulement en build prod (évite des 500 bizarres sur `next dev` avec certains chemins Windows / cache). */
const isProdBuild = process.env.NODE_ENV === "production";
/** Sur Vercel, outputFileTracingRoot expérimental peut casser le build monorepo ; le déploiement inclut déjà tout le repo. */
const isVercel = process.env.VERCEL === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /** Monorepo / CI : évite des faux échecs si ESLint n’est pas configuré pareil partout. */
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["components"],
  async redirects() {
    return [
      { source: "/gallery", destination: "/experience", permanent: false },
      { source: "/hero-gallery", destination: "/experience", permanent: false },
      {
        source: "/",
        has: [{ type: "query", key: "view", value: "visual" }],
        destination: "/experience",
        permanent: false,
      },
    ];
  },
  experimental: {
    ...(isProdBuild && !isVercel
      ? { outputFileTracingRoot: path.join(__dirname, "../..") }
      : {}),
  },
};

module.exports = nextConfig;
