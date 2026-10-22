"use client";

import { useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { HeadsGame } from "@/components/intro/HeadsGame";

import { DEFAULT_INTRO, INTRO_HEAD_FALLBACK, type IntroPublicConfig } from "@/lib/intro/types";

type FloatingHead = {
  index: number;
  x: number;
  y: number;
  width: number;
  angle: number;
  delay: number;
};

// Coordinates are percentages of the stage, not the browser window.
// Each silhouette stays in its own side area; the mouth has the entire center.
const DESKTOP_HEADS: readonly FloatingHead[] = [
  { index: 0, x: 11, y: 23, width: 124, angle: -9, delay: -1.2 },
  { index: 2, x: 24, y: 37, width: 132, angle: 6, delay: -3.5 },
  { index: 4, x: 10, y: 63, width: 138, angle: -6, delay: -4.8 },
  { index: 6, x: 23, y: 82, width: 118, angle: 5, delay: -2.4 },
  { index: 1, x: 89, y: 22, width: 125, angle: 7, delay: -3.0 },
  { index: 3, x: 76, y: 39, width: 132, angle: -6, delay: -0.9 },
  { index: 8, x: 90, y: 64, width: 136, angle: 7, delay: -5.3 },
  { index: 10, x: 77, y: 82, width: 120, angle: -4, delay: -2.0 },
];

// Smaller, deliberately spaced portraits on phones; no horizontal scrolling.
const MOBILE_HEADS: readonly FloatingHead[] = [
  { index: 0, x: 17, y: 15, width: 70, angle: -8, delay: -1.4 },
  { index: 4, x: 11, y: 47, width: 68, angle: 7, delay: -3.4 },
  { index: 8, x: 20, y: 83, width: 74, angle: -5, delay: -2.1 },
  { index: 2, x: 83, y: 16, width: 70, angle: 7, delay: -4.0 },
  { index: 6, x: 89, y: 49, width: 68, angle: -7, delay: -2.5 },
  { index: 10, x: 80, y: 83, width: 74, angle: 5, delay: -5.3 },
];

function FloatingFaces({
  images,
  heads,
  className,
}: {
  images: readonly string[];
  heads: readonly FloatingHead[];
  className: string;
}) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {heads.map(({ index, x, y, width, angle, delay }) => {
        const src = images[index];
        if (!src) return null;

        return (
          <div
            key={index}
            className="absolute aspect-[4/5]"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${width}px`,
              // On phones the outer wrapper is scaled but stays centered.
              transform: `translate(-50%, -50%) rotate(${angle}deg)`,
              maxWidth: "22%",
            }}
          >
            <div
              className="intro-floating-head relative h-full w-full"
              style={{ animationDelay: `${delay}s` }}
            >
              <Image
                src={src}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 1023px) 75px, 140px"
                className="object-contain drop-shadow-[0_16px_16px_rgba(0,0,0,.60)] select-none"
                draggable={false}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MouthEntrance({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Вам сюди — увійти на сайт Слави Ніконорова"
      className="group absolute top-1/2 left-1/2 z-20 block aspect-[1000/914] w-[64%] max-w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-[40%] transition-transform duration-300 outline-none hover:scale-[1.035] focus-visible:scale-[1.035] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#72d1bc] motion-reduce:transition-none sm:w-[54%] sm:max-w-[370px] lg:w-[42%] lg:max-w-[480px]"
    >
      {/* The center of the PNG is transparent. This solid dark layer stops
          floating faces from appearing through the mouth opening. */}
      <span
        aria-hidden="true"
        className="absolute inset-[10%] rounded-[48%] bg-[#160d0d] shadow-[0_0_50px_20px_rgba(17,7,7,.45)]"
      />
      <Image
        src="/icons/intro-mouth.png"
        alt=""
        fill
        priority
        sizes="(max-width: 639px) 65vw, (max-width: 1023px) 370px, 480px"
        className="pointer-events-none relative object-contain drop-shadow-[0_22px_26px_rgba(0,0,0,.55)] transition-[filter] duration-300 group-hover:brightness-110"
        draggable={false}
      />
      {/* 53% is the actual center of the transparent opening, not of the lips. */}
      <span className="pointer-events-none absolute inset-x-[18%] top-[53%] flex -translate-y-1/2 flex-col items-center justify-center gap-1 text-center sm:gap-2">
        <span className="font-serif text-[clamp(12px,3.5vw,29px)] leading-none font-bold tracking-[.06em] whitespace-nowrap text-[#f4e6d5] drop-shadow-[0_2px_10px_#130909] sm:tracking-[.12em]">
          ВАМ СЮДИ
        </span>
        <span className="text-base leading-none text-[#65cbb2] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 sm:text-2xl">
          ↗
        </span>
      </span>
    </Link>
  );
}

export default function SlavaHeadsIntro({ intro = DEFAULT_INTRO }: { intro?: IntroPublicConfig }) {
  const [showGame, setShowGame] = useState(false);
  const images = useMemo(() => {
    const configured = intro.heads.map((head) => head.url);
    return INTRO_HEAD_FALLBACK.map((fallback, index) => configured[index] || fallback);
  }, [intro.heads]);
  const siteHref = intro.siteHref || "/home";

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#1b1210] text-[#f1dfce]">
      <style>{`
        @keyframes intro-head-hover {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-2deg); }
          50% { transform: translate3d(3px, -11px, 0) rotate(2deg); }
        }
        .intro-floating-head {
          animation: intro-head-hover 7.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .intro-floating-head { animation: none; }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_32%,rgba(128,72,50,.24),transparent_55%),linear-gradient(180deg,#291b17_0%,#170f0e_100%)]"
      />

      {showGame ? (
        <div className="relative mx-auto flex min-h-dvh max-w-[1060px] flex-col items-center gap-8 px-4 py-8 sm:px-8">
          <div className="flex w-full flex-wrap items-center justify-between gap-4 border-b border-[#8c6b55]/40 pb-5">
            <button
              type="button"
              onClick={() => setShowGame(false)}
              className="min-h-11 rounded-full border border-[#ad866f]/65 px-5 text-sm text-[#f2ddc9] transition-colors hover:border-[#62c4ae] hover:text-[#62c4ae] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#62c4ae]"
            >
              ← Назад до входу
            </button>
            <Link
              href={siteHref}
              className="text-sm text-[#6bc7b1] underline-offset-4 hover:underline"
            >
              Увійти на сайт ↗
            </Link>
          </div>
          <div className="text-center">
            <p className="text-xs tracking-[.22em] text-[#65baa5] uppercase">Додаткова сцена</p>
            <h1 className="mt-3 font-serif text-3xl sm:text-5xl">Гра в голови</h1>
            <p className="mt-3 text-sm text-[#cab09f]">
              Поєднуй однакові голови, щоб відкрити нові образи.
            </p>
          </div>
          <HeadsGame
            headImages={images}
            siteHref={siteHref}
            autoStart={intro.autoModeDefault}
            dropIntervalMs={intro.autoIntervalMs}
          />
        </div>
      ) : (
        <div className="relative mx-auto flex min-h-dvh w-full max-w-[1300px] flex-col items-center px-3 pt-8 pb-9 sm:px-8 sm:pt-12">
          <header className="mx-auto max-w-[950px] text-center">
            <p className="mb-3 text-[10px] tracking-[.26em] text-[#67bba9] uppercase">
              Пролог / Вхід
            </p>
            <h1 className="font-serif text-[clamp(2rem,5vw,4.2rem)] leading-[1.05] tracking-[-.045em]">
              Обережно.
              <span className="mt-1 block text-[#61bea9] italic">Далі — сайт Ніконорова.</span>
            </h1>
          </header>

          <section
            aria-label="Вхід на сайт — ротова нора"
            className="relative mx-auto mt-7 h-[400px] w-full max-w-[1160px] overflow-hidden rounded-[24px] border border-[#795440]/55 bg-[radial-gradient(ellipse_at_50%_48%,#4b2924_0%,#2c1b17_40%,#1b1110_92%)] shadow-[inset_0_0_95px_rgba(0,0,0,.35),0_22px_65px_rgba(0,0,0,.3)] sm:mt-9 sm:h-[510px] lg:h-[590px]"
          >
            {/* A little atmospheric depth, but nothing distracting. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_21%_30%,rgba(210,126,73,.14),transparent_25%),radial-gradient(circle_at_79%_75%,rgba(48,149,124,.12),transparent_24%)] opacity-50"
            />

            <FloatingFaces images={images} heads={MOBILE_HEADS} className="lg:hidden" />
            <FloatingFaces images={images} heads={DESKTOP_HEADS} className="hidden lg:block" />
            <MouthEntrance href={siteHref} />

            <span className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2 text-center text-[9px] tracking-[.24em] whitespace-nowrap text-[#c3a493] uppercase sm:bottom-6">
              Натисни на рот, щоб увійти
            </span>
          </section>

          <p className="mx-auto mt-8 max-w-[900px] text-center font-serif text-[clamp(1.05rem,2.5vw,1.6rem)] leading-[1.45] text-[#e9d2c0] italic">
            «Я покажу, наскільки глибока ротова нора».
          </p>

          <button
            type="button"
            onClick={() => setShowGame(true)}
            className="mt-6 min-h-11 rounded-full border border-[#a37b62]/65 bg-[#2d1e19]/85 px-7 text-xs font-medium tracking-[.1em] text-[#edd7c5] transition-colors hover:border-[#61bea9] hover:text-[#74d2ba] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#74d2ba]"
          >
            Або зіграти в голови ↗
          </button>
        </div>
      )}
    </main>
  );
}
