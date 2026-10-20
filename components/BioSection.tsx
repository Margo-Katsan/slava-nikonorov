import Link from "next/link";

import { BioFilmstrip } from "@/components/BioFilmstrip";

import { getBioProfile } from "@/lib/bio/profile";

// Render this from a SERVER component, such as app/page.tsx.
export async function BioSection() {
  const profile = await getBioProfile();
  return (
    <section
      id="bio"
      className="relative mx-auto w-full max-w-[1440px] scroll-mt-24 px-5 pb-20 sm:px-8 lg:px-14"
    >
      <div className="border-t border-site-border/45 py-12 sm:py-14">
        <div className="mx-auto grid w-full max-w-[980px] grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12">
          <div className="min-w-0">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-site-accent" />
              <span className="text-[10px] font-semibold tracking-[0.22em] text-site-accent uppercase">
                Про мене
              </span>
            </div>
            <h2 className="font-serif text-[clamp(3.3rem,5vw,5.2rem)] leading-[1.02] tracking-[-0.045em] text-site-cream">
              {profile.heading}
              <span className="block text-site-accent italic">{profile.accent}</span>
            </h2>
            <div className="mt-7 flex gap-3">
              <span className="h-px w-12 bg-site-accent" />
              <span className="h-px w-14 bg-site-border" />
            </div>
            <p className="mt-7 max-w-[620px] font-serif text-[clamp(1.25rem,2vw,1.65rem)] leading-[1.55] whitespace-pre-wrap text-site-cream">
              {profile.lead}
            </p>
            <p className="mt-5 max-w-[600px] text-[14px] leading-[1.9] whitespace-pre-wrap text-site-muted sm:text-[15px]">
              {profile.description}
            </p>
            <Link
              href="/bio"
              className="mt-8 inline-flex items-center gap-3 text-[12px] text-site-cream transition-colors hover:text-site-accent focus-visible:outline focus-visible:outline-site-accent"
            >
              <span aria-hidden className="text-xl text-site-accent">
                ✦
              </span>
              <span className="border-b border-current pb-1 font-serif text-base">
                Повна біографія
              </span>
              <span aria-hidden>↗</span>
            </Link>
          </div>
          <div className="hidden lg:flex lg:justify-end">
            <BioFilmstrip frames={profile.frames} />
          </div>
        </div>
      </div>
    </section>
  );
}
