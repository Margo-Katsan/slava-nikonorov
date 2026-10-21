import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mx-auto w-full max-w-[1360px] overflow-hidden border-x border-t border-[#805a42]/35 bg-[#241a15] text-site-cream">
      {/* Едва заметное тёплое свечение — в стиле Hero и Header. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_7%_5%,rgba(154,97,61,0.13),transparent_44%),radial-gradient(ellipse_at_96%_100%,rgba(35,156,132,0.07),transparent_37%)]"
      />

      <div className="relative px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-8 py-9 sm:py-11 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <Link
            href="/home"
            aria-label="Слава Ніконоров — на головну сторінку"
            className="group inline-flex w-fit max-w-full items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent sm:gap-4"
          >
            <span className="flex h-[64px] w-[76px] shrink-0 items-center justify-center rounded-md border border-[#805a42]/35 bg-[#1c1511]/50 p-1 transition-colors group-hover:border-site-accent/60">
              <Image
                src="/icons/logo.png"
                alt=""
                width={70}
                height={58}
                className="h-[58px] w-[70px] object-contain"
              />
            </span>

            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-serif text-[21px] leading-tight text-site-cream transition-colors group-hover:text-site-accent sm:text-[25px]">
                Слава Ніконоров
              </span>
              <span className="text-[10px] leading-5 tracking-[0.13em] text-site-muted uppercase sm:text-[11px]">
                Актор · Режисер · Художник · Автор
              </span>
            </span>
          </Link>

          <nav
            aria-label="Навігація внизу сторінки"
            className="flex flex-wrap items-center gap-2 sm:gap-3 lg:justify-end"
          >
            <Link
              href="/home#bio"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-site-border/60 px-4 py-2 text-[11px] font-semibold tracking-[0.12em] text-site-cream uppercase transition-colors hover:border-site-accent/60 hover:text-site-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent sm:px-5"
            >
              Біографія
            </Link>

            <Link
              href="/home#contacts"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-site-accent/55 bg-site-accent/10 px-4 py-2 text-[11px] font-semibold tracking-[0.12em] text-site-cream uppercase transition-colors hover:bg-site-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent sm:px-5"
            >
              Контакти
              <ArrowUpRight aria-hidden="true" size={15} className="text-site-accent" />
            </Link>

            <a
              href="#"
              aria-label="Повернутися нагору цієї сторінки"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold tracking-[0.12em] text-site-muted uppercase transition-colors hover:text-site-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
            >
              Нагору{" "}
              <span aria-hidden="true" className="text-base">
                ↑
              </span>
            </a>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-site-border/35 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
          <p className="text-[11px] leading-5 text-site-muted/80">
            © {new Date().getFullYear()} Слава Ніконоров. Усі права захищено.
          </p>
          <p className="font-serif text-sm text-site-muted italic sm:text-[15px]">
            Різні образи. Один я. Далі буде...
          </p>
        </div>
      </div>
    </footer>
  );
}
