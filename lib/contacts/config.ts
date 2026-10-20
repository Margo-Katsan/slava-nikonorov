// Public/shared data only: do not import Prisma or auth into this module.
export const CONTACT_DEFINITIONS = [
  {
    id: "telegram",
    title: "Telegram",
    icon: "/icons/social/telegram.png",
    defaultDescription: "Написати напряму",
  },
  {
    id: "instagram",
    title: "Instagram",
    icon: "/icons/social/instagram.png",
    defaultDescription: "Моменти та закулісся",
  },
  {
    id: "youtube",
    title: "YouTube",
    icon: "/icons/social/youtube.png",
    defaultDescription: "Відео та роботи",
  },
  {
    id: "email",
    title: "Email",
    icon: "/icons/social/email.png",
    defaultDescription: "Для пропозицій",
  },
  {
    id: "facebook",
    title: "Facebook",
    icon: "/icons/social/facebook.png",
    defaultDescription: "Бути на зв'язку",
  },
] as const;

export type ContactId = (typeof CONTACT_DEFINITIONS)[number]["id"];
export type ContactDraft = {
  id: ContactId;
  url: string;
  description: string;
  visible: boolean;
  sortOrder: number;
};

export const CONTACT_IDS = CONTACT_DEFINITIONS.map((c) => c.id);

export function getContactDefinition(id: ContactId) {
  return CONTACT_DEFINITIONS.find((c) => c.id === id)!;
}
