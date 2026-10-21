"use client";

import { useEffect, useRef } from "react";

import Image from "next/image";

type Face = {
  src: string;
  position: string;
  appearance: string;
  depth: number;
};

// Все позиции заданы отдельными статическими Tailwind-классами.
// На десктопе сохраняем композицию, но даём запас на поворот и параллакс:
// никакая голова не должна опираться на край обрезающего контейнера.
const desktopFaces: Face[] = [
  {
    src: "/images/hero-faces/face-05.png",
    position: "left-[62%] top-[6%] z-0 w-[clamp(135px,13vw,175px)] -rotate-[4deg]",
    appearance: "opacity-40 brightness-[0.62] saturate-[0.65] blur-[0.7px]",
    depth: 3,
  },
  {
    src: "/images/hero-faces/face-02.png",
    position: "left-[46%] top-[20%] z-20 w-[clamp(215px,21vw,290px)] -rotate-[5deg]",
    appearance: "opacity-90 brightness-[0.84] saturate-[0.82]",
    depth: 9,
  },
  {
    src: "/images/hero-faces/face-01.png",
    position: "right-[6%] top-[9%] z-10 w-[clamp(215px,20vw,285px)] rotate-[3deg]",
    appearance: "opacity-85 brightness-[0.82] saturate-[0.85]",
    depth: 7,
  },
  {
    src: "/images/hero-faces/face-04.png",
    position: "left-[49%] top-[53%] z-10 w-[clamp(165px,16.5vw,220px)] rotate-[5deg]",
    appearance: "opacity-70 brightness-[0.73] saturate-[0.75]",
    depth: 5,
  },
  {
    src: "/images/hero-faces/face-06.png",
    position: "right-[6%] top-[52%] z-10 w-[clamp(175px,17.5vw,230px)] -rotate-[4deg]",
    appearance: "opacity-75 brightness-[0.77] saturate-[0.8]",
    depth: 6,
  },
];

// Мобильная композиция отдельная. Каждая голова находится с небольшим запасом
// ВНУТРИ области Hero, даже с учётом наклона. Не выносим карточки за края:
// внешние overflow-hidden нужны, чтобы не появлялась горизонтальная прокрутка.
const mobileFaces: Omit<Face, "depth">[] = [
  {
    src: "/images/hero-faces/face-05.png",
    position: "left-1/2 top-[8%] z-[1] w-[min(28%,130px)] -translate-x-1/2 -rotate-[6deg]",
    appearance: "opacity-30 brightness-[0.65] saturate-[0.6] blur-[0.5px]",
  },
  {
    src: "/images/hero-faces/face-02.png",
    position: "left-[5%] top-[16%] z-[5] w-[min(40%,185px)] -rotate-[7deg]",
    appearance: "opacity-80 brightness-[0.82] saturate-[0.75]",
  },
  {
    src: "/images/hero-faces/face-01.png",
    position: "right-[5%] top-[15%] z-[5] w-[min(40%,185px)] rotate-[7deg]",
    appearance: "opacity-80 brightness-[0.8] saturate-[0.8]",
  },
  {
    src: "/images/hero-faces/face-04.png",
    position: "bottom-[16%] left-[6%] z-[4] w-[min(34%,160px)] rotate-[7deg]",
    appearance: "opacity-55 brightness-[0.72] saturate-[0.7]",
  },
  {
    src: "/images/hero-faces/face-06.png",
    position: "bottom-[17%] right-[6%] z-[4] w-[min(34%,160px)] -rotate-[7deg]",
    appearance: "opacity-60 brightness-[0.76] saturate-[0.75]",
  },
];

export function HeroFaces() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopPointer = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine)",
    );
    const layers = Array.from(container.querySelectorAll<HTMLElement>("[data-parallax]"));

    let frame: number | null = null;
    let mouseX = 0;
    let mouseY = 0;

    const update = () => {
      frame = null;
      for (const layer of layers) {
        const depth = Number(layer.dataset.parallax) || 0;
        layer.style.transform = `translate3d(${(mouseX * depth).toFixed(2)}px, ${(mouseY * depth).toFixed(2)}px, 0)`;
      }
    };

    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    const reset = () => {
      if (mouseX === 0 && mouseY === 0) return;
      mouseX = 0;
      mouseY = 0;
      scheduleUpdate();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reducedMotion.matches || !desktopPointer.matches) {
        reset();
        return;
      }

      // Движение только при наведении на Hero, а не по всему окну браузера.
      const rect = container.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom ||
        rect.width === 0 ||
        rect.height === 0
      ) {
        reset();
        return;
      }

      mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      scheduleUpdate();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", reset);
    window.addEventListener("resize", reset, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", reset);
      window.removeEventListener("resize", reset);
      if (frame !== null) window.cancelAnimationFrame(frame);
      for (const layer of layers) layer.style.transform = "";
    };
  }, []);

  // Переполнение обрезаем лишь как страховку от горизонтального скролла.
  // Ниже все изображения находятся с запасом внутри границ коллажа.
  return (
    <div
      ref={containerRef}
      aria-label="Колаж творчих образів Слави Ніконорова"
      role="img"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      <style>{`
        @keyframes heroPortraitFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -5px, 0); }
        }

        @media (prefers-reduced-motion: no-preference) {
          .hero-portrait-floating {
            animation: heroPortraitFloat 9s ease-in-out infinite;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-portrait-floating { animation: none !important; }
          .hero-face-parallax { transition: none !important; }
        }
      `}</style>

      {/* Подсветка, соединяющая отдельные головы в одну композицию. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-[-5%] top-[5%] h-[90%] rounded-full bg-[radial-gradient(ellipse_at_50%_50%,rgba(155,85,48,0.19)_0%,transparent_67%)] blur-3xl lg:inset-x-auto lg:top-[8%] lg:left-[39%] lg:h-[84%] lg:w-[60%]"
      />

      {/* МОБИЛЬНАЯ И ПЛАНШЕТНАЯ ВЕРСИЯ: масштаб от размеров Hero. */}
      <div aria-hidden="true" className="absolute inset-0 lg:hidden">
        {mobileFaces.map((face) => (
          <div key={face.src} className={`absolute origin-center ${face.position}`}>
            <Image
              src={face.src}
              alt=""
              width={350}
              height={420}
              sizes="(max-width: 639px) 45vw, (max-width: 1023px) 210px, 0px"
              className={`block h-auto w-full object-contain drop-shadow-[0_15px_28px_rgba(0,0,0,0.48)] select-none ${face.appearance}`}
            />
          </div>
        ))}

        {/* Небольшое затемнение у основания: переход к следующему блоку Hero. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-[35] h-[14%] bg-gradient-to-t from-site-bg/30 via-site-bg/5 to-transparent"
        />
      </div>

      {/* DESKTOP: второстепенные образы слегка растворяются в фоне слева и справа. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden lg:block"
        style={{
          maskImage: "linear-gradient(to right, transparent 31%, black 42%, black 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 31%, black 42%, black 100%)",
        }}
      >
        {desktopFaces.map((face) => (
          <div key={face.src} className={`absolute origin-center ${face.position}`}>
            <div
              data-parallax={face.depth}
              className="hero-face-parallax transition-transform duration-500 ease-out will-change-transform"
            >
              <Image
                src={face.src}
                alt=""
                width={420}
                height={500}
                sizes="(min-width: 1024px) 330px, 0px"
                className={`block h-auto w-full object-contain drop-shadow-[0_22px_40px_rgba(0,0,0,0.45)] select-none ${face.appearance}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ГЛАВНЫЙ ПОРТРЕТ: крупный, но оставляет боковые головы видимыми. */}
      <div className="absolute bottom-[9%] left-1/2 z-30 w-[min(74%,345px)] -translate-x-1/2 sm:bottom-[6%] sm:w-[min(68%,385px)] lg:top-[12%] lg:bottom-auto lg:left-[54%] lg:w-[clamp(395px,37vw,500px)] lg:translate-x-0 xl:top-[11%] xl:left-[53%]">
        <div
          data-parallax={5}
          className="hero-face-parallax transition-transform duration-500 ease-out lg:will-change-transform"
        >
          <div className="hero-portrait-floating">
            <Image
              src="/images/portrait.png"
              alt=""
              width={700}
              height={760}
              priority
              sizes="(max-width: 639px) 74vw, (max-width: 1023px) 385px, (max-width: 1350px) 37vw, 500px"
              className="block h-auto w-full rotate-[1deg] object-contain drop-shadow-[0_30px_48px_rgba(0,0,0,0.55)] select-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
