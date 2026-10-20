import { redirect } from "next/navigation";

import { AccountSettings } from "@/components/admin/AccountSettings";

import { getMediaAdmin } from "@/lib/admin/media-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const access = await getMediaAdmin();
  if (!access) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: access.id },
    select: { name: true, email: true, emailVerified: true, twoFactorEnabled: true },
  });
  if (!user) redirect("/login");
  return (
    <section className="space-y-8">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[#31a88f] uppercase">
          Система / Налаштування
        </p>
        <h1 className="mt-3 font-serif text-4xl text-[#efdfcd] sm:text-5xl">
          Мій <span className="text-[#31a88f] italic">акаунт</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#b49c8e]">
          Зміна імені, пароля та перевірка захисту. Двофакторну автентифікацію не вимикаємо з
          адмінки.
        </p>
      </header>
      <AccountSettings initial={user} />
    </section>
  );
}
