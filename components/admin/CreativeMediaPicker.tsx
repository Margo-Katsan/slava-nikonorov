"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Check, ExternalLink, Film, Images, Search, X } from "lucide-react";

import type { CreativeMedia } from "@/lib/creative/sections";
import { categoryLabel } from "@/lib/media/categories";

type Props = {
  files: CreativeMedia[];
  value: string;
  onChange: (id: string) => void;
  imagesOnly?: boolean;
  required?: boolean;
  title?: string;
};

function cloudinaryThumb(url: string): string {
  // Media URLs are read from our database; do not change arbitrary third-party URLs.
  if (!url.startsWith("https://res.cloudinary.com/")) return url;
  return url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_360,c_limit/");
}

export function CreativeMediaPicker({
  files,
  value,
  onChange,
  imagesOnly = false,
  required = false,
  title = "Обкладинка з медіатеки",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [kind, setKind] = useState<"all" | "image" | "video">("all");
  const [limit, setLimit] = useState(40);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = files.find((file) => file.id === value);
  const available = imagesOnly ? files.filter((file) => file.resourceType === "image") : files;
  const categories = Array.from(new Set(available.map((file) => file.category))).sort();

  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("uk");
    return available.filter(
      (file) =>
        (category === "ALL" || file.category === category) &&
        (imagesOnly || kind === "all" || file.resourceType === kind) &&
        (!needle || file.title.toLocaleLowerCase("uk").includes(needle)),
    );
  }, [available, category, imagesOnly, kind, query]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);

  const secondaryButton =
    "rounded-xl border border-white/15 bg-[#241915] px-4 py-3 text-sm text-[#e9d5c3] transition hover:border-[#35b69b]/60 hover:bg-[#34241f]";
  const field =
    "w-full rounded-xl border border-white/15 bg-[#1a1311] px-4 py-3 text-sm text-[#efdfcd] outline-none focus:border-[#35b69b]";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#dac6b5]">
          {title}
          {required ? " *" : ""}
        </span>
        <a
          href="/admin/media"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[#48bba0] hover:underline"
        >
          Завантажити нові файли <ExternalLink size={13} />
        </a>
      </div>
      <input type="hidden" name="mediaAssetId" value={value} />
      {selected ? (
        <div className="flex items-center gap-4 rounded-xl border border-white/15 bg-[#1b1412] p-3">
          {selected.resourceType === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cloudinaryThumb(selected.url)}
              alt=""
              className="h-20 w-24 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-lg bg-[#402c25]">
              <Film className="text-[#d8a884]" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-[#efdfcd]">{selected.title}</p>
            <p className="mt-1 text-xs text-[#a99386]">{categoryLabel(selected.category)}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <button
                type="button"
                className="text-xs text-[#48bba0] underline-offset-4 hover:underline"
                onClick={() => setOpen(true)}
              >
                Замінити
              </button>
              {!required && (
                <button
                  type="button"
                  className="text-xs text-[#b79b8b] hover:text-white"
                  onClick={() => onChange("")}
                >
                  Прибрати
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`flex w-full items-center justify-center gap-3 border-dashed ${secondaryButton}`}
          onClick={() => setOpen(true)}
        >
          <Images size={19} className="text-[#35b69b]" /> Обрати файл із галереї
        </button>
      )}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-[3px] sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Вибір файлу з медіатеки"
            className="flex max-h-[92dvh] w-full max-w-[1050px] flex-col overflow-hidden rounded-[24px] border border-[#63493b] bg-[#241a17] shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
              <div>
                <p className="text-[10px] tracking-[.18em] text-[#35b69b] uppercase">
                  Cloudinary · Медіатека
                </p>
                <h3 className="mt-2 font-serif text-2xl text-[#efdfcd]">
                  Обрати {imagesOnly ? "фотографію" : "медіафайл"}
                </h3>
                <p className="mt-1 text-xs text-[#a99386]">Клацни на мініатюру, щоб вибрати її.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрити"
                className="rounded-lg p-2 text-[#d6c2b5] hover:bg-white/10"
              >
                <X size={21} />
              </button>
            </header>
            <div className="grid gap-3 border-b border-white/10 p-4 sm:grid-cols-[minmax(0,1fr)_190px_150px] sm:p-5">
              <label className="relative block">
                <Search
                  aria-hidden="true"
                  size={17}
                  className="absolute top-3.5 left-3.5 text-[#a58e82]"
                />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setLimit(40);
                  }}
                  className={`${field} pl-10`}
                  placeholder="Пошук за назвою..."
                  aria-label="Пошук файлів"
                />
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setLimit(40);
                }}
                className={field}
                aria-label="Категорія"
              >
                <option value="ALL">Усі категорії</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(c)}
                  </option>
                ))}
              </select>
              {!imagesOnly && (
                <select
                  value={kind}
                  onChange={(e) => {
                    setKind(e.target.value as typeof kind);
                    setLimit(40);
                  }}
                  className={field}
                  aria-label="Тип файлів"
                >
                  <option value="all">Усі типи</option>
                  <option value="image">Фото</option>
                  <option value="video">Відео</option>
                </select>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <p className="mb-4 text-xs text-[#ad9587]">
                Знайдено: {matches.length} · Показано: {Math.min(limit, matches.length)}
              </p>
              {matches.length === 0 ? (
                <p className="py-16 text-center text-sm text-[#a99386]">
                  Нічого не знайдено. Спробуй інший запит.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {matches.slice(0, limit).map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => {
                        onChange(file.id);
                        setOpen(false);
                      }}
                      className={`group relative overflow-hidden rounded-xl border bg-[#342520] text-left transition hover:border-[#35b69b] ${file.id === value ? "border-[#35b69b] ring-1 ring-[#35b69b]" : "border-white/10"}`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-black/25">
                        {file.resourceType === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            loading="lazy"
                            src={cloudinaryThumb(file.url)}
                            alt=""
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Film size={32} className="text-[#d5ab85]" />
                          </div>
                        )}
                        {file.id === value && (
                          <span className="absolute top-2 right-2 rounded-full bg-[#268a76] p-1.5 text-white">
                            <Check size={14} />
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 p-2.5">
                        <p className="truncate text-xs text-[#e9d7c5]" title={file.title}>
                          {file.title}
                        </p>
                        <p className="truncate text-[10px] text-[#aa8f80]">
                          {categoryLabel(file.category)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {limit < matches.length && (
                <button
                  type="button"
                  className={`mx-auto mt-6 block ${secondaryButton}`}
                  onClick={() => setLimit((n) => n + 40)}
                >
                  Показати ще
                </button>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
              <p className="text-xs text-[#ab9184]">
                {selected ? `Вибрано: ${selected.title}` : "Файл не вибрано"}
              </p>
              <button type="button" className={secondaryButton} onClick={() => setOpen(false)}>
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
