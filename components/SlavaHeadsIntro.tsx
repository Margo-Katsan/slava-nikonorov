"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";

/**
 * Положи 6 PNG/WebP с прозрачным фоном в public/images/heads/
 * и замени пути ниже на реальные имена файлов.
 * Каждая следующая фотография — голова следующего размера.
 */
const HEAD_IMAGES = [
  "/images/hero-faces/face-01.png",
  "/images/hero-faces/face-02.png",
  "/images/hero-faces/face-03.png",
  "/images/hero-faces/face-04.png",
  "/images/hero-faces/face-05.png",
  "/images/hero-faces/face-06.png",
] as const;

// Укажи адрес основного сайта. Например, если игра на /intro, это может быть "/".
const SITE_HREF = "/home";

const W = 420;
const H = 550;
const DANGER_Y = 86;
const RADII = [19, 27, 37, 50, 68, 89] as const;
const COLORS = ["#e7b78b", "#dba380", "#c58c75", "#b87c6b", "#aa786a", "#269685"];
const MAX_LEVEL = RADII.length - 1;
const DROP_DELAY_MS = 320;

type GameStatus = "playing" | "lost" | "won";
type Head = {
  id: number;
  level: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max));
}

function newLevel() {
  // Новые головы падают только первых трёх размеров.
  return Math.floor(Math.random() * 3);
}

function radius(head: Head) {
  return RADII[head.level];
}

export function HeadsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesRef = useRef<Head[]>([]);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const idRef = useRef(0);
  const nextRef = useRef(0);
  const statusRef = useRef<GameStatus>("playing");
  const pointerRef = useRef(W / 2);
  const lastDropRef = useRef(0);
  const overflowRef = useRef(0);
  const [next, setNext] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [auto, setAuto] = useState(false);

  const endGame = useCallback((result: "lost" | "won") => {
    if (statusRef.current !== "playing") return;
    statusRef.current = result;
    setStatus(result);
    setAuto(false);
  }, []);

  const restart = useCallback(() => {
    piecesRef.current = [];
    idRef.current = 0;
    overflowRef.current = 0;
    lastDropRef.current = 0;
    pointerRef.current = W / 2;
    nextRef.current = 0;
    statusRef.current = "playing";
    setNext(0);
    setScore(0);
    setStatus("playing");
    setAuto(false);
  }, []);

  const drop = useCallback(() => {
    if (statusRef.current !== "playing") return;
    const now = performance.now();
    if (now - lastDropRef.current < DROP_DELAY_MS) return;
    lastDropRef.current = now;

    const level = nextRef.current;
    const r = RADII[level];
    piecesRef.current.push({
      id: ++idRef.current,
      level,
      x: clamp(pointerRef.current, r + 3, W - r - 3),
      y: r + 2,
      vx: 0,
      vy: 0,
      age: 0,
    });
    const upcoming = newLevel();
    nextRef.current = upcoming;
    setNext(upcoming);
  }, []);

  // Загрузка изображений происходит только в браузере.
  useEffect(() => {
    let cancelled = false;
    const assets: (HTMLImageElement | null)[] = Array(HEAD_IMAGES.length).fill(null);
    imagesRef.current = assets;
    HEAD_IMAGES.forEach((src, index) => {
      const image = new window.Image();
      image.onload = () => {
        if (!cancelled) assets[index] = image;
      };
      image.onerror = () => {
        // Если путь ещё не задан — показываем запасной круг с номером уровня.
      };
      image.src = src;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Физика — фиксированные шаги 1/60 сек, чтобы на разных экранах
  // головы падали примерно одинаково.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let frameId = 0;
    let previous = 0;
    let accumulator = 0;

    function physics() {
      if (statusRef.current !== "playing") return;
      const items = piecesRef.current;

      for (const p of items) {
        const r = radius(p);
        p.age += 1;
        p.vy += 0.34;
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x - r < 0) {
          p.x = r;
          p.vx = Math.abs(p.vx) * 0.25;
        }
        if (p.x + r > W) {
          p.x = W - r;
          p.vx = -Math.abs(p.vx) * 0.25;
        }
        if (p.y + r > H) {
          p.y = H - r;
          p.vy = p.vy > 0.75 ? -p.vy * 0.16 : 0;
          p.vx *= 0.9;
        }
      }

      // Раздвигаем пересечения и объединяем пары одного уровня.
      for (let pass = 0; pass < 3; pass++) {
        let didMerge = false;
        for (let i = 0; i < items.length; i++) {
          for (let j = i + 1; j < items.length; j++) {
            const a = items[i];
            const b = items[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distance = Math.max(Math.hypot(dx, dy), 0.0001);
            const minDistance = radius(a) + radius(b);
            if (distance >= minDistance) continue;

            if (a.level === b.level && a.age > 10 && b.age > 10) {
              if (a.level === MAX_LEVEL) {
                endGame("won");
                return;
              }
              const upgradedLevel = a.level + 1;
              const r = RADII[upgradedLevel];
              const combined: Head = {
                id: ++idRef.current,
                level: upgradedLevel,
                x: clamp((a.x + b.x) / 2, r, W - r),
                y: clamp((a.y + b.y) / 2, r, H - r),
                vx: (a.vx + b.vx) * 0.35,
                vy: Math.min((a.vy + b.vy) * 0.2 - 2, 0),
                age: 0,
              };
              items.splice(j, 1);
              items.splice(i, 1);
              items.push(combined);
              setScore((s) => s + (upgradedLevel + 1) * 10);
              didMerge = true;
              break;
            }

            // Чем крупнее голова, тем труднее сдвинуть её.
            const nx = dx / distance;
            const ny = dy / distance;
            const overlap = minDistance - distance;
            const ma = radius(a) ** 2;
            const mb = radius(b) ** 2;
            const total = ma + mb;
            a.x -= nx * overlap * (mb / total);
            a.y -= ny * overlap * (mb / total);
            b.x += nx * overlap * (ma / total);
            b.y += ny * overlap * (ma / total);

            const normalSpeed = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (normalSpeed < 0) {
              const impulse = -normalSpeed * 0.28;
              a.vx -= nx * impulse * (mb / total);
              a.vy -= ny * impulse * (mb / total);
              b.vx += nx * impulse * (ma / total);
              b.vy += ny * impulse * (ma / total);
            }
          }
          if (didMerge) break;
        }
        // Если после объединения массив изменился — новый проход.
        if (didMerge) continue;
      }

      // Возвращаем предметы в контейнер после столкновений.
      for (const p of items) {
        const r = radius(p);
        p.x = clamp(p.x, r, W - r);
        p.y = Math.min(p.y, H - r);
      }

      // Проигрыш, если головы лежат выше красной черты ~ 1.7 сек.
      const overfilled = items.some(
        (p) => p.age > 48 && p.y - radius(p) < DANGER_Y && Math.abs(p.vy) < 1.2,
      );
      overflowRef.current = overfilled ? overflowRef.current + 1 : 0;
      if (overflowRef.current > 100) endGame("lost");
    }

    function drawHead(head: Head, opacity = 1) {
      if (!ctx) return;
      const r = radius(head);
      const asset = imagesRef.current[head.level];
      ctx.save();
      ctx.globalAlpha = opacity;

      // Тень повторяет форму прозрачного PNG, не добавляя круглый фон.
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 5;
      if (asset?.complete && asset.naturalWidth > 0) {
        const box = 2 * r * 1.12;
        const aspect = asset.naturalWidth / asset.naturalHeight;
        const width = aspect >= 1 ? box : box * aspect;
        const height = aspect >= 1 ? box / aspect : box;
        ctx.drawImage(asset, head.x - width / 2, head.y - height / 2, width, height);
      } else {
        // Запасной вариант, пока не указаны настоящие фото.
        ctx.fillStyle = COLORS[head.level];
        ctx.beginPath();
        ctx.ellipse(head.x, head.y, r * 0.92, r * 0.98, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.fillStyle = "#2b1715";
        ctx.font = `bold ${Math.max(11, r * 0.65)}px Georgia`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(head.level + 1), head.x, head.y);
      }
      ctx.restore();
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      const backdrop = ctx.createLinearGradient(0, 0, 0, H);
      backdrop.addColorStop(0, "#32201c");
      backdrop.addColorStop(1, "#1b1311");
      ctx.fillStyle = backdrop;
      ctx.fillRect(0, 0, W, H);

      // Линия переполнения.
      ctx.save();
      ctx.setLineDash([7, 7]);
      ctx.strokeStyle = "rgba(202, 122, 103, 0.7)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, DANGER_Y);
      ctx.lineTo(W, DANGER_Y);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "rgba(233,203,183,0.46)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("МЕЖА ГОЛІВ", 12, DANGER_Y - 9);

      for (const p of piecesRef.current) drawHead(p);

      if (statusRef.current === "playing") {
        // Полупрозрачная подсказка: куда упадёт следующая голова.
        const r = RADII[nextRef.current];
        const ghost: Head = {
          id: -1,
          level: nextRef.current,
          x: clamp(pointerRef.current, r + 3, W - r - 3),
          y: r + 2,
          vx: 0,
          vy: 0,
          age: 0,
        };
        drawHead(ghost, 0.55);
      }
    }

    function animate(now: number) {
      if (!previous) previous = now;
      accumulator += Math.min(now - previous, 48);
      previous = now;
      let cycles = 0;
      while (accumulator >= 1000 / 60 && cycles < 3) {
        physics();
        accumulator -= 1000 / 60;
        cycles++;
      }
      draw();
      frameId = requestAnimationFrame(animate);
    }
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [endGame]);

  // Дополнительный режим автопадения для заставки.
  useEffect(() => {
    if (!auto || status !== "playing") return;
    const interval = window.setInterval(() => {
      const same = piecesRef.current.filter((p) => p.level === nextRef.current);
      const target = same.length ? same[Math.floor(Math.random() * same.length)] : null;
      pointerRef.current = target
        ? target.x + (Math.random() - 0.5) * 28
        : 30 + Math.random() * (W - 60);
      drop();
    }, 1250);
    return () => window.clearInterval(interval);
  }, [auto, status, drop]);

  // Клавиатура: влево / вправо — прицел, пробел — бросить.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") pointerRef.current -= 24;
      else if (event.key === "ArrowRight") pointerRef.current += 24;
      else if (event.key === " " || event.key === "Enter") {
        if (
          event.target instanceof HTMLElement &&
          ["BUTTON", "A", "INPUT", "TEXTAREA"].includes(event.target.tagName)
        )
          return;
        drop();
      } else return;
      event.preventDefault();
      pointerRef.current = clamp(pointerRef.current, 20, W - 20);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drop]);

  function setPointer(clientX: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerRef.current = clamp(((clientX - rect.left) / rect.width) * W, 0, W);
  }

  return (
    <div className="w-full max-w-[460px]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-[#ead6c9]">
        <div className="text-xs tracking-[0.18em] uppercase">
          Голови зібрано: <b className="ml-2 text-[#e9b080]">{score}</b>
        </div>
        <div className="text-xs tracking-[0.18em] uppercase">
          Далі: <b className="text-[#3eb29b]">{next + 1} рівень</b>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-[#785246]/70 bg-[#241814] shadow-[0_22px_70px_rgba(0,0,0,0.4)]">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          aria-label="Гра: скидай голови Слави та поєднуй однакові"
          className="block aspect-[420/550] w-full cursor-crosshair touch-none select-none"
          onPointerMove={(event) => setPointer(event.clientX)}
          onPointerDown={(event) => {
            setPointer(event.clientX);
            drop();
          }}
        />

        {status !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#160e0c]/90 px-8 text-center backdrop-blur-sm">
            <h3 className="font-serif text-4xl text-[#f0dfcf]">
              {status === "won" ? "Усі образи зібрано!" : "Головам стало тісно!"}
            </h3>
            <p className="mt-4 text-sm leading-6 text-[#c1a59a]">
              {status === "won"
                ? "Ти об’єднав найбільші голови. Час зазирнути на сайт."
                : "Спробуй іще раз — або заходь на сайт."}
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-7 rounded-full bg-[#258c7a] px-6 py-3 text-sm font-semibold text-[#120d0c] transition hover:bg-[#36aa94]"
            >
              Ще одна спроба ↻
            </button>
            <Link
              className="mt-5 text-sm text-[#e7c4a9] underline underline-offset-4"
              href={SITE_HREF}
            >
              Увійти на сайт →
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[260px] text-xs leading-5 text-[#c6a99b]">
          Клацай або торкайся, щоб кинути голову. Дві однакові → одна більша.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAuto((v) => !v)}
            disabled={status !== "playing"}
            className="rounded-full border border-[#785246] px-4 py-2 text-xs text-[#ebd0bd] transition hover:border-[#2b9985] disabled:opacity-40"
          >
            {auto ? "Авто: увімк. ⏸" : "Автопадіння ▶"}
          </button>
          <button
            type="button"
            onClick={restart}
            className="rounded-full border border-[#785246] px-4 py-2 text-xs text-[#ebd0bd] transition hover:border-[#2b9985]"
          >
            Заново ↻
          </button>
        </div>
      </div>
    </div>
  );
}

// Полноэкранная вступительная страница.
export default function SlavaHeadsIntro() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(ellipse_at_50%_38%,#493027_0%,#241813_55%,#1a1210_100%)] px-5 py-10 text-[#eed9cb] sm:px-8">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-8 lg:grid lg:min-h-[calc(100dvh-5rem)] lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-16">
        <div className="max-w-[520px] text-center lg:text-left">
          <p className="mb-5 text-xs tracking-[0.25em] text-[#e4bda8] uppercase">
            Обережно! Далі — сайт Ніконорова
          </p>
          <h1 className="font-serif text-[clamp(3.1rem,6vw,6.2rem)] leading-[0.98] tracking-[-0.05em]">
            Гра в <span className="text-[#2da48e] italic">голови</span>
          </h1>
          <p className="mt-7 max-w-[440px] text-base leading-7 text-[#d4b5a4]">
            Тут кожен образ має значення. Кидай мої голови в контейнер: дві однакові зливаються в
            одну більшу. І так, поки головам не стане затісно.
          </p>
          <Link
            href={SITE_HREF}
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#b38b76] px-6 py-3 text-sm transition hover:border-[#2da48e] hover:text-[#55bba7]"
          >
            Пропустити вступ <span aria-hidden>↗</span>
          </Link>
        </div>
        <HeadsGame />
      </div>
    </main>
  );
}
