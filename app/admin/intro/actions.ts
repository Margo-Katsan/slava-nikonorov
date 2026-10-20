"use server";

import { revalidatePath } from "next/cache";

import { getMediaAdmin } from "@/lib/admin/media-access";
import { INTRO_ID } from "@/lib/intro/settings";
import { INTRO_HEAD_COUNT } from "@/lib/intro/types";
import { prisma } from "@/lib/prisma";

export type IntroActionState = { ok: boolean; message: string };

function stringField(form: FormData, key: string, min: number, max: number) {
  const raw = form.get(key);
  if (typeof raw !== "string") throw new Error(`Поле «${key}» не заповнене.`);
  const value = raw.trim();
  if (value.length < min || value.length > max) {
    throw new Error(`Поле «${key}»: потрібно від ${min} до ${max} символів.`);
  }
  return value;
}

export async function saveIntroSettings(
  _previous: IntroActionState,
  form: FormData,
): Promise<IntroActionState> {
  // Every mutation must verify admin + MFA on the server (not only in /admin layout).
  if (!(await getMediaAdmin())) {
    return { ok: false, message: "Немає доступу. Увійдіть знову з 2FA." };
  }

  try {
    const eyebrow = stringField(form, "eyebrow", 1, 120);
    const heading = stringField(form, "heading", 1, 65);
    const accent = stringField(form, "accent", 1, 65);
    const description = stringField(form, "description", 1, 700);
    const tagline = stringField(form, "tagline", 1, 200);
    const skipLabel = stringField(form, "skipLabel", 1, 60);
    const siteHref = stringField(form, "siteHref", 1, 100);
    // Internal absolute path only; disallow protocol-relative URLs and CRLF.
    if (
      !/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(siteHref) ||
      siteHref === "/intro" ||
      siteHref.startsWith("/intro/")
    ) {
      throw new Error("Шлях входу має бути внутрішнім: / або /home.");
    }
    const intervalRaw = stringField(form, "autoIntervalMs", 3, 4);
    const autoIntervalMs = Number(intervalRaw);
    if (!Number.isInteger(autoIntervalMs) || autoIntervalMs < 650 || autoIntervalMs > 3000) {
      throw new Error("Інтервал автопадіння: від 650 до 3000 мс.");
    }
    const enabled = form.get("enabled") === "on";
    const autoModeDefault = form.get("autoModeDefault") === "on";

    const chosen = Array.from({ length: INTRO_HEAD_COUNT }, (_, level) => ({
      level,
      mediaAssetId: stringField(form, `head-${level}`, 0, 128) || null,
    }));
    const ids = chosen.map((item) => item.mediaAssetId).filter((id): id is string => Boolean(id));
    if (new Set(ids).size !== ids.length) {
      throw new Error("Для різних рівнів вибери різні фотографії.");
    }
    if (ids.length) {
      const found = await prisma.mediaAsset.findMany({
        where: { id: { in: ids }, resourceType: "image" },
        select: { id: true },
      });
      if (found.length !== ids.length) {
        throw new Error("Одне з фото не знайдено в медіатеці або це відео.");
      }
    }

    // All settings and the eleven ordered levels update atomically.
    await prisma.$transaction(async (tx) => {
      await tx.introGameSettings.upsert({
        where: { id: INTRO_ID },
        create: {
          id: INTRO_ID,
          enabled,
          eyebrow,
          heading,
          accent,
          description,
          tagline,
          skipLabel,
          siteHref,
          autoModeDefault,
          autoIntervalMs,
        },
        update: {
          enabled,
          eyebrow,
          heading,
          accent,
          description,
          tagline,
          skipLabel,
          siteHref,
          autoModeDefault,
          autoIntervalMs,
        },
      });
      await tx.introGameHead.deleteMany({ where: { settingsId: INTRO_ID } });
      await tx.introGameHead.createMany({
        data: chosen.map(({ level, mediaAssetId }) => ({
          settingsId: INTRO_ID,
          level,
          mediaAssetId,
        })),
      });
    });

    revalidatePath("/intro");
    revalidatePath("/"); // If your game is rendered on / instead of /intro.
    revalidatePath("/admin/intro");
    return { ok: true, message: "Налаштування вступної гри збережено." };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.startsWith("Поле") ||
        error.message.startsWith("Шлях") ||
        error.message.startsWith("Інтервал") ||
        error.message.startsWith("Для різних") ||
        error.message.startsWith("Одне з фото"))
    ) {
      return { ok: false, message: error.message };
    }
    console.error("Error saving intro game settings:", error);
    return { ok: false, message: "Не вдалося зберегти зміни. Спробуйте ще раз." };
  }
}
