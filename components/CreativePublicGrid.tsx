import { WritingPublicBoard } from "@/components/WritingPublicBoard";

import { getPublishedCreativeItems } from "@/lib/creative/public";
import { UNTITLED_CREATIVE } from "@/lib/creative/sections";
import { CREATIVE_SECTIONS, type CreativeSlug } from "@/lib/creative/sections";

// Optional component: add it to your own public section/page after reviewing its layout.
export async function CreativePublicGrid({ slug }: { slug: CreativeSlug }) {
  const items = await getPublishedCreativeItems(slug);
  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-8 lg:px-14">
      <h2 className="mb-8 font-serif text-4xl text-site-cream">{CREATIVE_SECTIONS[slug].label}</h2>
      {slug === "writing" ? (
        <WritingPublicBoard
          items={items.map(({ id, title, categoryTag, body }) => ({
            id,
            title,
            categoryTag,
            body,
          }))}
        />
      ) : items.length === 0 ? (
        <p className="text-site-muted">Незабаром тут з'являться роботи.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-site-border/50 bg-[#281d19]"
            >
              {item.mediaAsset?.resourceType === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.mediaAsset.url}
                  alt={item.title === UNTITLED_CREATIVE ? "Творча робота" : item.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              )}
              <div className="space-y-3 p-5">
                {item.title !== UNTITLED_CREATIVE && (
                  <h3 className="font-serif text-2xl text-site-cream">{item.title}</h3>
                )}
                {item.subtitle && <p className="text-sm text-site-muted">{item.subtitle}</p>}
                {item.description && (
                  <p className="text-sm leading-7 whitespace-pre-wrap text-site-muted">
                    {item.description}
                  </p>
                )}
                {item.linkUrl && (
                  <a
                    href={item.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-site-accent hover:underline"
                  >
                    Переглянути ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
