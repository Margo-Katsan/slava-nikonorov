import type { ReactNode } from "react";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/AdminSidebar";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Проверяем авторизацию на сервере
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Проверяем роль в базе, а не доверяем клиенту
  const [user, dbSession] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        role: true,
        twoFactorEnabled: true,
      },
    }),

    prisma.session.findUnique({
      where: {
        id: session.session.id,
      },
      select: {
        userId: true,
        mfaVerified: true,
      },
    }),
  ]);

  if (!user || user.role !== "admin" || !dbSession || dbSession.userId !== session.user.id) {
    redirect("/login");
  }

  // Администратор должен настроить 2FA
  if (!user.twoFactorEnabled) {
    redirect("/login/setup-2fa");
  }

  // Доступ только после второго фактора
  if (dbSession.mfaVerified !== true) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-[#1c1513] text-[#eadbcc]">
      <AdminSidebar email={session.user.email} />

      <main
        id="admin-content"
        className="min-h-dvh px-5 pt-24 pb-12 sm:px-8 lg:ml-[270px] lg:px-10 lg:pt-10 xl:px-14"
      >
        <div className="mx-auto w-full max-w-[1500px]">{children}</div>
      </main>
    </div>
  );
}
