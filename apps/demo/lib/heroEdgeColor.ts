export type Rgb = { r: number; g: number; b: number };

export const HERO_BG_SRC = "/fond-bg.jpg";

/** Slides hero empilées (page expérience) au-dessus du hero principal. */
export const HERO_BG_1_SRC = "/fond-bg1.jpg";
export const HERO_BG_2_SRC = "/fond-bg2.jpg";

/** Moyenne RGB de la dernière rangée de pixels. */
export function sampleBottomRowRgb(src: string): Promise<Rgb> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const w = Math.min(480, img.naturalWidth || img.width);
        const h = Math.max(1, Math.round(((img.naturalHeight || img.height) / (img.naturalWidth || img.width)) * w));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          reject(new Error("2d context"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, h - 1, w, 1);
        let r = 0;
        let g = 0;
        let b = 0;
        const n = w;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        resolve({
          r: Math.round(r / n),
          g: Math.round(g / n),
          b: Math.round(b / n),
        });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("image load"));
    img.src = src;
  });
}

export function darkenRgb(r: number, g: number, b: number, factor: number): Rgb {
  return {
    r: Math.max(0, Math.min(255, Math.round(r * factor))),
    g: Math.max(0, Math.min(255, Math.round(g * factor))),
    b: Math.max(0, Math.min(255, Math.round(b * factor))),
  };
}

/** Fin du dégradé section 1 = début visuel de la section 2 */
export function heroLowerSeal(base: Rgb): Rgb {
  return darkenRgb(base.r, base.g, base.b, 0.36);
}

export function buildHeroOverlayGradient(base: Rgb): string {
  const d = heroLowerSeal(base);
  const mid = darkenRgb(base.r, base.g, base.b, 0.62);
  return `linear-gradient(180deg, rgba(12, 14, 20, 0.28) 0%, rgba(12, 14, 20, 0.08) 38%, rgba(${base.r}, ${base.g}, ${base.b}, 0.35) 72%, rgba(${mid.r}, ${mid.g}, ${mid.b}, 0.82) 88%, rgb(${d.r}, ${d.g}, ${d.b}) 100%)`;
}

export const FALLBACK_HERO_OVERLAY =
  "linear-gradient(180deg, rgba(12,14,18,0.32) 0%, rgba(12,14,18,0.12) 45%, rgba(12,14,18,0.52) 100%)";

/** Section 2 & 4 (même logique) */
export function buildSectionTwoGradient(base: Rgb | null): string {
  if (!base) {
    return "linear-gradient(180deg, #1e2229 0%, #12151c 45%, #0a0c10 100%)";
  }
  const top = heroLowerSeal(base);
  const mid = darkenRgb(base.r, base.g, base.b, 0.22);
  const deep = darkenRgb(base.r, base.g, base.b, 0.12);
  return `linear-gradient(180deg, rgb(${top.r},${top.g},${top.b}) 0%, rgb(${mid.r},${mid.g},${mid.b}) 48%, rgb(${deep.r},${deep.g},${deep.b}) 100%)`;
}

/** Section 3 : suite plus sombre après la 2 */
export function buildSectionThreeGradient(base: Rgb | null): string {
  if (!base) {
    return "linear-gradient(180deg, #0a0c10 0%, #030405 100%)";
  }
  const top = darkenRgb(base.r, base.g, base.b, 0.12);
  const bot = darkenRgb(base.r, base.g, base.b, 0.05);
  return `linear-gradient(180deg, rgb(${top.r},${top.g},${top.b}) 0%, rgb(${bot.r},${bot.g},${bot.b}) 100%)`;
}
