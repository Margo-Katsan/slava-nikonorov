import { NextResponse } from "next/server";

import { getMediaAdmin } from "@/lib/admin/media-access";
import { MEDIA_FORMATS, MEDIA_MAX_BYTES, type MediaKind } from "@/lib/media/categories";
import { getCloudinary } from "@/lib/media/cloudinary";
import { isAllowedMutationOrigin } from "@/lib/media/request-guard";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAllowedMutationOrigin(request))
    return NextResponse.json({ error: "Неприпустиме джерело запиту" }, { status: 403 });
  const admin = await getMediaAdmin();
  if (!admin) return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 });

  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Некоректний JSON" }, { status: 400 });
  }
  if (typeof data !== "object" || data === null) {
    return NextResponse.json({ error: "Некоректний запит" }, { status: 400 });
  }
  const body = data as Record<string, unknown>;
  if (typeof body.ticketId !== "string" || typeof body.title !== "string") {
    return NextResponse.json({ error: "Недостатньо даних" }, { status: 400 });
  }
  const title = body.title.trim();
  if (!title || title.length > 120) {
    return NextResponse.json({ error: "Назва має містити 1–120 символів" }, { status: 400 });
  }

  const ticket = await prisma.mediaUploadTicket.findUnique({ where: { id: body.ticketId } });
  if (
    !ticket ||
    ticket.issuedById !== admin.id ||
    ticket.consumedAt ||
    ticket.expiresAt.getTime() < Date.now() ||
    (ticket.resourceType !== "image" && ticket.resourceType !== "video")
  ) {
    return NextResponse.json(
      { error: "Дозвіл на завантаження недійсний або закінчився" },
      { status: 400 },
    );
  }

  // Never trust the URL, size, type or asset ID supplied by the browser.
  // Read authoritative metadata from Cloudinary Admin API using the signed ticket's public ID.
  let resource: {
    asset_id?: string;
    public_id?: string;
    resource_type?: string;
    secure_url?: string;
    bytes?: number;
    format?: string;
    width?: number;
    height?: number;
    duration?: number;
  };
  try {
    const { cloudinary } = getCloudinary();
    resource = await cloudinary.api.resource(ticket.publicId, {
      resource_type: ticket.resourceType,
      type: "upload",
    });
  } catch {
    return NextResponse.json(
      { error: "Cloudinary ще не підтвердив файл. Спробуй ще раз." },
      { status: 502 },
    );
  }

  const kind = ticket.resourceType as MediaKind;
  const format = (resource.format ?? "").toLowerCase();
  if (
    resource.public_id !== ticket.publicId ||
    resource.resource_type !== kind ||
    !resource.asset_id ||
    !resource.secure_url ||
    !resource.secure_url.startsWith("https://") ||
    !Number.isFinite(resource.bytes) ||
    !resource.bytes ||
    !MEDIA_FORMATS[kind].some((allowed) => allowed === format) ||
    resource.bytes > MEDIA_MAX_BYTES[kind]
  ) {
    return NextResponse.json(
      { error: "Файл не відповідає дозволеним параметрам" },
      { status: 422 },
    );
  }

  try {
    // Atomic ticket consumption prevents registering one upload twice.
    const asset = await prisma.$transaction(async (tx) => {
      const updated = await tx.mediaUploadTicket.updateMany({
        where: {
          id: ticket.id,
          issuedById: admin.id,
          consumedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { consumedAt: new Date() },
      });
      if (updated.count !== 1) throw new Error("Ticket already used");

      return tx.mediaAsset.create({
        data: {
          assetId: resource.asset_id!,
          publicId: ticket.publicId,
          title,
          url: resource.secure_url!,
          resourceType: kind,
          category: ticket.category,
          format: format || null,
          bytes: resource.bytes!,
          width: resource.width ?? null,
          height: resource.height ?? null,
          duration: resource.duration ?? null,
        },
      });
    });
    return NextResponse.json({ id: asset.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Не вдалося зареєструвати файл. Перевір медіатеку." },
      { status: 409 },
    );
  }
}
