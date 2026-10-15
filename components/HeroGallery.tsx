"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

const frames = [
  { src: "/images/stage.jpg", title: "ТЕАТР", position: "center" },
  { src: "/images/costume.jpg", title: "ОБРАЗИ", position: "center 18%" },
  { src: "/images/comic.jpg", title: "КІНО", position: "center 35%" },
];

export function HeroGallery() {
  const [offset, setOffset] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  const move = (step: number) => setOffset((v) => (v + step + frames.length) % frames.length);

  useEffect(() => {
    if (preview === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [preview]);

  return (
    <>
      <aside
        aria-label="Кіноплівка творчих образів"
        className="relative flex h-full w-full flex-col border-y border-site-border/60 bg-[#160f0d]/90 px-4 py-4 shadow-[-15px_0_35px_rgba(0,0,0,0.2)] backdrop-blur-[5px] sm:px-5"
      >
        {(["left-[6px]", "right-[6px]"] as const).map((side) => (
          <div
            key={side}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-3 ${side} flex flex-col justify-around`}
          >
            {Array.from({ length: 16 }, (_, i) => (
              <span
                key={i}
                className="h-[9px] w-[5px] rounded-[1px] border border-site-border/80"
              />
            ))}
          </div>
        ))}

        <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Попередні кадри"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-site-border text-site-cream transition-colors hover:bg-site-accent/20"
          >
            ↑
          </button>

          <div className="flex min-h-0 w-full flex-col gap-3 px-2">
            {frames.map((_, index) => {
              const realIndex = (index + offset) % frames.length;
              const frame = frames[realIndex];
              return (
                <button
                  key={frame.src}
                  type="button"
                  onClick={() => setPreview(realIndex)}
                  aria-label={`Переглянути: ${frame.title}`}
                  className="group relative block aspect-[4/3.7] w-full overflow-hidden bg-black ring-1 ring-site-border/80 transition-all duration-300 hover:ring-site-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
                >
                  <Image
                    src={frame.src}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 30vw, 170px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: frame.position }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 px-2 pb-2">
                    <span className="text-[9px] font-semibold tracking-[0.12em] text-site-cream">
                      {frame.title}
                    </span>
                    <span className="text-[9px] text-site-muted">
                      {String(realIndex + 1).padStart(2, "0")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex w-full items-center justify-between gap-2 px-2">
            <span className="text-[9px] tracking-[0.15em] text-site-muted">
              {String(offset + 1).padStart(2, "0")} / 03
            </span>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Наступні кадри"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-site-border text-site-cream transition-colors hover:bg-site-accent/20"
            >
              ↓
            </button>
          </div>
        </div>
      </aside>

      {preview !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={frames[preview].title}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-5 backdrop-blur-md"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative h-[75vh] w-full max-w-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={frames[preview].src}
              alt={frames[preview].title}
              fill
              sizes="90vw"
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => setPreview(null)}
              aria-label="Закрити"
              className="absolute top-2 right-2 z-10 flex size-10 items-center justify-center rounded-full border border-site-border/70 bg-black/80 text-xl text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
