"use client";

import { useState } from "react";

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

  const visibleFrames = [
    frames[mod(active - 1, frames.length)],
    frames[active],
    frames[mod(active + 1, frames.length)],
  ];

  function prev() {
    setActive((current) => mod(current - 1, frames.length));
  }

  function next() {
    setActive((current) => mod(current + 1, frames.length));
  }

  return (
    <aside className="h-[500px] w-[230px] shrink-0" aria-label="Кінематографічна навігація">
      <div className="relative h-full w-full overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,14,12,0.93),rgba(28,16,13,0.97))] shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
        {/* Внутреннее свечение */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_48%)]"
        />

        {/* Левая перфорация */}
        <div
          aria-hidden="true"
          className="absolute inset-y-6 left-[9px] flex flex-col justify-between"
        >
          {Array.from({ length: 13 }).map((_, index) => (
            <span
              key={`left-${index}`}
              className="block h-[9px] w-[4px] rounded-[2px] border border-white/10 bg-black/15"
            />
          ))}
        </div>

        {/* Правая перфорация */}
        <div
          aria-hidden="true"
          className="absolute inset-y-6 right-[9px] flex flex-col justify-between"
        >
          {Array.from({ length: 13 }).map((_, index) => (
            <span
              key={`right-${index}`}
              className="block h-[9px] w-[4px] rounded-[2px] border border-white/10 bg-black/15"
            />
          ))}
        </div>

        {/* Основное содержимое */}
        <div className="relative z-10 flex h-full flex-col px-5 py-4">
          {/* Верхняя кнопка */}
          <div className="mb-2 flex shrink-0 justify-center">
            <button
              type="button"
              onClick={prev}
              aria-label="Попередній кадр"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-site-accent transition-all duration-300 hover:-translate-y-0.5 hover:border-site-accent hover:bg-white/[0.07]"
            >
              <span className="text-base leading-none">↑</span>
            </button>
          </div>

          {/* Кадры */}
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
            {visibleFrames.map((frame, index) => {
              const isCenter = index === 1;

              const frameNumber = mod(active + index - 1, frames.length) + 1;

              return (
                <button
                  type="button"
                  key={`${frame.src}-${index}`}
                  disabled={isCenter}
                  aria-label={`${frame.title} — ${frame.subtitle ?? ""}`}
                  onClick={() => {
                    if (index === 0) prev();
                    if (index === 2) next();
                  }}
                  className={`group relative w-full shrink-0 overflow-hidden rounded-[15px] border text-left transition-all duration-300 ${
                    isCenter
                      ? "h-[120px] cursor-default border-site-accent/40 shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
                      : "h-[104px] border-white/10 opacity-80 hover:border-white/25 hover:opacity-100"
                  } `}
                >
                  {/* Фото */}
                  <Image
                    src={frame.src}
                    alt={frame.title}
                    fill
                    sizes="190px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    style={{
                      objectPosition: frame.position ?? "center",
                    }}
                  />

                  {/* Затемнение */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                  {/* Внутренняя рамка */}
                  <div
                    className={`pointer-events-none absolute inset-[6px] rounded-[10px] border ${
                      isCenter ? "border-white/20" : "border-white/10"
                    } `}
                  />

                  {/* Акцент активного кадра */}
                  {isCenter && (
                    <div className="absolute inset-y-0 left-0 w-[3px] bg-site-accent shadow-[0_0_12px_var(--color-site-accent)]" />
                  )}

                  {/* Подписи */}
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold tracking-[0.12em] text-white">
                          {frame.title}
                        </p>

                        {frame.subtitle && (
                          <p className="mt-1 truncate text-[10px] text-white/60">
                            {frame.subtitle}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 text-[10px] text-white/50">
                        {String(frameNumber).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Нижняя навигация */}
          <div className="mt-2 flex shrink-0 items-center justify-between px-[2px]">
            <span className="text-[10px] tracking-[0.18em] text-white/45">
              {String(active + 1).padStart(2, "0")}
              {" / "}
              {String(frames.length).padStart(2, "0")}
            </span>

            <button
              type="button"
              onClick={next}
              aria-label="Наступний кадр"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-site-accent transition-all duration-300 hover:translate-y-0.5 hover:border-site-accent hover:bg-white/[0.07]"
            >
              <span className="text-base leading-none">↓</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
