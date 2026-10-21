"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Minus,
  Play,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import Image from "next/image";

import { CinemaEvidenceBoard } from "@/components/CinemaEvidenceBoard";
import { ZoomablePhoto } from "@/components/gallery/ZoomablePhoto";
import type { ZoomablePhotoHandle } from "@/components/gallery/ZoomablePhoto";

import type { Item, Section } from "@/lib/content";

type MediaGridProps = {
  section: Section;
};

type CollectionMode = "art" | "writing" | "video";

function getMode(slug: string): CollectionMode {
  if (slug === "ya-pyshu") return "writing";

  if (slug === "fotogalereya" || slug === "ya-malyuyu") return "art";

  return "video";
}

function getCollectionHeading(mode: CollectionMode) {
  switch (mode) {
    case "writing":
      return {
        eyebrow: "ОСОБИСТИЙ АРХІВ / ТЕКСТИ",

        title: "Слова та історії",

        description: "Тексти, думки й вигадані світи — усе, що хочеться розповісти.",
      };

    case "art":
      return {
        eyebrow: "ОСОБИСТИЙ АРХІВ / ВІЗУАЛЬНЕ",

        title: "Погляд художника",

        description: "Малюнки, фотографії та образи, що говорять без слів.",
      };

    default:
      return {
        eyebrow: "ОСОБИСТИЙ АРХІВ / ВІДЕО",

        title: "Історії в кадрі",

        description: "Роботи, сцени й фрагменти, які варто побачити наживо.",
      };
  }
}

function getEmbedUrl(url: string): string | null {
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
    // Relative MP4 paths are expected here and handled by <video>.
  }

  return null;
}

export function MediaGrid({ section }: MediaGridProps) {
  if (section.slug === "kino") {
    return <CinemaEvidenceBoard section={section} />;
  }

  // A different section gets fresh filter and dialog state automatically.

  return <CollectionGallery key={section.slug} section={section} />;
}

function CollectionGallery({ section }: MediaGridProps) {
  const mode = getMode(section.slug);

  const heading = getCollectionHeading(mode);

  const [selectedGroup, setSelectedGroup] = useState("Усі");

  const [activeId, setActiveId] = useState<string | null>(null);

  const openerRef = useRef<HTMLButtonElement | null>(null);

  const closeRef = useRef<HTMLButtonElement | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);

  const groupNames = useMemo(
    () => ["Усі", ...Array.from(new Set(section.groups.map((group) => group.title)))],

    [section.groups],
  );

  const visibleGroups = useMemo(
    () =>
      section.groups.filter((group) => selectedGroup === "Усі" || group.title === selectedGroup),

    [section.groups, selectedGroup],
  );

  const visibleItems = useMemo(
    () => visibleGroups.flatMap((group) => group.items),

    [visibleGroups],
  );

  const allCount = section.groups.reduce((sum, group) => sum + group.items.length, 0);

  const activeIndex = visibleItems.findIndex((item) => String(item.id) === activeId);

  const active = activeIndex >= 0 ? visibleItems[activeIndex] : null;

  const openItem = useCallback((item: Item, source: HTMLButtonElement) => {
    openerRef.current = source;

    setActiveId(String(item.id));
  }, []);

  const closeItem = useCallback(() => {
    setActiveId(null);

    requestAnimationFrame(() => openerRef.current?.focus());
  }, []);

  const moveItem = useCallback(
    (step: number) => {
      setActiveId((current) => {
        if (visibleItems.length === 0 || current === null) return null;

        const index = visibleItems.findIndex((item) => String(item.id) === current);

        if (index < 0) return null;

        const next = (index + step + visibleItems.length) % visibleItems.length;

        return String(visibleItems[next].id);
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
      if (event.key === "Escape") {
        event.preventDefault();

        closeItem();

        return;
      }

      if (event.key === "Tab") {
        const dialog = modalRef.current;

        if (!dialog) return;

        const elements = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]), video[controls], iframe',
          ),
        ).filter((element) => element.getClientRects().length > 0);

        if (elements.length === 0) return;

        const first = elements[0];

        const last = elements[elements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();

          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();

          first.focus();
        }

        return;
      }

      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      const target = event.target;

      if (
        target instanceof HTMLMediaElement ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      if (visibleItems.length < 2) return;

      event.preventDefault();

      moveItem(event.key === "ArrowRight" ? 1 : -1);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, closeItem, moveItem, visibleItems.length]);

  return (
    <>
      <section className="relative isolate mx-auto w-full max-w-[1460px] overflow-hidden rounded-[12px] border border-[#5b4638]/35 bg-[#241d19] px-4 pt-10 pb-16 text-[#e8d9c8] shadow-[0_24px_70px_rgba(0,0,0,0.2)] sm:px-8 sm:pt-14 sm:pb-20 lg:px-12">
        {/* Atmospheric light, not cork texture / detective board. */}

        <div
          aria-hidden="true"

          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_0%,rgba(126,80,53,0.11),transparent_45%),radial-gradient(ellipse_at_95%_32%,rgba(35,103,89,0.07),transparent_43%),linear-gradient(180deg,#2b211d_0%,#241c19_45%,#211a17_100%)]"
        />

        <div
          aria-hidden="true"

          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#bea084]/35 to-transparent"
        />

        {/* Editorial introduction */}

        <header className="relative mb-9 border-b border-[#766052]/30 pb-9 sm:mb-12 sm:pb-10">
          <div className="mb-5 flex items-center gap-3 text-[10px] font-medium tracking-[0.22em] text-[#65ad9c] uppercase">
            <span className="h-px w-8 bg-[#4f9e8c]" aria-hidden="true" />

            {heading.eyebrow}
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end md:gap-10">
            <div className="max-w-[750px]">
              <h2 className="font-serif text-[clamp(2.5rem,5vw,4.8rem)] leading-[1.04] font-normal tracking-[-0.045em] text-[#f0e1d0]">
                {heading.title}
              </h2>

              <p className="mt-4 max-w-xl text-[14px] leading-[1.8] text-[#bda99a] sm:text-[15px]">
                {heading.description}
              </p>
            </div>

            <div className="flex shrink-0 items-baseline gap-2 border-l border-[#4f9e8c]/60 pl-4 md:pb-1">
              <span className="font-serif text-3xl text-[#e8d9c8]">
                {String(allCount).padStart(2, "0")}
              </span>

              <span className="text-[10px] tracking-[0.18em] text-[#bda99a] uppercase">
                матеріалів
              </span>
            </div>
          </div>
        </header>

        {/* Filters: restrained index tabs */}

        {groupNames.length > 1 && (
          <div
            role="group"

            aria-label="Фільтр творчого архіву"

            className="mb-12 flex flex-wrap items-center gap-2 sm:mb-14"
          >
            <span className="mr-3 hidden text-[10px] tracking-[0.2em] text-[#9f8a7a] uppercase md:block">
              КАТЕГОРІЇ
            </span>

            {groupNames.map((name) => {
              const selected = selectedGroup === name;

              return (
                <button
                  key={name}

                  type="button"

                  aria-pressed={selected}

                  onClick={() => {
                    setSelectedGroup(name);

                    setActiveId(null);
                  }}

                  className={[
                    "min-h-10 rounded-full border px-4 py-2 text-[12px] font-medium transition-all duration-200",

                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#63b6a4]",

                    selected
                      ? "border-[#438f80] bg-[#277c6d] text-[#f8f1e8]"
                      : "border-[#725949]/55 bg-[#332822]/55 text-[#c7b2a1] hover:border-[#62a998]/60 hover:text-[#f2e4d7]",
                  ].join(" ")}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}

        {/* Grouped collection */}

        <div className="space-y-16 sm:space-y-20">
          {visibleGroups.map((group, groupIndex) => (
            <section
              key={`${section.slug}-${group.title}`}

              aria-labelledby={`gallery-${section.slug}-${groupIndex}`}
            >
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#806553]/30 pb-5 sm:mb-8">
                <div className="flex min-w-0 items-baseline gap-4">
                  <span className="font-serif text-[19px] text-[#4b9d8a] italic sm:text-[22px]">
                    {String(groupIndex + 1).padStart(2, "0")}
                  </span>

                  <h3
                    id={`gallery-${section.slug}-${groupIndex}`}

                    className="font-serif text-[clamp(1.5rem,3vw,2.2rem)] leading-tight font-normal text-[#efe0d0]"
                  >
                    {group.title}
                  </h3>
                </div>

                <span className="pb-1 text-[11px] tracking-[0.16em] text-[#a79282] uppercase">
                  {String(group.items.length).padStart(2, "0")} / РОБІТ
                </span>
              </div>

              {group.items.length ? (
                <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-11">
                  {group.items.map((item, itemIndex) => {
                    const featured = group.items.length >= 3 && itemIndex === 0;

                    return (
                      <CollectionCard
                        key={String(item.id)}

                        item={item}

                        mode={mode}

                        number={itemIndex + 1}

                        featured={featured}

                        onOpen={openItem}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-[#6b5446]/55 px-5 py-14 text-center font-serif text-lg text-[#a99483] italic">
                  Матеріали незабаром з’являться.
                </div>
              )}
            </section>
          ))}
        </div>

        {visibleGroups.length === 0 && (
          <div className="py-16 text-center text-sm text-[#baa695]">
            У цьому розділі поки немає матеріалів.
          </div>
        )}

        <div
          className="mt-16 flex items-center gap-4 text-[10px] tracking-[0.2em] text-[#846f61] uppercase"

          aria-hidden="true"
        >
          <span className="h-px flex-1 bg-[#695244]/35" />
          КІНЕЦЬ ДОБІРКИ
          <span className="h-px flex-1 bg-[#695244]/35" />
        </div>
      </section>

      {active && (
        <CollectionDialog
          item={active}

          mode={mode}

          index={activeIndex}

          count={visibleItems.length}

          closeRef={closeRef}

          modalRef={modalRef}

          onClose={closeItem}

          onMove={moveItem}
        />
      )}
    </>
  );
}

type CollectionCardProps = {
  item: Item;

  mode: CollectionMode;

  number: number;

  featured: boolean;

  onOpen: (item: Item, source: HTMLButtonElement) => void;
};

function CollectionCard({ item, mode, number, featured, onOpen }: CollectionCardProps) {
  const isWriting = mode === "writing";

  const isArt = mode === "art";

  const hasVideo = mode === "video" && Boolean(item.video);

  const pictureSizing = featured
    ? "lg:aspect-[16/8.5]"
    : isArt
      ? "sm:aspect-[4/4.5]"
      : "sm:aspect-[4/3]";

  return (
    <button
      type="button"

      aria-label={`Відкрити: ${item.title}`}

      onClick={(event) => onOpen(item, event.currentTarget)}

      className={[
        "group relative flex min-w-0 flex-col text-left outline-none",

        "transition-transform duration-300 hover:-translate-y-1",

        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#64b4a3]",

        featured ? "lg:col-span-2" : "",
      ].join(" ")}
    >
      {/* Image / text artwork in a restrained archival mount */}

      <div
        className={[
          "relative w-full overflow-hidden rounded-[8px] border border-[#735849]/55 bg-[#30241f]",

          "shadow-[0_12px_32px_rgba(0,0,0,0.23)] transition-all duration-300",

          "group-hover:border-[#519987]/70 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.32)]",

          "aspect-[4/3]",

          pictureSizing,
        ].join(" ")}
      >
        {isWriting ? (
          <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_85%_0%,rgba(61,140,120,0.14),transparent_54%),linear-gradient(135deg,#3a2c25,#261e1b_65%,#221b18)] p-6 sm:p-8">
            {item.image && (
              <Image
                src={item.image}

                alt=""

                fill

                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 65vw"

                className="object-cover opacity-[0.17] grayscale transition-transform duration-700 group-hover:scale-105"
              />
            )}

            <div className="relative z-10 flex h-full flex-col border-l border-[#3b9a87]/65 pl-5">
              <span
                className="font-serif text-4xl leading-none text-[#48a18d]/85"

                aria-hidden="true"
              >
                “
              </span>

              <p className="mt-3 line-clamp-4 max-w-[40ch] font-serif text-[clamp(1.1rem,2vw,1.7rem)] leading-[1.45] text-[#eee1d3] italic">
                {item.description || item.title}
              </p>

              <span className="mt-auto pt-4 text-[10px] tracking-[0.17em] text-[#7cc1af] uppercase">
                ЧИТАТИ ТВІР ↗
              </span>
            </div>
          </div>
        ) : item.image ? (
          <>
            <Image
              src={item.image}

              alt=""

              fill

              sizes={
                featured
                  ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 65vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw"
              }

              className={[
                "transition-transform duration-700 group-hover:scale-[1.035]",

                isArt ? "object-contain p-2 sm:p-3" : "object-cover",
              ].join(" ")}
            />

            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f0b09]/45 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,#3b3029,#211a17_75%)] font-serif text-6xl text-[#8e7665]">
            {isArt ? "✳" : "✦"}
          </div>
        )}

        <span className="absolute top-4 left-4 z-10 rounded-[4px] border border-[#e1cbb5]/20 bg-[#1d1613]/70 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.14em] text-[#f0e1d1] backdrop-blur-sm">
          {String(number).padStart(2, "0")}
        </span>

        {hasVideo && (
          <span className="absolute top-1/2 left-1/2 z-10 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#f6e5d3]/45 bg-[#201916]/70 text-[#f8e9d8] shadow-[0_9px_27px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-[#5cb3a1] group-hover:bg-[#267c6d] sm:size-16">
            <Play
              size={21}

              fill="currentColor"

              strokeWidth={1.5}

              className="ml-1"

              aria-hidden="true"
            />
          </span>
        )}

        {isArt && (
          <span className="absolute right-4 bottom-4 z-10 flex size-9 items-center justify-center rounded-full border border-[#eee0cf]/30 bg-[#1e1714]/70 text-[#f0e3d3] backdrop-blur-sm transition-colors group-hover:border-[#5ab09d] group-hover:bg-[#267c6d]">
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        )}
      </div>

      {/* Catalog label — detached from image, not a pinned paper note */}

      <div className="mt-4 flex w-full items-start justify-between gap-4 border-b border-[#765c4b]/40 pb-5">
        <div className="min-w-0">
          <span className="text-[10px] font-medium tracking-[0.17em] text-[#58a894] uppercase">
            {isWriting ? "ТЕКСТ" : isArt ? "ВІЗУАЛЬНА РОБОТА" : "ВІДЕОАРХІВ"} /{" "}
            {String(number).padStart(2, "0")}
          </span>

          <h4 className="mt-1.5 line-clamp-2 font-serif text-[20px] leading-[1.25] font-normal text-[#eee0d1] transition-colors group-hover:text-white sm:text-[23px]">
            {item.title}
          </h4>

          {!isWriting && item.description && (
            <p className="mt-2 line-clamp-2 max-w-[54ch] text-[12px] leading-[1.6] text-[#b49f90] sm:text-[13px]">
              {item.description}
            </p>
          )}
        </div>

        <ArrowUpRight
          size={19}

          className="mt-1 shrink-0 text-[#9c8675] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#69bbaa]"

          aria-hidden="true"
        />
      </div>
    </button>
  );
}

type CollectionDialogProps = {
  item: Item;

  mode: CollectionMode;

  index: number;

  count: number;

  closeRef: RefObject<HTMLButtonElement | null>;

  modalRef: RefObject<HTMLDivElement | null>;

  onClose: () => void;

  onMove: (step: number) => void;
};

function CollectionDialog({
  item,

  mode,

  index,

  count,

  closeRef,

  modalRef,

  onClose,

  onMove,
}: CollectionDialogProps) {
  const embed = item.video ? getEmbedUrl(item.video) : null;

  const isWriting = mode === "writing";

  const isVideo = mode === "video";
  const hasZoomableImage = mode === "art" && Boolean(item.image) && !item.video;
  const zoomRef = useRef<ZoomablePhotoHandle>(null);
  const [photoScale, setPhotoScale] = useState(1);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[#0e0908]/90 p-3 backdrop-blur-lg sm:p-6"

      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}

        role="dialog"

        aria-modal="true"

        aria-label={item.title}

        className={[
          "relative my-auto flex w-full max-w-[1080px] flex-col rounded-[10px] border border-[#806654]/45 bg-[#241c18] shadow-[0_35px_110px_rgba(0,0,0,0.7)]",
          hasZoomableImage
            ? "h-[94dvh] overflow-hidden sm:h-[min(92dvh,900px)]"
            : "max-h-[94dvh] overflow-y-auto",
        ].join(" ")}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#806654]/35 px-4 py-4 sm:px-7">
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-[0.18em] text-[#65af9e] uppercase">
              АРХІВ СЛАВИ НІКОНОРОВА
            </p>

            <h2 className="mt-1 truncate font-serif text-[20px] text-[#eee0cf] sm:text-[27px]">
              {item.title}
            </h2>
          </div>

          <button
            ref={closeRef}

            type="button"

            onClick={onClose}

            aria-label="Закрити перегляд"

            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#8e7360]/55 text-[#e7d7c8] transition-colors hover:border-[#61b29f] hover:bg-[#3b3029] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#64b4a3]"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </header>

        <div
          className={[
            "relative overflow-hidden",
            hasZoomableImage ? "min-h-0 flex-1 bg-[#100c0b]" : "min-h-[220px] shrink-0",
            !hasZoomableImage ? (isWriting ? "bg-[#2d231e]" : "aspect-video bg-[#100c0b]") : "",
            isWriting ? "max-h-[60dvh] overflow-y-auto" : "",
          ].join(" ")}
        >
          {item.video ? (
            embed ? (
              <iframe
                key={String(item.id)}

                src={embed}

                title={item.title}

                className="absolute inset-0 h-full w-full"

                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"

                allowFullScreen
              />
            ) : (
              <video
                key={String(item.id)}

                src={item.video}

                autoPlay

                controls

                playsInline

                className="absolute inset-0 h-full w-full object-contain"
              />
            )
          ) : isWriting ? (
            <>
              {item.image && (
                <Image
                  src={item.image}

                  alt=""

                  fill

                  sizes="90vw"

                  className="object-cover opacity-[0.12] blur-lg"
                />
              )}

              <div className="relative mx-auto max-w-[720px] px-6 py-10 sm:px-12 sm:py-14">
                <div className="mb-5 h-px w-12 bg-[#4caa96]" aria-hidden="true" />

                <div className="font-serif text-[18px] leading-[1.9] whitespace-pre-line text-[#f0e2d3] sm:text-[23px]">
                  {item.description || item.title}
                </div>
              </div>
            </>
          ) : item.image ? (
            mode === "art" ? (
              <ZoomablePhoto
                ref={zoomRef}
                key={String(item.id)}
                src={item.image}
                alt={item.title}
                resetKey={String(item.id)}
                onScaleChange={setPhotoScale}
              />
            ) : (
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 1080px) 95vw, 1080px"
                className="object-contain"
              />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center font-serif text-6xl text-[#796252]">
              ✳
            </div>
          )}
        </div>

        {/* Zoom controls live on the lightbox FRAME, below the photo.
            They stay visible on phones and never cover the picture. */}
        {hasZoomableImage && (
          <div
            role="toolbar"
            aria-label="Масштаб фотографії"
            className="flex shrink-0 items-center justify-between gap-2 border-t border-[#806654]/45 bg-[#2b211c] px-3 py-2 text-[#eddfcf] sm:px-7"
          >
            <span className="hidden text-[10px] font-medium tracking-[0.18em] text-[#8fc2b5] uppercase sm:block">
              МАСШТАБ
            </span>
            <div className="mx-auto flex items-center gap-1 sm:mx-0" aria-label="Кнопки масштабу">
              <button
                type="button"
                aria-label="Зменшити фото"
                title="Зменшити"
                disabled={photoScale <= 1.001}
                onClick={() => zoomRef.current?.zoomOut()}
                className="grid size-11 place-items-center rounded-lg border border-[#725949]/45 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#35b69b] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Minus size={18} />
              </button>
              <span className="min-w-[62px] text-center font-mono text-xs text-[#ead2bc] tabular-nums">
                {Math.round(photoScale * 100)}%
              </span>
              <button
                type="button"
                aria-label="Збільшити фото"
                title="Збільшити"
                disabled={photoScale >= 4.999}
                onClick={() => zoomRef.current?.zoomIn()}
                className="grid size-11 place-items-center rounded-lg border border-[#725949]/45 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#35b69b] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Plus size={18} />
              </button>
              <span aria-hidden="true" className="mx-1 h-5 w-px bg-[#806654]/55" />
              <button
                type="button"
                aria-label="Скинути масштаб"
                title="Повернути 100%"
                disabled={photoScale <= 1.001}
                onClick={() => zoomRef.current?.reset()}
                className="grid size-11 place-items-center rounded-lg border border-[#725949]/45 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#35b69b] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <RotateCcw size={18} />
              </button>
            </div>
            <span className="hidden text-[10px] tracking-[.08em] text-[#a99586] md:block">
              ДВОМА ПАЛЬЦЯМИ · ПОДВІЙНИЙ ДОТИК
            </span>
          </div>
        )}

        <footer
          className={[
            "flex flex-wrap items-center justify-between gap-5 border-t border-[#806654]/35 px-4 py-5 sm:px-7",
            hasZoomableImage ? "max-h-[24dvh] shrink-0 overflow-y-auto" : "",
          ].join(" ")}
        >
          <div className="max-w-[70ch] min-w-0">
            {!isWriting && item.description && (
              <p className="text-[13px] leading-[1.7] whitespace-pre-line text-[#c7b2a3] sm:text-[14px]">
                {item.description}
              </p>
            )}

            {!item.video && isVideo && (
              <p className="text-[12px] leading-[1.6] text-[#a99080]">
                Відео для цього матеріалу ще не додано.
              </p>
            )}
          </div>

          {count > 1 && (
            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"

                onClick={() => onMove(-1)}

                aria-label="Попередній матеріал"

                className="flex size-10 items-center justify-center rounded-full border border-[#876a59]/60 text-[#eee1d2] transition-colors hover:border-[#69b4a2] hover:bg-[#3b3029] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#64b4a3]"
              >
                <ChevronLeft size={19} />
              </button>

              <span className="min-w-[62px] text-center font-mono text-[11px] tracking-[0.12em] text-[#baa493]">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>

              <button
                type="button"

                onClick={() => onMove(1)}

                aria-label="Наступний матеріал"

                className="flex size-10 items-center justify-center rounded-full border border-[#876a59]/60 text-[#eee1d2] transition-colors hover:border-[#69b4a2] hover:bg-[#3b3029] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#64b4a3]"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
