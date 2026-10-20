import type { Metadata } from "next";
import Link from "next/link";

import { getBioProfile } from "@/lib/bio/profile";

export const metadata: Metadata = {
  title: "Біографія — Слава Ніконоров",
  description: "Про мене, мої образи, кіно, театр і творчість.",
};

export default async function BiographyPage() {
  const bio = await getBioProfile();
  const paragraphs = bio.fullBio
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <main className="mx-auto min-h-[70vh] max-w-[1000px] px-5 pt-24 pb-24 sm:px-8 lg:px-14">
      <Link
        href="/#bio"
        className="text-xs tracking-[0.15em] text-site-accent uppercase hover:underline"
      >
        ← На головну
      </Link>
      <p className="mt-16 text-[10px] font-semibold tracking-[0.2em] text-site-accent uppercase">
        Моя історія
      </p>
      <h1 className="mt-5 font-serif text-[clamp(3.2rem,6vw,6rem)] leading-[1.02] text-site-cream">
        Трохи про <span className="text-site-accent italic">мене</span>
      </h1>
      <div className="mt-9 h-px w-16 bg-site-accent" />
      <article className="mt-10 max-w-[760px] space-y-7 font-serif text-[clamp(1.15rem,2vw,1.45rem)] leading-[1.75] text-site-cream">
        {paragraphs.map((paragraph, i) => (
          <p className="whitespace-pre-line" key={i}>
            {paragraph}
          </p>
        ))}
      </article>
      <p className="mt-14 text-sm text-site-muted italic">Далі буде...</p>
    </main>
  );
}
