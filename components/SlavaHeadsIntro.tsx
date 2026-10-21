"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";

import { DEFAULT_INTRO, INTRO_HEAD_FALLBACK, type IntroPublicConfig } from "@/lib/intro/types";

/**
 * A self-contained rebuild of the introductory merging game.
 * No dependencies or changes to the admin / DB data model are needed.
 * Everything is measured in logical canvas pixels; CSS scales the entire field.
 */
const FIELD_W = 420;
const FIELD_H = 550;
const LOSS_LINE = 86;

// Eleven levels. Level 11 fills 94% of the width. Level 10 is small enough
// that two of them can occupy the field simultaneously and be merged.
const RADII = [20, 27, 35, 45, 57, 71, 87, 104, 120, 130, 197] as const;
const MAX_LEVEL = RADII.length - 1;
const GRAVITY = 2.0;
const MAX_SPEED = 25;
const SUBSTEPS = 2; // Collision correction at high falling speed
const SOLVER_PASSES = 24;
const MIN_DROP_MS = 280;
const OVERFLOW_FRAMES = 110; // Consecutive fixed simulation ticks
const TWO_PI = Math.PI * 2;

const COLORS = [
  "#e7b78b",
  "#dba380",
  "#c58c75",
  "#b87c6b",
  "#aa786a",
  "#c99778",
  "#af8e7a",
  "#ad7b69",
  "#9c7466",
  "#4d8c7c",
  "#269685",
] as const;

export type GameHead = {
  id: number;
  level: number;
  x: number;
  y: number;
  vy: number;
  age: number;
  resting: number;
};

type Sprite = {
  image: HTMLImageElement;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  aspect: number;
};

type Axes = { rx: number; ry: number };
export type StepOutcome = {
  pieces: GameHead[];
  id: number;
  points: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const spawnLevel = () => Math.floor(Math.random() * 3);

/**
 * Crop the transparent PNG margins exactly once on load. Without this, even
 * touching physics shapes leave obvious gaps between the visible faces.
 * We use a fitted ellipse, not the expensive 96-direction pixel collision
 * profiles that made the previous physics unstable.
 */
function makeSprite(image: HTMLImageElement): Sprite {
  const fallback: Sprite = {
    image,
    sx: 0,
    sy: 0,
    sw: image.naturalWidth,
    sh: image.naturalHeight,
    aspect: image.naturalWidth / Math.max(1, image.naturalHeight),
  };
  try {
    const scale = Math.min(1, 384 / Math.max(image.naturalWidth, image.naturalHeight));
    const cw = Math.max(1, Math.round(image.naturalWidth * scale));
    const ch = Math.max(1, Math.round(image.naturalHeight * scale));
    const offscreen = document.createElement("canvas");
    offscreen.width = cw;
    offscreen.height = ch;
    const ctx = offscreen.getContext("2d", { willReadFrequently: true });
    if (!ctx) return fallback;
    ctx.drawImage(image, 0, 0, cw, ch);
    const pixels = ctx.getImageData(0, 0, cw, ch).data;
    let left = cw,
      right = -1,
      top = ch,
      bottom = -1;
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        if (pixels[(y * cw + x) * 4 + 3] < 42) continue;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
    if (right < left || bottom < top) return fallback;
    const sw = (right + 1 - left) / scale;
    const sh = (bottom + 1 - top) / scale;
    return { image, sx: left / scale, sy: top / scale, sw, sh, aspect: sw / sh };
  } catch {
    // The CDN may block pixel readback. Drawing remains possible.
    return fallback;
  }
}

/** Colliders match the visible width / height of each cropped portrait. */
function axesFor(level: number, sprites: readonly (Sprite | null)[]): Axes {
  const size = RADII[level];
  const aspect = sprites[level]?.aspect ?? 1;
  const scale = 0.99; // One-pixel drawing safety margin
  // At the final level, fill almost the full FIELD WIDTH, not merely the
  // height of a narrow portrait. Preserve the source image aspect ratio.
  if (level === MAX_LEVEL) {
    const rx = Math.min(size * scale, (FIELD_H / 2 - 2) * aspect);
    return { rx, ry: rx / aspect };
  }
  return aspect >= 1
    ? { rx: size * scale, ry: (size / aspect) * scale }
    : { rx: size * aspect * scale, ry: size * scale };
}

function keepInside(p: GameHead, sprites: readonly (Sprite | null)[]) {
  const { rx, ry } = axesFor(p.level, sprites);
  p.x = clamp(p.x, rx, FIELD_W - rx);
  p.y = clamp(p.y, ry, FIELD_H - ry);
}

/**
 * Approximate the Minkowski sum of two face silhouettes with an ellipse.
 * A value < 1 means the visible shapes are colliding.
 */
function collision(a: GameHead, b: GameHead, sprites: readonly (Sprite | null)[]) {
  const aa = axesFor(a.level, sprites);
  const bb = axesFor(b.level, sprites);
  const sx = aa.rx + bb.rx;
  const sy = aa.ry + bb.ry;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return { dx, dy, sx, sy, distance: Math.hypot(dx / sx, dy / sy) };
}

/**
 * A drop is admitted only where its real sprite won't cover an existing head.
 * It starts at the top, and after each click only ONE object is created.
 */
export function findDropX(
  pieces: readonly GameHead[],
  level: number,
  desired: number,
  sprites: readonly (Sprite | null)[] = [],
): number | null {
  const { rx, ry } = axesFor(level, sprites);
  const start = clamp(desired, rx, FIELD_W - rx);
  const free = (x: number) => {
    const candidate: GameHead = { id: -1, level, x, y: ry + 1, vy: 0, age: 0, resting: 0 };
    return pieces.every((piece) => collision(candidate, piece, sprites).distance >= 1.005);
  };
  if (free(start)) return start;
  for (let d = 3; d < FIELD_W; d += 3) {
    if (start - d >= rx && free(start - d)) return start - d;
    if (start + d <= FIELD_W - rx && free(start + d)) return start + d;
  }
  return null;
}

/**
 * Repeatable physics tick. The solver never rolls back a complete frame and
 * never repacks / teleports the pile. Pairs merge BEFORE separation, keeping
 * the familiar falling-and-combining behavior.
 */
export function stepHeads(
  previous: readonly GameHead[],
  lastId: number,
  sprites: readonly (Sprite | null)[] = [],
): StepOutcome {
  const pieces = previous.map((p) => ({ ...p }));
  let id = lastId;
  let points = 0;
  const original = new Map(previous.map((p) => [p.id, { x: p.x, y: p.y }]));

  // Two small substeps stop fast heads from tunnelling through each other.
  for (let substep = 0; substep < SUBSTEPS; substep++) {
    for (const p of pieces) {
      p.vy = Math.min(MAX_SPEED, p.vy + GRAVITY / SUBSTEPS);
      p.y += p.vy / SUBSTEPS;
      keepInside(p, sprites);
    }

    // Only a bounded number of merges can occur in one tick. No score updates
    // or rerenders during the iterative collision solver.
    let mergesInStep = 0;
    let merged = true;
    while (merged && mergesInStep < 8) {
      merged = false;
      outer: for (let i = 0; i < pieces.length; i++) {
        for (let j = i + 1; j < pieces.length; j++) {
          const a = pieces[i];
          const b = pieces[j];
          if (a.level !== b.level || a.level >= MAX_LEVEL || a.age < 6 || b.age < 6) continue;
          const hit = collision(a, b, sprites);
          if (hit.distance > 1.02) continue;
          const level = a.level + 1;
          const newHead: GameHead = {
            id: ++id,
            level,
            x: (a.x + b.x) / 2,
            y: (a.y + b.y) / 2,
            vy: 0,
            age: 0,
            resting: 0,
          };
          keepInside(newHead, sprites);
          pieces.splice(j, 1);
          pieces.splice(i, 1);
          pieces.push(newHead);
          points += (level + 1) * 10;
          merged = true;
          mergesInStep++;
          break outer;
        }
      }
    }

    // Position-based corrections: no spring forces and no bounce impulses.
    // If crowded, we keep moving the pieces to the physically available
    // space instead of freezing the whole world, as the old code did.
    for (let pass = 0; pass < (mergesInStep ? 60 : SOLVER_PASSES); pass++) {
      let maximumError = 0;
      for (let i = 0; i < pieces.length; i++) {
        for (let j = i + 1; j < pieces.length; j++) {
          const a = pieces[i];
          const b = pieces[j];
          const h = collision(a, b, sprites);
          if (h.distance >= 1) continue;
          const error = 1 - h.distance;
          maximumError = Math.max(maximumError, error);
          // Resolve coincident centers upwards / downwards deterministically.
          const ux = h.distance > 0.0001 ? h.dx / h.sx / h.distance : 0;
          const uy = h.distance > 0.0001 ? h.dy / h.sy / h.distance : a.id < b.id ? -1 : 1;
          const overlapX = ux * error * h.sx;
          const overlapY = uy * error * h.sy;
          const ra = RADII[a.level];
          const rb = RADII[b.level];
          const massA = ra * ra;
          const massB = rb * rb;
          const shareA = massB / (massA + massB);
          const shareB = massA / (massA + massB);
          a.x -= overlapX * shareA;
          a.y -= overlapY * shareA;
          b.x += overlapX * shareB;
          b.y += overlapY * shareB;
        }
      }
      for (const p of pieces) keepInside(p, sprites);
      if (maximumError < 0.0006) break;
    }
  }

  // Eliminate spurious movement after contact. All objects are redrawn at
  // their resolved coordinates, without any separate CSS motion animation.
  for (const p of pieces) {
    p.age++;
    const old = original.get(p.id);
    if (!old) continue;
    const movedY = p.y - old.y;
    const { ry } = axesFor(p.level, sprites);
    const touchingFloor = p.y + ry >= FIELD_H - 0.55;
    const hasSupport =
      touchingFloor ||
      pieces.some((q) => {
        if (q.id === p.id || q.y <= p.y + 0.5) return false;
        const h = collision(p, q, sprites);
        return h.distance >= 0.992 && h.distance <= 1.014;
      });
    if (hasSupport) p.vy = 0;
    else if (movedY < -0.4) p.vy = 0;
    else p.vy = Math.min(MAX_SPEED, Math.max(0, movedY));
    p.resting = hasSupport && Math.abs(movedY) < 0.5 ? Math.min(200, p.resting + 1) : 0;
  }
  return { pieces, id, points };
}

/** Only a genuinely stationary head over the line can end the game. */
export function overflowHead(
  pieces: readonly GameHead[],
  sprites: readonly (Sprite | null)[] = [],
): number | null {
  for (const p of pieces) {
    const { ry } = axesFor(p.level, sprites);
    if (p.age > 55 && p.vy < 2 && p.y - ry < LOSS_LINE - 4) return p.id;
  }
  return null;
}

type HeadsGameProps = {
  headImages?: readonly string[];
  siteHref?: string;
  autoStart?: boolean;
  dropIntervalMs?: number;
};

export function HeadsGame({
  headImages = INTRO_HEAD_FALLBACK,
  siteHref = "/home",
  autoStart = false,
  dropIntervalMs = 1250,
}: HeadsGameProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spritesRef = useRef<(Sprite | null)[]>(Array(RADII.length).fill(null));
  const piecesRef = useRef<GameHead[]>([]);
  const lastIdRef = useRef(0);
  const nextRef = useRef(0);
  const pointerRef = useRef(FIELD_W / 2);
  const lastDropRef = useRef(0);
  const lostRef = useRef(false);
  const overflowTimers = useRef<Map<number, number>>(new Map());
  const [next, setNext] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"playing" | "lost">("playing");
  const [auto, setAuto] = useState(autoStart);
  const [hint, setHint] = useState("");

  const restart = useCallback(() => {
    piecesRef.current = [];
    overflowTimers.current.clear();
    lastIdRef.current = 0;
    pointerRef.current = FIELD_W / 2;
    lastDropRef.current = 0;
    nextRef.current = 0;
    lostRef.current = false;
    setScore(0);
    setNext(0);
    setStatus("playing");
    setAuto(autoStart);
    setHint("");
  }, [autoStart]);

  // Load all the sprites BEFORE starting physics, so collision dimensions
  // cannot suddenly change during a game as PNGs finish downloading.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const urls = Array.from({ length: RADII.length }, (_, i) => headImages[i] || "");
    Promise.all(
      urls.map(
        (url) =>
          new Promise<Sprite | null>((resolve) => {
            if (!url) {
              resolve(null);
              return;
            }
            const image = new window.Image();
            image.crossOrigin = "anonymous";
            image.onload = () => resolve(makeSprite(image));
            image.onerror = () => resolve(null);
            image.src = url;
          }),
      ),
    ).then((sprites) => {
      if (cancelled) return;
      spritesRef.current = sprites;
      restart();
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [headImages, restart]);

  const changeNext = useCallback(() => {
    if (loading || lostRef.current) return;
    const newLevel = (nextRef.current + 1) % 3;
    nextRef.current = newLevel;
    setNext(newLevel);
    setHint("");
  }, [loading]);

  const drop = useCallback(() => {
    if (loading || lostRef.current) return;
    const now = performance.now();
    if (now - lastDropRef.current < MIN_DROP_MS) return;
    const level = nextRef.current;
    const sprites = spritesRef.current;
    const x = findDropX(piecesRef.current, level, pointerRef.current, sprites);
    if (x === null) {
      setHint("Зараз немає місця для цієї голови. Зачекай, поки інші опустяться.");
      return;
    }
    lastDropRef.current = now;
    setHint("");
    piecesRef.current.push({
      id: ++lastIdRef.current,
      level,
      x,
      y: axesFor(level, sprites).ry + 1,
      vy: 0,
      age: 0,
      resting: 0,
    });
    const upcoming = spawnLevel();
    nextRef.current = upcoming;
    setNext(upcoming);
  }, [loading]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(FIELD_W * dpr);
    canvas.height = Math.round(FIELD_H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const drawHead = (p: GameHead, opacity = 1) => {
      const sprite = spritesRef.current[p.level];
      const { rx, ry } = axesFor(p.level, spritesRef.current);
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.shadowColor = "rgba(0,0,0,.35)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
      if (sprite?.image.complete && sprite.image.naturalWidth) {
        ctx.drawImage(
          sprite.image,
          sprite.sx,
          sprite.sy,
          sprite.sw,
          sprite.sh,
          p.x - rx,
          p.y - ry,
          rx * 2,
          ry * 2,
        );
      } else {
        ctx.fillStyle = COLORS[p.level];
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, rx, ry, 0, 0, TWO_PI);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.font = `bold ${Math.max(12, RADII[p.level] * 0.6)}px Georgia`;
        ctx.fillStyle = "#271815";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(p.level + 1), p.x, p.y);
      }
      ctx.restore();
    };

    const draw = () => {
      const bg = ctx.createLinearGradient(0, 0, 0, FIELD_H);
      bg.addColorStop(0, "#32201c");
      bg.addColorStop(1, "#1b1311");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, FIELD_W, FIELD_H);

      ctx.save();
      ctx.setLineDash([7, 7]);
      ctx.strokeStyle = "rgba(202,122,103,.65)";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(0, LOSS_LINE);
      ctx.lineTo(FIELD_W, LOSS_LINE);
      ctx.stroke();
      ctx.restore();
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "#b89484";
      ctx.textAlign = "left";
      ctx.fillText("МЕЖА ГОЛІВ", 12, LOSS_LINE - 9);

      for (const p of piecesRef.current) drawHead(p);

      // Pause the in-board preview briefly after each drop. The little HUD
      // thumbnail above stays visible; this avoids two confusing faces near
      // the top when a real head is still falling out of the spawn area.
      if (!loading && !lostRef.current && performance.now() - lastDropRef.current > 360) {
        const level = nextRef.current;
        const x = findDropX(piecesRef.current, level, pointerRef.current, spritesRef.current);
        if (x !== null) {
          // Actual next face, never an ambiguous line! Semi-transparent and
          // edged with a thin dashed teal outline to distinguish it from a drop.
          const preview: GameHead = {
            id: -1,
            level,
            x,
            y: axesFor(level, spritesRef.current).ry + 1,
            vy: 0,
            age: 0,
            resting: 0,
          };
          drawHead(preview, 0.56);
          const { rx, ry } = axesFor(level, spritesRef.current);
          ctx.save();
          ctx.setLineDash([4, 5]);
          ctx.lineWidth = 1;
          ctx.strokeStyle = "rgba(82,190,168,.8)";
          ctx.beginPath();
          ctx.ellipse(x, preview.y, rx + 2, ry + 2, 0, 0, TWO_PI);
          ctx.stroke();
          ctx.restore();
        }
      }
    };

    let frameId = 0;
    let previousTime = 0;
    let accumulated = 0;
    const tick = (now: number) => {
      if (!previousTime) previousTime = now;
      accumulated = Math.min(accumulated + Math.min(now - previousTime, 48), 80);
      previousTime = now;
      let steps = 0;
      while (accumulated >= 1000 / 60 && steps < 4) {
        if (!loading && !lostRef.current) {
          const result = stepHeads(piecesRef.current, lastIdRef.current, spritesRef.current);
          piecesRef.current = result.pieces;
          lastIdRef.current = result.id;
          if (result.points) setScore((s) => s + result.points);
          // Countdown per actual head, not an accumulation of unrelated ones.
          const timers = new Map<number, number>();
          for (const p of result.pieces) {
            if (
              p.age <= 55 ||
              p.vy >= 2 ||
              p.y - axesFor(p.level, spritesRef.current).ry >= LOSS_LINE - 4
            )
              continue;
            const frames = (overflowTimers.current.get(p.id) ?? 0) + 1;
            timers.set(p.id, frames);
            if (frames >= OVERFLOW_FRAMES) {
              lostRef.current = true;
              setStatus("lost");
              setAuto(false);
            }
          }
          overflowTimers.current = timers;
        }
        accumulated -= 1000 / 60;
        steps++;
      }
      draw();
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [loading]);

  useEffect(() => {
    if (!auto || loading || status !== "playing") return;
    const interval = window.setInterval(
      () => {
        const level = nextRef.current;
        const same = piecesRef.current.filter((p) => p.level === level);
        const target = same.length ? same[Math.floor(Math.random() * same.length)] : null;
        pointerRef.current = target ? target.x : 20 + Math.random() * (FIELD_W - 40);
        drop();
      },
      Math.max(dropIntervalMs, MIN_DROP_MS + 30),
    );
    return () => window.clearInterval(interval);
  }, [auto, drop, dropIntervalMs, loading, status]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (loading || lostRef.current) return;
      const el = event.target;
      if (el instanceof HTMLElement && ["BUTTON", "A", "INPUT", "TEXTAREA"].includes(el.tagName))
        return;
      if (event.key === "ArrowLeft") pointerRef.current -= 20;
      else if (event.key === "ArrowRight") pointerRef.current += 20;
      else if (event.key === " " || event.key === "Enter") drop();
      else return;
      event.preventDefault();
      pointerRef.current = clamp(pointerRef.current, 0, FIELD_W);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [drop, loading]);

  const setPointer = (clientX: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerRef.current = clamp(((clientX - rect.left) * FIELD_W) / rect.width, 0, FIELD_W);
  };

  return (
    <div className="w-full max-w-[460px]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-[#ead6c9]">
        <div className="text-xs tracking-[0.18em] uppercase">
          Голови зібрано: <b className="ml-2 text-[#e9b080]">{score}</b>
        </div>
        <div className="flex items-center gap-2 text-xs tracking-[0.14em] uppercase">
          <span>Далі:</span>
          <b className="text-[#3eb29b]">
            {next + 1} / {RADII.length}
          </b>
          {loading ? (
            <span className="text-[#ad9282]">…</span>
          ) : spritesRef.current[next]?.image ? (
            // Canvas-compatible PNGs come from either public/ or Cloudinary.
            // The preview here is supplementary; the main preview is on canvas.
            <img
              src={spritesRef.current[next]?.image.src}
              alt={`Наступна голова, рівень ${next + 1}`}
              className="size-9 object-contain"
            />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-[#b9896d] text-[#20130e]">
              {next + 1}
            </span>
          )}
        </div>
      </div>

      {hint && status === "playing" && (
        <div
          role="status"
          className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#85624b]/60 bg-[#392821] px-3 py-2 text-xs text-[#e7c8b0]"
        >
          <span>{hint}</span>
          <button
            type="button"
            onClick={changeNext}
            className="rounded-full border border-[#45ab97]/60 px-3 py-1.5 font-semibold text-[#7bd0bb] hover:bg-[#22685a]/30"
          >
            Інша голова ↻
          </button>
        </div>
      )}
      <div className="relative overflow-hidden rounded-[28px] border border-[#785246]/70 bg-[#241814] shadow-[0_22px_70px_rgba(0,0,0,.4)]">
        <canvas
          ref={canvasRef}
          width={FIELD_W}
          height={FIELD_H}
          aria-label="Гра: кидай голови Слави та поєднуй однакові"
          className="block aspect-[420/550] w-full cursor-crosshair touch-none select-none"
          onPointerMove={(e: { clientX: number }) => setPointer(e.clientX)}
          onPointerDown={(e: { clientX: number }) => {
            setPointer(e.clientX);
            drop();
          }}
        />
        {loading && (
          <div
            role="status"
            className="absolute inset-0 flex items-center justify-center bg-[#1b1412]/90 text-sm text-[#dec3ab]"
          >
            Завантажуємо голови…
          </div>
        )}
        {status === "lost" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#160e0c]/93 px-7 text-center backdrop-blur-sm">
            <h3 className="font-serif text-3xl text-[#f0dfcf] sm:text-4xl">Головам стало тісно!</h3>
            <p className="mt-4 text-sm leading-6 text-[#c1a59a]">
              Голови заповнили поле вище червоної межі. Спробуй ще раз!
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-7 rounded-full bg-[#258c7a] px-6 py-3 text-sm font-semibold text-[#120d0c] hover:bg-[#36aa94]"
            >
              Ще одна спроба ↻
            </button>
            <Link
              href={siteHref}
              className="mt-5 text-sm text-[#e7c4a9] underline underline-offset-4"
            >
              Увійти на сайт →
            </Link>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[260px] text-xs leading-5 text-[#c6a99b]">
          Клацай або торкайся, щоб кинути голову. Дві однакові зливаються в одну більшу.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAuto((v) => !v)}
            disabled={loading || status !== "playing"}
            className="rounded-full border border-[#785246] px-4 py-2 text-xs text-[#ebd0bd] hover:border-[#2b9985] disabled:opacity-40"
          >
            {auto ? "Авто: увімк. ⏸" : "Автопадіння ▶"}
          </button>
          <button
            type="button"
            onClick={restart}
            className="rounded-full border border-[#785246] px-4 py-2 text-xs text-[#ebd0bd] hover:border-[#2b9985]"
          >
            Заново ↻
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SlavaHeadsIntro({ intro = DEFAULT_INTRO }: { intro?: IntroPublicConfig }) {
  const headImages = useMemo(() => intro.heads.map((head) => head.url), [intro.heads]);
  return (
    <main className="min-h-dvh bg-[radial-gradient(ellipse_at_50%_38%,#493027_0%,#241813_55%,#1a1210_100%)] px-5 py-10 text-[#eed9cb] sm:px-8">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-8 lg:grid lg:min-h-[calc(100dvh-5rem)] lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-16">
        <div className="max-w-[520px] text-center lg:text-left">
          <p className="mb-5 text-xs tracking-[0.25em] text-[#e4bda8] uppercase">{intro.eyebrow}</p>
          <h1 className="font-serif text-[clamp(3.1rem,6vw,6.2rem)] leading-[0.98] tracking-[-0.05em]">
            {intro.heading} <span className="text-[#2da48e] italic">{intro.accent}</span>
          </h1>
          <p className="mt-7 max-w-[440px] text-base leading-7 whitespace-pre-wrap text-[#d4b5a4]">
            {intro.description}
          </p>
          <p className="mt-5 font-serif text-lg text-[#eccbb3] italic">{intro.tagline}</p>
          <Link
            href={intro.siteHref}
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#b38b76] px-6 py-3 text-sm hover:border-[#2da48e] hover:text-[#55bba7]"
          >
            {intro.skipLabel} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <HeadsGame
          headImages={headImages}
          siteHref={intro.siteHref}
          autoStart={intro.autoModeDefault}
          dropIntervalMs={intro.autoIntervalMs}
        />
      </div>
    </main>
  );
}
