import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MediaGrid } from "@/components/MediaGrid";
import { WritingPublicBoard } from "@/components/WritingPublicBoard";

import { getSection } from "@/lib/content";
import { getSectionFromDb } from "@/lib/content-db";
import { getPublishedCreativeItems } from "@/lib/creative/public";

// Опубліковані матеріали мають оновлюватися після змін в адмінці.
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ section: string }>;
};

// Для метаданих достатньо статичної назви розділу.
// Не створюємо друге підключення до БД лише заради title/description.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { section: slug } = await params;
  const section = getSection(slug);

  return {
    title: section?.title ?? "Розділ",
    description: section?.description,
  };
}

export default async function SectionPage({ params }: PageProps) {
  const { section: slug } = await params;
  const staticSection = getSection(slug);
  if (!staticSection) notFound();

  // Тексти мають окремий компонент: він підтримує повне Tiptap-форматування.
  // Інші п'ять розділів продовжують використовувати існуючий MediaGrid.
  const isWriting = slug === "ya-pyshu";
  const [dbSection, writings] = await Promise.all([
    isWriting ? Promise.resolve(staticSection) : getSectionFromDb(slug),
    isWriting ? getPublishedCreativeItems("writing") : Promise.resolve(null),
  ]);
  if (!dbSection) notFound();

  return (
    <main className="section-page wrap">
      <header className="section-heading">
        <span className="eyebrow">ТВОРЧИЙ АРХІВ / {dbSection.subtitle}</span>
        <h1>{dbSection.title}</h1>
        <p>{dbSection.description}</p>
      </header>

      {isWriting && writings ? (
        <WritingPublicBoard items={writings} />
      ) : (
        <MediaGrid section={dbSection} />
      )}
    </main>
  );
}
