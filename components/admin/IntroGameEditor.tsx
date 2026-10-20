"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import {
  Check,
  ExternalLink,
  Gamepad2,
  ImagePlus,
  Play,
  Save,
  Search,
  Settings2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

import {
  INTRO_HEAD_COUNT,
  INTRO_HEAD_FALLBACK,
  INTRO_HEAD_RADII,
  type IntroPublicConfig,
} from "@/lib/intro/types";

import { type IntroActionState, saveIntroSettings } from "@/app/admin/intro/actions";

type Asset = { id: string; title: string; url: string; category: string };

const initialState: IntroActionState = { ok: false, message: "" };
const field =
  "w-full rounded-xl border border-[#61473d] bg-[#1b1412] px-4 py-3 text-sm text-[#f1e1d0] outline-none placeholder:text-[#846e63] focus:border-[#37ae95] focus:ring-2 focus:ring-[#37ae95]/15";

function HeadPreview({
  src,
  level,
  small = false,
}: {
  src: string;
  level: number;
  small?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (failed) {
    return (
      <span
        role="img"
        aria-label={`Немає фото для рівня ${level + 1}`}
        className={`flex shrink-0 items-center justify-center rounded-full border border-[#7d5649] bg-[#493027] font-serif text-[#e8b99d] ${small ? "size-[38px] text-sm" : "size-[88px] text-3xl"}`}
      >
        {level + 1}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={small ? "" : `Голова ${level + 1}`}
      onError={() => setFailed(true)}
      className={
        small
          ? "size-[38px] shrink-0 object-contain"
          : "max-h-[118px] max-w-[95%] object-contain drop-shadow-xl"
      }
    />
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2b9e86] px-6 py-3 text-sm font-semibold text-[#10221a] transition hover:bg-[#46c1a3] disabled:cursor-wait disabled:opacity-60"
    >
      <Save size={17} aria-hidden="true" /> {pending ? "Зберігаємо..." : "Зберегти зміни"}
    </button>
  );
}

export function IntroGameEditor({
  initial,
  images,
}: {
  initial: IntroPublicConfig;
  images: Asset[];
}) {
  const [result, submit] = useActionState(saveIntroSettings, initialState);
  const [draft, setDraft] = useState(initial);
  const [pickerLevel, setPickerLevel] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("HEADS");

  useEffect(() => {
    if (pickerLevel === null) return;
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setPickerLevel(null);
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [pickerLevel]);

  const filteredImages = useMemo(() => {
    const text = search.trim().toLocaleLowerCase("uk");
    return images.filter(
      (asset) =>
        (category === "all" || asset.category === category) &&
        (!text || asset.title.toLocaleLowerCase("uk").includes(text)),
    );
  }, [images, category, search]);

  const imageCategories = useMemo(
    () => [...new Set(images.map((asset) => asset.category))],
    [images],
  );
  function update<K extends keyof IntroPublicConfig>(key: K, value: IntroPublicConfig[K]) {
    setDraft((old) => ({ ...old, [key]: value }));
  }

  function changeHead(level: number, asset: Asset | null) {
    setDraft((old) => ({
      ...old,
      heads: old.heads.map((head) =>
        head.level === level
          ? {
              ...head,
              mediaAssetId: asset?.id ?? "",
              url: asset?.url ?? INTRO_HEAD_FALLBACK[level],
            }
          : head,
      ),
    }));
    setPickerLevel(null);
    setSearch("");
  }

  return (
    <>
      <form action={submit} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.85fr)]">
          <div className="space-y-6">
            <section className="rounded-[24px] border border-white/10 bg-[#2a1e1a] p-5 sm:p-7">
              <div className="mb-6 flex items-start gap-3">
                <Gamepad2 className="mt-1 shrink-0 text-[#35aa91]" size={23} />
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-[#35aa91] uppercase">
                    01 / Образи
                  </p>
                  <h2 className="mt-2 font-serif text-2xl text-[#f0dfcf]">Одинадцять рівнів гри</h2>
                  <p className="mt-2 text-xs leading-6 text-[#b19b8c]">
                    У грі 11 різних голів. Дві однакові стають однією більшою — до рівня 11. Обирай
                    PNG/WebP із прозорим фоном з медіатеки.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {draft.heads.map((head) => (
                  <div
                    key={head.level}
                    className="rounded-[18px] border border-[#584034] bg-[#1d1513] p-3"
                  >
                    <input
                      type="hidden"
                      name={`head-${head.level}`}
                      value={head.mediaAssetId}
                      readOnly
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold tracking-[0.16em] text-[#37b097] uppercase">
                        Рівень {head.level + 1} / {INTRO_HEAD_COUNT}
                      </span>
                      <span className="text-[11px] text-[#998175]">
                        Ø {INTRO_HEAD_RADII[head.level] * 2}px
                      </span>
                    </div>
                    <div className="mt-3 flex h-[135px] items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle,#4e3228,#241713)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <HeadPreview src={head.url} level={head.level} />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPickerLevel(head.level);
                        setCategory("HEADS");
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#795447] px-3 py-2.5 text-xs text-[#f0dfcf] transition hover:border-[#35aa91]"
                    >
                      <ImagePlus size={15} /> {head.mediaAssetId ? "Замінити фото" : "Обрати фото"}
                    </button>
                    {head.mediaAssetId && (
                      <button
                        type="button"
                        onClick={() => changeHead(head.level, null)}
                        className="mt-2 block w-full text-center text-[11px] text-[#ac9487] underline underline-offset-4 hover:text-[#f0dfcf]"
                      >
                        Повернути стандартне
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Link
                href="/admin/media"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-xs text-[#3eb599] hover:underline"
              >
                <ExternalLink size={14} /> Завантажити нові голови у медіатеку
              </Link>
              <p className="mt-3 text-xs text-[#aa9285]">
                Перші 6 раніше збережених голів залишаться на місці. Для рівнів 7–11 обери нові
                фото. Якщо локального файла немає, побачиш позначку з номером рівня.
              </p>
            </section>

            <section className="rounded-[24px] border border-white/10 bg-[#2a1e1a] p-5 sm:p-7">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#35aa91] uppercase">
                02 / Написи
              </p>
              <h2 className="mt-2 font-serif text-2xl text-[#f0dfcf]">Текст вступної сторінки</h2>
              <div className="mt-6 space-y-4">
                <label className="block text-xs text-[#dbc5b5]">
                  Верхній напис
                  <input
                    name="eyebrow"
                    required
                    maxLength={120}
                    value={draft.eyebrow}
                    onChange={(e) => update("eyebrow", e.target.value)}
                    className={`${field} mt-2`}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs text-[#dbc5b5]">
                    Заголовок
                    <input
                      name="heading"
                      required
                      maxLength={65}
                      value={draft.heading}
                      onChange={(e) => update("heading", e.target.value)}
                      className={`${field} mt-2`}
                    />
                  </label>
                  <label className="block text-xs text-[#dbc5b5]">
                    Виділене слово
                    <input
                      name="accent"
                      required
                      maxLength={65}
                      value={draft.accent}
                      onChange={(e) => update("accent", e.target.value)}
                      className={`${field} mt-2`}
                    />
                  </label>
                </div>
                <label className="block text-xs text-[#dbc5b5]">
                  Опис гри
                  <textarea
                    name="description"
                    required
                    rows={4}
                    maxLength={700}
                    value={draft.description}
                    onChange={(e) => update("description", e.target.value)}
                    className={`${field} mt-2 resize-y`}
                  />
                </label>
                <label className="block text-xs text-[#dbc5b5]">
                  Нижня фраза
                  <input
                    name="tagline"
                    required
                    maxLength={200}
                    value={draft.tagline}
                    onChange={(e) => update("tagline", e.target.value)}
                    className={`${field} mt-2`}
                  />
                </label>
                <label className="block text-xs text-[#dbc5b5]">
                  Текст посилання пропуску
                  <input
                    name="skipLabel"
                    required
                    maxLength={60}
                    value={draft.skipLabel}
                    onChange={(e) => update("skipLabel", e.target.value)}
                    className={`${field} mt-2`}
                  />
                </label>
              </div>
            </section>
          </div>

          <aside className="space-y-6 self-start xl:sticky xl:top-6">
            <section className="rounded-[24px] border border-[#60463a] bg-[#281d19] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Settings2 size={19} className="text-[#35aa91]" />
                <h2 className="font-serif text-2xl text-[#f0dfcf]">Налаштування</h2>
              </div>
              <div className="mt-5 space-y-5">
                <label className="flex items-start gap-3 rounded-xl border border-white/10 p-3">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={draft.enabled}
                    onChange={(e) => update("enabled", e.target.checked)}
                    className="mt-1 size-4 accent-[#2ba48b]"
                  />
                  <span className="text-sm text-[#f0dfcf]">
                    Увімкнути вступну гру
                    <span className="mt-1 block text-xs leading-5 text-[#b19b8c]">
                      Коли вимкнено, `/intro` перенаправляє на основний сайт.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 rounded-xl border border-white/10 p-3">
                  <input
                    type="checkbox"
                    name="autoModeDefault"
                    checked={draft.autoModeDefault}
                    onChange={(e) => update("autoModeDefault", e.target.checked)}
                    className="mt-1 size-4 accent-[#2ba48b]"
                  />
                  <span className="text-sm text-[#f0dfcf]">
                    Автопадіння одразу
                    <span className="mt-1 block text-xs leading-5 text-[#b19b8c]">
                      Гра запускає автоматичне падіння голів при відкритті.
                    </span>
                  </span>
                </label>
                <label className="block text-xs text-[#dbc5b5]">
                  Інтервал автопадіння (мс)
                  <input
                    type="number"
                    name="autoIntervalMs"
                    min={650}
                    max={3000}
                    step={50}
                    value={draft.autoIntervalMs}
                    onChange={(e) => update("autoIntervalMs", Number(e.target.value))}
                    className={`${field} mt-2`}
                  />
                </label>
                <label className="block text-xs text-[#dbc5b5]">
                  Куди веде «Увійти на сайт»
                  <input
                    name="siteHref"
                    required
                    maxLength={100}
                    value={draft.siteHref}
                    onChange={(e) => update("siteHref", e.target.value)}
                    placeholder="/home"
                    className={`${field} mt-2`}
                  />
                  <span className="mt-2 block text-xs text-[#a99385]">
                    Лише внутрішній шлях, наприклад /home або /.
                  </span>
                </label>
              </div>
            </section>

            <section className="rounded-[24px] border border-white/10 bg-[#281d19] p-5 sm:p-6">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#35aa91] uppercase">
                Попередній перегляд
              </p>
              <div className="mt-5 rounded-[16px] bg-[radial-gradient(circle_at_50%_25%,#493026,#1b1311_85%)] p-5 text-center">
                <p className="text-[10px] tracking-[0.18em] text-[#d9b6a5] uppercase">
                  {draft.eyebrow || "—"}
                </p>
                <p className="mt-4 font-serif text-3xl text-[#f0dfcf]">
                  {draft.heading} <em className="text-[#34aa91]">{draft.accent}</em>
                </p>
                <div className="mx-auto mt-5 flex max-w-[380px] flex-wrap items-center justify-center gap-1">
                  {draft.heads.map((head) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <HeadPreview key={head.level} src={head.url} level={head.level} small />
                  ))}
                </div>
                <p className="mt-5 text-xs leading-6 text-[#dac1b2]">{draft.description}</p>
                <p className="mt-3 font-serif text-sm text-[#e1bea6] italic">{draft.tagline}</p>
                <span className="mt-4 inline-block text-xs text-[#43bda1]">
                  {draft.skipLabel} ↗
                </span>
              </div>
              <p className="mt-3 text-[11px] text-[#a58d80]">
                Це мініатюра оформлення. Фізика падіння перевіряється на справжній сторінці гри.
              </p>
              <Link
                href="/intro"
                target="_blank"
                className="mt-4 inline-flex items-center gap-2 text-xs text-[#40b99d] hover:underline"
              >
                <Play size={15} /> Відкрити гру <ExternalLink size={13} />
              </Link>
            </section>
          </aside>
        </div>

        <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[#735246] bg-[#281c18]/95 px-5 py-4 shadow-2xl backdrop-blur-md">
          <div
            role="status"
            aria-live="polite"
            className={`text-sm ${result.ok ? "text-[#8cdec1]" : "text-[#ecb1a3]"}`}
          >
            {result.message || "Зміни буде видно після збереження."}
          </div>
          <SaveButton />
        </div>
      </form>

      {pickerLevel !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPickerLevel(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`Обрати голову рівня ${pickerLevel + 1}`}
            className="flex max-h-[90dvh] w-full max-w-[850px] flex-col overflow-hidden rounded-[24px] border border-[#61483e] bg-[#251b17] shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="font-serif text-2xl text-[#f0dfcf]">Обрати голову</h2>
                <p className="mt-1 text-xs text-[#aa9286]">
                  Рівень {pickerLevel + 1} · Медіатека Cloudinary
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerLevel(null)}
                aria-label="Закрити"
                className="p-2 text-[#e5d3c7]"
              >
                <X size={22} />
              </button>
            </header>
            <div className="grid gap-3 border-b border-white/10 p-5 sm:grid-cols-[1fr_175px]">
              <label className="relative block">
                <span className="sr-only">Пошук</span>
                <Search size={17} className="absolute top-3.5 left-3 text-[#a99487]" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Пошук за назвою..."
                  className={`${field} pl-10`}
                />
              </label>
              <label>
                <span className="sr-only">Категорія</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={field}
                >
                  <option value="all">Усі фото</option>
                  {imageCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "HEADS" ? "Голови для гри" : cat}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {filteredImages.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {filteredImages.map((asset) => {
                    const selected = draft.heads[pickerLevel]?.mediaAssetId === asset.id;
                    const usedElsewhere = draft.heads.some(
                      (h) => h.level !== pickerLevel && h.mediaAssetId === asset.id,
                    );
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        disabled={usedElsewhere}
                        onClick={() => changeHead(pickerLevel, asset)}
                        className="group overflow-hidden rounded-xl border border-white/10 bg-[#1c1411] text-left hover:border-[#36aa91] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.url}
                          alt={asset.title}
                          loading="lazy"
                          className="aspect-square w-full object-contain p-2"
                        />
                        <div className="flex items-center gap-2 p-2.5">
                          <span className="min-w-0 flex-1 truncate text-xs text-[#ead7c7]">
                            {asset.title}
                          </span>
                          {selected && <Check size={15} className="shrink-0 text-[#40c5a3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-[#b79e91]">
                  Немає зображень у цій категорії. Обери «Усі фото» або завантаж нові у медіатеку.
                </p>
              )}
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-5">
              <button
                type="button"
                onClick={() => changeHead(pickerLevel, null)}
                className="rounded-xl border border-[#705145] px-4 py-2.5 text-xs text-[#e8d3c2] hover:border-[#37af96]"
              >
                Стандартне фото
              </button>
              <button
                type="button"
                onClick={() => {
                  setPickerLevel(null);
                  setSearch("");
                }}
                className="rounded-xl bg-[#315a4e] px-4 py-2.5 text-xs text-[#ead7c6]"
              >
                Закрити
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
