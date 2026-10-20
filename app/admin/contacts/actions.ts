"use server";

import { revalidatePath } from "next/cache";

import { getMediaAdmin } from "@/lib/admin/media-access";
import { CONTACT_DEFINITIONS, type ContactDraft, type ContactId } from "@/lib/contacts/config";
import { prisma } from "@/lib/prisma";

type Result = { ok: true } | { ok: false; error: string };
const IDs = new Set<string>(CONTACT_DEFINITIONS.map((c) => c.id));

function normalizeContactURL(id: ContactId, raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (id === "email") {
    const email = value.replace(/^mailto:/i, "");
    if (
      !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ||
      email.length > 254 ||
      /[\r\n?&#]/.test(email)
    ) {
      throw new Error("Укажіть коректний email без додаткових параметрів.");
    }
    return `mailto:${email}`;
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Укажіть повне посилання https://...");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) {
    throw new Error("Посилання повинно бути HTTPS без логіна, пароля та порту.");
  }
  const host = url.hostname.toLowerCase();
  const allowed: Record<Exclude<ContactId, "email">, string[]> = {
    telegram: ["t.me", "telegram.me"],
    instagram: ["instagram.com"],
    youtube: ["youtube.com", "youtu.be"],
    facebook: ["facebook.com", "fb.com", "fb.me"],
  };
  const valid = allowed[id].some((domain) => host === domain || host.endsWith(`.${domain}`));
  if (!valid) throw new Error("Посилання має вести на відповідну соцмережу.");
  if (url.href.length > 700) throw new Error("Посилання надто довге.");
  return url.href;
}

export async function saveSiteContacts(rows: ContactDraft[]): Promise<Result> {
  if (!(await getMediaAdmin()))
    return { ok: false, error: "Доступ заборонено. Увійдіть повторно." };
  if (
    !Array.isArray(rows) ||
    rows.length !== CONTACT_DEFINITIONS.length ||
    new Set(rows.map((r) => r?.id)).size !== CONTACT_DEFINITIONS.length ||
    rows.some(
      (r) =>
        !r ||
        !IDs.has(r.id) ||
        typeof r.url !== "string" ||
        typeof r.description !== "string" ||
        typeof r.visible !== "boolean" ||
        r.description.length > 140 ||
        r.url.length > 700,
    )
  ) {
    return { ok: false, error: "Некоректний список контактів." };
  }
  try {
    const safe = rows.map((row, i) => {
      const url = normalizeContactURL(row.id, row.url);
      if (row.visible && !url) throw new Error("Щоб показувати контакт, укажіть посилання.");
      return {
        id: row.id,
        url,
        description: row.description.trim(),
        visible: row.visible,
        sortOrder: i * 10,
      };
    });

    await prisma.$transaction(
      safe.map((row) =>
        prisma.siteContact.upsert({
          where: { id: row.id },
          create: row,
          update: {
            url: row.url,
            description: row.description,
            visible: row.visible,
            sortOrder: row.sortOrder,
          },
        }),
      ),
    );

    revalidatePath("/admin/contacts");
    revalidatePath("/");
    revalidatePath("/home");
    return { ok: true };
  } catch (error) {
    if (
      error instanceof Error &&
      ["Укажіть", "Посилання", "Щоб"].some((s) => error.message.startsWith(s))
    ) {
      return { ok: false, error: error.message };
    }
    console.error("saveSiteContacts error", error);
    return { ok: false, error: "Не вдалося зберегти контакти." };
  }
}
