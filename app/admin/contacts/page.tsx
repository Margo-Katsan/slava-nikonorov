import { redirect } from "next/navigation";

import { ContactsEditor } from "@/components/admin/ContactsEditor";

import { getMediaAdmin } from "@/lib/admin/media-access";
import { getContactDrafts } from "@/lib/contacts/server";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  if (!(await getMediaAdmin())) redirect("/login");
  const contacts = await getContactDrafts();
  return (
    <section className="space-y-8">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[#31a88f] uppercase">
          Система / Контакти
        </p>
        <h1 className="mt-3 font-serif text-4xl text-[#efdfcd] sm:text-5xl">
          Знайти мене <span className="text-[#31a88f] italic">без гриму</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#b49c8e]">
          Оновлюй посилання, описи та видимість соцмереж. Стрілками можна міняти порядок без зміни
          коду.
        </p>
      </header>
      <ContactsEditor initial={contacts} />
    </section>
  );
}
