import { ArrowLeft, ArrowUpRight, Fingerprint, ScanLine } from "lucide-react";
import Link from "next/link";

export default function Exit() {
  return (
    <main className="relative isolate min-h-[calc(100svh-80px)] overflow-hidden bg-site-bg text-site-cream">
      {/* Атмосфера: свет, зерно и едва заметная киноплёнка. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_74%_35%,rgba(44,143,123,.12),transparent_43%),radial-gradient(ellipse_at_12%_80%,rgba(152,92,54,.12),transparent_42%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(238,219,196,.08)_4px)] opacity-[.15]"
      />

      <div className="mx-auto grid w-full max-w-[1360px] grid-cols-1 items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:min-h-[calc(100svh-80px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)] lg:gap-14 lg:px-12 xl:px-14">
        {/* Основной смысловой блок. */}
        <section className="relative z-10 min-w-0">
          <div className="mb-9 flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[.24em] text-site-muted uppercase sm:text-[11px]">
            <span className="h-px w-9 bg-site-accent" />
            <span>АРХІВ / СПРАВА № 404</span>
            <span className="text-site-accent">·</span>
            <span>ВИХІД</span>
          </div>

          <p
            aria-label="Помилка 404"
            className="font-serif text-[clamp(7.2rem,25vw,17rem)] leading-[.72] tracking-[-.10em] text-site-cream/95 select-none [text-shadow:0_12px_60px_rgba(0,0,0,.25)]"
          >
            404<span className="text-site-accent">.</span>
          </p>

          <div className="mt-9 max-w-[650px] sm:mt-12">
            <h1 className="font-serif text-[clamp(2.1rem,4vw,4.5rem)] leading-[1.05] tracking-[-.035em] text-site-cream">
              Не було тут
              <br />
              ніякого сайту.
            </h1>
            <p className="mt-5 font-serif text-[clamp(1.45rem,2.6vw,2.25rem)] text-site-accent italic">
              Вам здалося.
            </p>
            <p className="mt-6 max-w-md text-sm leading-7 text-site-muted sm:text-base">
              Жодних слідів. Жодних свідків. Лише дивне відчуття, ніби ви щойно бачили щось дуже
              цікаве.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <Link
              href="/"
              className="group inline-flex min-h-[54px] items-center justify-center gap-3 rounded-full bg-site-accent px-7 text-[12px] font-semibold tracking-[.035em] text-site-bg transition-[transform,filter] duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent"
            >
              <ArrowLeft
                size={17}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              А може, все-таки був?
            </Link>
            <Link
              href="/home#work"
              className="group inline-flex min-h-[48px] items-center gap-2 border-b border-site-border/70 font-serif text-base text-site-cream transition-colors hover:border-site-accent hover:text-site-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent"
            >
              Знайти інші сліди
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </section>

        {/* Декоративное «досье». Оно не содержит навигации, чтобы не сбивать с толку. */}
        <aside
          aria-label="Декоративне досьє зниклого сайту"
          className="relative mx-auto w-full max-w-[490px] lg:max-w-none"
        >
          <div
            aria-hidden="true"
            className="absolute -inset-5 rotate-[3deg] rounded-[8px] border border-[#8c694b]/35 bg-[#2b201b] shadow-[0_30px_80px_rgba(0,0,0,.35)] sm:-inset-7"
          />
          <div
            aria-hidden="true"
            className="absolute -inset-2 -rotate-[2deg] rounded-[4px] border border-[#ad7953]/25 bg-[#35251c] sm:-inset-3"
          />

          <div className="relative rotate-[1deg] border border-[#8f7257] bg-[#e2d1b7] p-4 text-[#34251d] shadow-[0_30px_70px_rgba(0,0,0,.48)] sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-[#674d3c]/35 pb-3 font-mono text-[9px] tracking-[.16em] uppercase sm:text-[10px]">
              <span>ОСОБОВА СПРАВА / 404</span>
              <span className="inline-flex items-center gap-1.5 text-[#77523b]">
                <ScanLine size={14} aria-hidden="true" />
                НЕ ЗНАЙДЕНО
              </span>
            </div>

            <div className="relative mt-4 overflow-hidden border-[7px] border-[#241b17] bg-[#1d1613] sm:border-[9px]">
              {/* Используем существующий фон Hero — новых изображений не нужно. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[url('/images/bg-hero.png')] bg-cover bg-center opacity-50 grayscale"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#1b1412] via-[#1b1412]/25 to-[#1b1412]/50"
              />
              <div className="relative flex aspect-[4/3] flex-col items-center justify-center gap-4 px-4 text-center text-[#e7d6c0]">
                <span className="font-serif text-[clamp(5rem,15vw,9rem)] leading-none tracking-[-.1em] opacity-80">
                  ?
                </span>
                <span className="border border-[#dfc8a8]/45 px-4 py-2 font-mono text-[10px] tracking-[.32em] uppercase sm:text-xs">
                  ОБ’ЄКТ ЗНИК
                </span>
              </div>
              <span
                aria-hidden="true"
                className="absolute right-2 bottom-2 font-mono text-[9px] tracking-widest text-[#e7d6c0]/70"
              >
                КАДР 000 / 000
              </span>
            </div>

            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
              <div className="space-y-2 font-mono text-[10px] leading-[1.65] tracking-[.08em] text-[#594332] sm:text-[11px]">
                <p>
                  <span className="text-[#9c7a61]">СТАТУС:</span> ЗНИК БЕЗВІСТИ
                </p>
                <p>
                  <span className="text-[#9c7a61]">ДОКАЗІВ:</span> НЕ ВИЯВЛЕНО
                </p>
                <p>
                  <span className="text-[#9c7a61]">ПІДОЗРА:</span> ВАМ ЗДАЛОСЯ
                </p>
              </div>
              <Fingerprint
                aria-hidden="true"
                className="size-16 rotate-[-18deg] text-[#8a5346]/45 sm:size-20"
                strokeWidth={0.85}
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-dashed border-[#674d3c]/50 pt-3 font-mono text-[9px] tracking-[.15em] text-[#71533f] uppercase">
              <span>СПРАВУ ЗАКРИТО</span>
              <span>© НІКОНОРОВ</span>
            </div>

            <span
              aria-hidden="true"
              className="absolute -top-2 left-[23%] size-3 rounded-full border border-[#4b2920] bg-[radial-gradient(circle_at_30%_25%,#e7b188,#996142_50%,#48251d)] shadow-[1px_3px_5px_rgba(0,0,0,.65)]"
            />
            <span
              aria-hidden="true"
              className="absolute -top-2 right-[21%] size-3 rounded-full border border-[#4b2920] bg-[radial-gradient(circle_at_30%_25%,#e7b188,#996142_50%,#48251d)] shadow-[1px_3px_5px_rgba(0,0,0,.65)]"
            />
          </div>
          <p className="relative mt-8 text-center font-serif text-xs tracking-[.02em] text-site-muted italic sm:text-sm">
            Іноді найкращий вихід — повернутися до початку.
          </p>
        </aside>
      </div>
    </main>
  );
}
