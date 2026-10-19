export function Footer() {
  return (
    <footer className="relative w-full">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="border-t border-site-border/45 pt-10 pb-6 sm:pt-12">
          {/* Верхняя часть */}
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
            {/* Логотип и имя */}
            <div className="flex items-start gap-4">
              <a
                href="/"
                aria-label="На головну"
                className="font-serif text-[34px] leading-none font-bold tracking-[-0.08em] text-site-accent transition-opacity hover:opacity-75"
              >
                СН
              </a>

              <div className="pt-1">
                <p className="font-serif text-[20px] text-site-cream">Слава Ніконоров</p>

                <p className="mt-1 text-[12px] text-site-muted">Різні образи. Один я.</p>
              </div>
            </div>

            {/* Навигация */}
            <nav
              aria-label="Навігація внизу сторінки"
              className="flex flex-wrap items-center gap-x-8 gap-y-4"
            >
              <a
                href="#bio"
                className="text-[11px] font-medium tracking-[0.15em] text-site-muted uppercase transition-colors hover:text-site-accent"
              >
                Про мене
              </a>

              <a
                href="#contacts"
                className="text-[11px] font-medium tracking-[0.15em] text-site-muted uppercase transition-colors hover:text-site-accent"
              >
                Контакти
              </a>

              <a
                href="#"
                aria-label="Повернутися нагору"
                className="group flex items-center gap-2 text-[11px] font-medium tracking-[0.15em] text-site-accent uppercase"
              >
                Нагору
                <span className="text-[17px] transition-transform duration-300 group-hover:-translate-y-1">
                  ↗
                </span>
              </a>
            </nav>
          </div>

          {/* Нижняя линия */}
          <div className="mt-10 border-t border-site-border/35 pt-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <span className="text-[11px] text-site-muted/70">
                © {new Date().getFullYear()} Слава Ніконоров. Усі права захищено.
              </span>

              <span className="font-serif text-[15px] text-site-muted/70 italic">Далі буде...</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
