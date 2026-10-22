"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { sections } from "@/lib/content";

const HOME_HREF = "/home";
const CONTACTS_HREF = "/home#contacts";

// «Контакти» показываем отдельной кнопкой, не дублируем в общем списке.
const navigation = sections;

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-[80] mx-auto w-full max-w-[1360px] border-x border-b border-[#805a42]/35 bg-[#241a15]/95 text-[#f0dfcd] shadow-[0_10px_26px_rgba(0,0,0,.22)] backdrop-blur-xl">
      {/* Эта ширина совпадает с Hero: контейнер строго ограничен 1360px.
          Не добавляйте сюда .wrap или w-screen: это снова растянет шапку. */}
      <div className="relative w-full min-w-0 px-4 sm:px-6 lg:px-7">
        <div className="flex h-[70px] min-w-0 items-center gap-4 sm:h-[76px]">
          <Link
            href={HOME_HREF}
            aria-label="Слава Ніконоров — головна сторінка"
            onClick={closeMenu}
            className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#35b69b]"
          >
            <span className="relative grid size-[46px] shrink-0 place-items-center rounded-md border border-[#86634c]/45 bg-[#33231c]/70 sm:size-[52px]">
              <Image
                src="/icons/logo.png"
                alt=""
                width={58}
                height={58}
                priority
                className="h-[43px] w-[43px] object-contain transition-transform duration-300 group-hover:scale-105 sm:h-[49px] sm:w-[49px]"
              />
            </span>
            <span className="min-w-0">
              <span className="block font-serif text-[17px] leading-tight tracking-[.005em] whitespace-nowrap sm:text-[20px]">
                Слава <span className="text-[#35b69b] italic">Ніконоров</span>
              </span>
              <span className="mt-0.5 block text-[8px] font-medium tracking-[.21em] text-[#b9a491] uppercase sm:text-[9px]">
                творчий простір
              </span>
            </span>
          </Link>

          <nav
            aria-label="Основна навігація"
            className="ml-auto hidden min-w-0 items-center gap-0.5 xl:flex"
          >
            {navigation.map((section) => {
              const href = `/${section.slug}`;
              const active = pathname === href;

              return (
                <Link
                  key={section.slug}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative shrink-0 rounded px-2 py-3 text-[10px] font-semibold tracking-[.04em] whitespace-nowrap uppercase transition-colors focus-visible:outline-2 focus-visible:outline-[#35b69b] 2xl:px-2.5 ${
                    active ? "text-[#35b69b]" : "text-[#d9c7b6] hover:text-[#fff4e8]"
                  }`}
                >
                  {section.title}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-2 bottom-[7px] h-px bg-[#35b69b] transition-transform duration-200 ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}

            <Link
              href={CONTACTS_HREF}
              className="ml-2 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#35b69b]/65 bg-[#17483e] px-3.5 py-2.5 text-[10px] font-semibold tracking-[.07em] text-[#e4f4ed] uppercase transition-colors hover:bg-[#206657] focus-visible:outline-2 focus-visible:outline-[#35b69b]"
            >
              Контакти <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
            <Link
              href="/exit"
              className="ml-1.5 inline-flex shrink-0 items-center gap-1 px-1.5 py-2 text-[10px] font-semibold tracking-[.06em] whitespace-nowrap text-[#bca492] uppercase transition-colors hover:text-[#f0dfcd] focus-visible:outline-2 focus-visible:outline-[#35b69b]"
            >
              Вихід <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            aria-label={isOpen ? "Закрити меню" : "Відкрити меню"}
            aria-controls="site-mobile-navigation"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((previous) => !previous)}
            className="ml-auto grid size-11 shrink-0 place-items-center rounded-lg border border-[#795a46]/70 bg-[#36261e] text-[#eddbc8] transition-colors hover:border-[#35b69b] hover:text-[#35b69b] focus-visible:outline-2 focus-visible:outline-[#35b69b] xl:hidden"
          >
            {isOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>

        {/* На мобильном меню занимает место в потоке страницы.
            Никаких absolute/fixed и перекрытия Hero или текста. */}
        {isOpen && (
          <nav
            id="site-mobile-navigation"
            aria-label="Мобільна навігація"
            className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-76px)] overflow-y-auto overscroll-contain border-x border-b border-[#805a42]/50 bg-[#241a15] px-4 pt-4 pb-5 shadow-[0_24px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:px-6 lg:px-7 xl:hidden"
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {navigation.map((section) => {
                const href = `/${section.slug}`;
                const active = pathname === href;

                return (
                  <Link
                    key={section.slug}
                    href={href}
                    onClick={closeMenu}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-12 min-w-0 items-center rounded-lg border px-3 py-2 font-serif text-sm leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-[#35b69b] ${
                      active
                        ? "border-[#35b69b]/65 bg-[#154c42]/60 text-[#ecfbf4]"
                        : "border-[#72523f]/60 bg-[#33241c] text-[#e7d3bd] hover:border-[#35b69b]/55"
                    }`}
                  >
                    <span className="break-words">{section.title}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={CONTACTS_HREF}
                onClick={closeMenu}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[#35b69b]/70 bg-[#1a5a4c] px-4 py-2.5 text-xs font-semibold tracking-[.08em] text-[#effaf4] uppercase transition-colors hover:bg-[#247362]"
              >
                Контакти <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <Link
                href="/exit"
                onClick={closeMenu}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#72523f]/70 px-4 py-2.5 text-xs text-[#d2bba5] transition-colors hover:text-white"
              >
                Вихід <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
