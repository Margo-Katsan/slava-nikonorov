export const MEDIA_CATEGORIES = [
  { value: "HEADS", label: "Голови для гри" },
  { value: "CINEMA", label: "Кіно" },
  { value: "THEATRE", label: "Театр" },
  { value: "MY_CINEMA", label: "Моє кіно" },
  { value: "PAINTING", label: "Я малюю" },
  { value: "WRITING", label: "Я пишу" },
  { value: "GALLERY", label: "Фотогалерея" },
  { value: "OTHER", label: "Інше" },
] as const;

export type MediaCategory = (typeof MEDIA_CATEGORIES)[number]["value"];
export type MediaKind = "image" | "video";

export function isMediaCategory(value: unknown): value is MediaCategory {
  return MEDIA_CATEGORIES.some((item) => item.value === value);
}

export function categoryLabel(value: string): string {
  return MEDIA_CATEGORIES.find((item) => item.value === value)?.label ?? value;
}

export const MEDIA_MAX_BYTES = {
  image: 15 * 1024 * 1024,
  video: 80 * 1024 * 1024,
} as const;

export const MEDIA_FORMATS = {
  image: ["jpg", "png", "webp", "gif", "avif"],
  video: ["mp4", "mov", "webm"],
} as const;
