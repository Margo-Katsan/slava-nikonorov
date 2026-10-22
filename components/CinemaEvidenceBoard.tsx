"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Film,
  Fingerprint,
  Play,
  ScanSearch,
  X,
} from "lucide-react";
import Image from "next/image";
import { createPortal } from "react-dom";

import type { Item, Section } from "@/lib/content";

type VideoSource =
  | { kind: "iframe"; src: string }
  | { kind: "file"; src: string }
  | { kind: "link"; src: string }
  | null;

type BoardContent = {
  all: Item[];
  showreels: Item[];
  businessCards: Item[];
  episodes: Item[];
};

// Матовая архивная бумага: не чисто белая, с почти незаметной фактурой.
const PAPER = {
  backgroundColor: "#e8dac4",
  backgroundImage:
    "linear-gradient(143deg,rgba(255,250,239,.36) 0%,transparent 53%,rgba(94,57,38,.06) 100%),repeating-linear-gradient(12deg,rgba(84,55,39,.016) 0px,rgba(84,55,39,.016) 1px,transparent 1px,transparent 6px)",
};

function categoryOf(group: string, item: Item): "showreel" | "business" | "episode" {
  const text = `${group} ${item.category ?? ""}`.toLocaleLowerCase("uk");
  if (/шоур[іi]л|showreel/.test(text)) return "showreel";
  if (/візитк|визитк|business card|\bintro\b/.test(text)) return "business";
  return "episode";
}

function buildContent(section: Section): BoardContent {
  const all: Item[] = [];
  const showreels: Item[] = [];
  const businessCards: Item[] = [];
  const episodes: Item[] = [];
  const used = new Set<string>();

  for (const group of section.groups) {
    for (const item of group.items) {
      // Убираем случайные дубли, но не меняем порядок из Neon.
      if (used.has(item.id)) continue;
      used.add(item.id);
      all.push(item);

      const category = categoryOf(group.title, item);
      if (category === "showreel") showreels.push(item);
      else if (category === "business") businessCards.push(item);
      else episodes.push(item);
    }
  }

  return { all, showreels, businessCards, episodes };
}

function getVideoSource(url?: string): VideoSource {
  if (!url) return null;
  if (url.startsWith("/") && !url.startsWith("//")) {
    return { kind: "file", src: url };
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;

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
      return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0` };
    }

    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
      const vimeoId = parsed.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
      if (vimeoId) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeoId}` };
    }

    if (
      /\.(mp4|webm|ogg)$/i.test(parsed.pathname) ||
      (host === "res.cloudinary.com" && parsed.pathname.includes("/video/upload/"))
    ) {
      return { kind: "file", src: url };
    }

    return { kind: "link", src: url };
  } catch {
    return null;
  }
}

// Крошечная металлическая кнопка лежит НА бумаге, а не над карточкой.
// Вся кнопка декоративная: нажатие и клавиатурный фокус остаются у карточки.
function Pin({
  teal = false,
  kind = "card",
  align = "center",
}: {
  teal?: boolean;
  kind?: "card" | "clue";
  align?: "left" | "center" | "right";
}) {
  const position =
    align === "left" ? "left-3" : align === "right" ? "right-3" : "left-1/2 -translate-x-1/2";

  return (
    <span
      data-board-pin
      data-pin-kind={kind}
      aria-hidden="true"
      className={`pointer-events-none absolute top-[6px] z-30 flex size-[9px] items-center justify-center rounded-full border border-[#3e2a23] shadow-[0_1px_1px_rgba(255,241,222,.18),1px_2px_3px_rgba(0,0,0,.62)] ${position}`}
      style={{
        background: teal
          ? "radial-gradient(circle at 30% 22%,#d2f5e9 0%,#43b6a0 28%,#1a5d51 71%,#0b372f 100%)"
          : "radial-gradient(circle at 31% 23%,#f5dbb4 0%,#b98658 27%,#775039 71%,#302019 100%)",
      }}
    >
      <span className="absolute top-[1px] left-[1px] size-[2px] rounded-full bg-white/65" />
    </span>
  );
}

// Наклон детерминирован по ID. Math.random() здесь вызвал бы скачки
// после ререндеров и несоответствие HTML сервера/клиента.
function cardTilt(id: string, prominent: boolean): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash = Math.imul(hash ^ id.charCodeAt(i), 16777619);
  }
  const ratio = (hash >>> 0) / 4294967295;
  return Math.round((ratio - 0.5) * (prominent ? 4.2 : 5.4) * 100) / 100;
}

type Anchor = { x: number; y: number; kind: "card" | "clue" };
type ThreadGeometry = { width: number; height: number; pins: Anchor[] };

// Сеть нитей аккуратная: только главная цепочка, несколько близких связей
// и отдельные акценты от мини-улик. Так доска выглядит цельно, но не перегружено.
function makeThreadConnections(pins: Anchor[], width: number): Array<[number, number]> {
  const connections: Array<[number, number]> = [];
  const seen = new Set<string>();
  const maxCount = Math.min(
    width < 640 ? 16 : 22,
    Math.max(pins.length - 1, Math.ceil(pins.length * 1.15)),
  );

  const add = (a: number, b: number) => {
    if (a === b || a < 0 || b < 0 || a >= pins.length || b >= pins.length) return;
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    if (seen.has(key) || connections.length >= maxCount) return;
    seen.add(key);
    connections.push([a, b]);
  };

  // Главная последовательность — визуальный "маршрут" по доске.
  for (let i = 1; i < pins.length; i++) add(i - 1, i);

  // Несколько локальных связей между реально близкими точками.
  for (let i = 0; i < pins.length; i++) {
    if (connections.length >= maxCount) break;

    const nearby = pins
      .map((point, index) => ({
        index,
        distance: Math.hypot(point.x - pins[i].x, point.y - pins[i].y),
      }))
      .filter(({ index }) => index !== i)
      .sort((a, b) => a.distance - b.distance);

    const preferredLinks = pins[i].kind === "clue" ? 1 : width < 640 ? 1 : 2;
    const maxDistance = width < 640 ? 210 : 255;
    let added = 0;

    for (const neighbor of nearby) {
      if (added >= preferredLinks || connections.length >= maxCount) break;
      if (neighbor.distance > maxDistance) break;
      const previous = connections.length;
      add(i, neighbor.index);
      if (connections.length > previous) added++;
    }
  }

  // Для улик добавляем по одной осмысленной связи к ближайшей карточке.
  pins.forEach((pin, index) => {
    if (pin.kind !== "clue" || connections.length >= maxCount) return;
    const nearestCard = pins
      .map((candidate, cardIndex) => ({ candidate, cardIndex }))
      .filter(({ candidate }) => candidate.kind === "card")
      .sort(
        (a, b) =>
          Math.hypot(a.candidate.x - pin.x, a.candidate.y - pin.y) -
          Math.hypot(b.candidate.x - pin.x, b.candidate.y - pin.y),
      )[0];

    if (nearestCard) add(index, nearestCard.cardIndex);
  });

  return connections;
}

function ThreadLines({ geometry }: { geometry: ThreadGeometry }) {
  const { width, height, pins } = geometry;
  const connections = makeThreadConnections(pins, width);

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {connections.map(([from, to], i) => {
        const a = pins[from];
        const b = pins[to];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        const sag = Math.min(18, 2.5 + distance * 0.02 + (i % 3) * 1.15);
        const d = `M ${a.x} ${a.y} C ${a.x + dx * 0.28} ${a.y + dy * 0.28 + sag}, ${a.x + dx * 0.73} ${a.y + dy * 0.73 + sag}, ${b.x} ${b.y}`;
        const accent = i % 4 === 0;

        return (
          <g key={`${from}-${to}`} fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Нити проложены ПОД карточками. Тень создает расстояние до доски. */}
            <path
              d={d}
              stroke="#120909"
              strokeWidth="4.25"
              opacity=".24"
              transform="translate(1 1.8)"
            />
            <path d={d} stroke={accent ? "#5a1f28" : "#4b1821"} strokeWidth="2.45" opacity=".98" />
            <path d={d} stroke={accent ? "#8f3545" : "#742b38"} strokeWidth="1.2" opacity=".95" />
            <path
              d={d}
              stroke={accent ? "#bf6878" : "#a94d60"}
              strokeWidth=".36"
              opacity=".52"
              transform="translate(-.35 -.45)"
            />
          </g>
        );
      })}
    </svg>
  );
}

// Одна система нитей на ВСЮ доску: соединяет верх, заметки и нижние ряды.
function BoardThreadNetwork({ children, signature }: { children: ReactNode; signature: string }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<ThreadGeometry | null>(null);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    let frame = 0;

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = board.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const pins = Array.from(board.querySelectorAll<HTMLElement>("[data-board-pin]"));
        const points: Anchor[] = pins.map((pin) => {
          const rect = pin.getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2 - bounds.left,
            y: rect.top + rect.height / 2 - bounds.top,
            kind: pin.dataset.pinKind === "clue" ? "clue" : "card",
          };
        });
        setGeometry({ width: bounds.width, height: bounds.height, pins: points });
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(board);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [signature]);

  return (
    <div ref={boardRef} className="relative isolate">
      {geometry && <ThreadLines geometry={geometry} />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Сетка держит карточки в документном потоке и на мобильном не перекрывает текст.
function ConnectedCards({
  items,
  prominent = false,
  activeId,
  onSelect,
}: {
  items: Item[];
  prominent?: boolean;
  activeId?: string;
  onSelect: (id: string, source: HTMLButtonElement) => void;
}) {
  return (
    <div
      className={
        prominent
          ? "relative grid grid-cols-2 items-start gap-x-5 gap-y-7 px-3 py-4 sm:gap-x-7"
          : "relative grid grid-cols-2 gap-x-5 gap-y-8 px-3 py-4 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4"
      }
    >
      {items.map((item) => (
        <EvidenceCard
          key={item.id}
          item={item}
          prominent={prominent}
          active={item.id === activeId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

// Дополнительные «улики» живут в обычной сетке, а не плавают над текстом.
function ClueNotes() {
  const notes = [
    { kind: "question", title: "ХТО?", label: "НЕВІДОМА РОЛЬ", rotation: -3 },
    { kind: "fingerprint", title: "ВІДБИТОК", label: "ДОКАЗ № 07", rotation: 2.4 },
    { kind: "search", title: "ЗВ'ЯЗОК", label: "СПРАВА ВІДКРИТА", rotation: -1.9 },
  ] as const;

  return (
    <div
      aria-hidden="true"
      className="mx-auto my-6 grid w-full max-w-[490px] grid-cols-3 gap-3 px-1 sm:gap-5"
    >
      {notes.map((note) => (
        <div
          key={note.kind}
          className="relative flex min-h-[78px] min-w-0 flex-col items-center justify-center border border-[#bba286] px-1 py-2 text-center shadow-[0_5px_0_rgba(30,16,10,.14),0_13px_21px_rgba(0,0,0,.24)] sm:min-h-[94px]"
          style={{ ...PAPER, transform: `rotate(${note.rotation}deg)` }}
        >
          {note.kind === "question" ? (
            <span className="font-serif text-3xl leading-none text-[#7b4b3d] sm:text-4xl">?</span>
          ) : note.kind === "fingerprint" ? (
            <Fingerprint className="size-7 text-[#7d5542] opacity-80 sm:size-9" strokeWidth={1.2} />
          ) : (
            <ScanSearch className="size-7 text-[#695445] opacity-80 sm:size-9" strokeWidth={1.3} />
          )}
          <span className="mt-1 font-serif text-[9px] font-bold tracking-[.03em] text-[#4a3228] sm:text-[11px]">
            {note.title}
          </span>
          <span className="mt-0.5 max-w-full truncate font-mono text-[6px] tracking-[.05em] text-[#94745b] sm:text-[8px]">
            {note.label}
          </span>
          <Pin kind="clue" align="right" />
        </div>
      ))}
    </div>
  );
}

function TornLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto my-7 w-fit max-w-full border border-[#c4ac91]/65 px-5 py-2.5 text-center font-serif text-[13px] font-semibold tracking-[.14em] text-[#38291f] shadow-[0_8px_18px_rgba(0,0,0,.25)] sm:text-[15px]"
      style={{ ...PAPER, clipPath: "polygon(1% 5%,97% 0%,100% 90%,3% 100%,0% 80%)" }}
    >
      {children}
      <Pin kind="clue" align="left" />
    </div>
  );
}

function EvidenceCard({
  item,
  active,
  prominent = false,
  onSelect,
}: {
  item: Item;
  active: boolean;
  prominent?: boolean;
  onSelect: (id: string, source: HTMLButtonElement) => void;
}) {
  return (
    <div
      className="relative z-10 min-w-0 px-[2px] pt-3 pb-2"
      style={{ transform: `rotate(${cardTilt(item.id, prominent)}deg)` }}
    >
      <button
        type="button"
        onClick={(event) => onSelect(item.id, event.currentTarget)}
        aria-pressed={active}
        aria-label={`Переглянути: ${item.title}`}
        className={`group relative block w-full min-w-0 border p-[5px] text-left shadow-[0_3px_0_rgba(30,19,13,.14),0_14px_25px_rgba(0,0,0,.32)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_5px_0_rgba(30,19,13,.12),0_19px_28px_rgba(0,0,0,.36)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35b69b] sm:p-2 ${
          active
            ? "border-[#4c9f8b] ring-1 ring-[#4c9f8b]/75"
            : "border-[#b49b7e] hover:border-[#d2b18a]"
        }`}
        style={PAPER}
      >
        <div
          className={`relative w-full overflow-hidden border border-[#513b2e]/30 bg-[#211915] ${prominent ? "aspect-[16/10]" : "aspect-[4/3]"}`}
        >
          {item.image ? (
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes={
                prominent ? "(max-width: 640px) 48vw, 350px" : "(max-width: 640px) 45vw, 200px"
              }
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-serif text-3xl text-[#ad9581]">
              КІНО
            </div>
          )}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(249,226,193,.1),inset_0_-17px_24px_rgba(0,0,0,.16)]"
          />
          {item.video && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-10 items-center justify-center rounded-full border border-[#e9d5be]/60 bg-[#1b1310]/75 text-[#f2dfc9] shadow-[0_4px_15px_rgba(0,0,0,.32)] backdrop-blur-[2px] sm:size-12">
                <Play size={20} className="ml-0.5" fill="currentColor" />
              </span>
            </span>
          )}
        </div>
        <div className="min-w-0 px-1 pt-2.5 pb-1 sm:px-2">
          <p
            className={`line-clamp-2 font-serif leading-[1.18] font-semibold tracking-[-.015em] break-words text-[#32231b] ${prominent ? "text-base sm:text-lg" : "text-sm sm:text-base"}`}
          >
            {item.title}
          </p>
          {item.category && (
            <p className="mt-1 truncate text-[10px] tracking-[.04em] text-[#695346]">
              {item.category}
            </p>
          )}
        </div>
        <Pin teal={active} />
      </button>
    </div>
  );
}

function FeaturedWork({
  item,
  index,
  total,
  onClose,
  onMove,
}: {
  item: Item | null;
  index: number;
  total: number;
  onClose: () => void;
  onMove: (offset: number) => void;
}) {
  const video = getVideoSource(item?.video);

  if (!item) {
    return (
      <div className="flex min-h-60 items-center justify-center border border-[#896b53]/50 bg-[#231914] p-8 text-center font-serif text-[#dbc6b0]">
        Обери матеріал на дошці, щоб побачити його тут.
      </div>
    );
  }

  return (
    <article className="min-w-0 rounded-[10px] border border-[#8d7059]/55 bg-[linear-gradient(145deg,#281d18_0%,#1c1512_64%,#181210_100%)] p-2 shadow-[inset_0_1px_0_rgba(241,213,177,.08),0_22px_55px_rgba(0,0,0,.33)] sm:p-3">
      <div className="flex items-start justify-between gap-3 px-2 pt-2 pb-3 sm:px-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-[.24em] text-[#63b3a1]">
            АРХІВ / ОБРАНА РОБОТА
          </p>
          <h3 className="mt-2 font-serif text-2xl leading-tight break-words text-[#f0dfcd] sm:text-3xl">
            {item.title}
          </h3>
          {item.category && <p className="mt-1 text-xs text-[#bba28c]">{item.category}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити перегляд"
          className="shrink-0 rounded-sm border border-[#78563c] p-2 text-[#edd7c0] hover:bg-[#3b2b22]"
        >
          <X size={19} />
        </button>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-[3px] border border-[#ad8a68]/18 bg-[#120e0c]">
        {video?.kind === "iframe" ? (
          <iframe
            key={item.id}
            src={video.src}
            title={item.title}
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
          />
        ) : video?.kind === "file" ? (
          <video
            key={item.id}
            src={video.src}
            controls
            playsInline
            preload="metadata"
            poster={item.image}
            className="h-full w-full object-contain"
          />
        ) : item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 100vw, 44vw"
            className="object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-serif text-3xl text-[#947c69]">
            Кіноархів
          </div>
        )}
      </div>

      <div className="relative mt-2 min-w-0 p-4 text-[#39291f] sm:p-6" style={PAPER}>
        <Pin teal align="right" />
        {item.description ? (
          <p className="font-serif text-base leading-relaxed break-words whitespace-pre-line sm:text-lg">
            {item.description}
          </p>
        ) : (
          <p className="font-serif text-[#8a7564] italic">Опис поки не додано.</p>
        )}
        {video?.kind === "link" && (
          <a
            href={video.src}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 border-b border-[#247f72] pb-1 text-sm font-semibold text-[#185c52] hover:text-[#0f3a34]"
          >
            Переглянути відео <ArrowRight size={15} />
          </a>
        )}
        {total > 1 && (
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#725b4a]/30 pt-4">
            <button
              type="button"
              onClick={() => onMove(-1)}
              aria-label="Попередня робота"
              className="rounded-full border border-[#806d59] p-2 hover:bg-[#d3bda3]"
            >
              <ChevronLeft size={19} />
            </button>
            <span className="font-mono text-xs tracking-widest text-[#665041]">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => onMove(1)}
              aria-label="Наступна робота"
              className="rounded-full border border-[#806d59] p-2 hover:bg-[#d3bda3]"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

// Просмотр работ на мобильных: модалка не заставляет возвращаться к началу
// длинной доски. Portal выводит её непосредственно в body, за пределами
// overflow-hidden и stacking context самой доски.
function MobileWorkDialog({
  item,
  index,
  total,
  onClose,
  onMove,
}: {
  item: Item;
  index: number;
  total: number;
  onClose: () => void;
  onMove: (offset: number) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const video = getVideoSource(item.video);

  // При переходе к следующей работе показываем её видео, а не низ
  // описания предыдущей карточки.
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [item.id]);

  useEffect(() => {
    // position:fixed нужен в том числе для Safari на iPhone.
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      // Не перехватываем стрелки: они могут управлять прокруткой видео.
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], video[controls], iframe",
        ),
      ).filter((element) => element.getClientRects().length > 0);

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
    // Эффект только на открытие / закрытие — смена видео не блокирует body заново.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center bg-[#0a0706]/95 backdrop-blur-md sm:items-center lg:hidden"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-cinema-title"
        tabIndex={-1}
        className="flex h-[100dvh] w-full max-w-[680px] flex-col overflow-hidden border-[#7e604b]/70 bg-[#241914] shadow-[0_24px_100px_rgba(0,0,0,.75)] sm:h-[min(92dvh,900px)] sm:rounded-xl sm:border"
      >
        {/* Верхняя панель всегда видна, даже при длинном описании. */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#80624b]/40 px-4 pt-[max(14px,env(safe-area-inset-top))] pb-3 sm:px-6 sm:pt-5">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold tracking-[.22em] text-[#35b69b] uppercase">
              КІНОАРХІВ / ПЕРЕГЛЯД
            </p>
            <h2
              id="mobile-cinema-title"
              className="mt-1 font-serif text-[25px] leading-tight break-words text-[#f0dfcd]"
            >
              {item.title}
            </h2>
            {item.category && <p className="mt-1 text-xs text-[#bba28c]">{item.category}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Закрити перегляд"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#9b775d]/60 text-[#f0dfcd] transition-colors hover:bg-[#4b3629] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35b69b]"
          >
            <X size={21} />
          </button>
        </div>

        <div
          ref={contentRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-6 sm:px-6"
        >
          <div className="relative h-[min(48dvh,430px)] min-h-[185px] w-full overflow-hidden rounded-sm bg-black">
            {video?.kind === "iframe" ? (
              <iframe
                key={item.id}
                src={video.src}
                title={item.title}
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full"
              />
            ) : video?.kind === "file" ? (
              <video
                key={item.id}
                src={video.src}
                controls
                playsInline
                preload="metadata"
                poster={item.image}
                className="h-full w-full object-contain"
              />
            ) : item.image ? (
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 680px) 100vw, 680px"
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-serif text-2xl text-[#947c69]">
                Матеріал із кіноархіву
              </div>
            )}
          </div>

          <div className="relative mt-3 min-w-0 p-5 text-[#39291f] sm:p-6" style={PAPER}>
            <Pin teal align="right" />
            {item.description ? (
              <p className="font-serif text-base leading-relaxed break-words whitespace-pre-line">
                {item.description}
              </p>
            ) : (
              <p className="font-serif text-[#8a7564] italic">Опис поки не додано.</p>
            )}
            {video?.kind === "link" && (
              <a
                href={video.src}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 border-b border-[#247f72] pb-1 text-sm font-semibold text-[#185c52]"
              >
                Переглянути відео <ArrowRight size={15} />
              </a>
            )}
          </div>
        </div>

        {total > 1 && (
          <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[#80624b]/40 bg-[#241914] px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
            <button
              type="button"
              onClick={() => onMove(-1)}
              aria-label="Попередня робота"
              className="flex min-h-11 items-center gap-1 rounded-full border border-[#8e6e55] px-3 text-xs text-[#f0dfcd] hover:bg-[#3b2b22] focus-visible:outline-2 focus-visible:outline-[#35b69b]"
            >
              <ChevronLeft size={18} /> Назад
            </button>
            <span className="font-mono text-xs tracking-widest text-[#d7bfaa]" aria-live="polite">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => onMove(1)}
              aria-label="Наступна робота"
              className="flex min-h-11 items-center gap-1 rounded-full border border-[#8e6e55] px-3 text-xs text-[#f0dfcd] hover:bg-[#3b2b22] focus-visible:outline-2 focus-visible:outline-[#35b69b]"
            >
              Далі <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function CinemaEvidenceBoard({ section }: { section: Section }) {
  const content = useMemo(() => buildContent(section), [section]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [mobileId, setMobileId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const initial = content.episodes[0] ?? content.showreels[0] ?? content.businessCards[0] ?? null;
  const active = closed ? null : (content.all.find((item) => item.id === activeId) ?? initial);
  const activeIndex = active ? content.all.findIndex((item) => item.id === active.id) : -1;
  const promoted = [...content.showreels, ...content.businessCards];
  const episodes = showAll ? content.episodes : content.episodes.slice(0, 12);
  const mobileIndex = content.all.findIndex((item) => item.id === mobileId);
  const mobileItem = mobileIndex >= 0 ? content.all[mobileIndex] : null;

  // Если окно увеличилось до desktop, модалка закрывается; выбор остаётся
  // активным в правой панели.
  useEffect(() => {
    if (!mobileId) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (desktop.matches) setMobileId(null);
    };
    onChange();
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [mobileId]);

  function select(id: string, source: HTMLButtonElement) {
    setActiveId(id);
    setClosed(false);

    if (window.matchMedia("(max-width: 1023px)").matches) {
      triggerRef.current = source;
      setMobileId(id);
    }
  }

  function closeMobile() {
    setMobileId(null);
    // Возвращаем фокус к карточке, на которой открыли окно; scroll не трогаем.
    requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  }

  function moveMobile(offset: number) {
    if (!mobileItem || content.all.length <= 1) return;
    const next = (mobileIndex + offset + content.all.length) % content.all.length;
    const id = content.all[next].id;
    setActiveId(id);
    setMobileId(id);
  }

  function move(offset: number) {
    if (content.all.length === 0 || activeIndex < 0) return;
    const next = (activeIndex + offset + content.all.length) % content.all.length;
    setActiveId(content.all[next].id);
    setClosed(false);
  }

  return (
    <section className="mx-auto w-full max-w-[1500px] text-[#ead9c5]">
      <div className="mb-8 flex flex-col gap-5 border-b border-[#a07d62]/25 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-3 text-[10px] font-semibold tracking-[.24em] text-[#5db19e] uppercase before:h-px before:w-7 before:bg-[#5db19e]/75 before:content-['']">
            КІНО / ОСОБИСТИЙ АРХІВ
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-[-.03em] text-[#f3e6d7] sm:text-5xl">
            Ролі, історії, люди
          </h2>
        </div>
        <p className="max-w-sm font-serif text-sm leading-6 text-[#c7ae9b] italic sm:text-right">
          Кіно — це люди. А люди — це завжди історії.
        </p>
      </div>

      {/* На мобильном — сама доска и окно просмотра по нажатию.
          На desktop — прежняя панель справа. */}
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)] lg:gap-6">
        <div className="min-w-0 lg:order-1">
          <div className="relative isolate overflow-hidden rounded-[14px] border-[6px] border-[#482d24] bg-[#2c201b] p-4 shadow-[inset_0_0_0_1px_rgba(196,150,101,.22),inset_0_0_65px_rgba(0,0,0,.5),0_22px_55px_rgba(0,0,0,.3)] sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-55"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(22deg,transparent 0 17px,rgba(9,5,4,.046) 18px 19px),radial-gradient(ellipse at 32% 14%,rgba(111,52,46,.19),transparent 58%),radial-gradient(ellipse at 72% 78%,rgba(106,73,48,.14),transparent 55%)",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[5px] rounded-[5px] border border-[#ad8562]/16"
            />
            {/* Нити связывают шоурил, улики и эпизоды; все карточки выше SVG. */}
            <BoardThreadNetwork
              signature={[...promoted, ...episodes].map((item) => item.id).join("|")}
            >
              {promoted.length > 0 && (
                <>
                  <TornLabel>ШОУРІЛ І ВІЗИТКА</TornLabel>
                  <ConnectedCards
                    items={promoted}
                    prominent
                    activeId={active?.id}
                    onSelect={select}
                  />
                </>
              )}

              <ClueNotes />
              <TornLabel>ЕПІЗОДИ / РОБОТИ</TornLabel>
              {content.episodes.length > 0 ? (
                <ConnectedCards items={episodes} activeId={active?.id} onSelect={select} />
              ) : (
                <p className="rounded-sm border border-[#856850]/30 px-4 py-6 text-center font-serif text-[#c4aa93]">
                  Епізодів поки немає.
                </p>
              )}

              {content.episodes.length > 12 && (
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="mx-auto mt-8 flex items-center justify-center gap-3 rounded-md border border-[#6b9d8e]/60 bg-[#16483e] px-5 py-3 font-serif text-sm tracking-[.09em] text-[#f1e3d0] shadow-[0_9px_22px_rgba(0,0,0,.28)] transition-colors hover:border-[#88c3b0] hover:bg-[#1e6053] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#35b69b]"
                >
                  <Film size={18} />
                  {showAll ? "ЗГОРНУТИ АРХІВ" : "ПОВНИЙ АРХІВ КІНО"}
                  <ArrowRight size={16} />
                </button>
              )}
              {content.all.length === 0 && (
                <p className="py-8 text-center font-serif text-[#d4bea9]">
                  Опублікованих робіт поки немає.
                </p>
              )}
            </BoardThreadNetwork>
          </div>
        </div>

        <div className="hidden min-w-0 lg:order-2 lg:block">
          <FeaturedWork
            item={active}
            index={Math.max(0, activeIndex)}
            total={content.all.length}
            onClose={() => setClosed(true)}
            onMove={move}
          />
        </div>
      </div>
      {mobileItem && (
        <MobileWorkDialog
          item={mobileItem}
          index={mobileIndex}
          total={content.all.length}
          onClose={closeMobile}
          onMove={moveMobile}
        />
      )}
    </section>
  );
}
