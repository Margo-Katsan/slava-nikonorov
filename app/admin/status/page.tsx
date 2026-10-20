import { redirect } from "next/navigation";

import { StatusEditor } from "@/components/admin/StatusEditor";

import { isVerifiedAdmin } from "@/lib/is-verified-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminStatusPage() {
  if (!(await isVerifiedAdmin())) redirect("/login");

  const status = await prisma.siteStatus.findUnique({ where: { id: "home" } });

  return (
    <section className="space-y-8">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.22em] text-[#31a88f] uppercase">
          Головна сторінка / Контент
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-[#efdfcd] sm:text-5xl">
          Думка <span className="text-[#31a88f] italic">на сьогодні</span>
        </h1>
        <p className="mt-3 max-w-[600px] text-sm leading-7 text-[#af998d]">
          Змінюй короткий напис на головній без редагування коду та нового деплою.
        </p>
      </header>
      <StatusEditor initialContent={status?.content ?? ""} />
    </section>
  );
}
