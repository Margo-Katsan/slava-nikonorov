import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MediaGrid } from "@/components/MediaGrid";

import { getSectionFromDb } from "@/lib/content-db";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ section: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { section } = await params;

  const data = await getSectionFromDb(section);

  return {
    title: data?.title ?? "Розділ",
    description: data?.description,
  };
}

export default async function SectionPage({ params }: PageProps) {
  const { section: slug } = await params;

  const section = await getSectionFromDb(slug);

  if (!section) {
    notFound();
  }

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
