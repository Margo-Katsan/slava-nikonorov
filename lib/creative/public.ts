import "server-only";

import { CREATIVE_SECTIONS, type CreativeSlug } from "@/lib/creative/sections";
import { prisma } from "@/lib/prisma";

// Use this query in existing public pages, so the same drag order is visible on the site.
export async function getPublishedCreativeItems(slug: CreativeSlug) {
  return prisma.creativeItem.findMany({
    where: { section: CREATIVE_SECTIONS[slug].category, published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { mediaAsset: { select: { id: true, url: true, title: true, resourceType: true } } },
  });
}
