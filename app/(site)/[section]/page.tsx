import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MediaGrid } from "@/components/MediaGrid";

import { getSection, sections } from "@/lib/content";

export function generateStaticParams() {
  return sections.map((s) => ({ section: s.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const s = getSection(section);
  return { title: s?.title || "Розділ" };
}
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: slug } = await params;
  const section = getSection(slug);
  if (!section) notFound();
  return (
    <main className="section-page wrap">
      <header className="section-heading">
        <span className="eyebrow">ТВОРЧИЙ АРХІВ / {section.subtitle}</span>
        <h1>{section.title}</h1>
        <p>{section.description}</p>
      </header>
      <MediaGrid section={section} />
    </main>
  );
}
