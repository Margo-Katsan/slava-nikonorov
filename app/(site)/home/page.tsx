import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { BioSection } from "@/components/BioSection";
import { ContactSection } from "@/components/ContactSection";
import { HeroFaces } from "@/components/HeroFaces";
import { ArrowUpRight } from "@/components/Icons";
import { TodayThought } from "@/components/TodayThought";

import { sections } from "@/lib/content";

export const metadata: Metadata = {
  title: "Слава Ніконоров — актор, режисер, художник, автор",
  description:
    "Особистий творчий простір Слави Ніконорова: кіно, театр, власні фільми, живопис, тексти й фотографії.",
};

// Keep the order matched to `sections` from lib/content.ts.
// All images are already used by the original home page: no new assets required.
const sectionImages = [
  "/icons/cinema.png",
  "/icons/theatre.png",
  "/icons/my-cinema.png",
  "/icons/painting.png",
  "/icons/writing.png",
  "/icons/gallery.png",
] as const;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent";

function EditorialRule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="h-[1px] w-8 shrink-0 bg-site-accent sm:w-12" />
      <span className="text-[10px] font-medium tracking-[0.22em] text-site-accent uppercase">
        {label}
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-site-bg text-site-cream">
      {/* 01 — CINEMATIC HERO */}
      <section
        aria-labelledby="home-title"
        className="relative isolate overflow-hidden border-b border-site-border/35"
      >
        {/* The photographic background belongs to Hero only. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 bg-[url('/images/bg-hero.png')] bg-cover bg-center opacity-75 lg:bg-top"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-site-bg/65 via-site-bg/35 to-site-bg lg:bg-gradient-to-r lg:from-site-bg/85 lg:via-site-bg/40 lg:to-site-bg/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-site-bg via-site-bg/70 to-transparent"
        />

        {/* Both Header and homepage use the same overall 1360px frame. */}
        <div className="relative mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-10">
          <div className="relative grid min-w-0 grid-cols-1 lg:min-h-[790px] lg:grid-cols-[minmax(0,45%)_minmax(0,55%)] lg:grid-rows-[auto_1fr]">
            {/* Extra contrast behind the desktop headline. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-10 z-10 hidden w-[66%] bg-gradient-to-r from-site-bg/85 via-site-bg/65 to-transparent lg:block"
            />

            {/* Mobile: headline first; large collage gets its own row. */}
            <div className="relative z-20 col-start-1 row-start-1 min-w-0 pt-14 sm:pt-20 lg:pt-24">
              <div className="mb-8 flex items-center gap-3 text-[10px] font-medium tracking-[0.2em] uppercase sm:gap-4">
                <span className="inline-flex h-7 shrink-0 items-center border border-site-accent/45 px-2.5 text-site-accent">
                  01 / ПОРТРЕТ
                </span>
                <span className="text-site-muted">Актор · Режисер · Художник · Автор</span>
              </div>

              <h1
                id="home-title"
                className="m-0 max-w-full font-serif font-normal tracking-[-0.055em]"
              >
                <span className="block text-[clamp(4.1rem,11vw,6.3rem)] leading-[0.94] text-site-cream lg:text-[clamp(5.1rem,7.6vw,7.4rem)]">
                  Слава
                </span>
                <span className="mt-1.5 block text-[clamp(2.7rem,8.2vw,5.25rem)] leading-[1.02] text-site-accent italic lg:mt-2 lg:text-[clamp(4.3rem,6.65vw,6.5rem)]">
                  Ніконоров
                </span>
              </h1>

              <div aria-hidden="true" className="mt-8 flex items-center gap-3 sm:mt-10">
                <span className="h-[2px] w-14 bg-site-accent" />
                <span className="h-px w-20 bg-site-border/75" />
                <span className="size-1 rotate-45 border border-site-accent/70" />
              </div>
            </div>

            {/* HeroFaces preserves the existing animated collage and its assets.
                It has a dedicated height on phones: no text overlap. */}
            <div className="relative z-0 col-start-1 row-start-2 h-[clamp(400px,108vw,560px)] min-w-0 lg:absolute lg:inset-0 lg:col-auto lg:row-auto lg:h-full lg:w-full">
              <HeroFaces />
            </div>

            <div className="relative z-20 col-start-1 row-start-3 min-w-0 pt-6 pb-14 lg:row-start-2 lg:pt-9 lg:pb-20">
              <p className="max-w-[460px] font-serif text-[clamp(1.13rem,2vw,1.38rem)] leading-[1.65] text-site-cream/95">
                Граю, знімаю, малюю, пишу.
              </p>
              <p className="mt-3 max-w-[450px] text-[14px] leading-[1.9] text-site-muted sm:text-[15px]">
                Приміряю різні образи, вигадую історії та знаходжу незвичайне у звичайному.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4 sm:mt-9">
                <Link
                  href="#work"
                  className={`group inline-flex min-h-[54px] items-center justify-center gap-4 rounded-full bg-site-accent px-7 text-[13px] font-semibold text-site-bg shadow-[0_14px_30px_rgba(0,0,0,0.24)] transition-[transform,filter,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(0,0,0,0.35)] hover:brightness-110 motion-reduce:transition-none ${focusRing}`}
                >
                  Дивитися роботи
                  <ArrowUpRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                  />
                </Link>
                <Link
                  href="#bio"
                  className={`group inline-flex min-h-12 items-center gap-3 ${focusRing}`}
                >
                  <Image
                    src="/icons/star.png"
                    alt=""
                    aria-hidden="true"
                    width={30}
                    height={30}
                    className="size-[30px] object-contain transition-transform duration-300 group-hover:rotate-12 motion-reduce:transition-none"
                  />
                  <span className="border-b border-site-border/80 pb-1 font-serif text-[18px] text-site-cream transition-colors group-hover:border-site-accent group-hover:text-site-accent">
                    Біографія
                  </span>
                </Link>
              </div>

              {/* One quote component; no competing extra cards or fake content. */}
              <aside
                aria-label="Думка на сьогодні"
                className="mt-12 max-w-[450px] border-t border-site-border/50 pt-6 lg:mt-14"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-site-accent" />
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-site-accent uppercase">
                      Думка на сьогодні
                    </span>
                  </div>
                  <span
                    aria-hidden="true"
                    className="text-[10px] tracking-[0.16em] text-site-muted/60"
                  >
                    ✦
                  </span>
                </div>
                <div className="border-l border-site-accent/60 pl-5">
                  <div className="[&_.quote-frame-lines]:!hidden [&_.quote-sketch]:!m-0 [&_.quote-sketch]:!max-w-none [&_.quote-sketch]:!border-0 [&_.quote-sketch]:!bg-transparent [&_.quote-sketch]:!p-0 [&_.quote-sketch]:!shadow-none [&_.quote-sketch_p]:!font-serif [&_.quote-sketch_p]:!text-[17px] [&_.quote-sketch_p]:!leading-[1.65] [&_.quote-sketch_p]:!text-site-cream/90 [&_.quote-sketch_p]:!italic [&_.quote-top]:!mb-3 [&_.quote-top]:!text-site-muted [&_.quote-top_button]:!text-site-muted">
                    <TodayThought />
                  </div>
                </div>
              </aside>
            </div>

            {/* Small editorial annotation, desktop only. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 bottom-16 z-20 hidden items-end gap-3 border-r border-site-accent/50 pr-4 text-right lg:flex"
            >
              <div>
                <p className="text-[10px] font-semibold tracking-[0.22em] text-site-cream/85 uppercase">
                  Кожна роль —
                </p>
                <p className="mt-1 font-serif text-[18px] text-site-cream/85 italic">
                  окрема історія
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* A quiet transition from the portrait to the portfolio. */}
      <div
        aria-hidden="true"
        className="mx-auto flex w-full max-w-[1360px] items-center justify-between px-5 pt-8 sm:px-8 lg:px-10"
      >
        <span className="h-px w-12 bg-site-border/55" />
        <span className="text-[9px] tracking-[0.32em] text-site-muted/55 uppercase">
          Слава Ніконоров · Творчий простір
        </span>
        <span className="h-px w-12 bg-site-border/55" />
      </div>

      {/* 02 — CREATIVE DIRECTIONS */}
      <section
        id="work"
        aria-labelledby="work-title"
        className="relative z-10 mx-auto w-full max-w-[1360px] scroll-mt-28 px-5 pt-16 pb-20 sm:px-8 sm:pt-20 sm:pb-24 lg:px-10 lg:pt-24 lg:pb-28"
      >
        <div className="mb-9 flex flex-col gap-5 sm:mb-11 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <EditorialRule label="02 / МІЙ ТВОРЧИЙ СВІТ" />
            <h2
              id="work-title"
              className="mt-5 max-w-2xl font-serif text-[clamp(2.4rem,5vw,4.15rem)] leading-[1.08] font-normal tracking-[-0.035em] text-site-cream"
            >
              Історії в різних <em className="font-normal text-site-accent">формах.</em>
            </h2>
            <p className="mt-5 max-w-xl text-[14px] leading-7 text-site-muted sm:text-[15px]">
              Від сцени й кінокадру до полотна та слова. Обери напрямок, який цікавить тебе
              найбільше.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 self-start border-b border-site-border/55 pb-3 sm:self-end">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-site-accent" />
            <span className="font-mono text-[11px] tracking-[0.15em] text-site-muted">
              01 — {String(sections.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Editorial grid: two hero cards + four compact cards on wide screens.
            Normal CSS grid everywhere keeps descriptions clear on mobile. */}
        <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 xl:grid-cols-12 xl:gap-5">
          {sections.map((section, index) => {
            const featured = index < 2;
            const number = String(index + 1).padStart(2, "0");

            return (
              <Link
                key={section.slug}
                href={`/${section.slug}`}
                aria-label={`${section.title} — переглянути розділ`}
                className={`group relative isolate flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-site-border/55 bg-site-surface/80 p-5 shadow-[0_10px_36px_rgba(0,0,0,0.12)] transition-[transform,border-color,background-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-site-accent/65 hover:bg-site-surface-soft hover:shadow-[0_22px_55px_rgba(0,0,0,0.26)] motion-reduce:transition-none sm:p-6 ${
                  featured
                    ? "min-h-[255px] xl:col-span-6 xl:min-h-[285px] xl:p-8"
                    : "min-h-[230px] xl:col-span-3 xl:min-h-[258px]"
                } ${focusRing}`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-site-accent/[0.10] via-transparent to-transparent opacity-65 transition-opacity duration-300 group-hover:opacity-100"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 -right-20 -z-10 size-52 rounded-full border border-site-accent/10 transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-12 -right-10 -z-10 size-36 rounded-full border border-site-border/15"
                />

                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] tracking-[0.18em] text-site-accent">
                    {number} / {String(sections.length).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-px w-12 bg-site-border/55 transition-colors group-hover:bg-site-accent/60"
                  />
                </div>

                <div className="mt-4 flex flex-1 items-center gap-4 sm:gap-5 xl:gap-6">
                  <div
                    className={`relative flex shrink-0 items-center justify-center ${
                      featured ? "size-[92px] sm:size-[110px]" : "size-[76px] xl:size-[72px]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-2 rounded-full bg-site-accent/10 opacity-65 blur-[22px] transition-opacity group-hover:opacity-100"
                    />
                    <Image
                      src={sectionImages[index] ?? "/icons/star.png"}
                      alt=""
                      width={112}
                      height={112}
                      className="relative h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.28)] transition-transform duration-500 group-hover:scale-[1.08] group-hover:-rotate-3 motion-reduce:transition-none"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`font-serif leading-[1.14] font-normal tracking-[-0.025em] text-site-cream transition-colors group-hover:text-site-accent ${
                        featured ? "text-[27px] sm:text-[31px]" : "text-[23px] xl:text-[24px]"
                      }`}
                    >
                      {section.title}
                    </h3>
                    <p className="mt-3 text-[12px] leading-[1.7] text-site-muted sm:text-[13px]">
                      {section.subtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3 border-t border-site-border/40 pt-4">
                  <span className="text-[10px] font-medium tracking-[0.15em] text-site-muted/85 uppercase transition-colors group-hover:text-site-cream">
                    Відкрити розділ
                  </span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-site-border/70 text-site-cream transition-[border-color,background-color,color,transform] duration-300 group-hover:translate-x-0.5 group-hover:border-site-accent group-hover:bg-site-accent group-hover:text-site-bg">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 03 / 04 — Existing admin-connected Bio and Contacts sections.
          They keep their own markup and data sources; no duplicate content. */}
      <div
        aria-hidden="true"
        className="mx-auto h-px w-full max-w-[1280px] bg-gradient-to-r from-transparent via-site-border/55 to-transparent"
      />
      <BioSection />
      <ContactSection />

      <div
        aria-hidden="true"
        className="mx-auto mb-8 h-px w-full max-w-[1280px] bg-gradient-to-r from-transparent via-site-border/45 to-transparent"
      />
    </main>
  );
}
