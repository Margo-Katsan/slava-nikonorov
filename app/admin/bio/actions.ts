"use server";

import { revalidatePath } from "next/cache";

import { getMediaAdmin } from "@/lib/admin/media-access";
import { BIO_ID } from "@/lib/bio/profile";
import { prisma } from "@/lib/prisma";

export type BioActionState = { ok: boolean; message: string };
const positions = new Set([
  "center",
  "center top",
  "center 18%",
  "center 25%",
  "center 35%",
  "center 50%",
  "center bottom",
]);

function readText(form: FormData, key: string, min: number, max: number): string {
  const raw = form.get(key);
  if (typeof raw !== "string") throw new Error(`Поле «${key}» має неправильний формат.`);
  const text = raw.trim();
  if (text.length < min || text.length > max) {
    throw new Error(`Поле «${key}»: допустимо від ${min} до ${max} символів.`);
  }
  return text;
}

export async function saveBioProfile(
  _previous: BioActionState,
  formData: FormData,
): Promise<BioActionState> {
  // Server Actions can be called directly. Do not trust the admin layout alone.
  if (!(await getMediaAdmin())) {
    return { ok: false, message: "Сесія завершена або доступ заборонено. Увійдіть знову." };
  }

  try {
    const heading = readText(formData, "heading", 1, 80);
    const accent = readText(formData, "accent", 1, 80);
    const lead = readText(formData, "lead", 1, 500);
    const description = readText(formData, "description", 1, 2000);
    const fullBio = readText(formData, "fullBio", 1, 20000);

    const frames = [0, 1, 2].map((slot) => {
      const title = readText(formData, `frame-${slot}-title`, 1, 40);
      const subtitle = readText(formData, `frame-${slot}-subtitle`, 0, 100);
      const position = readText(formData, `frame-${slot}-position`, 1, 32);
      const mediaAssetId = readText(formData, `frame-${slot}-mediaAssetId`, 0, 128);
      if (!positions.has(position)) throw new Error(`Некоректне положення кадру ${slot + 1}.`);
      return { slot, title, subtitle, position, mediaAssetId: mediaAssetId || null };
    });

    const chosenIds = [
      ...new Set(
        frames.map((frame) => frame.mediaAssetId).filter((id): id is string => id !== null),
      ),
    ];
    if (chosenIds.length) {
      const existing = await prisma.mediaAsset.findMany({
        where: { id: { in: chosenIds }, resourceType: "image" },
        select: { id: true },
      });
      if (existing.length !== chosenIds.length) {
        return { ok: false, message: "Один із вибраних файлів не знайдено або це не фото." };
      }
    }

    // Text and the three ordered frames are committed together, or none is saved.
    await prisma.$transaction(async (tx) => {
      await tx.bioProfile.upsert({
        where: { id: BIO_ID },
        create: { id: BIO_ID, heading, accent, lead, description, fullBio },
        update: { heading, accent, lead, description, fullBio },
      });
      await tx.bioFilmFrame.deleteMany({ where: { bioId: BIO_ID } });
      await tx.bioFilmFrame.createMany({
        data: frames.map(({ slot, title, subtitle, position, mediaAssetId }) => ({
          bioId: BIO_ID,
          slot,
          title,
          subtitle,
          position,
          mediaAssetId,
        })),
      });
    });

    revalidatePath("/");
    revalidatePath("/bio");
    revalidatePath("/admin/bio");
    return { ok: true, message: "Біографію та кіноплівку збережено." };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.startsWith("Поле") || error.message.startsWith("Некоректне"))
    ) {
      return { ok: false, message: error.message };
    }
    console.error("Unable to save biography:", error);
    return { ok: false, message: "Не вдалося зберегти біографію. Спробуйте ще раз." };
  }
}
