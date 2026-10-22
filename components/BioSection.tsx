import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { BioFilmstrip } from "@/components/BioFilmstrip";

import { getBioProfile } from "@/lib/bio/profile";

// Server Component: all content and film frames still come from Neon/admin.
export async function BioSection() {
  const profile = await getBioProfile();
  const frameCount = profile.frames.length;

  return (
    <section
      id="bio"
      aria-labelledby="bio-heading"
      className="relative mx-auto w-full max-w-[1360px] scroll-mt-24 px-5 pb-20 text-site-cream sm:px-8 sm:pb-24 lg:px-12"
    >
      <div className="relative overflow-hidden border-t border-site-border/50 pt-12 sm:pt-16 lg:pt-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-10 -right-24 h-80 w-80 rounded-full bg-site-accent/[0.035] blur-[85px]"
        />

        <div className="relative grid min-w-0 grid-cols-1 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,405px)] lg:gap-x-14 lg:gap-y-0 xl:gap-x-20">
          {/* Mobile order: introduction -> filmstrip -> detailed biography. */}
          <div className="order-1 min-w-0 lg:col-start-1 lg:row-start-1">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span aria-hidden="true" className="h-px w-9 bg-site-accent" />
              <span className="text-[10px] font-semibold tracking-[0.24em] text-site-accent uppercase">
                Про мене / Біографія
              </span>
            </div>

            <h2
              id="bio-heading"
              className="max-w-[760px] font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.98] font-normal tracking-[-0.052em] text-site-cream"
            >
              {profile.heading}
              <span className="mt-2 block text-site-accent italic">{profile.accent}</span>
            </h2>

            <div className="mt-7 flex items-center gap-3 sm:mt-9">
              <span aria-hidden="true" className="h-[2px] w-12 bg-site-accent" />
              <span aria-hidden="true" className="h-px w-16 bg-site-border/80" />
              <span className="ml-2 text-[10px] tracking-[0.17em] text-site-muted uppercase">
                У кадрі й поза ним
              </span>
            </div>

            {profile.lead && (
              <p className="mt-7 max-w-[670px] font-serif text-[clamp(1.3rem,2.2vw,1.9rem)] leading-[1.48] whitespace-pre-wrap text-site-cream/95">
                {profile.lead}
              </p>
            )}
          </div>

          {/* Filmstrip is visible on phones, not hidden behind lg:hidden. */}
          <div className="order-2 min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="mb-4 flex items-center justify-between gap-3 lg:mb-5">
              <p className="text-[10px] font-medium tracking-[0.2em] text-site-muted uppercase">
                Кадри життя
              </p>
              <p className="font-mono text-[10px] tracking-[0.15em] text-site-accent">
                {String(frameCount).padStart(2, "0")} / АРХІВ
              </p>
            </div>
            <BioFilmstrip frames={profile.frames} />
            <p className="mt-3 text-[11px] leading-5 text-site-muted/85">
              <span className="lg:hidden">Гортай стрічку вбік, щоб побачити більше кадрів.</span>
              <span className="hidden lg:inline">Гортай стрічку вниз, щоб побачити всі кадри.</span>
            </p>
          </div>

          <div className="order-3 min-w-0 lg:col-start-1 lg:row-start-2 lg:pt-7">
            {profile.description && (
              <p className="max-w-[640px] text-[14px] leading-[1.95] whitespace-pre-wrap text-site-muted sm:text-[15px]">
                {profile.description}
              </p>
            )}

            <Link
              href="/bio"
              className="group mt-8 inline-flex min-h-11 items-center gap-3 border-b border-site-border/70 pb-1 text-site-cream transition-colors hover:border-site-accent hover:text-site-accent focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent"
            >
              <span aria-hidden="true" className="text-xl text-site-accent">
                ✦
              </span>
              <span className="font-serif text-[17px]">Повна біографія</span>
              <ArrowUpRight
                aria-hidden="true"
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
