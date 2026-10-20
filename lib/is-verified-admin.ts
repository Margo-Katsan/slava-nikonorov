import { headers } from "next/headers";
import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Authorization must be checked in every write action/API, not only a layout.
// Reuses the existing admin role and mfaVerified fields in your Better Auth schema.
export async function isVerifiedAdmin(): Promise<boolean> {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result) return false;

  const [user, dbSession] = await Promise.all([
    prisma.user.findUnique({
      where: { id: result.user.id },
      select: { role: true, twoFactorEnabled: true },
    }),
    prisma.session.findUnique({
      where: { id: result.session.id },
      select: { userId: true, mfaVerified: true },
    }),
  ]);

  return (
    user?.role === "admin" &&
    user.twoFactorEnabled === true &&
    dbSession?.userId === result.user.id &&
    dbSession.mfaVerified === true
  );
}
