export const CREATIVE_SECTIONS = {
  cinema: {
    label: "Кіно",
    category: "CINEMA",
    intro: "Акторські роботи: фільми, серіали, ролі та епізоди.",
    itemName: "кінороботу",
    subtitleLabel: "Роль або підзаголовок",
    tagLabel: "Жанр / формат",
    bodyLabel: "Деталі про роль чи проєкт",
  },
  theatre: {
    label: "Театр",
    category: "THEATRE",
    intro: "Вистави, сцена, ролі та театральні історії.",
    itemName: "виставу",
    subtitleLabel: "Роль / театр",
    tagLabel: "Театр / жанр",
    bodyLabel: "Деталі вистави",
  },
  "my-cinema": {
    label: "Моє кіно",
    category: "MY_CINEMA",
    intro: "Власні фільми, режисерські роботи та експерименти.",
    itemName: "фільм",
    subtitleLabel: "Підзаголовок / формат",
    tagLabel: "Жанр",
    bodyLabel: "Історія створення / опис",
  },
  painting: {
    label: "Я малюю",
    category: "PAINTING",
    intro: "Малюнки, живопис та інші візуальні роботи.",
    itemName: "роботу",
    subtitleLabel: "Підзаголовок",
    tagLabel: "Техніка / матеріал",
    bodyLabel: "Історія роботи",
  },
  writing: {
    label: "Я пишу",
    category: "WRITING",
    intro: "Есе, вірші, вигадані світи та тексти.",
    itemName: "текст",
    subtitleLabel: "Підзаголовок",
    tagLabel: "Тип тексту",
    bodyLabel: "Повний текст",
  },
  gallery: {
    label: "Фотогалерея",
    category: "GALLERY",
    intro: "Фотографії, кадри, портрети та спогади.",
    itemName: "фотографію",
    subtitleLabel: "Підпис до фото",
    tagLabel: "Альбом / тема",
    bodyLabel: "Примітки",
  },
} as const;

export type CreativeSlug = keyof typeof CREATIVE_SECTIONS;
export type CreativeCategory = (typeof CREATIVE_SECTIONS)[CreativeSlug]["category"];

export const CREATIVE_SLUGS = Object.keys(CREATIVE_SECTIONS) as CreativeSlug[];
export function isCreativeSlug(slug: string): slug is CreativeSlug {
  return Object.prototype.hasOwnProperty.call(CREATIVE_SECTIONS, slug);
}
export function categoryForSlug(slug: CreativeSlug): CreativeCategory {
  return CREATIVE_SECTIONS[slug].category;
}

export type CreativeMedia = {
  id: string;
  title: string;
  url: string;
  resourceType: string;
  category: string;
};

export const UNTITLED_CREATIVE = "Без назви";

export type CreativeItemUI = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  body: string | null;
  year: number | null;
  categoryTag: string | null;
  linkUrl: string | null;
  mediaAssetId: string | null;
  mediaAsset: CreativeMedia | null;
  published: boolean;
  sortOrder: number;
};
