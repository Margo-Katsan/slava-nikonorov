export type SectionKey =
  "kino" | "teatr" | "moie-kino" | "ya-malyuyu" | "ya-pyshu" | "fotogalereya";
export type Item = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  video?: string;
  category?: string;
};
export type Section = {
  slug: SectionKey;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  groups: { title: string; items: Item[] }[];
};
const demoImage = "/images/stage.jpg";
const video = (prefix: string, n: number, category?: string): Item => ({
  id: `${prefix}-${n}`,
  title: `${prefix === "episode" ? "Епізод" : prefix === "performance" ? "Вистава" : "Робота"} ${String(n).padStart(2, "0")}`,
  description: "Демо-картка — замініть назву, обкладинку та URL у lib/content.ts",
  image: demoImage,
  category,
});
export const sections: Section[] = [
  {
    slug: "kino",
    title: "КІНО",
    subtitle: "Шоуріл, візитка, епізоди",
    description: "Мої ролі у кіно, телевізійних проєктах та найцікавіші епізоди.",
    icon: "film",
    groups: [
      {
        title: "ШОУРІЛ І ВІЗИТКА",
        items: [
          {
            id: "showreel",
            title: "ШОУРІЛ",
            image: demoImage,
            description: "Нарізка акторських робіт",
          },
          { id: "intro", title: "ВІЗИТКА", image: demoImage, description: "Знайомство з актором" },
        ],
      },
      { title: "ЕПІЗОДИ", items: Array.from({ length: 18 }, (_, i) => video("episode", i + 1)) },
    ],
  },
  {
    slug: "teatr",
    title: "ТЕАТР",
    subtitle: "Вистави, ролі, сценічне життя",
    description: "Вистави, персонажі, світлини зі сцени й історії закулісся.",
    icon: "masks",
    groups: [
      {
        title: "ВИСТАВИ",
        items: Array.from({ length: 20 }, (_, i) => ({
          ...video("performance", i + 1),
          category: "Спектакль",
          description: "Опис ролі, фото та матеріали вистави — додайте власні дані.",
        })),
      },
    ],
  },
  {
    slug: "moie-kino",
    title: "МОЄ КІНО",
    subtitle: "Режисура, ідеї, відеороботи",
    description: "Я також режисер. Тут будуть мої фільми, експерименти й історії їх створення.",
    icon: "clapper",
    groups: [
      {
        title: "РЕЖИСЕРСЬКІ РОБОТИ",
        items: Array.from({ length: 20 }, (_, i) => video("directing", i + 1)),
      },
    ],
  },
  {
    slug: "ya-malyuyu",
    title: "Я МАЛЮЮ",
    subtitle: "Дитячі та дорослі малюнки",
    description: "Малюнки, ескізи, фантазії та інші світи.",
    icon: "palette",
    groups: [
      {
        title: "ДИТЯЧІ МАЛЮНКИ",
        items: Array.from({ length: 8 }, (_, i) => ({
          id: `kid-${i}`,
          title: `Малюнок ${i + 1}`,
          category: "Дитячі",
        })),
      },
      {
        title: "НЕДИТЯЧІ МАЛЮНКИ",
        items: Array.from({ length: 8 }, (_, i) => ({
          id: `adult-${i}`,
          title: `Робота ${i + 1}`,
          category: "Недитячі",
        })),
      },
    ],
  },
  {
    slug: "ya-pyshu",
    title: "Я ПИШУ",
    subtitle: "Вірші, есе, поезія",
    description: "Українські вірші, есе, історії й посилання на поетичний канал.",
    icon: "book",
    groups: [
      {
        title: "ВІРШІ",
        items: Array.from({ length: 5 }, (_, i) => ({
          id: `poem-${i}`,
          title: `Вірш ${i + 1}`,
          description: "Тут з’явиться повний текст вірша. Замініть його у файлі з даними.",
        })),
      },
      {
        title: "ЕСЕ",
        items: Array.from({ length: 4 }, (_, i) => ({
          id: `essay-${i}`,
          title: `Есе ${i + 1}`,
          description: "Тут з’явиться текст есе. Картинка збільшиться, а текст відкриється поверх.",
        })),
      },
    ],
  },
  {
    slug: "fotogalereya",
    title: "ФОТОГАЛЕРЕЯ",
    subtitle: "У кадрі й за камерою",
    description: "Світлини ролей, дитячі фото, портрети та фотографії, зроблені мною.",
    icon: "camera",
    groups: [
      {
        title: "Я В КАДРІ · ДИТЯЧІ",
        items: Array.from({ length: 8 }, (_, i) => ({
          id: `child-${i}`,
          title: `Дитяче фото ${i + 1}`,
          image: "/images/comic.jpg",
        })),
      },
      {
        title: "Я В КАДРІ · НЕДИТЯЧІ",
        items: Array.from({ length: 8 }, (_, i) => ({
          id: `adult-photo-${i}`,
          title: `Фото ${i + 1}`,
          image: "/images/portrait.png",
        })),
      },
      {
        title: "Я В КАДРІ · В ОБРАЗІ",
        items: Array.from({ length: 8 }, (_, i) => ({
          id: `role-${i}`,
          title: `Образ ${i + 1}`,
          image: "/images/costume.jpg",
        })),
      },
      {
        title: "Я ЗА КАМЕРОЮ",
        items: Array.from({ length: 24 }, (_, i) => ({
          id: `behind-${i}`,
          title: `Моя світлина ${i + 1}`,
        })),
      },
    ],
  },
];
export function getSection(slug: string) {
  return sections.find((s) => s.slug === slug);
}
