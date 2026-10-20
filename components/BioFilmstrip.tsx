"use client";

import { useState } from "react";

import Image from "next/image";

type Frame = { slot: number; title: string; subtitle: string; position: string; url: string };
const wrapIndex = (index: number, count: number) => (index + count) % count;

export function BioFilmstrip({ frames }: { frames: Frame[] }) {
  const [active, setActive] = useState(1);
  if (frames.length < 3) return null;
  const visible = [-1, 0, 1].map((offset) => {
    const index = wrapIndex(active + offset, frames.length);
    return { frame: frames[index], index };
  });
  const move = (direction: -1 | 1) =>
    setActive((current) => wrapIndex(current + direction, frames.length));

  return (
    <aside aria-label="Кінематографічна добірка" className="h-[460px] w-[240px] shrink-0">
      <div className="relative h-full w-full overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,14,12,0.96),rgba(28,16,13,0.99))] px-5 py-4 shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-6 left-[8px] flex flex-col justify-between"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="h-2 w-[3px] rounded-sm border border-white/15" />
          ))}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-6 right-[8px] flex flex-col justify-between"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="h-2 w-[3px] rounded-sm border border-white/15" />
          ))}
        </div>
        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-2 flex justify-center">
            <button
              type="button"
              aria-label="Попередній кадр"
              onClick={() => move(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#30ab91] hover:border-[#30ab91] focus-visible:outline focus-visible:outline-[#30ab91]"
            >
              ↑
            </button>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-3">
            {visible.map(({ frame, index }, slotIndex) => {
              const focused = slotIndex === 1;
              return (
                <button
                  type="button"
                  key={`${slotIndex}-${frame.slot}`}
                  disabled={focused}
                  onClick={() => move(slotIndex === 0 ? -1 : 1)}
                  aria-label={`${frame.title}: ${frame.subtitle}`}
                  className={`group relative w-full shrink-0 overflow-hidden rounded-[15px] border text-left ${focused ? "h-[112px] border-[#2ea88e]/55" : "h-[96px] border-white/10 opacity-80 hover:opacity-100"}`}
                >
                  <Image
                    unoptimized
                    src={frame.url}
                    alt={frame.title}
                    fill
                    sizes="200px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{ objectPosition: frame.position }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent"
                  />
                  {focused && (
                    <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[#2da88e]" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold tracking-[0.1em] text-white">
                        {frame.title}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-white/70">{frame.subtitle}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-white/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between px-1">
            <span className="text-[10px] tracking-[0.15em] text-white/55">
              {String(active + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              aria-label="Наступний кадр"
              onClick={() => move(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#30ab91] hover:border-[#30ab91] focus-visible:outline focus-visible:outline-[#30ab91]"
            >
              ↓
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
