import { redirect } from "next/navigation";

import { CreativeSectionManager } from "@/components/admin/CreativeSectionManager";

import { getMediaAdmin } from "@/lib/admin/media-access";
import { CREATIVE_SECTIONS, type CreativeSlug } from "@/lib/creative/sections";
import { prisma } from "@/lib/prisma";

export async function CreativeAdminPage({ slug }: { slug: CreativeSlug }) {
  if (!(await getMediaAdmin())) redirect("/login");
  const section = CREATIVE_SECTIONS[slug];
  const [items, media] = await Promise.all([
    prisma.creativeItem.findMany({
      where: { section: section.category },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        mediaAsset: {
          select: { id: true, title: true, url: true, resourceType: true, category: true },
        },
      },
    }),
    prisma.mediaAsset.findMany({
      // First 500 media records; upload new assets via /admin/media.
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { id: true, title: true, url: true, resourceType: true, category: true },
    }),
  ]);

  return (
    <section className="space-y-8">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.22em] text-[#31a88f] uppercase">
          Моя творчість / Керування матеріалами
        </p>
        <h1 className="mt-4 font-serif text-4xl text-[#efdfcd] sm:text-5xl">{section.label}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#b49c8e]">{section.intro}</p>
      </header>
      <CreativeSectionManager
        key={slug}
        slug={slug}
        initialItems={items.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          description: item.description,
          body: item.body,
          year: item.year,
          categoryTag: item.categoryTag,
          linkUrl: item.linkUrl,
          mediaAssetId: item.mediaAssetId,
          mediaAsset: item.mediaAsset,
          published: item.published,
          sortOrder: item.sortOrder,
        }))}
        media={media}
      />
    </section>
  );
}
