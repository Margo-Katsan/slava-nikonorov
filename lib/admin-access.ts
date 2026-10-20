import { headers } from "next/headers";
import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getAdminAccess() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { state: "unauthenticated" as const };

  // Never trust a role supplied by the browser or a stale session claim.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, twoFactorEnabled: true },
  });
  if (!user || user.role !== "admin") return { state: "forbidden" as const };
  if (!user.twoFactorEnabled) return { state: "enrollment" as const, user };
  if (session.session.mfaVerified !== true) return { state: "mfa_required" as const, user };
  return { state: "ok" as const, user };
}
