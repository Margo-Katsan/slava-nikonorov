import { NextResponse } from "next/server";

import { getAdminAccess } from "@/lib/admin-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const access = await getAdminAccess();
  if (access.state !== "ok") {
    return NextResponse.json(
      { error: "Forbidden" },
      {
        status: access.state === "unauthenticated" ? 401 : 403,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
  return NextResponse.json(
    { ok: true, admin: access.user.name },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
