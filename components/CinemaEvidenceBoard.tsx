"use client";

import { type ReactNode, useMemo, useState } from "react";

import { ArrowRight, ChevronLeft, ChevronRight, Film, Play, X } from "lucide-react";
import Image from "next/image";

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

const PAPER = {
  backgroundColor: "#e5d4bd",
  backgroundImage:
    "repeating-linear-gradient(12deg,rgba(81,51,32,.025) 0px,rgba(81,51,32,.025) 1px,transparent 1px,transparent 5px),linear-gradient(145deg,rgba(255,255,255,.26),transparent 65%)",
};

function categoryOf(group: string, item: Item): "showreel" | "business" | "episode" {
  const text = `${group} ${item.category ?? ""} ${item.title} ${item.id}`.toLocaleLowerCase("uk");
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

function Pin({ teal = false }: { teal?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -top-[9px] left-1/2 z-20 h-[18px] w-[18px] -translate-x-1/2 rounded-full border border-[#38221a] shadow-[1px_4px_5px_rgba(0,0,0,.65)]"
      style={{
        background: teal
          ? "radial-gradient(circle at 30% 25%,#b0ebe0 0%,#2da58e 32%,#145449 75%,#0a342c 100%)"
          : "radial-gradient(circle at 30% 25%,#f5d4a1 0%,#bb7851 32%,#743922 74%,#391d17 100%)",
      }}
    />
  );
}

function TornLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto my-7 w-fit max-w-full px-5 py-2 text-center font-serif text-sm font-semibold tracking-[.12em] text-[#34251d] shadow-[2px_5px_10px_rgba(0,0,0,.35)] sm:text-base"
      style={{ ...PAPER, clipPath: "polygon(1% 5%,97% 0%,100% 90%,3% 100%,0% 80%)" }}
    >
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-2 size-1.5 -translate-y-1/2 rounded-full bg-[#76472f]"
      />
      {children}
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
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative min-w-0 pt-2">
      <Pin teal={active} />
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        aria-pressed={active}
        aria-label={`Переглянути: ${item.title}`}
        className={`group relative block w-full min-w-0 border p-[5px] text-left shadow-[3px_9px_16px_rgba(0,0,0,.45)] transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35b69b] sm:p-2 ${
          active ? "border-[#35b69b] ring-2 ring-[#35b69b]/55" : "border-[#b49c84]"
        }`}
        style={PAPER}
      >
        <div
          className={`relative w-full overflow-hidden bg-[#211915] ${prominent ? "aspect-[16/10]" : "aspect-[4/3]"}`}
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
          {item.video && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-10 items-center justify-center rounded-full border border-[#f2dfc9] bg-[#1b1310]/70 text-[#f2dfc9] shadow-lg sm:size-12">
                <Play size={20} className="ml-0.5" fill="currentColor" />
              </span>
            </span>
          )}
        </div>
        <div className="min-w-0 px-1 pt-2 pb-1 sm:px-2">
          <p
            className={`line-clamp-2 font-serif leading-tight font-semibold break-words text-[#32231b] ${prominent ? "text-base sm:text-lg" : "text-sm sm:text-base"}`}
          >
            {item.title}
          </p>
          {item.category && (
            <p className="mt-1 truncate text-[10px] tracking-[.04em] text-[#695346]">
              {item.category}
            </p>
          )}
        </div>
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
    <article className="min-w-0 border border-[#8d6b51]/65 bg-[#1c1512] p-2 shadow-[0_18px_40px_rgba(0,0,0,.4)] sm:p-3">
      <div className="flex items-start justify-between gap-3 px-2 pt-2 pb-3 sm:px-3">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[.23em] text-[#35b69b]">АРХІВ / ОБРАНА РОБОТА</p>
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

      <div className="relative aspect-video w-full overflow-hidden bg-[#120e0c]">
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
        <Pin teal />
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

export function CinemaEvidenceBoard({ section }: { section: Section }) {
  const content = useMemo(() => buildContent(section), [section]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const initial = content.episodes[0] ?? content.showreels[0] ?? content.businessCards[0] ?? null;
  const active = closed ? null : (content.all.find((item) => item.id === activeId) ?? initial);
  const activeIndex = active ? content.all.findIndex((item) => item.id === active.id) : -1;
  const promoted = [...content.showreels, ...content.businessCards];
  const episodes = showAll ? content.episodes : content.episodes.slice(0, 12);

  function select(id: string) {
    setActiveId(id);
    setClosed(false);
  }

  function move(offset: number) {
    if (content.all.length === 0 || activeIndex < 0) return;
    const next = (activeIndex + offset + content.all.length) % content.all.length;
    select(content.all[next].id);
  }

  return (
    <section className="mx-auto w-full max-w-[1500px] text-[#ead9c5]">
      <div className="mb-6 flex flex-col gap-3 border-b border-[#81624a]/30 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] tracking-[.25em] text-[#35b69b]">КІНО / ОСОБИСТИЙ АРХІВ</p>
          <h2 className="mt-2 font-serif text-3xl text-[#f0dfcd] sm:text-5xl">
            Ролі, історії, люди
          </h2>
        </div>
        <p className="max-w-xs font-serif text-sm leading-6 text-[#c3a995] italic">
          Кіно — це люди. А люди — це завжди історії.
        </p>
      </div>

      {/* На телефоне сначала идёт выбранная работа и её текст, потом карточки.
          Никаких абсолютных координат для самих карточек. */}
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)] lg:gap-6">
        <div className="order-2 min-w-0 lg:order-1">
          <div className="relative isolate overflow-hidden rounded-md border-[6px] border-[#493326] bg-[#2d2019] p-3 shadow-[inset_0_0_45px_rgba(0,0,0,.65),0_18px_45px_rgba(0,0,0,.25)] sm:p-5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-45"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(24deg,transparent 0 17px,rgba(0,0,0,.07) 18px 19px),radial-gradient(ellipse at 40% 15%,#60412b44,transparent 60%)",
              }}
            />
            {/* Нити лежат ПОД карточками и поэтому не мешают ни кликам, ни тексту. */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 h-full w-full"
              viewBox="0 0 700 850"
              preserveAspectRatio="none"
            >
              <path
                d="M42 56 L368 110 L650 46 M84 290 L580 360 L130 535 L603 680"
                fill="none"
                stroke="#874338"
                strokeWidth="2"
                opacity=".65"
              />
              <path
                d="M42 56 L368 110 L650 46 M84 290 L580 360 L130 535 L603 680"
                fill="none"
                stroke="#d18775"
                strokeWidth=".55"
                opacity=".7"
              />
            </svg>
            <div className="relative z-10">
              {promoted.length > 0 && (
                <>
                  <TornLabel>ШОУРІЛ І ВІЗИТКА</TornLabel>
                  <div className="grid grid-cols-2 items-start gap-3 sm:gap-5">
                    {promoted.map((item) => (
                      <EvidenceCard
                        key={item.id}
                        item={item}
                        prominent
                        active={active?.id === item.id}
                        onSelect={select}
                      />
                    ))}
                  </div>
                </>
              )}

              <TornLabel>ЕПІЗОДИ / РОБОТИ</TornLabel>
              {content.episodes.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-3 xl:grid-cols-4">
                  {episodes.map((item) => (
                    <EvidenceCard
                      key={item.id}
                      item={item}
                      active={active?.id === item.id}
                      onSelect={select}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-sm border border-[#856850]/30 px-4 py-6 text-center font-serif text-[#c4aa93]">
                  Епізодів поки немає.
                </p>
              )}

              {content.episodes.length > 12 && (
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="mx-auto mt-8 flex items-center justify-center gap-3 rounded-sm border border-[#b08b63] bg-[#16463e] px-5 py-3 font-serif text-sm tracking-[.08em] text-[#eedccb] shadow-[2px_7px_12px_rgba(0,0,0,.4)] hover:bg-[#1e6759]"
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
            </div>
          </div>
        </div>

        <div className="order-1 min-w-0 lg:order-2">
          <FeaturedWork
            item={active}
            index={Math.max(0, activeIndex)}
            total={content.all.length}
            onClose={() => setClosed(true)}
            onMove={move}
          />
        </div>
      </div>
    </section>
  );
}
