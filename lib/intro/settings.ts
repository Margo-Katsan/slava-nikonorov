import { unstable_noStore as noStore } from "next/cache";
import "server-only";

import { DEFAULT_INTRO, INTRO_HEAD_COUNT, type IntroPublicConfig } from "@/lib/intro/types";
import { prisma } from "@/lib/prisma";

export const INTRO_ID = "home";

export async function getIntroConfig(): Promise<IntroPublicConfig> {
  noStore();
  const record = await prisma.introGameSettings.findUnique({
    where: { id: INTRO_ID },
    include: {
      heads: {
        orderBy: { level: "asc" },
        include: {
          mediaAsset: { select: { id: true, url: true, resourceType: true } },
        },
      },
    },
  });

  const byLevel = new Map((record?.heads ?? []).map((head) => [head.level, head] as const));
  const heads = Array.from({ length: INTRO_HEAD_COUNT }, (_, level) => {
    const asset = byLevel.get(level)?.mediaAsset;
    const valid = asset?.resourceType === "image";
    return {
      level,
      mediaAssetId: valid ? asset.id : "",
      url: valid ? asset.url : DEFAULT_INTRO.heads[level].url,
    };
  });

  return {
    enabled: record?.enabled ?? DEFAULT_INTRO.enabled,
    eyebrow: record?.eyebrow ?? DEFAULT_INTRO.eyebrow,
    heading: record?.heading ?? DEFAULT_INTRO.heading,
    accent: record?.accent ?? DEFAULT_INTRO.accent,
    description: record?.description ?? DEFAULT_INTRO.description,
    tagline: record?.tagline ?? DEFAULT_INTRO.tagline,
    skipLabel: record?.skipLabel ?? DEFAULT_INTRO.skipLabel,
    siteHref: record?.siteHref ?? DEFAULT_INTRO.siteHref,
    autoModeDefault: record?.autoModeDefault ?? DEFAULT_INTRO.autoModeDefault,
    autoIntervalMs: record?.autoIntervalMs ?? DEFAULT_INTRO.autoIntervalMs,
    heads,
    updatedAt: record?.updatedAt?.toISOString() ?? null,
  };
}
