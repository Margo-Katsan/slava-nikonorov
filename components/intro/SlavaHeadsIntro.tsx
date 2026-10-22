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
  opacity: number;
  delay: number;
};

// Новый принцип композиции: 11 образов образуют живую рамку вокруг рта.
// Все координаты относительно сцены; изображениями по-прежнему управляет /admin/intro.
// Первые позиции — небольшие акценты, крупные лица — ближе к середине по вертикали.
const DESKTOP_HEADS: readonly FloatingHead[] = [
  { index: 0, x: 13, y: 20, width: 144, angle: -8, opacity: 0.91, delay: -1.2 },
  { index: 1, x: 27, y: 37, width: 151, angle: 5, opacity: 1, delay: -3.4 },
  { index: 2, x: 10, y: 52, width: 164, angle: -4, opacity: 0.94, delay: -5.1 },
  { index: 3, x: 27, y: 66, width: 145, angle: 6, opacity: 1, delay: -2.0 },
  { index: 4, x: 13, y: 82, width: 143, angle: -6, opacity: 0.88, delay: -4.4 },
  { index: 5, x: 27, y: 84, width: 101, angle: 9, opacity: 0.74, delay: -1.8 },
  { index: 6, x: 87, y: 20, width: 148, angle: 7, opacity: 0.89, delay: -4.7 },
  { index: 7, x: 73, y: 37, width: 157, angle: -5, opacity: 1, delay: -1.0 },
  { index: 8, x: 90, y: 52, width: 160, angle: 6, opacity: 0.93, delay: -3.6 },
  { index: 9, x: 74, y: 67, width: 148, angle: -4, opacity: 0.96, delay: -6.2 },
  { index: 10, x: 87, y: 82, width: 143, angle: 7, opacity: 0.87, delay: -2.6 },
];

// Отдельная композиция для планшетов: не копируем десктопные пиксели.
const TABLET_HEADS: readonly FloatingHead[] = [
  { index: 0, x: 12, y: 20, width: 110, angle: -9, opacity: 0.9, delay: -1.2 },
  { index: 1, x: 28, y: 16, width: 100, angle: 6, opacity: 0.88, delay: -3.4 },
  { index: 2, x: 11, y: 46, width: 120, angle: -5, opacity: 0.98, delay: -5.1 },
  { index: 3, x: 25, y: 64, width: 110, angle: 5, opacity: 0.95, delay: -2.0 },
  { index: 4, x: 12, y: 81, width: 109, angle: -7, opacity: 0.84, delay: -4.4 },
  { index: 5, x: 50, y: 88, width: 78, angle: 3, opacity: 0.8, delay: -1.8 },
  { index: 6, x: 88, y: 20, width: 110, angle: 7, opacity: 0.9, delay: -4.7 },
  { index: 7, x: 72, y: 16, width: 104, angle: -6, opacity: 0.88, delay: -1.0 },
  { index: 8, x: 89, y: 47, width: 117, angle: 4, opacity: 0.98, delay: -3.6 },
  { index: 9, x: 76, y: 64, width: 111, angle: -5, opacity: 0.94, delay: -6.2 },
  { index: 10, x: 88, y: 82, width: 112, angle: 7, opacity: 0.85, delay: -2.6 },
];

// На телефоне все 11 видны вокруг портала: три сверху, по две сбоку, четыре снизу.
// Боковые группы остаются за губами, но не пробиваются сквозь отверстие.
const MOBILE_HEADS: readonly FloatingHead[] = [
  { index: 0, x: 16, y: 12, width: 69, angle: -8, opacity: 0.96, delay: -1.2 },
  { index: 1, x: 49, y: 8, width: 63, angle: 4, opacity: 0.84, delay: -3.4 },
  { index: 2, x: 83, y: 12, width: 72, angle: 7, opacity: 0.94, delay: -5.1 },
  { index: 3, x: 13, y: 35, width: 74, angle: -5, opacity: 0.96, delay: -2.0 },
  { index: 4, x: 87, y: 35, width: 72, angle: 5, opacity: 0.96, delay: -4.4 },
  { index: 5, x: 14, y: 61, width: 74, angle: 5, opacity: 0.94, delay: -1.8 },
  { index: 6, x: 87, y: 61, width: 72, angle: -5, opacity: 0.96, delay: -4.7 },
  { index: 7, x: 17, y: 84, width: 76, angle: -6, opacity: 0.94, delay: -1.0 },
  { index: 8, x: 40, y: 90, width: 65, angle: 7, opacity: 0.82, delay: -3.6 },
  { index: 9, x: 64, y: 88, width: 68, angle: -5, opacity: 0.86, delay: -6.2 },
  { index: 10, x: 85, y: 84, width: 74, angle: 6, opacity: 0.94, delay: -2.6 },
];

function FloatingFaces({
  images,
  heads,
  className,
  responsive,
}: {
  images: readonly string[];
  heads: readonly FloatingHead[];
  className: string;
  responsive: "mobile" | "tablet" | "desktop";
}) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {heads.map(({ index, x, y, width, angle, opacity, delay }) => {
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
              maxWidth: responsive === "mobile" ? "21%" : responsive === "tablet" ? "19%" : "15%",
              opacity,
              transform: `translate(-50%, -50%) rotate(${angle}deg)`,
            }}
          >
            <div
              className="intro-floating-head relative size-full"
              style={{ animationDelay: `${delay}s`, animationDuration: `${8 + (index % 4)}s` }}
            >
              <Image
                src={src}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 639px) 75px, (max-width: 1023px) 125px, 170px"
                className="object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,.65)] select-none"
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
      className="group absolute top-1/2 left-1/2 z-30 block aspect-[1000/914] w-[61%] max-w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-[40%] transition-transform duration-300 outline-none hover:scale-[1.045] focus-visible:scale-[1.045] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#72d1bc] motion-reduce:transition-none sm:w-[49%] sm:max-w-[370px] lg:w-[43%] lg:max-w-[500px]"
    >
      {/* Непрозрачная подложка не даёт головам появляться в отверстии рта. */}
      <span
        aria-hidden="true"
        className="absolute inset-[10%] rounded-[48%] bg-[#130d0e] shadow-[0_0_55px_24px_rgba(20,8,8,.56)]"
      />
      <Image
        src="/icons/intro-mouth.png"
        alt=""
        fill
        priority
        sizes="(max-width: 639px) 65vw, (max-width: 1023px) 370px, 500px"
        className="pointer-events-none relative object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,.68)] transition-[filter] duration-300 group-hover:brightness-110"
        draggable={false}
      />
      <span className="pointer-events-none absolute inset-x-[15%] top-[53%] flex -translate-y-1/2 flex-col items-center gap-1.5 text-center">
        <span className="font-serif text-[clamp(12px,3.3vw,28px)] leading-none font-bold tracking-[.07em] whitespace-nowrap text-[#fff0de] drop-shadow-[0_3px_10px_#110707] sm:tracking-[.13em]">
          ВАМ СЮДИ
        </span>
        <span className="text-[18px] leading-none text-[#75cbb8] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 sm:text-2xl">
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
    return Array.from(
      { length: 11 },
      (_, index) => configured[index] || INTRO_HEAD_FALLBACK[index] || "",
    );
  }, [intro.heads]);
  const siteHref = intro.siteHref || "/home";

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#180f0e] text-[#f1dfce]">
      <style>{`
        @keyframes intro-head-hover {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -6px, 0); }
        }
        .intro-floating-head {
          animation: intro-head-hover 9s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .intro-floating-head { animation: none !important; }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(125,63,48,.19),transparent_60%),linear-gradient(180deg,#261814_0%,#170f0e_100%)]"
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
        <div className="relative mx-auto flex min-h-dvh w-full max-w-[1320px] flex-col items-center px-3 pt-8 pb-9 sm:px-7 sm:pt-10 lg:pt-10">
          <header className="relative z-20 mx-auto max-w-[950px] text-center">
            <p className="mb-3 text-[10px] font-semibold tracking-[.27em] text-[#6cbba8] uppercase">
              ПРОЛОГ / 11 ОБРАЗІВ / ОДИН ВХІД
            </p>
            <h1 className="font-serif text-[clamp(2rem,5vw,4.15rem)] leading-[1.06] tracking-[-.045em]">
              Обережно.
              <span className="mt-0.5 block text-[#74ccb6] italic">Далі — сайт Ніконорова.</span>
            </h1>
          </header>

          {/* Полноценная сцена вместо прямоугольной "карточки": портреты
              собираются вокруг рта в единую композицию, без случайных рамок. */}
          <section
            aria-label="Одинадцять образів Слави Ніконорова та вхід на сайт"
            className="relative mx-auto mt-4 h-[520px] w-full max-w-[1180px] overflow-hidden sm:mt-5 sm:h-[590px] lg:h-[630px] xl:h-[650px]"
          >
            {/* Центральный мягкий свет собирает лица и портал в одну сцену. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(109,47,41,.28)_0%,rgba(69,34,29,.14)_34%,transparent_72%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[6%] top-[8%] h-[84%] rounded-[50%] border border-[#bc8969]/[.08]"
            />

            <FloatingFaces
              images={images}
              heads={MOBILE_HEADS}
              responsive="mobile"
              className="sm:hidden"
            />
            <FloatingFaces
              images={images}
              heads={TABLET_HEADS}
              responsive="tablet"
              className="hidden sm:block lg:hidden"
            />
            <FloatingFaces
              images={images}
              heads={DESKTOP_HEADS}
              responsive="desktop"
              className="hidden lg:block"
            />
            <MouthEntrance href={siteHref} />
          </section>

          <p className="relative z-10 -mt-1 max-w-[800px] text-center font-serif text-[clamp(1.05rem,2.3vw,1.5rem)] leading-[1.5] text-[#e5cbb7] italic sm:mt-0">
            «Я покажу, наскільки глибока ротова нора».
          </p>
          <p className="mt-3 text-center text-[10px] tracking-[.2em] text-[#a99183] uppercase">
            Натисни на рот, щоб увійти
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
