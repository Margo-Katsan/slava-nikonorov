// Safe to import from both Server and Client Components.
export const INTRO_HEAD_COUNT = 11;
// Radii in the 420 x 550 game world. Level 11 is still small enough to fit.
export const INTRO_HEAD_RADII = [13, 17, 21, 26, 32, 40, 49, 60, 73, 88, 103] as const;
export const INTRO_HEAD_FALLBACK = [
  "/images/hero-faces/face-01.png",
  "/images/hero-faces/face-02.png",
  "/images/hero-faces/face-03.png",
  "/images/hero-faces/face-04.png",
  "/images/hero-faces/face-05.png",
  "/images/hero-faces/face-06.png",
  "/images/hero-faces/face-07.png",
  "/images/hero-faces/face-08.png",
  "/images/hero-faces/face-09.png",
  "/images/hero-faces/face-10.png",
  "/images/hero-faces/face-11.png",
] as const;

export type IntroHead = {
  level: number;
  mediaAssetId: string;
  url: string;
};

export type IntroPublicConfig = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  accent: string;
  description: string;
  tagline: string;
  skipLabel: string;
  siteHref: string;
  autoModeDefault: boolean;
  autoIntervalMs: number;
  heads: IntroHead[];
  updatedAt: string | null;
};

export const DEFAULT_INTRO: IntroPublicConfig = {
  enabled: true,
  eyebrow: "Обережно! Далі — сайт Ніконорова",
  heading: "Гра в",
  accent: "голови",
  description:
    "Тут кожен образ має значення. Кидай мої голови в контейнер: дві однакові зливаються в одну більшу. І так, поки головам не стане затісно.",
  tagline: "Я покажу, наскільки глибока ротова нора…",
  skipLabel: "Пропустити вступ",
  siteHref: "/home",
  autoModeDefault: false,
  autoIntervalMs: 1250,
  heads: INTRO_HEAD_FALLBACK.map((url, level) => ({ level, mediaAssetId: "", url })),
  updatedAt: null,
};
