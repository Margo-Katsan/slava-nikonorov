"use client";

import { useEffect, useRef } from "react";

import Image from "next/image";

type Face = {
  src: string;
  position: string;
  appearance: string;
  depth: number;
};

const faces: Face[] = [
  // ДАЛЬНИЙ ВЕРХНИЙ ОБРАЗ
  {
    src: "/images/hero-faces/face-05.png",
    position: "left-[63%] top-[1%] z-0 " + "w-[clamp(155px,15vw,210px)] " + "-rotate-[4deg]",
    appearance: "opacity-[0.4] brightness-[0.62] " + "saturate-[0.65] blur-[0.7px]",
    depth: 3,
  },

  // ЛЕВОЕ КРУПНОЕ ЛИЦО
  {
    src: "/images/hero-faces/face-02.png",
    position: "left-[46%] top-[19%] z-20 " + "w-[clamp(230px,22vw,305px)] " + "-rotate-[5deg]",
    appearance: "opacity-[0.9] brightness-[0.84] " + "saturate-[0.82]",
    depth: 9,
  },

  // ПРАВОЕ ВЕРХНЕЕ ЛИЦО
  {
    src: "/images/hero-faces/face-01.png",
    position: "left-[76%] top-[7%] z-10 " + "w-[clamp(225px,23vw,320px)] " + "rotate-[3deg]",
    appearance: "opacity-[0.85] brightness-[0.82] " + "saturate-[0.85]",
    depth: 7,
  },

  // НИЖНЕЕ ЛЕВОЕ ЛИЦО
  {
    src: "/images/hero-faces/face-04.png",
    position: "left-[50%] top-[57%] z-10 " + "w-[clamp(185px,18vw,250px)] " + "rotate-[5deg]",
    appearance: "opacity-[0.72] brightness-[0.73] " + "saturate-[0.75]",
    depth: 5,
  },

  // НИЖНЕЕ ПРАВОЕ ЛИЦО
  {
    src: "/images/hero-faces/face-06.png",
    position: "left-[77%] top-[50%] z-10 " + "w-[clamp(195px,20vw,280px)] " + "-rotate-[4deg]",
    appearance: "opacity-[0.78] brightness-[0.77] " + "saturate-[0.8]",
    depth: 6,
  },
];

export function HeroFaces() {
  const containerRef = useRef<HTMLDivElement>(null);

  // ПАРАЛЛАКС
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    if (reducedMotion.matches || !finePointer.matches) {
      return;
    }

    const layers = container.querySelectorAll<HTMLElement>("[data-parallax]");

    let frame: number | null = null;
    let mouseX = 0;
    let mouseY = 0;

    const update = () => {
      layers.forEach((layer) => {
        const depth = Number(layer.dataset.parallax || 0);

        const x = mouseX * depth;
        const y = mouseY * depth;

        layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });

      frame = null;
    };

    const scheduleUpdate = () => {
      if (frame === null) {
        frame = requestAnimationFrame(update);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;

      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;

      scheduleUpdate();
    };

    const reset = () => {
      mouseX = 0;
      mouseY = 0;
      scheduleUpdate();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    window.addEventListener("blur", reset);
    document.addEventListener("mouseleave", reset);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);

      window.removeEventListener("blur", reset);
      document.removeEventListener("mouseleave", reset);

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }

      layers.forEach((layer) => {
        layer.style.transform = "";
      });
    };
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-10">
      {/* АНИМАЦИЯ ГЛАВНОГО ПОРТРЕТА */}

      <style>
        {`
          @keyframes portraitFloat {
            0%, 100% {
              transform: translate3d(0, 0, 0);
            }

            50% {
              transform: translate3d(0, -7px, 0);
            }
          }

          @media (prefers-reduced-motion: no-preference) {
            .portrait-floating {
              animation:
                portraitFloat 9s ease-in-out infinite;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .face-parallax {
              transition: none !important;
            }

            .portrait-floating {
              animation: none !important;
            }
          }
        `}
      </style>

      {/* МЯГКОЕ СВЕЧЕНИЕ ЗА КОМПОЗИЦИЕЙ */}

      <div
        aria-hidden="true"
        className="absolute top-[7%] left-[14%] h-[85%] w-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(155,85,48,0.17)_0%,transparent_72%)] blur-3xl lg:top-[7%] lg:left-[43%] lg:h-[82%] lg:w-[55%]"
      />

      {/* МОБИЛЬНАЯ КОМПОЗИЦИЯ */}

      <div aria-hidden="true" className="absolute inset-0 overflow-hidden lg:hidden">
        {/* ЛЕВОЕ ЛИЦО */}

        <div className="absolute top-[18%] left-[2%] w-[min(49vw,215px)] -rotate-[7deg] opacity-[0.70] sm:left-[13%]">
          <Image
            src="/images/hero-faces/face-02.png"
            alt=""
            width={350}
            height={420}
            sizes="(max-width: 640px) 47vw, 205px"
            className="block h-auto w-full object-contain brightness-[0.76] drop-shadow-[0_18px_30px_rgba(0,0,0,0.4)] saturate-[0.76]"
          />
        </div>

        {/* ПРАВОЕ ЛИЦО */}

        <div className="absolute top-[13%] right-[2%] w-[min(50vw,220px)] rotate-[6deg] opacity-[0.75] sm:right-[13%]">
          <Image
            src="/images/hero-faces/face-01.png"
            alt=""
            width={350}
            height={420}
            sizes="(max-width: 640px) 48vw, 210px"
            className="block h-auto w-full object-contain brightness-[0.79] drop-shadow-[0_18px_30px_rgba(0,0,0,0.4)] saturate-[0.8]"
          />
        </div>
      </div>

      {/* ВСЕ ВТОРОСТЕПЕННЫЕ ЛИЦА — DESKTOP */}

      <div
        aria-hidden="true"
        className="absolute inset-0 hidden overflow-hidden lg:block"
        style={{
          maskImage:
            "linear-gradient(to right, " +
            "transparent 33%, " +
            "black 43%, " +
            "black 96%, " +
            "transparent 100%)",

          WebkitMaskImage:
            "linear-gradient(to right, " +
            "transparent 33%, " +
            "black 43%, " +
            "black 96%, " +
            "transparent 100%)",
        }}
      >
        {faces.map((face) => (
          <div key={face.src} className={["absolute origin-center", face.position].join(" ")}>
            <div
              data-parallax={face.depth}
              className="face-parallax transition-transform duration-500 ease-out will-change-transform"
            >
              <Image
                src={face.src}
                alt=""
                width={420}
                height={500}
                sizes="(min-width: 1024px) 330px, 0px"
                className={[
                  "block h-auto w-full",
                  "object-contain select-none",
                  "drop-shadow-[0_22px_40px_rgba(0,0,0,0.45)]",
                  face.appearance,
                ].join(" ")}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ГЛАВНЫЙ ПОРТРЕТ */}

      <div className="absolute bottom-[8%] left-1/2 z-30 w-[min(88vw,380px)] -translate-x-1/2 sm:bottom-[6%] sm:w-[min(68vw,420px)] lg:top-[12%] lg:bottom-auto lg:left-[54%] lg:w-[clamp(395px,37vw,500px)] lg:translate-x-0 xl:top-[11%] xl:left-[53%]">
        {/* ПАРАЛЛАКС */}

        <div
          data-parallax={5}
          className="face-parallax transition-transform duration-500 ease-out will-change-transform"
        >
          {/* МЯГКОЕ ДВИЖЕНИЕ */}

          <div className="portrait-floating">
            <Image
              src="/images/portrait.png"
              alt="Слава Ніконоров"
              width={700}
              height={760}
              priority
              sizes="
                (max-width: 640px) 90vw,
                (max-width: 1023px) 440px,
                (max-width: 1350px) 37vw,
                500px
              "
              className="block h-auto w-full rotate-[1deg] object-contain drop-shadow-[0_32px_52px_rgba(0,0,0,0.48)] select-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
