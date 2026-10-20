import { NextResponse } from "next/server";

import { getMediaAdmin } from "@/lib/admin/media-access";
import { getCloudinary } from "@/lib/media/cloudinary";
import { isAllowedMutationOrigin } from "@/lib/media/request-guard";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!isAllowedMutationOrigin(request))
    return NextResponse.json({ error: "Неприпустиме джерело запиту" }, { status: 403 });
  if (!(await getMediaAdmin()))
    return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 });
  const { id } = await context.params;
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Некоректний JSON" }, { status: 400 });
  }
  const body = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title || title.length > 120) {
    return NextResponse.json({ error: "Назва має містити 1–120 символів" }, { status: 400 });
  }

  const existing = await prisma.mediaAsset.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Файл не знайдено" }, { status: 404 });
  await prisma.mediaAsset.update({ where: { id }, data: { title } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: Context) {
  if (!isAllowedMutationOrigin(request))
    return NextResponse.json({ error: "Неприпустиме джерело запиту" }, { status: 403 });
  if (!(await getMediaAdmin()))
    return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 });
  const { id } = await context.params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: "Файл не знайдено" }, { status: 404 });
  if (asset.resourceType !== "image" && asset.resourceType !== "video") {
    return NextResponse.json({ error: "Недопустимий тип файлу" }, { status: 400 });
  }

  // First delete in Cloudinary, then delete the DB record; retry is safe if the
  // Cloudinary resource is already gone. Ask user to check site references first.
  try {
    const { cloudinary } = getCloudinary();
    const response = await cloudinary.uploader.destroy(asset.publicId, {
      resource_type: asset.resourceType,
      type: "upload",
      invalidate: true,
    });
    if (response.result !== "ok" && response.result !== "not found") {
      throw new Error("Cloudinary did not confirm deletion");
    }
  } catch {
    return NextResponse.json({ error: "Не вдалося видалити з Cloudinary" }, { status: 502 });
  }

  await prisma.mediaAsset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
