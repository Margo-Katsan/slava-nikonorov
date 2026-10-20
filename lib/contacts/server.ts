import "server-only";

import { CONTACT_DEFINITIONS, type ContactDraft } from "@/lib/contacts/config";
import { prisma } from "@/lib/prisma";

// Admin sees all five channels, including those that are not published yet.
export async function getContactDrafts(): Promise<ContactDraft[]> {
  const saved = await prisma.siteContact.findMany();
  const byId = new Map(saved.map((item) => [item.id, item]));
  return CONTACT_DEFINITIONS.map((def, index) => {
    const item = byId.get(def.id);
    return {
      id: def.id,
      url: item?.url ?? "",
      description: item?.description ?? def.defaultDescription,
      visible: item?.visible ?? false,
      sortOrder: item?.sortOrder ?? index * 10,
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getPublicContacts() {
  const records = await prisma.siteContact.findMany({
    where: { visible: true, NOT: { url: "" } },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  const lookup = new Map(CONTACT_DEFINITIONS.map((item) => [item.id, item] as const));
  return records.flatMap((item) => {
    const def = lookup.get(item.id as (typeof CONTACT_DEFINITIONS)[number]["id"]);
    if (!def) return [];
    return [
      {
        id: def.id,
        title: def.title,
        icon: def.icon,
        url: item.url,
        description: item.description || def.defaultDescription,
      },
    ];
  });
}
