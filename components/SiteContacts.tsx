// Optional replacement for the current hardcoded ContactSection.tsx.
// Server component: import in a Server Component such as app/home/page.tsx.
import Image from "next/image";

import { getPublicContacts } from "@/lib/contacts/server";

export async function SiteContacts() {
  const contacts = await getPublicContacts();
  return (
    <section
      id="contacts"
      className="mx-auto w-full max-w-[1440px] scroll-mt-24 px-5 pb-20 sm:px-8 lg:px-14 lg:pb-28"
    >
      <div className="border-t border-[#513b33] pt-14 sm:pt-20">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end lg:gap-12">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-[#31a88f] uppercase">
              — Контакти · Співпраця
            </p>
            <h2 className="mt-5 font-serif text-[clamp(2.8rem,5vw,5.5rem)] leading-[1.05] text-[#f1e2d2]">
              Знайти мене <span className="block text-[#31a88f] italic">без гриму.</span>
            </h2>
          </div>
          <div>
            <p className="font-serif text-xl text-[#efdfcc]">
              Є ідея, роль або творчий проєкт? Поговорімо.
            </p>
            <p className="mt-3 text-sm leading-7 text-[#b49c8e]">Обирай, де нам зустрітися.</p>
          </div>
        </div>
        {contacts.length ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {contacts.map((contact) => (
              <a
                key={contact.id}
                href={contact.url}
                target={contact.id === "email" ? undefined : "_blank"}
                rel={contact.id === "email" ? undefined : "noopener noreferrer"}
                className="group relative flex min-h-[170px] flex-col items-center justify-center rounded-[20px] border border-[#62493b] bg-[#2a1e19] p-4 text-center transition hover:-translate-y-1 hover:border-[#2da88d] focus-visible:outline-2 focus-visible:outline-[#2da88d]"
              >
                <span aria-hidden="true" className="absolute top-3 right-4 text-xs text-[#b39987]">
                  ↗
                </span>
                <Image
                  src={contact.icon}
                  alt=""
                  width={90}
                  height={90}
                  className="h-[78px] w-[78px] object-contain transition-transform group-hover:scale-105"
                />
                <span className="mt-2 text-xs font-semibold tracking-[0.1em] text-[#efdfcc] uppercase">
                  {contact.title}
                </span>
                <span className="mt-1 text-[11px] text-[#b39987]">{contact.description}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-[#a89084]">Контакти незабаром з’являться.</p>
        )}
      </div>
    </section>
  );
}
