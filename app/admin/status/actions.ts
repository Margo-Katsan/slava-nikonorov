"use server";

import { revalidatePath } from "next/cache";

import { isVerifiedAdmin } from "@/lib/is-verified-admin";
import { prisma } from "@/lib/prisma";

export type StatusActionState = {
  ok: boolean;
  message: string;
};

export async function saveSiteStatus(
  _previousState: StatusActionState,
  formData: FormData,
): Promise<StatusActionState> {
  // Server Actions are directly callable endpoints. Never rely only on /admin/layout.
  if (!(await isVerifiedAdmin())) {
    return { ok: false, message: "Доступ заборонено. Увійдіть повторно." };
  }

  const input = formData.get("content");
  if (typeof input !== "string") {
    return { ok: false, message: "Невірний формат тексту." };
  }

  const content = input.trim();
  if (content.length === 0 || content.length > 500) {
    return { ok: false, message: "Введіть від 1 до 500 символів." };
  }

  try {
    await prisma.siteStatus.upsert({
      where: { id: "home" },
      create: { id: "home", content },
      update: { content },
    });
  } catch (error) {
    console.error("Could not save public site status", error);
    return { ok: false, message: "Не вдалося зберегти текст. Спробуйте ще раз." };
  }

  revalidatePath("/");
  revalidatePath("/admin/status");
  return { ok: true, message: "Збережено. Текст оновлено на сайті." };
}
