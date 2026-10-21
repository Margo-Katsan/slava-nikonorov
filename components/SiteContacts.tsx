import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";

import { getPublicContacts } from "@/lib/contacts/server";

// Серверный компонент: показывает только опубликованные ссылки из /admin/contacts.
export async function SiteContacts() {
  noStore();
  const contacts = await getPublicContacts();

  return (
    <section
      id="contacts"
      aria-labelledby="contacts-title"
      className="wrap mx-auto w-full scroll-mt-28 pt-12 pb-20 text-[#f0dfcd] sm:pt-16 sm:pb-28"
    >
      <div className="relative overflow-hidden rounded-[28px] border border-[#775541]/45 bg-[radial-gradient(ellipse_at_85%_0%,rgba(32,128,105,0.12),transparent_42%),linear-gradient(145deg,#30231d,#211713)] px-4 py-9 shadow-[0_20px_65px_rgba(12,8,6,.18)] sm:px-8 sm:py-12 lg:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-6 right-8 font-serif text-[90px] leading-none text-[#b58b6a]/[0.08] sm:text-[150px]"
        >
          &
        </div>

        <div className="relative grid gap-5 border-b border-[#896b53]/30 pb-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end lg:gap-12">
          <div>
            <p className="mb-4 flex items-center gap-3 text-[10px] font-bold tracking-[0.22em] text-[#42baa0] uppercase">
              <span aria-hidden="true" className="h-px w-8 bg-[#42baa0]" />
              Контакти / Співпраця
            </p>
            <h2
              id="contacts-title"
              className="font-serif text-[clamp(2.5rem,6.5vw,5.6rem)] leading-[1.02] tracking-[-0.045em]"
            >
              Знайти мене
              <span className="block text-[#42baa0] italic">без гриму.</span>
            </h2>
          </div>
          <div className="lg:pb-2">
            <p className="max-w-md font-serif text-[20px] leading-8 text-[#f0dfcd] sm:text-[24px]">
              Є ідея, роль або творчий проєкт? Поговорімо.
            </p>
            <p className="mt-3 max-w-md text-[14px] leading-7 text-[#bfa99a]">
              Напиши мені напряму або зазирни за лаштунки — обирай, де нам зустрітися.
            </p>
          </div>
        </div>

        {contacts.length > 0 ? (
          <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {contacts.map((contact) => {
              const isEmail = contact.id === "email";
              return (
                <a
                  key={contact.id}
                  href={contact.url}
                  target={isEmail ? undefined : "_blank"}
                  rel={isEmail ? undefined : "noopener noreferrer"}
                  aria-label={`${contact.title}: ${contact.description}`}
                  className="group relative flex min-h-[174px] min-w-0 flex-col items-center justify-center rounded-2xl border border-[#705343]/70 bg-[#34251f]/85 p-3 text-center transition-[border-color,background-color,transform,box-shadow] duration-300 last:col-span-2 hover:-translate-y-1 hover:border-[#42baa0]/75 hover:bg-[#3b2922] hover:shadow-[0_15px_30px_rgba(0,0,0,.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#42baa0] sm:last:col-span-1"
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-2.5 right-3 text-sm text-[#c4a38a] transition-colors group-hover:text-[#42baa0]"
                  >
                    ↗
                  </span>
                  <Image
                    src={contact.icon}
                    alt=""
                    width={88}
                    height={88}
                    sizes="88px"
                    className="h-[76px] w-[76px] object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,.3)] transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="mt-2 max-w-full text-[11px] font-semibold tracking-[.12em] break-words text-[#f0dfcd] uppercase">
                    {contact.title}
                  </span>
                  <span className="mt-1 max-w-full text-[11px] leading-4 text-[#b9a292]">
                    {contact.description}
                  </span>
                </a>
              );
            })}
          </div>
        ) : (
          <p className="relative mt-8 rounded-xl border border-[#775541]/50 bg-[#2b1e19] px-5 py-6 text-sm text-[#cdb6a4]">
            Контакти незабаром з’являться. Додай їх у розділі адмінки «Контакти».
          </p>
        )}

        <div className="relative mt-9 flex flex-col justify-between gap-3 border-t border-[#896b53]/30 pt-5 text-[#ab9586] sm:flex-row sm:items-center">
          <p className="font-serif text-[15px] italic">Ролі змінюються. На зв’язку — завжди я.</p>
          <p className="text-[10px] tracking-[0.14em] uppercase">
            Слава Ніконоров · Творчий простір
          </p>
        </div>
      </div>
    </section>
  );
}
