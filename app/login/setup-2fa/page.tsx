import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { Setup2FA } from "@/components/Setup2FA";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Налаштування 2FA", robots: { index: false, follow: false } };

export default async function SetupTwoFactorPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, twoFactorEnabled: true },
  });
  if (user?.role !== "admin") notFound();
  if (user.twoFactorEnabled) redirect("/login");
  return <Setup2FA />;
}
