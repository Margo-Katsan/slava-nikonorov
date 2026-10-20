import Image from "next/image";
import Link from "next/link";

import { BioSection } from "@/components/BioSection";
import { ContactSection } from "@/components/ContactSection";
import { DailyQuote } from "@/components/DailyQuote";
import { HeroFaces } from "@/components/HeroFaces";
import { HeroFilmstrip } from "@/components/HeroFilmstrip";
import { ArrowUpRight } from "@/components/Icons";
import { TodayThought } from "@/components/TodayThought";

import { sections } from "@/lib/content";

const sectionImages = [
  "/icons/cinema.png",
  "/icons/theatre.png",
  "/icons/my-cinema.png",
  "/icons/painting.png",
  "/icons/writing.png",
  "/icons/gallery.png",
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-site-bg text-site-cream">
      {/* HERO */}

      <section className="relative isolate overflow-hidden">
        {/* Фон только для Hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 bg-[url('/images/bg-hero.png')] bg-cover bg-center bg-no-repeat lg:bg-top"
        />

        {/* Плавное затемнение фона */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-site-bg/30 via-site-bg/35 to-site-bg"
        />

        <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-14">
          <div className="relative grid grid-cols-1 lg:min-h-[730px] lg:grid-cols-[44%_56%] lg:grid-rows-[auto_1fr]">
            {/* Затемнение за текстом только на компьютере */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[60%] bg-gradient-to-r from-site-bg/85 via-site-bg/65 to-transparent lg:block"
            />

            {/* 1. ЗАГОЛОВОК */}

            <div className="relative z-20 col-start-1 row-start-1 pt-12 sm:pt-16 lg:pt-20">
              <div className="mb-7 flex items-center gap-3 sm:gap-4">
                <span className="h-px w-7 shrink-0 bg-site-accent" />

                <p className="text-[9px] font-semibold tracking-[0.17em] text-site-muted uppercase sm:text-[11px]">
                  Актор · Режисер · Художник · Автор
                </p>
              </div>

              <h1 className="m-0 font-serif font-normal tracking-[-0.055em]">
                <span className="block text-[clamp(3.9rem,14vw,5rem)] leading-[0.94] text-site-cream lg:text-[clamp(4.2rem,7vw,7rem)]">
                  Слава
                </span>

                <span className="mt-2 block text-[clamp(2.55rem,11vw,4rem)] leading-[1.08] text-site-accent italic lg:text-[clamp(3.7rem,6.5vw,6.6rem)]">
                  Ніконоров
                </span>
              </h1>

              <div className="mt-7 flex items-center gap-3 lg:mt-8">
                <span className="h-[2px] w-10 bg-site-accent" />
                <span className="h-px w-16 bg-site-border/70" />
              </div>
            </div>

            {/* 2. КОЛЛАЖ ГОЛОВ */}

            <div className="relative z-0 col-start-1 row-start-2 h-[clamp(390px,112vw,480px)] w-full lg:absolute lg:inset-0 lg:col-auto lg:row-auto lg:h-full lg:w-full">
              <HeroFaces />,
            </div>

            {/* 3. ОПИСАНИЕ, КНОПКИ И ЦИТАТА */}

            <div className="relative z-20 col-start-1 row-start-3 pt-4 pb-14 lg:row-start-2 lg:pt-7 lg:pb-12">
              {/* Описание */}

              <p className="max-w-[460px] text-[15px] leading-[1.85] text-site-cream/85 sm:text-[17px]">
                Граю, знімаю, малюю, пишу.
                <br />
                Приміряю різні образи, вигадую історії та знаходжу незвичайне у звичайному.
              </p>

              {/* Кнопки */}

              <div className="mt-8 flex flex-wrap items-center gap-5 sm:gap-7">
                <Link
                  href="#work"
                  className="group inline-flex min-h-[52px] items-center justify-center gap-4 rounded-full bg-site-accent px-7 text-[13px] font-semibold text-site-bg transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent"
                >
                  Дивитися роботи
                  <ArrowUpRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </Link>

                <Link
                  href="#bio"
                  className="group inline-flex min-h-[48px] items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent"
                >
                  <Image
                    src="/icons/star.png"
                    alt=""
                    width={30}
                    height={30}
                    className="h-[30px] w-[30px] object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                  />

                  <span className="border-b border-site-border pb-1 font-serif text-[17px] text-site-cream transition-colors group-hover:text-site-accent">
                    Біографія
                  </span>
                </Link>
              </div>

              {/* Цитата */}

              <div className="mt-10 w-full max-w-[455px] border-t border-site-border/45 pt-6 lg:mt-11">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-[6px] w-[6px] rounded-full bg-site-accent" />

                  <span className="text-[10px] font-semibold tracking-[0.2em] text-site-accent uppercase">
                    Думка на сьогодні
                  </span>
                </div>

                <div className="border-l border-site-accent/65 pl-5">
                  <div className="[&_.quote-frame-lines]:!hidden [&_.quote-sketch]:!m-0 [&_.quote-sketch]:!max-w-none [&_.quote-sketch]:!border-0 [&_.quote-sketch]:!bg-transparent [&_.quote-sketch]:!p-0 [&_.quote-sketch]:!shadow-none [&_.quote-sketch_p]:!font-serif [&_.quote-sketch_p]:!text-[17px] [&_.quote-sketch_p]:!leading-[1.7] [&_.quote-sketch_p]:!text-site-cream [&_.quote-sketch_p]:!italic [&_.quote-top]:!mb-3 [&_.quote-top]:!text-site-muted [&_.quote-top_button]:!text-site-muted">
                    <TodayThought />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CREATIVE SECTIONS */}

      <section
        id="work"
        aria-label="Напрямки творчості"
        className="relative z-20 mx-auto w-full max-w-[1440px] scroll-mt-24 px-5 pt-5 pb-20 sm:px-8 lg:px-14"
      >
        {/* SECTION HEADING */}

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-site-accent uppercase">
              Мій творчий світ
            </p>

            <h2 className="font-serif text-[26px] leading-tight font-normal text-site-cream sm:text-[32px]">
              Обери, з чого почати
            </h2>
          </div>

          <span className="hidden pb-1 text-[11px] tracking-[0.18em] text-site-muted sm:block">
            01 — 06
          </span>
        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, index) => (
            <Link
              key={section.slug}
              href={`/${section.slug}`}
              className="group relative isolate flex min-h-[132px] items-center gap-4 overflow-hidden rounded-2xl border border-site-border/65 bg-site-surface/85 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-site-accent/55 hover:bg-site-surface-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-site-accent sm:p-5"
            >
              {/* HOVER LIGHT */}

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-site-accent/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              {/* ICON */}

              <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center">
                <div
                  aria-hidden="true"
                  className="absolute inset-2 rounded-full bg-site-accent/10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
                />

                <Image
                  src={sectionImages[index] ?? "/icons/star.png"}
                  alt=""
                  width={76}
                  height={76}
                  className="relative h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.25)] transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* CONTENT */}

              <div className="min-w-0 flex-1">
                <span className="mb-1 block text-[9px] font-medium tracking-[0.18em] text-site-accent/75">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3 className="mb-1.5 font-serif text-[19px] leading-tight font-medium text-site-cream sm:text-[21px]">
                  {section.title}
                </h3>

                <p className="text-[12px] leading-[1.6] text-site-muted">{section.subtitle}</p>
              </div>

              {/* ARROW */}

              <span className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center self-end rounded-full border border-site-border/70 text-site-muted transition-all duration-300 group-hover:border-site-accent group-hover:bg-site-accent group-hover:text-site-bg">
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ABOUT */}

      <BioSection />
      <ContactSection />

      {/* PAGE END DECOR */}

      <div
        aria-hidden="true"
        className="mx-auto h-px w-full max-w-[1320px] bg-gradient-to-r from-transparent via-site-border/40 to-transparent"
      />
    </main>
  );
}
