import { unstable_noStore as noStore } from "next/cache";
import "server-only";

import { prisma } from "@/lib/prisma";

export const BIO_ID = "home";

export const FALLBACK_BIO = {
  heading: "Трохи про",
  accent: "мене",
  lead: "Мені цікаво приміряти різні ролі, розповідати історії та шукати незвичайне у звичайному.",
  description:
    "Кіно, театр, власні відеороботи, малюнки й тексти — різні способи побачити світ і поділитися ним. Тут поступово з'являтимуться історії, роботи, спогади та інші цікаві речі.",
  fullBio: "Тут з’явиться моя розгорнута біографія. Далі буде...",
} as const;

export const FALLBACK_FRAMES = [
  {
    slot: 0,
    title: "ТЕАТР",
    subtitle: "Сцена, ролі, пластика",
    position: "center",
    url: "/images/stage.jpg",
  },
  {
    slot: 1,
    title: "ОБРАЗИ",
    subtitle: "Характери, перевтілення",
    position: "center 18%",
    url: "/images/costume.jpg",
  },
  {
    slot: 2,
    title: "КІНО",
    subtitle: "Кадр, епізоди, камера",
    position: "center 35%",
    url: "/images/comic.jpg",
  },
] as const;

export type BioFrameDTO = {
  slot: number;
  title: string;
  subtitle: string;
  position: string;
  mediaAssetId: string;
  url: string;
};

export async function getBioProfile() {
  // Always read the latest published biography on server-rendered pages.
  noStore();
  const record = await prisma.bioProfile.findUnique({
    where: { id: BIO_ID },
    include: {
      frames: {
        orderBy: { slot: "asc" },
        include: { mediaAsset: { select: { id: true, url: true, resourceType: true } } },
      },
    },
  });

  const savedFrames = new Map((record?.frames ?? []).map((frame) => [frame.slot, frame] as const));
  const frames: BioFrameDTO[] = FALLBACK_FRAMES.map((fallback) => {
    const saved = savedFrames.get(fallback.slot);
    const media = saved?.mediaAsset?.resourceType === "image" ? saved.mediaAsset : null;
    return {
      slot: fallback.slot,
      title: saved?.title ?? fallback.title,
      subtitle: saved?.subtitle ?? fallback.subtitle,
      position: saved?.position ?? fallback.position,
      mediaAssetId: media?.id ?? "",
      url: media?.url ?? fallback.url,
    };
  });

  return {
    heading: record?.heading ?? FALLBACK_BIO.heading,
    accent: record?.accent ?? FALLBACK_BIO.accent,
    lead: record?.lead ?? FALLBACK_BIO.lead,
    description: record?.description ?? FALLBACK_BIO.description,
    fullBio: record?.fullBio ?? FALLBACK_BIO.fullBio,
    frames,
    updatedAt: record?.updatedAt?.toISOString() ?? null,
  };
}
