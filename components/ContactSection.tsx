import Image from "next/image";

const contacts = [
  {
    name: "Telegram",
    description: "Написати напряму",
    image: "/icons/social/telegram.png",
    href: "https://t.me/YOUR_USERNAME",
    external: true,
  },
  {
    name: "Instagram",
    description: "Моменти та закулісся",
    image: "/icons/social/instagram.png",
    href: "https://instagram.com/YOUR_USERNAME",
    external: true,
  },
  {
    name: "YouTube",
    description: "Відео та роботи",
    image: "/icons/social/youtube.png",
    href: "https://youtube.com/@YOUR_CHANNEL",
    external: true,
  },
  {
    name: "Email",
    description: "Для пропозицій",
    image: "/icons/social/email.png",
    href: "mailto:hello@example.com",
    external: false,
  },
  {
    name: "Facebook",
    description: "Бути на зв’язку",
    image: "/icons/social/facebook.png",
    href: "https://facebook.com/YOUR_PROFILE",
    external: true,
  },
];

export function ContactSection() {
  return (
    <section
      id="contacts"
      aria-labelledby="contacts-title"
      className="relative mx-auto w-full max-w-[1440px] scroll-mt-24 px-5 pb-20 sm:px-8 lg:px-14 lg:pb-28"
    >
      <div className="border-t border-site-border/45 pt-14 sm:pt-20">
        {/* ЗАГОЛОВОК И ОПИСАНИЕ */}
        <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end lg:gap-12">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-site-accent" />

              <p className="text-[10px] font-semibold tracking-[0.22em] text-site-accent uppercase">
                Контакти · Співпраця
              </p>
            </div>

            <h2
              id="contacts-title"
              className="font-serif text-[clamp(2.8rem,5.5vw,5.5rem)] leading-[1.02] font-normal tracking-[-0.045em] text-site-cream"
            >
              Знайти мене
              <span className="block text-site-accent italic">без гриму.</span>
            </h2>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-[420px] font-serif text-[clamp(1.15rem,1.6vw,1.45rem)] leading-[1.55] text-site-cream">
              Є ідея, роль або творчий проєкт? Поговорімо.
            </p>

            <p className="mt-3 max-w-[420px] text-[14px] leading-[1.8] text-site-muted">
              Можеш написати мені напряму або зазирнути за лаштунки — обирай, де нам зустрітися.
            </p>
          </div>
        </div>

        {/* СОЦИАЛЬНЫЕ СЕТИ */}
        <div className="mt-11 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {contacts.map((contact) => (
            <a
              key={contact.name}
              href={contact.href}
              target={contact.external ? "_blank" : undefined}
              rel={contact.external ? "noopener noreferrer" : undefined}
              aria-label={`${contact.name}: ${contact.description}`}
              className="group relative flex min-h-[174px] flex-col items-center justify-center overflow-hidden rounded-[20px] border border-site-border/60 bg-[linear-gradient(145deg,rgba(65,41,31,0.30),rgba(26,17,15,0.40))] px-3 py-5 text-center transition-all duration-300 last:col-span-2 hover:-translate-y-1 hover:border-site-accent/55 hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent sm:last:col-span-1"
            >
              {/* Подсветка при наведении */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(186,115,65,0.08),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              {/* Стрелочка */}
              <span
                aria-hidden="true"
                className="absolute top-3 right-4 text-[15px] text-site-muted/45 transition-colors group-hover:text-site-accent"
              >
                ↗
              </span>

              {/* ИКОНКА */}
              <Image
                src={contact.image}
                alt=""
                width={96}
                height={96}
                sizes="96px"
                className="relative h-[84px] w-[84px] object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.24)] transition-transform duration-300 group-hover:scale-110"
              />

              {/* Название */}
              <span className="relative mt-2 text-[12px] font-semibold tracking-[0.12em] text-site-cream uppercase">
                {contact.name}
              </span>

              {/* Подпись */}
              <span className="relative mt-1 text-[11px] text-site-muted">
                {contact.description}
              </span>

              {/* Нижняя анимированная линия */}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-site-accent transition-all duration-300 group-hover:w-1/2"
              />
            </a>
          ))}
        </div>

        {/* НИЖНЯЯ ПОДПИСЬ */}
        <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-site-border/35 pt-6">
          <p className="font-serif text-[15px] text-site-muted italic">
            Ролі змінюються. На зв’язку — завжди я.
          </p>

          <p className="text-[10px] tracking-[0.2em] text-site-muted/65 uppercase">
            Слава Ніконоров · Творчий простір
          </p>
        </div>
      </div>
    </section>
  );
}
