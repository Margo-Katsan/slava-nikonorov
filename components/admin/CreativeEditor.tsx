"use client";

import { type FormEvent, type ReactNode, useState } from "react";

import { Check, X } from "lucide-react";

import { CreativeMediaPicker } from "@/components/admin/CreativeMediaPicker";
import { WritingRichTextEditor } from "@/components/admin/WritingRichTextEditor";

import {
  CREATIVE_SECTIONS,
  type CreativeItemUI,
  type CreativeMedia,
  type CreativeSlug,
  UNTITLED_CREATIVE,
} from "@/lib/creative/sections";

import { saveCreativeItem } from "@/app/admin/creative-actions";

type Props = {
  slug: CreativeSlug;
  editing: CreativeItemUI | "new";
  media: CreativeMedia[];
  onClose: () => void;
  onSaved: (message: string) => void;
};

const fieldClass =
  "w-full rounded-xl border border-white/15 bg-[#1a1311] px-4 py-3 text-sm text-[#efdfcd] outline-none placeholder:text-[#846f64] focus:border-[#35b69b]";
const labelClass = "mb-2 block text-xs font-medium text-[#dac6b5]";

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required = false,
  type = "text",
  maxLength = 180,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
  type?: string;
  maxLength?: number;
  children?: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className={labelClass}>
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        maxLength={type === "number" ? undefined : maxLength}
        min={type === "number" ? 1900 : undefined}
        max={type === "number" ? 2200 : undefined}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={fieldClass}
      />
      {children}
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows = 5,
  maxLength = 30000,
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>
        {label}
        {required ? " *" : ""}
      </span>
      <textarea
        name={name}
        required={required}
        rows={rows}
        maxLength={maxLength}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={`${fieldClass} resize-y leading-7 whitespace-pre-wrap`}
      />
    </label>
  );
}

function existingWritingType(value?: string | null): "essay" | "poem" | "other" {
  const tag = (value ?? "").trim().toLocaleLowerCase("uk");
  if (tag === "есе" || tag === "эссе") return "essay";
  if (tag === "вірш" || tag === "стих") return "poem";
  return "other";
}

export function CreativeEditor({ slug, editing, media, onClose, onSaved }: Props) {
  const existing = editing === "new" ? null : editing;
  const section = CREATIVE_SECTIONS[slug];
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mediaId, setMediaId] = useState(existing?.mediaAssetId ?? "");
  const [writingType, setWritingType] = useState<"essay" | "poem" | "other">(
    existing ? existingWritingType(existing.categoryTag) : "essay",
  );
  const customWritingType =
    existing && existingWritingType(existing.categoryTag) === "other" ? existing.categoryTag : "";
  const isWriting = slug === "writing";
  const titleValue = existing?.title === UNTITLED_CREATIVE ? "" : (existing?.title ?? "");
  const [writingTitle, setWritingTitle] = useState(titleValue);
  const [otherType, setOtherType] = useState(customWritingType ?? "");
  const previewCategory =
    writingType === "essay" ? "Есе" : writingType === "poem" ? "Вірш" : otherType.trim() || "Інше";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await saveCreativeItem(new FormData(event.currentTarget));
      if (result.ok) onSaved(result.message);
      else setError(result.message);
    } catch {
      setError("Не вдалося зберегти матеріал. Спробуй ще раз.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-[24px] border border-[#35b69b]/30 bg-[#30221e] p-5 sm:p-7"
    >
      <input type="hidden" name="section" value={slug} />
      <input type="hidden" name="id" value={existing?.id ?? ""} />
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-[10px] tracking-[.18em] text-[#35b69b] uppercase">
            Редактор / {section.label}
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[#efdfcd]">
            {existing ? "Редагувати" : `Додати ${section.itemName}`}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити редактор"
          className="rounded-xl p-2 text-[#bbab9f] hover:bg-white/10"
        >
          <X size={20} />
        </button>
      </div>

      {isWriting ? (
        <div className="space-y-5">
          <label className="block">
            <span className={labelClass}>Заголовок (необов'язково)</span>
            <input
              name="title"
              value={writingTitle}
              onChange={(event) => setWritingTitle(event.target.value)}
              maxLength={180}
              placeholder="Можна залишити порожнім"
              className={fieldClass}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Що це за текст? *</span>
              <select
                name="writingType"
                value={writingType}
                onChange={(e) => setWritingType(e.target.value as typeof writingType)}
                className={fieldClass}
              >
                <option value="essay">Есе</option>
                <option value="poem">Вірш</option>
                <option value="other">Інше (власна назва)</option>
              </select>
            </label>
            {writingType === "other" && (
              <label className="block">
                <span className={labelClass}>Напиши тип тексту *</span>
                <input
                  name="writingCustomType"
                  value={otherType}
                  onChange={(event) => setOtherType(event.target.value)}
                  required
                  maxLength={80}
                  placeholder="Наприклад: Оповідання, щоденник..."
                  className={fieldClass}
                />
              </label>
            )}
          </div>
          <WritingRichTextEditor
            initialValue={existing?.body ?? null}
            isPoem={writingType === "poem"}
            previewTitle={writingTitle}
            previewCategory={previewCategory}
          />
          <p className="text-xs leading-6 text-[#af998e]">
            Можна публікувати без заголовка й обкладинки. Абзаци, форматування та віршовані рядки
            зберігаються.
          </p>
        </div>
      ) : slug === "cinema" ? (
        <div className="space-y-5">
          <Field label="Назва фільму / серіалу" name="title" required defaultValue={titleValue} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Моя роль"
              name="subtitle"
              defaultValue={existing?.subtitle}
              placeholder="Ім'я персонажа, епізод"
              maxLength={220}
            />
            <Field label="Рік" name="year" type="number" defaultValue={existing?.year} />
            <Field
              label="Жанр / формат"
              name="categoryTag"
              defaultValue={existing?.categoryTag}
              maxLength={80}
            />
            <Field
              label="Посилання на трейлер / фільм"
              name="linkUrl"
              type="url"
              maxLength={800}
              defaultValue={existing?.linkUrl}
              placeholder="https://..."
            />
          </div>
          <TextArea
            label="Опис проєкту"
            name="description"
            rows={3}
            maxLength={2500}
            defaultValue={existing?.description}
          />
          <TextArea
            label="Додаткова інформація про роль"
            name="body"
            rows={5}
            defaultValue={existing?.body}
          />
          <CreativeMediaPicker
            title="Постер / кадр із медіатеки"
            files={media}
            value={mediaId}
            onChange={setMediaId}
            imagesOnly
          />
        </div>
      ) : slug === "theatre" ? (
        <div className="space-y-5">
          <Field label="Назва вистави" name="title" required defaultValue={titleValue} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Моя роль / театр"
              name="subtitle"
              defaultValue={existing?.subtitle}
              maxLength={220}
            />
            <Field label="Рік постановки" name="year" type="number" defaultValue={existing?.year} />
          </div>
          <Field
            label="Жанр вистави"
            name="categoryTag"
            defaultValue={existing?.categoryTag}
            maxLength={80}
          />
          <TextArea
            label="Коротко про виставу"
            name="description"
            rows={3}
            maxLength={2500}
            defaultValue={existing?.description}
          />
          <TextArea
            label="Спогади, деталі, режисер"
            name="body"
            rows={5}
            defaultValue={existing?.body}
          />
          <CreativeMediaPicker
            title="Афіша / фотографія вистави"
            files={media}
            value={mediaId}
            onChange={setMediaId}
            imagesOnly
          />
        </div>
      ) : slug === "my-cinema" ? (
        <div className="space-y-5">
          <Field label="Назва мого фільму" name="title" required defaultValue={titleValue} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Формат / підзаголовок"
              name="subtitle"
              defaultValue={existing?.subtitle}
              maxLength={220}
            />
            <Field label="Рік" name="year" type="number" defaultValue={existing?.year} />
            <Field
              label="Жанр"
              name="categoryTag"
              defaultValue={existing?.categoryTag}
              maxLength={80}
            />
            <Field
              label="Посилання на перегляд"
              name="linkUrl"
              type="url"
              maxLength={800}
              defaultValue={existing?.linkUrl}
              placeholder="https://..."
            />
          </div>
          <TextArea
            label="Опис фільму"
            name="description"
            rows={3}
            maxLength={2500}
            defaultValue={existing?.description}
          />
          <TextArea
            label="Як створювався фільм"
            name="body"
            rows={5}
            defaultValue={existing?.body}
          />
          <CreativeMediaPicker
            title="Постер / кадр"
            files={media}
            value={mediaId}
            onChange={setMediaId}
            imagesOnly
          />
        </div>
      ) : slug === "painting" ? (
        <div className="space-y-5">
          <CreativeMediaPicker
            title="Зображення роботи"
            required
            imagesOnly
            files={media}
            value={mediaId}
            onChange={setMediaId}
          />
          <Field label="Назва роботи (необов'язково)" name="title" defaultValue={titleValue} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Техніка / матеріал"
              name="categoryTag"
              maxLength={80}
              defaultValue={existing?.categoryTag}
              placeholder="Олія, акварель, олівець..."
            />
            <Field
              label="Рік (необов'язково)"
              name="year"
              type="number"
              defaultValue={existing?.year}
            />
          </div>
          <TextArea
            label="Історія картини (необов'язково)"
            name="description"
            rows={4}
            maxLength={2500}
            defaultValue={existing?.description}
          />
        </div>
      ) : (
        <div className="space-y-5">
          <CreativeMediaPicker
            title="Фотографія"
            required
            imagesOnly
            files={media}
            value={mediaId}
            onChange={setMediaId}
          />
          <Field label="Назва (необов'язково)" name="title" defaultValue={titleValue} />
          <Field
            label="Підпис до фотографії"
            name="subtitle"
            defaultValue={existing?.subtitle}
            maxLength={220}
          />
          <Field
            label="Альбом / тема"
            name="categoryTag"
            defaultValue={existing?.categoryTag}
            maxLength={80}
            placeholder="Портрети, за лаштунками..."
          />
        </div>
      )}

      <label className="flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-4 py-3">
        <input
          type="checkbox"
          name="published"
          value="true"
          defaultChecked={existing?.published ?? false}
          className="h-4 w-4 accent-[#2da58e]"
        />
        <span className="text-sm text-[#eedccb]">Опублікувати на сайті</span>
      </label>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-400/30 bg-red-950/25 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#278d7a] px-5 py-3 text-sm font-semibold text-[#0d1815] hover:bg-[#37a98f] disabled:opacity-50"
        >
          <Check size={16} />
          {saving ? "Збереження..." : "Зберегти"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/15 px-5 py-3 text-sm text-[#c9b4a5] hover:bg-white/10"
        >
          Скасувати
        </button>
      </div>
    </form>
  );
}
