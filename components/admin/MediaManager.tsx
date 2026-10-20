"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Check,
  CloudUpload,
  Copy,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Pencil,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  MEDIA_CATEGORIES,
  MEDIA_MAX_BYTES,
  type MediaCategory,
  type MediaKind,
  categoryLabel,
} from "@/lib/media/categories";

type Asset = {
  id: string;
  assetId: string;
  publicId: string;
  title: string;
  url: string;
  resourceType: string;
  category: string;
  format: string | null;
  bytes: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
};

type SignResult = {
  ticketId: string;
  uploadUrl: string;
  apiKey: string;
  signature: string;
  params: Record<string, string | number>;
  maxBytes: number;
};

function fileKind(file: File): MediaKind | null {
  if (/^image\//.test(file.type)) return "image";
  if (/^video\//.test(file.type)) return "video";
  return null;
}

async function jsonResponse<T>(response: Response): Promise<T> {
  const value: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const object = value && typeof value === "object" ? (value as { error?: unknown }) : {};
    throw new Error(typeof object.error === "string" ? object.error : "Помилка сервера");
  }
  return value as T;
}

function uploadToCloudinary(
  file: File,
  signed: SignResult,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);
    for (const [key, value] of Object.entries(signed.params)) {
      form.append(key, String(value));
    }
    form.append("api_key", signed.apiKey);
    form.append("signature", signed.signature);

    xhr.open("POST", signed.uploadUrl);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onerror = () => reject(new Error("Зв’язок із Cloudinary перервано"));
    xhr.ontimeout = () => reject(new Error("Час завантаження вичерпано"));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        let message = "Cloudinary не прийняв файл";
        try {
          const body: { error?: { message?: string } } = JSON.parse(xhr.responseText);
          if (body.error?.message) message = body.error.message;
        } catch {
          /* Keep a generic error */
        }
        reject(new Error(message));
      }
    };
    xhr.timeout = 10 * 60 * 1000;
    xhr.send(form);
  });
}

function sizeLabel(bytes: number): string {
  return bytes > 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
    : `${Math.max(1, Math.round(bytes / 1024))} КБ`;
}

export function MediaManager({
  initialItems,
  totalShown,
}: {
  initialItems: Asset[];
  totalShown: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(initialItems);
  const [category, setCategory] = useState<MediaCategory>("GALLERY");
  const [filter, setFilter] = useState<"all" | MediaKind>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);
  const selected = items.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    setDraftTitle(selected?.title ?? "");
  }, [selected?.id, selected?.title]);

  const filtered = useMemo(() => {
    const lower = query.toLocaleLowerCase("uk").trim();
    return items.filter(
      (item) =>
        (filter === "all" || item.resourceType === filter) &&
        (categoryFilter === "all" || item.category === categoryFilter) &&
        (!lower ||
          `${item.title} ${item.publicId} ${categoryLabel(item.category)}`
            .toLocaleLowerCase("uk")
            .includes(lower)),
    );
  }, [items, query, filter, categoryFilter]);

  async function addFiles(files: FileList | File[]) {
    if (uploading) return;
    const chosen = Array.from(files).slice(0, 8);
    if (!chosen.length) return;
    setUploading(true);
    setProgress(0);
    setError("");
    setNotice("");
    let uploaded = 0;
    let lastId: string | null = null;
    try {
      for (const [index, file] of chosen.entries()) {
        const kind = fileKind(file);
        if (
          !kind ||
          ![
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/avif",
            "video/mp4",
            "video/quicktime",
            "video/webm",
          ].includes(file.type)
        ) {
          throw new Error(`Тип файлу «${file.name}» не підтримується`);
        }
        if (file.size > MEDIA_MAX_BYTES[kind]) {
          throw new Error(`«${file.name}» завеликий. Ліміт: ${sizeLabel(MEDIA_MAX_BYTES[kind])}`);
        }
        setUploadLabel(`${index + 1}/${chosen.length} · ${file.name}`);
        setProgress(0);

        const signed = await jsonResponse<SignResult>(
          await fetch("/api/admin/media/sign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category, kind }),
          }),
        );
        await uploadToCloudinary(file, signed, setProgress);
        const completed = await jsonResponse<{ id: string }>(
          await fetch("/api/admin/media/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ticketId: signed.ticketId, title: file.name.slice(0, 120) }),
          }),
        );
        lastId = completed.id;
        uploaded += 1;
      }
      setNotice(`Завантажено файлів: ${uploaded}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Помилка завантаження");
    } finally {
      setUploading(false);
      setProgress(0);
      setUploadLabel("");
      if (lastId) setSelectedId(lastId);
      if (uploaded) router.refresh();
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Посилання скопійовано");
      setError("");
    } catch {
      setError("Не вдалося скопіювати посилання");
    }
  }

  async function saveTitle() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await jsonResponse(
        await fetch(`/api/admin/media/${encodeURIComponent(selected.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: draftTitle }),
        }),
      );
      setItems((prev) =>
        prev.map((item) =>
          item.id === selected.id ? { ...item, title: draftTitle.trim() } : item,
        ),
      );
      setNotice("Назву збережено");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Помилка збереження");
    } finally {
      setBusy(false);
    }
  }

  async function removeAsset() {
    if (!selected) return;
    if (
      !window.confirm(
        `Видалити «${selected.title}» назавжди з Cloudinary і бази?\n\nЯкщо файл використано на сайті, посилання перестане працювати.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await jsonResponse(
        await fetch(`/api/admin/media/${encodeURIComponent(selected.id)}`, { method: "DELETE" }),
      );
      setItems((prev) => prev.filter((item) => item.id !== selected.id));
      setSelectedId(null);
      setNotice("Файл видалено");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Помилка видалення");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[22px] border border-white/10 bg-[#281d19] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#31a88f] uppercase">
              Нове завантаження
            </p>
            <h2 className="mt-2 font-serif text-[25px] text-[#f1dfcb]">Додати матеріали</h2>
            <p className="mt-2 text-xs leading-6 text-[#ae9789]">
              Фото до 15 МБ · Відео до 80 МБ · До 8 файлів за раз
            </p>
          </div>
          <label className="flex flex-col gap-2 text-xs text-[#d4beae]">
            Категорія
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MediaCategory)}
              disabled={uploading}
              className="min-w-[200px] rounded-xl border border-white/10 bg-[#1d1513] px-3 py-3 text-sm text-[#f1dfcb] outline-none focus:border-[#31a88f]"
            >
              {MEDIA_CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/quicktime,video/webm"
          onChange={(e) => {
            if (e.currentTarget.files) void addFiles(e.currentTarget.files);
            e.currentTarget.value = "";
          }}
        />
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!uploading) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (!uploading) void addFiles(e.dataTransfer.files);
          }}
          className={`mt-5 flex flex-col items-center rounded-[18px] border border-dashed px-4 py-8 text-center transition-colors ${isDragging ? "border-[#31a88f] bg-[#31a88f]/10" : "border-[#655044] bg-[#211713]"}`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#31a88f]/25 bg-[#31a88f]/10 text-[#31a88f]">
            <CloudUpload size={24} />
          </div>
          <p className="mt-3 text-sm text-[#f1dfcb]">Перетягни файли сюди</p>
          <p className="mt-1 text-xs text-[#a58f82]">або обери на своєму пристрої</p>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2caa90] px-5 py-3 text-xs font-bold text-[#101c17] transition hover:bg-[#54c4ac] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UploadCloud size={16} /> {uploading ? "Завантаження..." : "Обрати файли"}
          </button>
          {uploading && (
            <div className="mt-5 w-full max-w-[360px]" role="status">
              <p className="mb-2 truncate text-xs text-[#d7c2b3]">
                {uploadLabel} — {progress}%
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#31a88f] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-[#31a88f]/30 bg-[#31a88f]/10 p-4 text-sm text-[#86dfca]"
        >
          <Check size={17} />
          {notice}
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 rounded-[22px] border border-white/10 bg-[#281d19] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-serif text-[25px] text-[#f1dfcb]">
              Усі матеріали{" "}
              <span className="font-sans text-xs text-[#a58f82] not-italic">
                ({filtered.length})
              </span>
            </h2>
            <div className="relative flex-1 sm:max-w-[260px]">
              <Search
                size={15}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-[#998577]"
              />
              <input
                type="search"
                aria-label="Пошук матеріалів"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Знайти файл..."
                className="w-full rounded-xl border border-white/10 bg-[#1b1412] py-2.5 pr-3 pl-9 text-xs text-[#f1dfcb] outline-none placeholder:text-[#897568] focus:border-[#31a88f]"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["all", "image", "video"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setFilter(kind)}
                className={`rounded-lg border px-3 py-2 text-xs transition-colors ${filter === kind ? "border-[#31a88f]/40 bg-[#31a88f]/15 text-[#8cdec9]" : "border-white/10 text-[#b39d8f] hover:border-white/25"}`}
              >
                {kind === "all" ? "Усі" : kind === "image" ? "Фото" : "Відео"}
              </button>
            ))}
            <select
              aria-label="Фільтр категорії"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#1b1412] px-3 py-2 text-xs text-[#ccb6a7] outline-none"
            >
              <option value="all">Всі категорії</option>
              {MEDIA_CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {filtered.length ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((asset) => (
                <button
                  type="button"
                  key={asset.id}
                  aria-pressed={selectedId === asset.id}
                  onClick={() => setSelectedId(asset.id)}
                  className={`group overflow-hidden rounded-xl border bg-[#1c1513] text-left transition-all hover:-translate-y-0.5 hover:border-[#31a88f]/40 ${selectedId === asset.id ? "border-[#31a88f]" : "border-white/10"}`}
                >
                  <div className="relative aspect-square overflow-hidden bg-[#332621]">
                    {asset.resourceType === "image" ? (
                      // Intentionally use a plain image for admin-only dynamic remote assets.
                      // No Next image optimizer or remotePatterns configuration required.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.url}
                        alt={asset.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#bca899]">
                        <Film size={34} strokeWidth={1.4} />
                        <span className="text-[10px]">ВІДЕО</span>
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white">
                      {asset.resourceType === "video" ? "VIDEO" : "PHOTO"}
                    </span>
                  </div>
                  <div className="px-3 py-3">
                    <p className="truncate text-xs text-[#efdfcd]">{asset.title}</p>
                    <p className="mt-1 truncate text-[10px] text-[#9e8a7f]">
                      {categoryLabel(asset.category)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center text-[#a58f82]">
              <ImageIcon size={32} strokeWidth={1.2} />
              <p className="mt-3 text-sm">Матеріалів не знайдено</p>
              <p className="mt-1 text-xs">Завантаж перший файл або зміни фільтр</p>
            </div>
          )}
          {totalShown >= 200 && (
            <p className="mt-4 text-xs text-[#ae9789]">
              Показано 200 найновіших файлів. Пагінацію додамо при зростанні бібліотеки.
            </p>
          )}
        </div>

        <aside className="rounded-[22px] border border-white/10 bg-[#281d19] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-[22px] text-[#f1dfcb]">Деталі файлу</h2>
            {selected && (
              <button
                type="button"
                aria-label="Закрити деталі"
                onClick={() => setSelectedId(null)}
                className="text-[#9b8578] hover:text-white"
              >
                <X size={17} />
              </button>
            )}
          </div>
          {selected ? (
            <div className="mt-4 space-y-4">
              <div className="overflow-hidden rounded-xl bg-[#1c1513]">
                {selected.resourceType === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.url}
                    alt={selected.title}
                    className="max-h-[300px] w-full object-contain"
                  />
                ) : (
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    src={selected.url}
                    className="max-h-[300px] w-full"
                  />
                )}
              </div>
              <label className="block text-xs text-[#bda799]">
                Назва
                <input
                  type="text"
                  maxLength={120}
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#1b1412] px-3 py-3 text-sm text-[#f1dfcb] outline-none focus:border-[#31a88f]"
                />
              </label>
              <button
                type="button"
                onClick={() => void saveTitle()}
                disabled={busy || !draftTitle.trim() || draftTitle.trim() === selected.title}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#31a88f]/35 py-3 text-xs text-[#88dbc5] hover:bg-[#31a88f]/10 disabled:opacity-40"
              >
                <Pencil size={15} /> Зберегти назву
              </button>
              <dl className="space-y-2 border-t border-white/10 pt-4 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-[#978477]">Категорія</dt>
                  <dd className="text-right text-[#e1cfbf]">{categoryLabel(selected.category)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#978477]">Розмір</dt>
                  <dd className="text-[#e1cfbf]">{sizeLabel(selected.bytes)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#978477]">Формат</dt>
                  <dd className="text-[#e1cfbf] uppercase">{selected.format ?? "—"}</dd>
                </div>
                {selected.width && selected.height && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#978477]">Роздільність</dt>
                    <dd className="text-[#e1cfbf]">
                      {selected.width} × {selected.height}
                    </dd>
                  </div>
                )}
              </dl>
              <button
                type="button"
                onClick={() => void copyLink(selected.url)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2caa90] px-4 py-3 text-xs font-bold text-[#11231d] hover:bg-[#56c6ae]"
              >
                <Copy size={15} /> Копіювати посилання
              </button>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={selected.url}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-xs text-[#dfcbbd] hover:border-white/25"
              >
                <ExternalLink size={15} /> Відкрити оригінал
              </a>
              <button
                type="button"
                disabled={busy}
                onClick={() => void removeAsset()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 py-3 text-xs text-red-300 hover:bg-red-400/10 disabled:opacity-50"
              >
                <Trash2 size={15} /> Видалити назавжди
              </button>
            </div>
          ) : (
            <div className="mt-6 flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-5 text-center text-[#968275]">
              <ImageIcon size={27} strokeWidth={1.3} />
              <p className="mt-3 text-sm">Обери файл із сітки</p>
              <p className="mt-2 text-xs leading-5">Тут будуть перегляд, назва та дії</p>
            </div>
          )}
        </aside>
      </div>
      <p className="text-xs leading-6 text-[#9e887b]">
        Видалення файлу з Cloudinary остаточне: якщо зображення вже використане на публічній
        сторінці, посилання перестане працювати. Ця перша версія поки не перевіряє такі зв’язки
        автоматично.
      </p>
    </div>
  );
}
