"use client";

import { useActionState, useMemo, useState } from "react";

import { Check, ExternalLink, Images, RefreshCw, Save, Search, X } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

import { categoryLabel } from "@/lib/media/categories";

import { type BioActionState, saveBioProfile } from "@/app/admin/bio/actions";

type Frame = {
  slot: number;
  title: string;
  subtitle: string;
  position: string;
  mediaAssetId: string;
  url: string;
};
type Bio = {
  heading: string;
  accent: string;
  lead: string;
  description: string;
  fullBio: string;
  frames: Frame[];
  updatedAt: string | null;
};
type Asset = { id: string; title: string; url: string; category: string };
type FrameDraft = Frame;

const INITIAL: BioActionState = { ok: false, message: "" };
const POSITIONS = [
  { value: "center", label: "По центру" },
  { value: "center top", label: "Верх" },
  { value: "center 18%", label: "18% зверху" },
  { value: "center 25%", label: "25% зверху" },
  { value: "center 35%", label: "35% зверху" },
  { value: "center 50%", label: "50% зверху" },
  { value: "center bottom", label: "Низ" },
] as const;

const textField =
  "w-full rounded-xl border border-[#644a40] bg-[#1b1412] px-4 py-3 text-sm leading-6 text-[#f1e2d3] outline-none placeholder:text-[#897166] focus:border-[#39ab94] focus:ring-2 focus:ring-[#39ab94]/15";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2b9b84] px-6 py-3 text-sm font-semibold text-[#101915] transition hover:bg-[#43baa0] disabled:cursor-wait disabled:opacity-60"
    >
      <Save size={17} aria-hidden="true" />
      {pending ? "Зберігаємо..." : "Зберегти зміни"}
    </button>
  );
}

export function BioEditor({ profile, images }: { profile: Bio; images: Asset[] }) {
  const [state, submitAction] = useActionState(saveBioProfile, INITIAL);
  const [heading, setHeading] = useState(profile.heading);
  const [accent, setAccent] = useState(profile.accent);
  const [lead, setLead] = useState(profile.lead);
  const [description, setDescription] = useState(profile.description);
  const [fullBio, setFullBio] = useState(profile.fullBio);
  const [frames, setFrames] = useState<FrameDraft[]>(profile.frames);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => ["all", ...new Set(images.map((x) => x.category))], [images]);
  const matchingImages = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("uk");
    return images.filter(
      (image) =>
        (category === "all" || image.category === category) &&
        (!q || image.title.toLocaleLowerCase("uk").includes(q)),
    );
  }, [images, search, category]);

  const imageById = useMemo(() => new Map(images.map((item) => [item.id, item])), [images]);

  function changeFrame(slot: number, changes: Partial<FrameDraft>) {
    setFrames((previous) =>
      previous.map((frame) => (frame.slot === slot ? { ...frame, ...changes } : frame)),
    );
  }

  function chooseImage(image: Asset | null) {
    if (selectedSlot === null) return;
    const previous = profile.frames.find((f) => f.slot === selectedSlot);
    changeFrame(selectedSlot, {
      mediaAssetId: image?.id ?? "",
      url:
        image?.url ??
        (selectedSlot === 0
          ? "/images/stage.jpg"
          : selectedSlot === 1
            ? "/images/costume.jpg"
            : "/images/comic.jpg"),
    });
    if (!image && previous?.mediaAssetId === "") {
      changeFrame(selectedSlot, { mediaAssetId: "", url: previous.url });
    }
    setSelectedSlot(null);
    setSearch("");
    setCategory("all");
  }

  return (
    <>
      <form action={submitAction} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.85fr)]">
          <div className="space-y-6">
            <section className="rounded-[22px] border border-white/10 bg-[#291e1a] p-5 sm:p-7">
              <div className="mb-6">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#30ae92] uppercase">
                  01 / Головна сторінка
                </p>
                <h2 className="mt-2 font-serif text-2xl text-[#f0dfcf]">Коротка біографія</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2 text-xs text-[#d8c3b4]">
                  <span>Заголовок</span>
                  <input
                    className={textField}
                    name="heading"
                    value={heading}
                    maxLength={80}
                    required
                    onChange={(event) => setHeading(event.target.value)}
                  />
                </label>
                <label className="block space-y-2 text-xs text-[#d8c3b4]">
                  <span>Бірюзове слово</span>
                  <input
                    className={textField}
                    name="accent"
                    value={accent}
                    maxLength={80}
                    required
                    onChange={(event) => setAccent(event.target.value)}
                  />
                </label>
              </div>
              <label className="mt-5 block space-y-2 text-xs text-[#d8c3b4]">
                <span>Головний текст (до 500 символів)</span>
                <textarea
                  className={textField}
                  name="lead"
                  value={lead}
                  rows={4}
                  maxLength={500}
                  required
                  onChange={(event) => setLead(event.target.value)}
                />
                <span className="block text-right text-[11px] text-[#a89184]">
                  {lead.length}/500
                </span>
              </label>
              <label className="mt-4 block space-y-2 text-xs text-[#d8c3b4]">
                <span>Додатковий текст (до 2000 символів)</span>
                <textarea
                  className={textField}
                  name="description"
                  value={description}
                  rows={5}
                  maxLength={2000}
                  required
                  onChange={(event) => setDescription(event.target.value)}
                />
                <span className="block text-right text-[11px] text-[#a89184]">
                  {description.length}/2000
                </span>
              </label>
            </section>
            <section className="rounded-[22px] border border-white/10 bg-[#291e1a] p-5 sm:p-7">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#30ae92] uppercase">
                02 / Повна історія
              </p>
              <h2 className="mt-2 font-serif text-2xl text-[#f0dfcf]">Розгорнута біографія</h2>
              <p className="mt-2 text-xs leading-6 text-[#af978a]">
                Текст для окремої сторінки, яка відкривається за посиланням «Біографія».
              </p>
              <label className="mt-5 block space-y-2 text-xs text-[#d8c3b4]">
                <span>Текст біографії (абзаци відокремлюй порожнім рядком)</span>
                <textarea
                  className={textField}
                  name="fullBio"
                  value={fullBio}
                  rows={12}
                  minLength={1}
                  maxLength={20000}
                  required
                  onChange={(event) => setFullBio(event.target.value)}
                />
                <span className="block text-right text-[11px] text-[#a89184]">
                  {fullBio.length}/20000
                </span>
              </label>
            </section>
          </div>
          <aside className="space-y-5 self-start xl:sticky xl:top-6">
            <section className="rounded-[22px] border border-[#61483e] bg-[#241a17] p-5 sm:p-6">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#36aa93] uppercase">
                Попередній перегляд
              </p>
              <h2 className="mt-5 font-serif text-[clamp(2.25rem,3vw,3.5rem)] leading-[1.04] tracking-[-0.04em] text-[#f0dfcf]">
                {heading || "Трохи про"}
                <span className="block text-[#2e9e88] italic">{accent || "мене"}</span>
              </h2>
              <div className="mt-5 flex gap-3">
                <span className="h-px w-12 bg-[#2c9f87]" />
                <span className="h-px w-12 bg-[#6d4a3c]" />
              </div>
              <p className="mt-5 font-serif text-xl leading-relaxed whitespace-pre-wrap text-[#efdfcf]">
                {lead || "Тут буде головний текст..."}
              </p>
              <p className="mt-4 text-sm leading-7 whitespace-pre-wrap text-[#b19a8e]">
                {description || "Тут буде додатковий текст..."}
              </p>
              <div className="mt-5 flex items-center gap-2 text-[10px] tracking-[0.18em] text-[#ad9387] uppercase">
                <span className="h-px w-8 bg-[#2c9f87]" />
                Далі буде...
              </div>
            </section>
            <section className="rounded-[22px] border border-white/10 bg-[#241a17] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="font-serif text-xl text-[#f0dfcf]">Кіноплівка</p>
                <Images className="text-[#30a68c]" size={21} />
              </div>
              <p className="mt-2 text-xs leading-6 text-[#ae9588]">
                Три кадри в обраному порядку. Відкрий медіатеку, щоб додати нові фото.
              </p>
              <div className="mt-5 space-y-3">
                {frames.map((frame) => {
                  const preview = imageById.get(frame.mediaAssetId)?.url ?? frame.url;
                  return (
                    <div
                      className="rounded-[16px] border border-white/10 bg-[#1b1412] p-3"
                      key={frame.slot}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative h-[95px] w-[105px] shrink-0 overflow-hidden rounded-xl bg-[#3b2a22]">
                          {/* External URLs are saved by a verified Cloudinary upload backend. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={`Кадр ${frame.slot + 1}`}
                            src={preview}
                            className="h-full w-full object-cover"
                            style={{ objectPosition: frame.position }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] tracking-[0.15em] text-[#33ae92] uppercase">
                            Кадр 0{frame.slot + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelectedSlot(frame.slot)}
                            className="mt-2 rounded-lg border border-[#785449] px-3 py-2 text-xs text-[#f0dfcf] transition hover:border-[#38af98]"
                          >
                            Обрати фото
                          </button>
                          <input
                            type="hidden"
                            name={`frame-${frame.slot}-mediaAssetId`}
                            value={frame.mediaAssetId}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <label className="block text-[11px] text-[#baa395]">
                          Назва
                          <input
                            className={`${textField} mt-1`}
                            name={`frame-${frame.slot}-title`}
                            maxLength={40}
                            required
                            value={frame.title}
                            onChange={(e) => changeFrame(frame.slot, { title: e.target.value })}
                          />
                        </label>
                        <label className="block text-[11px] text-[#baa395]">
                          Підпис
                          <input
                            className={`${textField} mt-1`}
                            name={`frame-${frame.slot}-subtitle`}
                            maxLength={100}
                            value={frame.subtitle}
                            onChange={(e) => changeFrame(frame.slot, { subtitle: e.target.value })}
                          />
                        </label>
                        <label className="block text-[11px] text-[#baa395]">
                          Кадрування
                          <select
                            className={`${textField} mt-1`}
                            name={`frame-${frame.slot}-position`}
                            value={frame.position}
                            onChange={(e) => changeFrame(frame.slot, { position: e.target.value })}
                          >
                            {POSITIONS.map((position) => (
                              <option key={position.value} value={position.value}>
                                {position.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#32b699]">
                <Link
                  className="inline-flex items-center gap-1 hover:underline"
                  href="/admin/media"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Додати фото у медіатеку <ExternalLink size={13} />
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:underline"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw size={13} /> Оновити список
                </button>
              </div>
            </section>
          </aside>
        </div>
        <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[#6f5146] bg-[#281c18]/95 px-5 py-4 shadow-2xl backdrop-blur-md">
          <div
            aria-live="polite"
            role="status"
            className={`text-sm ${state.ok ? "text-[#87d9bb]" : "text-[#f1ada1]"}`}
          >
            {state.message || "Зміни з’являться на сайті після збереження."}
          </div>
          <SubmitButton />
        </div>
      </form>

      {selectedSlot !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedSlot(null);
          }}
        >
          <section
            aria-modal="true"
            role="dialog"
            aria-label={`Обрати фото для кадру ${selectedSlot + 1}`}
            className="flex max-h-[90dvh] w-full max-w-[850px] flex-col overflow-hidden rounded-[24px] border border-[#674a40] bg-[#251a16] shadow-2xl"
          >
            <header className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <h2 className="font-serif text-2xl text-[#f0dfcf]">Обрати фото</h2>
                <p className="mt-1 text-xs text-[#a99589]">Кадр 0{selectedSlot + 1} · Cloudinary</p>
              </div>
              <button
                aria-label="Закрити"
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="rounded-xl p-2 text-[#e8d5c6] hover:bg-white/10"
              >
                <X size={21} />
              </button>
            </header>
            <div className="grid gap-3 border-b border-white/10 p-5 sm:grid-cols-[1fr_180px]">
              <label className="relative block">
                <span className="sr-only">Пошук фото</span>
                <Search className="absolute top-3.5 left-3 text-[#a99083]" size={17} />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Пошук за назвою..."
                  className={`${textField} pl-10`}
                />
              </label>
              <label>
                <span className="sr-only">Категорія фото</span>
                <select
                  className={textField}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">Усі категорії</option>
                  {categories
                    .filter((c) => c !== "all")
                    .map((c) => (
                      <option key={c} value={c}>
                        {categoryLabel(c)}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {matchingImages.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {matchingImages.map((image) => (
                    <button
                      type="button"
                      onClick={() => chooseImage(image)}
                      key={image.id}
                      className="group overflow-hidden rounded-xl border border-white/10 bg-[#1a1311] text-left hover:border-[#3aaf95] focus-visible:outline focus-visible:outline-[#3aaf95]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={image.title}
                        loading="lazy"
                        className="aspect-square w-full object-cover transition-transform group-hover:scale-[1.04]"
                      />
                      <div className="flex items-center justify-between gap-1 p-2.5">
                        <span className="truncate text-xs text-[#f0dfcf]">{image.title}</span>
                        {frames[selectedSlot]?.mediaAssetId === image.id && (
                          <Check size={15} className="shrink-0 text-[#42c8a6]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-[#b8a095]">
                  Немає фото. Завантаж їх у медіатеку.
                </p>
              )}
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-5">
              <button
                type="button"
                onClick={() => chooseImage(null)}
                className="rounded-xl border border-[#684b40] px-4 py-2.5 text-xs text-[#ead8c8] hover:border-[#39aa91]"
              >
                Використовувати стандартне фото
              </button>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="rounded-xl bg-[#315447] px-4 py-2.5 text-xs text-[#ead8c8]"
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
