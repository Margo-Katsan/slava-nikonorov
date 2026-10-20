import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { getMediaAdmin } from "@/lib/admin/media-access";
import {
  MEDIA_FORMATS,
  MEDIA_MAX_BYTES,
  type MediaKind,
  isMediaCategory,
} from "@/lib/media/categories";
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
    return NextResponse.json({ error: "Некоректні параметри" }, { status: 400 });
  }

  const body = data as Record<string, unknown>;
  const category = body.category;
  const kind = body.kind;
  if (!isMediaCategory(category) || (kind !== "image" && kind !== "video")) {
    return NextResponse.json({ error: "Некоректна категорія або тип файлу" }, { status: 400 });
  }
  const mediaKind: MediaKind = kind;

  // Basic per-user limit. For higher-traffic installations add an atomic limit
  // (e.g. Redis or a DB transaction/lock) as well.
  const issuedRecently = await prisma.mediaUploadTicket.count({
    where: { issuedById: admin.id, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (issuedRecently >= 40) {
    return NextResponse.json({ error: "Ліміт завантажень на годину вичерпано" }, { status: 429 });
  }

  const publicId = `nikonorov/${category.toLowerCase()}/${randomUUID()}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    timestamp,
    public_id: publicId,
    allowed_formats: MEDIA_FORMATS[mediaKind].join(","),
    overwrite: "false",
  };

  const { cloudinary, cloudName, apiKey, apiSecret } = getCloudinary();
  const signature = cloudinary.utils.api_sign_request(params, apiSecret);

  const ticket = await prisma.mediaUploadTicket.create({
    data: {
      publicId,
      category,
      resourceType: mediaKind,
      issuedById: admin.id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
    select: { id: true },
  });

  return NextResponse.json(
    {
      ticketId: ticket.id,
      uploadUrl: `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${mediaKind}/upload`,
      apiKey,
      signature,
      params,
      maxBytes: MEDIA_MAX_BYTES[mediaKind],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
