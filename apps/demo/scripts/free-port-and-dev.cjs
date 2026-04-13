/**
 * Libère le port (souvent un vieux Node qui laisse une autre app ou un cache HS),
 * puis lance Next. À n’exécuter qu’une fois : un seul terminal `npm run dev`.
 */
const { spawn, execSync } = require("child_process");
const path = require("path");

const PORT = process.env.PORT || "3000";
const root = path.join(__dirname, "..");

process.env.NEXT_IGNORE_INCORRECT_LOCKFILE = "1";

console.log(
  `\n[demo dev] Port ${PORT} : arrêt des anciens processus d’écoute (si besoin)…`
);

function freePortWin(p) {
  try {
    execSync(
      `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${p} -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`,
      { stdio: "ignore" }
    );
  } catch {
    /* aucun listener ou accès refusé */
  }
}

function freePortUnix(p) {
  try {
    execSync(`lsof -ti:${p} | xargs kill -9 2>/dev/null`, {
      shell: true,
      stdio: "ignore",
    });
  } catch {
    /* rien à tuer */
  }
}

if (process.platform === "win32") freePortWin(PORT);
else freePortUnix(PORT);

console.log(
  `[demo dev] Démarrage Next.js sur http://localhost:${PORT}\n` +
    `           Expérience visuelle : http://localhost:${PORT}/experience  (/gallery → redirect)\n` +
    `           (un seul terminal dev — fermer les autres npm run dev.)\n`
);

const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextCli, "dev", "-p", PORT], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
