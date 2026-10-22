import { ArrowLeft, ArrowUpRight, Compass, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { sections } from "@/lib/content";

const filmHoles = Array.from({ length: 9 }, (_, index) => index);

export default function NotFound() {
  return (
    <main className="relative isolate min-h-[calc(100dvh-100px)] overflow-hidden bg-site-bg text-site-cream">
      {/* Свет от кинопроектора и лёгкая фактура фона. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_18%,rgba(119,74,48,0.21),transparent_55%),radial-gradient(ellipse_at_5%_90%,rgba(35,132,113,0.08),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(234,208,181,0.025)_4px)] opacity-20"
      />

      <div className="mx-auto w-full max-w-[1360px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        {/* Первый экран: сообщение слева, визуальный акцент справа. */}
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.94fr)] lg:gap-16">
          <div className="min-w-0">
            <div className="mb-7 flex items-center gap-3 text-[10px] font-semibold tracking-[0.24em] text-site-accent uppercase sm:text-[11px]">
              <span className="h-px w-8 shrink-0 bg-site-accent" aria-hidden="true" />
              Архів / Загублений кадр
            </div>

            <p
              aria-hidden="true"
              className="font-serif text-[clamp(7rem,20vw,13rem)] leading-[0.78] tracking-[-0.105em] text-[#b88b70]/25 select-none"
            >
              404
            </p>

            <h1 className="mt-5 max-w-[650px] font-serif text-[clamp(2.7rem,6vw,5.5rem)] leading-[1.04] tracking-[-0.05em] text-site-cream">
              Цей кадр
              <span className="block text-site-accent italic">загубився.</span>
            </h1>

            <p className="mt-6 max-w-[480px] font-serif text-[clamp(1.05rem,2vw,1.3rem)] leading-[1.65] text-site-cream/80">
              Цю сторінку поки не знайшли. Можливо, вона пішла на кастинг.
            </p>
            <p className="mt-3 max-w-[470px] text-[13px] leading-7 text-site-muted sm:text-[14px]">
              Але історія на цьому не закінчується. Повернися до початку або обери інший розділ
              архіву.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/home"
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-site-accent px-6 py-3 text-[13px] font-semibold text-site-bg shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent"
              >
                <Home size={16} strokeWidth={1.8} aria-hidden="true" />
                На головну
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/home#work"
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-site-border/75 bg-site-surface/60 px-6 py-3 text-[13px] text-site-cream transition-all duration-200 hover:border-site-accent/70 hover:text-site-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent"
              >
                <Compass size={17} strokeWidth={1.6} aria-hidden="true" />
                Дивитися роботи
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-4 text-[10px] tracking-[0.18em] text-site-muted/75 uppercase">
              <span className="h-px w-12 bg-site-border/70" aria-hidden="true" />
              Помилка маршруту / 404
            </div>
          </div>

          {/* Используем существующий портрет сайта, новых изображений не требуется. */}
          <div className="relative mx-auto w-full max-w-[570px]">
            <div className="relative isolate aspect-[5/4] overflow-hidden rounded-[16px] border border-[#8d674d]/45 bg-[#241814] shadow-[0_25px_80px_rgba(0,0,0,0.4)] sm:aspect-[5/4] lg:aspect-[4/5]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_45%,#6d4938_0%,#36231e_52%,#1d1512_100%)]"
              />

              {/* Перфорация плёнки. */}
              <div
                aria-hidden="true"
                className="absolute inset-x-4 top-4 z-20 flex justify-between gap-2 sm:inset-x-6"
              >
                {filmHoles.map((hole) => (
                  <span
                    key={hole}
                    className="h-2.5 w-4 rounded-[2px] border border-[#dec0a0]/25 bg-[#120d0b]/80 sm:h-3 sm:w-5"
                  />
                ))}
              </div>
              <div
                aria-hidden="true"
                className="absolute inset-x-4 bottom-4 z-20 flex justify-between gap-2 sm:inset-x-6"
              >
                {filmHoles.map((hole) => (
                  <span
                    key={hole}
                    className="h-2.5 w-4 rounded-[2px] border border-[#dec0a0]/25 bg-[#120d0b]/80 sm:h-3 sm:w-5"
                  />
                ))}
              </div>

              <div className="absolute inset-x-7 top-12 z-20 flex items-center justify-between text-[9px] font-medium tracking-[0.18em] text-[#e0c8b4]/70 uppercase sm:inset-x-10 sm:top-14">
                <span>Кадр № 404</span>
                <span className="text-[#79c4af]">Не знайдено</span>
              </div>

              <Image
                src="/images/portrait.png"
                alt=""
                fill
                sizes="(max-width: 1023px) 90vw, 520px"
                className="pointer-events-none object-contain object-bottom opacity-90 drop-shadow-[0_18px_32px_rgba(0,0,0,0.4)] select-none"
                priority
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1c1310] via-transparent to-transparent"
              />
              <div className="absolute inset-x-6 bottom-12 z-20 text-center sm:bottom-14">
                <span className="inline-block -rotate-3 border border-[#d8ac8a]/60 bg-[#271b17]/85 px-5 py-2 font-serif text-[clamp(0.9rem,2vw,1.25rem)] tracking-[0.1em] text-[#f0dbc4] shadow-lg backdrop-blur-sm">
                  ЗНІМАЛЬНИЙ МАЙДАНЧИК ЗАЧИНЕНО
                </span>
              </div>
            </div>
            <p className="mt-3 text-right font-serif text-xs text-site-muted/70 italic">
              Навіть у загублених кадрів є своя історія.
            </p>
          </div>
        </div>

        {/* Вместо тупика — ссылки на все творческие разделы. */}
        <nav
          aria-label="Інші розділи сайту"
          className="mt-20 border-t border-site-border/45 pt-10 sm:mt-24 sm:pt-12"
        >
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-site-accent uppercase">
                Продовжити перегляд
              </p>
              <h2 className="mt-2 font-serif text-[clamp(1.65rem,3vw,2.5rem)] text-site-cream">
                Можливо, ти шукав щось із цього
              </h2>
            </div>
            <span className="hidden font-mono text-[11px] tracking-[0.14em] text-site-muted sm:inline">
              01 — {String(sections.length).padStart(2, "0")}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2 lg:grid-cols-3">
            {sections.map((section, index) => (
              <Link
                key={section.slug}
                href={`/${section.slug}`}
                className="group relative flex min-h-[118px] min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-site-border/55 bg-site-surface/65 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-site-accent/60 hover:bg-site-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-[11px] text-site-accent/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-site-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-site-accent"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-4 min-w-0">
                  <span className="block font-serif text-xl leading-tight text-site-cream transition-colors group-hover:text-site-accent sm:text-[22px]">
                    {section.title}
                  </span>
                  {section.subtitle && (
                    <span className="mt-1 block text-xs leading-5 text-site-muted">
                      {section.subtitle}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-site-muted">
            <Link
              href="/home#bio"
              className="inline-flex items-center gap-2 transition-colors hover:text-site-accent focus-visible:outline-2 focus-visible:outline-site-accent"
            >
              <ArrowLeft size={15} aria-hidden="true" /> Біографія
            </Link>
            <Link
              href="/home#contacts"
              className="inline-flex items-center gap-2 transition-colors hover:text-site-accent focus-visible:outline-2 focus-visible:outline-site-accent"
            >
              Контакти <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}
