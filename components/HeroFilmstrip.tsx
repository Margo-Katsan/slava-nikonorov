"use client";

import { useMemo, useState } from "react";

import Image from "next/image";

type Frame = {
  src: string;
  title: string;
  subtitle?: string;
  position?: string;
};

const frames: Frame[] = [
  {
    src: "/images/stage.jpg",
    title: "ТЕАТР",
    subtitle: "Сцена, ролі, пластика",
    position: "center",
  },
  {
    src: "/images/costume.jpg",
    title: "ОБРАЗИ",
    subtitle: "Характери, перевтілення",
    position: "center 18%",
  },
  {
    src: "/images/comic.jpg",
    title: "КІНО",
    subtitle: "Кадр, епізоди, камера",
    position: "center 35%",
  },
];

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function HeroFilmstrip() {
  const [active, setActive] = useState(1);

  const visibleFrames = useMemo(() => {
    return [
      frames[mod(active - 1, frames.length)],
      frames[active],
      frames[mod(active + 1, frames.length)],
    ];
  }, [active]);

  function prev() {
    setActive((current) => mod(current - 1, frames.length));
  }

  function next() {
    setActive((current) => mod(current + 1, frames.length));
  }

  return (
    <aside
      className="absolute top-1/2 right-6 z-30 hidden h-[560px] w-[190px] -translate-y-1/2 xl:block"
      aria-label="Кінематографічна навігація"
    >
      <div className="relative h-full w-full overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,14,12,0.93),rgba(28,16,13,0.97))] shadow-[0_24px_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
        {/* мягкий внутренний объём */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[1px] rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.045),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_22%,transparent_78%,rgba(255,255,255,0.015))]"
        />

        {/* перфорация слева */}
        <div
          aria-hidden="true"
          className="absolute inset-y-7 left-[9px] flex flex-col justify-between"
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={`left-${index}`}
              className="block h-[10px] w-[4px] rounded-[2px] border border-white/12 bg-black/10"
            />
          ))}
        </div>

        {/* перфорация справа */}
        <div
          aria-hidden="true"
          className="absolute inset-y-7 right-[9px] flex flex-col justify-between"
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={`right-${index}`}
              className="block h-[10px] w-[4px] rounded-[2px] border border-white/12 bg-black/10"
            />
          ))}
        </div>

        {/* центральная колонка */}
        <div className="relative z-10 flex h-full flex-col px-5 py-5">
          {/* top button */}
          <div className="mb-4 flex justify-center">
            <button
              type="button"
              onClick={prev}
              aria-label="Попередній кадр"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/[0.03] text-[var(--color-site-accent)] transition-all duration-300 hover:border-[var(--color-site-accent)] hover:bg-[color:var(--color-site-accent)]/10"
            >
              <span className="text-lg leading-none">↑</span>
            </button>
          </div>

          {/* frames */}
          <div className="flex flex-1 flex-col justify-center gap-4">
            {visibleFrames.map((frame, index) => {
              const isCenter = index === 1;
              const frameNumber = mod(active + (index - 1), frames.length) + 1;

              return (
                <button
                  type="button"
                  key={`${frame.src}-${frame.title}-${index}`}
                  onClick={() => {
                    if (index === 0) prev();
                    if (index === 2) next();
                  }}
                  className={`group relative w-full overflow-hidden rounded-[18px] border text-left transition-all duration-300 ${
                    isCenter
                      ? "h-[144px] border-white/18 shadow-[0_14px_28px_rgba(0,0,0,0.32)]"
                      : "h-[122px] border-white/10 opacity-95"
                  } `}
                >
                  <Image
                    src={frame.src}
                    alt={frame.title}
                    fill
                    sizes="190px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{
                      objectPosition: frame.position ?? "center",
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/20 to-black/10" />

                  {/* inner outline */}
                  <div
                    className={`absolute inset-[7px] rounded-[13px] border ${isCenter ? "border-white/18" : "border-white/10"} `}
                  />

                  {/* accent line */}
                  {isCenter && (
                    <div className="absolute top-0 left-0 h-full w-[3px] bg-[var(--color-site-accent)] shadow-[0_0_14px_var(--color-site-accent)]" />
                  )}

                  {/* text */}
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold tracking-[0.14em] text-white">
                          {frame.title}
                        </p>
                        {frame.subtitle ? (
                          <p className="mt-1 truncate text-[10px] text-white/58">
                            {frame.subtitle}
                          </p>
                        ) : null}
                      </div>

                      <span className="shrink-0 text-[10px] text-white/55">
                        {String(frameNumber).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* footer */}
          <div className="mt-4 flex items-center justify-between px-[2px]">
            <span className="text-[10px] tracking-[0.22em] text-white/45">
              {String(active + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}
            </span>

            <button
              type="button"
              onClick={next}
              aria-label="Наступний кадр"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/[0.03] text-[var(--color-site-accent)] transition-all duration-300 hover:border-[var(--color-site-accent)] hover:bg-[color:var(--color-site-accent)]/10"
            >
              <span className="text-lg leading-none">↓</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
