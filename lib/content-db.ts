import "server-only";

import { type Item, type Section, type SectionKey, getSection } from "@/lib/content";
import { PUBLIC_GROUP_LABELS, categoryGroupIndex } from "@/lib/creative/category-groups";
import { getPublishedCreativeItems } from "@/lib/creative/public";
import { plainTextFromStored } from "@/lib/creative/rich-text";
import type { CreativeSlug } from "@/lib/creative/sections";

const sectionMap: Record<SectionKey, CreativeSlug> = {
  kino: "cinema",
  teatr: "theatre",
  "moie-kino": "my-cinema",
  "ya-malyuyu": "painting",
  "ya-pyshu": "writing",
  fotogalereya: "gallery",
};

export async function getSectionFromDb(slug: string): Promise<Section | undefined> {
  const staticSection = getSection(slug);
  if (!staticSection) return undefined;

  const key = staticSection.slug;
  const records = await getPublishedCreativeItems(sectionMap[key]);
  const labels = PUBLIC_GROUP_LABELS[key];

  // Keep every category visible, even if no works have been published in it yet.
  const groups: Section["groups"] = labels.map((title) => ({
    title,
    items: [],
  }));
  const unassigned: Item[] = [];

  for (const record of records) {
    const item: Item = {
      id: record.id,
      title: record.title === "Без назви" ? "" : record.title,
      description:
        key === "ya-pyshu"
          ? plainTextFromStored(record.body)
          : (record.description ?? record.subtitle ?? undefined),
      image: record.mediaAsset?.resourceType === "image" ? record.mediaAsset.url : undefined,
      video: record.linkUrl ?? undefined,
      category: record.categoryTag ?? undefined,
    };

    const groupIndex = categoryGroupIndex(key, record.categoryTag);
    if (groupIndex === null) {
      // Legacy records may have "genre" or "painting technique" instead
      // of a category. Do not hide or silently misclassify them.
      unassigned.push(item);
    } else {
      groups[groupIndex].items.push(item);
    }
  }

  if (unassigned.length) {
    groups.push({ title: "БЕЗ КАТЕГОРІЇ", items: unassigned });
  }

  // Keep original subtitle, description and icon from lib/content.ts.
  return { ...staticSection, groups };
}
