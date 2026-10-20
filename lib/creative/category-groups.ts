/**
 * Public category definitions. Keep these tags in sync with admin selects.
 * These describe the group of a work, not its genre/technique.
 */
export const CREATIVE_CATEGORY_OPTIONS = {
  cinema: ["Шоуріл", "Візитка", "Епізоди"],
  painting: ["Дитячі", "Недитячі"],
  gallery: ["Я в кадрі · дитячі", "Я в кадрі · недитячі", "Я в кадрі · в образі", "Я за камерою"],
} as const;

export type CategorizedAdminSlug = keyof typeof CREATIVE_CATEGORY_OPTIONS;

export const PUBLIC_GROUP_LABELS = {
  kino: ["ШОУРІЛ", "ВІЗИТКА", "ЕПІЗОДИ"],
  teatr: ["ВИСТАВИ"],
  "moie-kino": ["РЕЖИСЕРСЬКІ РОБОТИ"],
  "ya-malyuyu": ["ДИТЯЧІ МАЛЮНКИ", "НЕДИТЯЧІ МАЛЮНКИ"],
  "ya-pyshu": ["ЕСЕ", "ВІРШІ", "ІНШЕ"],
  fotogalereya: [
    "Я В КАДРІ · ДИТЯЧІ",
    "Я В КАДРІ · НЕДИТЯЧІ",
    "Я В КАДРІ · В ОБРАЗІ",
    "Я ЗА КАМЕРОЮ",
  ],
} as const;

export type PublicCreativeSlug = keyof typeof PUBLIC_GROUP_LABELS;

function normalize(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("uk")
    .replace(/[·•]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Returns null for legacy/unknown category tags. No card is ever discarded. */
export function categoryGroupIndex(
  slug: PublicCreativeSlug,
  categoryTag: string | null | undefined,
): number | null {
  if (slug === "teatr" || slug === "moie-kino") return 0;

  const tag = normalize(categoryTag);
  if (slug === "ya-pyshu") {
    if (tag === "есе" || tag === "эссе" || tag === "essay") return 0;
    if (["вірш", "вірші", "стих", "стихи", "poem"].includes(tag)) return 1;
    // Includes custom types such as "Оповідання", "Щоденник", "Гумор".
    return 2;
  }

  if (!tag) return null;
  if (slug === "kino") {
    if (["шоуріл", "шоурил", "showreel"].includes(tag)) return 0;
    if (["візитка", "визитка"].includes(tag)) return 1;
    if (["епізод", "епізоди", "эпизод", "эпизоды"].includes(tag)) return 2;
    return null;
  }
  if (slug === "ya-malyuyu") {
    if (["дитячі", "дитячий", "дитяче"].includes(tag)) return 0;
    if (["недитячі", "недитяче", "дорослі", "доросле"].includes(tag)) return 1;
    return null;
  }
  if (slug === "fotogalereya") {
    const accepted = CREATIVE_CATEGORY_OPTIONS.gallery.map(normalize);
    const exact = accepted.indexOf(tag);
    if (exact !== -1) return exact;
    if (["дитячі", "я в кадрі дитячі"].includes(tag)) return 0;
    if (["недитячі", "я в кадрі недитячі"].includes(tag)) return 1;
    if (["в образі", "образ", "я в кадрі в образі"].includes(tag)) return 2;
    if (["за камерою", "я за камерою"].includes(tag)) return 3;
    return null;
  }
  return null;
}
