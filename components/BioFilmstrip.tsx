"use client";

import { useCallback, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

type Frame = {
  slot: number;
  title: string;
  subtitle: string;
  position: string;
  url: string;
};

const number = (value: number) => String(value).padStart(2, "0");

function Perforations({ vertical = false }: { vertical?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={
        vertical
          ? "flex h-full flex-col items-center justify-between gap-1"
          : "flex w-full items-center justify-between gap-1"
      }
    >
      {Array.from({ length: vertical ? 18 : 16 }, (_, index) => (
        <span
          key={index}
          className={
            vertical
              ? "h-[10px] w-[6px] shrink-0 rounded-[2px] border border-[#997b62]/55 bg-[#0d0a09]"
              : "h-[6px] w-[11px] shrink-0 rounded-[2px] border border-[#997b62]/55 bg-[#0d0a09]"
          }
        />
      ))}
    </div>
  );
}

export function BioFilmstrip({ frames }: { frames: Frame[] }) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);

  // All frames are rendered and scrollable, even if the admin added 30+.
  const scrollToFrame = useCallback(
    (index: number) => {
      const rail = railRef.current;
      if (!rail || frames.length === 0) return;

      const targetIndex = (index + frames.length) % frames.length;
      const target = rail.querySelectorAll<HTMLElement>("[data-bio-frame]")[targetIndex];
      if (!target) return;

      const vertical = window.matchMedia("(min-width: 1024px)").matches;
      const position = vertical
        ? target.offsetTop + target.offsetHeight / 2 - rail.clientHeight / 2
        : target.offsetLeft + target.offsetWidth / 2 - rail.clientWidth / 2;

      rail.scrollTo({
        left: vertical ? 0 : position,
        top: vertical ? position : 0,
        behavior: "smooth",
      });
      setActive(targetIndex);
    },
    [frames.length],
  );

  // Keep the counter synced when the user swipes/scrolls manually.
  const syncActiveOnScroll = useCallback(() => {
    if (scrollFrameRef.current !== null) cancelAnimationFrame(scrollFrameRef.current);

    scrollFrameRef.current = requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      const rail = railRef.current;
      if (!rail) return;
      const children = rail.querySelectorAll<HTMLElement>("[data-bio-frame]");
      if (!children.length) return;

      const vertical = window.matchMedia("(min-width: 1024px)").matches;
      const midpoint = vertical
        ? rail.scrollTop + rail.clientHeight / 2
        : rail.scrollLeft + rail.clientWidth / 2;
      let nearest = 0;
      let minDistance = Infinity;

      children.forEach((element, index) => {
        const center = vertical
          ? element.offsetTop + element.offsetHeight / 2
          : element.offsetLeft + element.offsetWidth / 2;
        const distance = Math.abs(center - midpoint);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = index;
        }
      });
      setActive((previous) => (previous === nearest ? previous : nearest));
    });
  }, []);

  if (frames.length === 0) {
    return (
      <aside className="flex min-h-52 items-center justify-center rounded-xl border border-site-border/60 bg-site-surface/60 p-6 text-center font-serif text-site-muted">
        Кадри з’являться незабаром.
      </aside>
    );
  }

  return (
    <aside
      aria-label="Кінематографічна добірка з біографії"
      className="min-w-0 overflow-hidden rounded-[17px] border border-[#80604d]/70 bg-[#1b1412] shadow-[0_20px_60px_rgba(0,0,0,0.34)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#80604d]/35 px-4 py-3 sm:px-5">
        <span className="text-[9px] font-semibold tracking-[0.21em] text-[#5ab5a0] uppercase">
          КІНОПЛІВКА / АРХІВ
        </span>
        <span className="font-mono text-[10px] tracking-[0.12em] text-[#cab29c]" aria-live="polite">
          {number(active + 1)} <span className="text-[#8c796a]">/</span> {number(frames.length)}
        </span>
      </div>

      <div className="relative min-w-0 p-3 sm:p-4 lg:px-6 lg:py-3">
        {/* Small sprocket holes along the film edges. */}
        <div className="pointer-events-none absolute inset-x-4 top-[5px] lg:hidden">
          <Perforations />
        </div>
        <div className="pointer-events-none absolute inset-x-4 bottom-[5px] lg:hidden">
          <Perforations />
        </div>
        <div className="pointer-events-none absolute inset-y-3 left-[7px] hidden lg:block">
          <Perforations vertical />
        </div>
        <div className="pointer-events-none absolute inset-y-3 right-[7px] hidden lg:block">
          <Perforations vertical />
        </div>

        <div
          ref={railRef}
          onScroll={syncActiveOnScroll}
          role="region"
          aria-label="Гортайте кадри кіноплівки"
          tabIndex={0}
          className="relative flex min-w-0 snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto overflow-y-hidden py-3 outline-none focus-visible:ring-2 focus-visible:ring-[#5ab5a0] lg:h-[490px] lg:snap-y lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:px-2 lg:py-3 [&::-webkit-scrollbar]:hidden"
        >
          {frames.map((frame, index) => (
            <button
              data-bio-frame
              key={`${frame.slot}-${index}`}
              type="button"
              onClick={() => scrollToFrame(index)}
              aria-label={`${number(index + 1)}. ${frame.title}${frame.subtitle ? ` — ${frame.subtitle}` : ""}`}
              aria-current={index === active ? "true" : undefined}
              className={`group relative w-[min(72vw,270px)] shrink-0 snap-center overflow-hidden rounded-[8px] border bg-[#30231d] text-left shadow-[0_9px_22px_rgba(0,0,0,0.35)] transition-[border-color,opacity,transform] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5ab5a0] lg:w-full lg:snap-center ${
                index === active
                  ? "border-[#50ae9a] opacity-100"
                  : "border-[#85664f]/70 opacity-85 hover:border-[#b89b7f] hover:opacity-100"
              }`}
            >
              <div className="relative aspect-[4/3] w-full lg:aspect-[16/9]">
                {frame.url ? (
                  <Image
                    unoptimized
                    src={frame.url}
                    alt={frame.title}
                    fill
                    sizes="(max-width: 640px) 72vw, (max-width: 1023px) 270px, 360px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transform-none"
                    style={{ objectPosition: frame.position || "center" }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-serif text-3xl text-[#a9927d]">
                    Кадр {number(index + 1)}
                  </div>
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0b0908]/95 via-[#0b0908]/20 to-transparent"
                />
                {index === active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-[3px] bg-[#4eb69e]"
                  />
                )}
                <span className="absolute top-3 left-3 rounded-sm bg-black/55 px-2 py-1 font-mono text-[9px] tracking-widest text-[#f0ded1]">
                  {number(index + 1)}
                </span>
                <div className="absolute inset-x-0 bottom-0 min-w-0 p-3 sm:p-4">
                  <p className="line-clamp-2 font-serif text-[17px] leading-snug text-[#fff1e4] sm:text-lg">
                    {frame.title}
                  </p>
                  {frame.subtitle && (
                    <p className="mt-1 line-clamp-1 text-[11px] leading-4 text-[#e2cfc0]/85">
                      {frame.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[#80604d]/35 px-4 py-3 sm:px-5">
        <span className="text-[10px] text-[#baa18d]">
          <span className="lg:hidden">Гортай убік</span>
          <span className="hidden lg:inline">Гортай вниз</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Попередній кадр"
            disabled={frames.length < 2}
            onClick={() => scrollToFrame(active - 1)}
            className="flex size-9 items-center justify-center rounded-full border border-[#8b6b56]/70 text-[#60baa5] transition-colors hover:border-[#60baa5] hover:bg-[#2c2721] focus-visible:outline-2 focus-visible:outline-[#60baa5] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft aria-hidden="true" size={18} className="lg:rotate-90" />
          </button>
          <button
            type="button"
            aria-label="Наступний кадр"
            disabled={frames.length < 2}
            onClick={() => scrollToFrame(active + 1)}
            className="flex size-9 items-center justify-center rounded-full border border-[#8b6b56]/70 text-[#60baa5] transition-colors hover:border-[#60baa5] hover:bg-[#2c2721] focus-visible:outline-2 focus-visible:outline-[#60baa5] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight aria-hidden="true" size={18} className="lg:rotate-90" />
          </button>
        </div>
      </div>
    </aside>
  );
}
