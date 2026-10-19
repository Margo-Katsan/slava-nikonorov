"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import { ArrowUpRight, ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import Image from "next/image";

import type { Item, Section } from "@/lib/content";

type Spot = { x: number; y: number; w: number; h: number; angle: number };

type EvidenceCard = { id: string; item: Item; number: number; spot: Spot };

type PaperNote = { id: string; kind: "question" | "clue"; spot: Spot };

type Wire = { from: string; to: string };

type BoardLayout = {
  height: number;

  cards: EvidenceCard[];

  notes: PaperNote[];

  wires: Wire[];
};

type TemplateSpot = { x: number; y: number; w: number; angle: number };

// Композиция намеренно асимметричная, но без случайных скачков при перерендере.

const WIDE_SCENE: TemplateSpot[] = [
  { x: 0.045, y: 0.12, w: 0.34, angle: -4.2 },

  { x: 0.61, y: 0.045, w: 0.32, angle: 3.3 },

  { x: 0.325, y: 0.375, w: 0.3, angle: 2.7 },

  { x: 0.72, y: 0.415, w: 0.24, angle: -3.8 },

  { x: 0.067, y: 0.715, w: 0.3, angle: 3.2 },

  { x: 0.505, y: 0.765, w: 0.37, angle: -3.0 },
];

const MID_SCENE: TemplateSpot[] = [
  { x: 0.055, y: 0.085, w: 0.49, angle: -3.6 },

  { x: 0.52, y: 0.29, w: 0.42, angle: 3.0 },

  { x: 0.1, y: 0.705, w: 0.44, angle: 2.7 },

  { x: 0.48, y: 1.025, w: 0.46, angle: -3.4 },
];

const SMALL_SCENE: TemplateSpot[] = [
  { x: 0.05, y: 0.09, w: 0.76, angle: -2.8 },

  { x: 0.215, y: 0.685, w: 0.73, angle: 2.6 },

  { x: 0.055, y: 1.305, w: 0.75, angle: -2.5 },

  { x: 0.2, y: 1.92, w: 0.73, angle: 3.0 },
];

function makeLayout(items: Item[], width: number): BoardLayout {
  if (width <= 0 || !items.length) {
    return { height: 260, cards: [], notes: [], wires: [] };
  }

  const small = width < 560;

  const mid = width >= 560 && width < 920;

  const template = small ? SMALL_SCENE : mid ? MID_SCENE : WIDE_SCENE;

  const perScene = template.length;

  const sceneStep = (small ? 2.58 : mid ? 1.52 : 1.25) * width;
  // Только один большой зазор между первой и второй группами.
  // Все фотографии внутри групп остаются на прежних местах относительно друг друга.
  const firstGapReduction = small ? 0 : Math.min(205, width * (mid ? 0.1 : 0.17));
  const sceneOffset = (scene: number) => scene * sceneStep - (scene > 0 ? firstGapReduction : 0);

  const cards: EvidenceCard[] = [];

  const notes: PaperNote[] = [];

  const wires: Wire[] = [];

  let bottom = 0;

  items.forEach((item, index) => {
    const scene = Math.floor(index / perScene);

    const base = template[index % perScene];

    const mirrored = !small && scene % 2 === 1;

    const w = base.w * width;

    const h = Math.round(w * (small ? 0.68 : 0.7) + (small ? 65 : 72));

    const spot: Spot = {
      x: (mirrored ? 1 - base.x - base.w : base.x) * width,

      y: sceneOffset(scene) + base.y * width,

      w,

      h,

      angle: mirrored ? -base.angle : base.angle,
    };

    cards.push({ id: `card-${index}`, item, number: index + 1, spot });

    bottom = Math.max(bottom, spot.y + h);
  });

  const scenes = Math.ceil(items.length / perScene);

  for (let scene = 0; scene < scenes; scene++) {
    const start = scene * perScene;

    const count = Math.min(perScene, items.length - start);

    const y0 = sceneOffset(scene);

    const mirrored = !small && scene % 2 === 1;

    // Не «паутина»: максимум 2–3 соединения на группу фотографий.

    if (small) {
      if (count >= 2) wires.push({ from: `card-${start}`, to: `card-${start + 1}` });

      if (count >= 4) wires.push({ from: `card-${start + 2}`, to: `card-${start + 3}` });
    } else if (mid) {
      if (count >= 2) wires.push({ from: `card-${start}`, to: `card-${start + 1}` });

      if (count >= 4) wires.push({ from: `card-${start + 1}`, to: `card-${start + 3}` });
    } else {
      if (count >= 3) wires.push({ from: `card-${start}`, to: `card-${start + 2}` });

      if (count >= 5) wires.push({ from: `card-${start + 2}`, to: `card-${start + 4}` });

      if (count >= 4) wires.push({ from: `card-${start + 1}`, to: `card-${start + 3}` });
    }

    // Одна бумажная заметка вместо множества декоративных обрывков.

    const noteWidth = width * (small ? 0.185 : mid ? 0.16 : 0.125);

    const nx = small ? (scene % 2 ? 0.045 : 0.76) : mid ? 0.76 : 0.44;

    const spot: Spot = {
      x: (mirrored ? 1 - nx - noteWidth / width : nx) * width,

      y: y0 + width * (small ? 0.49 : mid ? 0.045 : 0.11),

      w: noteWidth,

      h: Math.max(small ? 62 : 80, noteWidth * (small ? 1.05 : 0.82)),

      angle: scene % 2 ? -4.5 : 4.5,
    };

    const noteId = `note-${scene}`;

    notes.push({ id: noteId, kind: scene % 2 ? "clue" : "question", spot });

    // Один штрих от заметки, без «звёздочки» из трёх нитей.

    if (count > 0) {
      wires.push({
        from: noteId,

        to: `card-${start + (small ? 0 : Math.min(count - 1, 1))}`,
      });
    }

    bottom = Math.max(bottom, spot.y + spot.h);
  }

  return {
    cards,

    notes,

    wires,

    height: Math.ceil(bottom + (small ? 65 : 90)),
  };
}

// Центр верхнего края повёрнутого листа — место для кнопки.

function pinPoint(spot: Spot) {
  const radians = (spot.angle * Math.PI) / 180;

  return {
    x: spot.x + spot.w / 2 + (spot.h / 2) * Math.sin(radians),

    y: spot.y + (spot.h / 2) * (1 - Math.cos(radians)),
  };
}

function videoEmbed(url: string): string | null {
  try {
    const parsed = new URL(url);

    const host = parsed.hostname.toLowerCase();

    let youtubeId: string | null = null;

    if (host === "youtu.be" || host === "www.youtu.be") {
      youtubeId = parsed.pathname.split("/")[1] || null;
    } else if (
      ["youtube.com", "www.youtube.com", "m.youtube.com", "www.youtube-nocookie.com"].includes(host)
    ) {
      youtubeId =
        parsed.searchParams.get("v") ||
        parsed.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1] ||
        null;
    }

    if (youtubeId && /^[\w-]{11}$/.test(youtubeId)) {
      return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
    }

    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
      const vimeoId = parsed.pathname.match(/^\/(?:video\/)?(\d+)/)?.[1];

      if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
    }
  } catch {
    // Локальное видео /videos/film.mp4 откроется обычным video-плеером.
  }

  return null;
}

function useBoardWidth() {
  const ref = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const update = () => setWidth(element.getBoundingClientRect().width);

    update();

    const observer = new ResizeObserver(update);

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

function EvidencePhoto({
  data,

  onOpen,
}: {
  data: EvidenceCard;

  onOpen: (item: Item, element: HTMLButtonElement) => void;
}) {
  const { spot, item, number } = data;

  return (
    <article
      className="absolute origin-center"

      style={{
        left: spot.x,

        top: spot.y,

        width: spot.w,

        height: spot.h,

        transform: `rotate(${spot.angle}deg)`,

        zIndex: 10 + (number % 4),
      }}
    >
      <button
        type="button"

        onClick={(event) => onOpen(item, event.currentTarget)}

        aria-label={`Переглянути: ${item.title}`}

        className="group relative flex h-full w-full flex-col overflow-hidden border border-[#b6aa9b] bg-[#e7dfd3] p-[6px] text-left transition-[transform,box-shadow] duration-300 outline-none hover:scale-[1.025] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent sm:p-[8px]"

        style={{
          boxShadow: "0 17px 28px rgba(0,0,0,.38), 0 3px 7px rgba(0,0,0,.30)",

          backgroundImage:
            "linear-gradient(135deg,rgba(255,255,255,.22),transparent 55%,rgba(90,64,40,.07))",
        }}
      >
        <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-[#171819]">
          {item.image ? (
            <Image
              src={item.image}

              alt=""

              fill

              sizes="(max-width: 559px) 78vw, (max-width: 919px) 48vw, 36vw"

              className="object-cover transition-transform duration-500 group-hover:scale-[1.045]"

              style={{ filter: "grayscale(.34) sepia(.12) contrast(1.05)" }}
            />
          ) : (
            <div className="flex h-full items-center justify-center font-serif text-5xl text-[#9c9387]">
              ?
            </div>
          )}

          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5" />

          <span className="absolute bottom-2 left-2 flex size-8 items-center justify-center rounded-full border border-[#eee2d3]/50 bg-[#191715]/75 text-[#f3e8de] transition-colors group-hover:bg-site-accent group-hover:text-site-bg sm:size-10">
            <Play size={15} fill="currentColor" className="ml-[2px]" />
          </span>

          <span className="absolute top-2 right-2 bg-[#1b1916]/75 px-1.5 py-1 font-mono text-[10px] tracking-widest text-[#f1e8dd]">
            {String(number).padStart(2, "0")}
          </span>
        </div>

        <div className="flex h-[60px] shrink-0 items-center justify-between gap-2 px-1 pt-1 sm:h-[64px] sm:px-2">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-[15px] leading-tight text-[#302721] sm:text-[19px]">
              {item.title}
            </h3>

            <p className="mt-0.5 truncate font-mono text-[8px] tracking-[.06em] text-[#7f7061] uppercase sm:text-[9px]">
              {item.description || "Матеріал із кіноархіву"}
            </p>
          </div>

          <ArrowUpRight size={15} className="shrink-0 text-[#857363]" />
        </div>
      </button>
    </article>
  );
}

function Scrap({ note }: { note: PaperNote }) {
  const { spot } = note;

  return (
    <div
      aria-hidden="true"

      className="absolute flex flex-col items-center justify-center overflow-hidden border border-[#b9ab98] bg-[#e2d7c4] px-1 text-center"

      style={{
        left: spot.x,

        top: spot.y,

        width: spot.w,

        height: spot.h,

        transform: `rotate(${spot.angle}deg)`,

        zIndex: 18,

        boxShadow: "3px 9px 17px rgba(0,0,0,.26)",

        backgroundImage:
          "linear-gradient(145deg,rgba(255,255,255,.28),transparent 70%,rgba(100,75,48,.08))",
      }}
    >
      {note.kind === "question" ? (
        <>
          <span className="font-mono text-[8px] tracking-widest text-[#736454]">ХТО?</span>

          <span className="font-serif text-[38px] leading-none text-[#8c534b] italic sm:text-[54px]">
            ?
          </span>

          <span className="font-mono text-[7px] text-[#83705e]">ЗНАЙДИ ЗВʼЯЗОК</span>
        </>
      ) : (
        <>
          <span className="font-mono text-[8px] tracking-wider text-[#806e5b]">НОТАТКА</span>

          <span className="mt-1 font-serif text-[14px] leading-tight text-[#58483a] italic sm:text-[18px]">
            Один актор.
          </span>

          <span className="font-serif text-[11px] text-[#665545] italic">Різні ролі.</span>
        </>
      )}
    </div>
  );
}

function boardPoints(layout: BoardLayout) {
  const points = new Map<string, { x: number; y: number }>();

  layout.cards.forEach((card) => points.set(card.id, pinPoint(card.spot)));

  layout.notes.forEach((note) => points.set(note.id, pinPoint(note.spot)));

  return points;
}

// Шнур ПОД карточками: тонкий матовый хлопок, спокойный бордовый оттенок.

function BoardThreads({ layout, width }: { layout: BoardLayout; width: number }) {
  const points = boardPoints(layout);

  return (
    <svg
      aria-hidden="true"

      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"

      viewBox={`0 0 ${width} ${layout.height}`}

      preserveAspectRatio="none"
    >
      {layout.wires.map(({ from, to }, index) => {
        const a = points.get(from);

        const b = points.get(to);

        if (!a || !b) return null;

        const dx = b.x - a.x;

        const dy = b.y - a.y;

        // Незначительная дуга вниз, будто нить слегка провисает под своим весом.

        const sag = Math.min(11, 3 + Math.abs(dx) * 0.009);

        const d = `M ${a.x} ${a.y} C ${a.x + dx * 0.28} ${a.y + dy * 0.28 + sag}, ${a.x + dx * 0.72} ${a.y + dy * 0.72 + sag}, ${b.x} ${b.y}`;

        return (
          <g key={`${from}-${to}-${index}`} fill="none" strokeLinecap="round">
            <path
              d={d}
              stroke="#0a0707"
              strokeWidth="3"
              opacity=".30"
              transform="translate(0.8 1.5)"
            />

            <path d={d} stroke="#743f3b" strokeWidth="1.8" />

            <path
              d={d}
              stroke="#b46a60"
              strokeWidth=".48"
              opacity=".55"
              transform="translate(0 -0.35)"
            />
          </g>
        );
      })}
    </svg>
  );
}

// Кнопки НАД фотографиями, ровно в точках начала нитей.

function BoardPins({
  layout,
  width,
  svgId,
}: {
  layout: BoardLayout;
  width: number;
  svgId: string;
}) {
  const points = boardPoints(layout);

  return (
    <svg
      aria-hidden="true"

      className="pointer-events-none absolute inset-0 z-30 h-full w-full"

      viewBox={`0 0 ${width} ${layout.height}`}

      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id={`${svgId}-pin`} cx="28%" cy="24%" r="85%">
          <stop offset="0" stopColor="#e0c9aa" />

          <stop offset=".42" stopColor="#a48565" />

          <stop offset="1" stopColor="#554035" />
        </radialGradient>
      </defs>

      {Array.from(points, ([id, p]) => (
        <g key={id}>
          <ellipse cx={p.x + 1.3} cy={p.y + 2.5} rx="6.2" ry="4.1" fill="#0c0b0a" opacity=".42" />

          <circle
            cx={p.x}
            cy={p.y}
            r="4.9"
            fill={`url(#${svgId}-pin)`}
            stroke="#47372e"
            strokeWidth=".65"
          />

          <circle cx={p.x - 1.25} cy={p.y - 1.4} r="1" fill="#f0dfc6" opacity=".75" />
        </g>
      ))}
    </svg>
  );
}

function WatchDialog({
  item,

  index,

  count,

  onClose,

  onMove,

  closeRef,
}: {
  item: Item;

  index: number;

  count: number;

  onClose: () => void;

  onMove: (offset: number) => void;

  closeRef: RefObject<HTMLButtonElement | null>;
}) {
  const iframeSrc = item.video ? videoEmbed(item.video) : null;

  return (
    <div
      role="dialog"

      aria-modal="true"

      aria-label={item.title}

      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#100c0a]/90 p-3 backdrop-blur-md sm:p-6"

      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-y-auto rounded-lg border border-[#b79f85]/25 bg-[#241c19] shadow-[0_36px_100px_rgba(0,0,0,.65)]">
        <div className="flex items-center justify-between gap-4 border-b border-[#ead8c2]/15 px-4 py-3 text-[#f3e9dd] sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-[.2em] text-site-accent uppercase">
              КІНОАРХІВ / ПЕРЕГЛЯД
            </p>

            <h2 className="mt-1 truncate font-serif text-xl sm:text-3xl">{item.title}</h2>
          </div>

          <button
            ref={closeRef}

            type="button"

            onClick={onClose}

            aria-label="Закрити"

            className="shrink-0 rounded-full border border-white/20 p-2.5 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative aspect-video min-h-[180px] bg-black">
          {item.video ? (
            iframeSrc ? (
              <iframe
                key={String(item.id)}

                src={iframeSrc}

                title={item.title}

                className="absolute inset-0 h-full w-full"

                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"

                allowFullScreen
              />
            ) : (
              <video
                key={String(item.id)}

                src={item.video}

                controls

                autoPlay

                playsInline

                className="absolute inset-0 h-full w-full object-contain"
              />
            )
          ) : item.image ? (
            <Image src={item.image} alt={item.title} fill sizes="95vw" className="object-contain" />
          ) : (
            <div className="flex h-full items-center justify-center font-serif text-6xl text-white/30">
              ?
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 text-[#e9d9c9] sm:px-6">
          <p className="max-w-[65ch] text-sm leading-6 text-[#e9d9c9]/85">
            {item.description || "Матеріал із кіноархіву."}
          </p>

          {count > 1 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Попереднє"
                onClick={() => onMove(-1)}
                className="rounded-full border border-white/20 p-2 hover:bg-white/10"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="font-mono text-xs tracking-widest text-[#ccb49e]">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>

              <button
                type="button"
                aria-label="Наступне"
                onClick={() => onMove(1)}
                className="rounded-full border border-white/20 p-2 hover:bg-white/10"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CinemaEvidenceBoard({ section }: { section: Section }) {
  const [filter, setFilter] = useState("Усі");

  const [activeId, setActiveId] = useState<string | null>(null);

  const { ref: stageRef, width } = useBoardWidth();

  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const closeRef = useRef<HTMLButtonElement>(null);

  const svgId = useId().replace(/[^a-zA-Z0-9\_-]/g, "");

  const allItems = useMemo(
    () => section.groups.flatMap((group) => group.items),

    [section.groups],
  );

  const visibleItems = useMemo(
    () =>
      filter === "Усі"
        ? allItems
        : section.groups

            .filter((group) => group.title === filter)

            .flatMap((group) => group.items),

    [filter, allItems, section.groups],
  );

  const layout = useMemo(() => makeLayout(visibleItems, width), [visibleItems, width]);

  const activeIndex = visibleItems.findIndex((item) => String(item.id) === activeId);

  const active = activeIndex >= 0 ? visibleItems[activeIndex] : null;

  const open = useCallback((item: Item, source: HTMLButtonElement) => {
    triggerRef.current = source;

    setActiveId(String(item.id));
  }, []);

  const close = useCallback(() => {
    setActiveId(null);

    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const move = useCallback(
    (offset: number) => {
      setActiveId((current) => {
        const index = visibleItems.findIndex((item) => String(item.id) === current);

        if (index < 0 || visibleItems.length === 0) return null;

        return String(
          visibleItems[(index + offset + visibleItems.length) % visibleItems.length].id,
        );
      });
    },

    [visibleItems],
  );

  useEffect(() => {
    if (!active) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowLeft") move(-1);
      else if (event.key === "ArrowRight") move(1);
      else if (event.key === "Tab") {
        const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');

        if (!dialog) return;

        const controls = Array.from(
          dialog.querySelectorAll<HTMLElement>("button, [href], video[controls], iframe"),
        ).filter((el) => el.getClientRects().length > 0);

        if (!controls.length) return;

        const first = controls[0];

        const last = controls[controls.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();

          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();

          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, close, move]);

  return (
    <section className="relative mx-auto w-full max-w-[1460px] rounded-[12px] border border-[#5b4638]/35 bg-[radial-gradient(ellipse_at_15%_0%,rgba(126,80,53,0.11),transparent_45%),radial-gradient(ellipse_at_95%_32%,rgba(35,103,89,0.07),transparent_43%),linear-gradient(180deg,#2b211d_0%,#241c19_45%,#211a17_100%)] px-2 py-10 text-site-cream sm:px-6 sm:py-14">
      {/* Заголовок и фильтры отделены от физической поверхности доски. */}

      <div className="mb-8 flex flex-col gap-6 px-2 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:px-4">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-site-accent" />

            <p className="font-mono text-[10px] tracking-[.21em] text-site-accent uppercase">
              ОСОБИСТИЙ КІНОАРХІВ / 001
            </p>
          </div>

          <h2 className="font-serif text-[38px] leading-tight text-site-cream sm:text-[55px]">
            Архів ролей
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-7 text-site-muted">
            Шоуріл, візитка та фрагменти з фільмів — різні історії одного актора.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Фільтр кіноархіву">
          {["Усі", ...Array.from(new Set(section.groups.map((group) => group.title)))].map(
            (name) => (
              <button
                key={name}

                type="button"

                onClick={() => {
                  setFilter(name);

                  setActiveId(null);
                }}

                aria-pressed={filter === name}

                className={`rounded-full border px-4 py-2 font-mono text-[10px] tracking-[.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-site-accent ${
                  filter === name
                    ? "border-site-accent/70 bg-site-accent/15 text-site-cream"
                    : "border-site-border/60 bg-site-surface/60 text-site-muted hover:border-site-accent/60 hover:text-site-cream"
                }`}
              >
                {name}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Коллаж без доски: фотографии, заметки и нити поверх фона сайта. */}
      <div className="relative isolate overflow-visible bg-transparent">
        <div className="relative z-10 flex items-start justify-between gap-3 px-4 pt-5 sm:px-9 sm:pt-8">
          <div className="-rotate-2 border border-[#c6b9a5] bg-[#e2d8c7] px-4 py-3 text-[#46352d] shadow-[3px_8px_17px_rgba(0,0,0,.25)] sm:px-6 sm:py-4">
            <p className="font-mono text-[8px] tracking-[.16em] uppercase sm:text-[10px]">
              СПРАВА № 001 / КІНО
            </p>

            <p className="mt-1 font-serif text-xl leading-tight sm:text-3xl">Досьє ролей</p>

            <p className="mt-1 font-mono text-[8px] tracking-[.08em] text-[#877363] uppercase sm:text-[10px]">
              Відео · Ролі · Фрагменти
            </p>
          </div>

          <span className="mt-3 border-b border-[#b0a398]/40 pb-1 font-mono text-[9px] tracking-[.18em] text-[#c3b5a4] uppercase sm:text-[11px]">
            {String(visibleItems.length).padStart(2, "0")} матеріалів
          </span>
        </div>

        <div
          ref={stageRef}

          className="relative isolate mt-6 w-full sm:mt-8"

          style={{ height: width ? layout.height : 550, opacity: width ? 1 : 0 }}
        >
          {width > 0 && <BoardThreads layout={layout} width={width} />}

          {layout.cards.map((data) => (
            <EvidencePhoto key={data.id} data={data} onOpen={open} />
          ))}

          {layout.notes.map((note) => (
            <Scrap key={note.id} note={note} />
          ))}

          {width > 0 && <BoardPins layout={layout} width={width} svgId={svgId} />}

          {width > 0 && visibleItems.length === 0 && (
            <div className="absolute inset-x-5 top-16 -rotate-2 border border-[#c6b8a1] bg-[#e4d8c5] px-6 py-8 text-center font-serif text-lg text-[#59483b] shadow-xl sm:inset-x-1/4">
              У цій добірці поки немає матеріалів.
            </div>
          )}
        </div>
      </div>

      {active && (
        <WatchDialog
          item={active}

          index={activeIndex}

          count={visibleItems.length}

          onClose={close}

          onMove={move}

          closeRef={closeRef}
        />
      )}
    </section>
  );
}
