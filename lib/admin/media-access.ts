import { headers } from "next/headers";
import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Authorize every read/write API, not merely the /admin layout.
// Assumes your verified MFA session flag has been SECURITY TESTED.
export async function getMediaAdmin(): Promise<{ id: string; email: string } | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const [user, dbSession] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, role: true, twoFactorEnabled: true },
    }),
    prisma.session.findUnique({
      where: { id: session.session.id },
      select: { userId: true, mfaVerified: true },
    }),
  ]);

  if (
    !user ||
    user.role !== "admin" ||
    !user.twoFactorEnabled ||
    !dbSession ||
    dbSession.userId !== user.id ||
    dbSession.mfaVerified !== true
  ) {
    return null;
  }

  return { id: user.id, email: user.email };
}
