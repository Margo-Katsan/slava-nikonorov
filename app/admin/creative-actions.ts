"use server";

import { revalidatePath } from "next/cache";

import { getMediaAdmin } from "@/lib/admin/media-access";
import { validateWritingBody } from "@/lib/creative/rich-text";
import {
  CREATIVE_SECTIONS,
  type CreativeSlug,
  UNTITLED_CREATIVE,
  isCreativeSlug,
} from "@/lib/creative/sections";
import { prisma } from "@/lib/prisma";

type ActionResult = { ok: boolean; message: string };

async function checkAdmin(): Promise<boolean> {
  // Existing MFA-aware server check from the media kit.
  return Boolean(await getMediaAdmin());
}

function stringField(formData: FormData, key: string, max: number, required = false): string {
  const raw = formData.get(key);
  if (raw !== null && typeof raw !== "string") throw new Error(`Некоректне поле: ${key}`);
  const value = (raw ?? "").toString().trim();
  if (value.length > max || (required && !value)) {
    throw new Error(`Поле «${key}» повинно містити ${required ? "1–" : "до "}${max} символів.`);
  }
  return value;
}

function parseYear(raw: string): number | null {
  if (!raw) return null;
  if (!/^\d{4}$/.test(raw)) throw new Error("Рік має містити чотири цифри.");
  const year = Number(raw);
  if (year < 1900 || year > 2200) throw new Error("Некоректний рік.");
  return year;
}

function parseLink(raw: string): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Некоректне посилання.");
  }
  if (!["https:", "http:"].includes(url.protocol))
    throw new Error("Посилання має починатися з https:// або http://.");
  if (url.username || url.password) throw new Error("Посилання не може містити логін або пароль.");
  return url.href;
}

const PUBLIC_PATHS: Record<CreativeSlug, string> = {
  cinema: "/kino",
  theatre: "/teatr",
  "my-cinema": "/moie-kino",
  painting: "/ya-malyuyu",
  writing: "/ya-pyshu",
  gallery: "/fotogalereya",
};

function invalidateSection(slug: CreativeSlug) {
  revalidatePath(`/admin/${slug}`);
  revalidatePath(PUBLIC_PATHS[slug]);
  revalidatePath("/home");
}

export async function saveCreativeItem(formData: FormData): Promise<ActionResult> {
  if (!(await checkAdmin())) return { ok: false, message: "Сесію завершено. Увійдіть знову." };
  try {
    const slug = stringField(formData, "section", 24);
    if (!isCreativeSlug(slug)) throw new Error("Невідомий розділ.");
    const section = CREATIVE_SECTIONS[slug].category;
    const id = stringField(formData, "id", 128);
    const optionalTitle = slug === "writing" || slug === "gallery" || slug === "painting";
    const userTitle = stringField(formData, "title", 180, !optionalTitle);
    const title = userTitle || UNTITLED_CREATIVE; // No schema change required for title String @db.VarChar(180)
    let subtitle: string | null = null;
    let description: string | null = null;
    let body: string | null = null;
    let year: number | null = null;
    let categoryTag: string | null = null;
    let linkUrl: string | null = null;
    let mediaAssetId: string | null = null;
    const published = formData.get("published") === "true";

    if (slug === "writing") {
      // JSON is validated and normalized on the server. Legacy plain text remains accepted.
      const rawBody = formData.get("body");
      if (typeof rawBody !== "string") throw new Error("Напиши текст перед збереженням.");
      body = validateWritingBody(rawBody);
      const kind = stringField(formData, "writingType", 12, true);
      if (kind === "essay") categoryTag = "Есе";
      else if (kind === "poem") categoryTag = "Вірш";
      else if (kind === "other") categoryTag = stringField(formData, "writingCustomType", 80, true);
      else throw new Error("Некоректний тип тексту.");
    } else {
      subtitle = stringField(formData, "subtitle", 220) || null;
      description = stringField(formData, "description", 2500) || null;
      body = stringField(formData, "body", 30000) || null;
      year = parseYear(stringField(formData, "year", 4));
      categoryTag = stringField(formData, "categoryTag", 80) || null;
      linkUrl = parseLink(stringField(formData, "linkUrl", 800));
      mediaAssetId = stringField(formData, "mediaAssetId", 128) || null;

      if ((slug === "gallery" || slug === "painting") && !mediaAssetId) {
        throw new Error("Обраний медіафайл обов'язковий у цьому розділі.");
      }
      if (mediaAssetId) {
        const media = await prisma.mediaAsset.findUnique({
          where: { id: mediaAssetId },
          select: { id: true, resourceType: true },
        });
        if (!media) throw new Error("Обраний файл відсутній у медіатеці.");
        if (media.resourceType !== "image")
          throw new Error("Обраний медіафайл має бути фотографією.");
      }
    }

    const data = {
      section,
      title,
      subtitle,
      description,
      body,
      year,
      categoryTag,
      linkUrl,
      mediaAssetId,
      published,
    };
    if (id) {
      // Must prevent updates to records belonging to another section.
      const updated = await prisma.creativeItem.updateMany({
        where: { id, section },
        data,
      });
      if (updated.count !== 1) throw new Error("Роботу не знайдено в цьому розділі.");
    } else {
      await prisma.$transaction(async (tx) => {
        const last = await tx.creativeItem.findFirst({
          where: { section },
          orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
          select: { sortOrder: true },
        });
        await tx.creativeItem.create({
          data: { ...data, sortOrder: (last?.sortOrder ?? -10) + 10 },
        });
      });
    }
    invalidateSection(slug);
    return { ok: true, message: id ? "Зміни збережено." : "Матеріал створено." };
  } catch (e) {
    if (e instanceof Error && !e.message.includes("Prisma")) {
      // Only expose errors we produced ourselves.
      const allowed = [
        "Невідомий",
        "Некоректне",
        "Поле",
        "Рік",
        "Посилання",
        "Обраний",
        "Роботу",
        "Напиши",
        "Текст",
        "Максимальна довжина",
      ];
      if (allowed.some((prefix) => e.message.startsWith(prefix)))
        return { ok: false, message: e.message };
    }
    console.error("saveCreativeItem failed", e);
    return { ok: false, message: "Не вдалося зберегти матеріал." };
  }
}

export async function deleteCreativeItem(slug: string, id: string): Promise<ActionResult> {
  if (!(await checkAdmin())) return { ok: false, message: "Доступ заборонено." };
  if (!isCreativeSlug(slug) || typeof id !== "string" || id.length > 128) {
    return { ok: false, message: "Некоректні параметри." };
  }
  try {
    const result = await prisma.creativeItem.deleteMany({
      where: { id, section: CREATIVE_SECTIONS[slug].category },
    });
    if (result.count !== 1) return { ok: false, message: "Матеріал не знайдено." };
    invalidateSection(slug);
    // Media stays in Cloudinary. Deleting a card must not delete a shared file.
    return { ok: true, message: "Матеріал видалено. Файл залишився в медіатеці." };
  } catch (e) {
    console.error("deleteCreativeItem failed", e);
    return { ok: false, message: "Не вдалося видалити матеріал." };
  }
}

export async function reorderCreativeItems(slug: string, ids: string[]): Promise<ActionResult> {
  if (!(await checkAdmin())) return { ok: false, message: "Доступ заборонено." };
  if (
    !isCreativeSlug(slug) ||
    !Array.isArray(ids) ||
    ids.length > 500 ||
    ids.some((id) => typeof id !== "string" || id.length > 128) ||
    new Set(ids).size !== ids.length
  ) {
    return { ok: false, message: "Некоректний список елементів." };
  }
  try {
    const section = CREATIVE_SECTIONS[slug].category;
    await prisma.$transaction(async (tx) => {
      const existing = await tx.creativeItem.findMany({
        where: { section },
        select: { id: true },
      });
      // Reject an incomplete set, unauthorized IDs or stale clients.
      if (existing.length !== ids.length || existing.some((item) => !ids.includes(item.id))) {
        throw new Error("STALE_LIST");
      }
      for (const [index, id] of ids.entries()) {
        await tx.creativeItem.update({ where: { id }, data: { sortOrder: index * 10 } });
      }
    });
    invalidateSection(slug);
    return { ok: true, message: "Новий порядок збережено." };
  } catch (e) {
    if (e instanceof Error && e.message === "STALE_LIST") {
      return { ok: false, message: "Список змінився. Оновіть сторінку та повторіть." };
    }
    console.error("reorderCreativeItems failed", e);
    return { ok: false, message: "Помилка збереження порядку." };
  }
}
