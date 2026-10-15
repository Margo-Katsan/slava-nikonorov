import Image from "next/image";
import Link from "next/link";

import { sections } from "@/lib/content";

export function Header() {
  return (
    <header className="site-header wrap">
      <Link
        href="/home"
        aria-label="Слава Ніконоров — головна сторінка"
        className="inline-flex shrink-0 items-center justify-center"
      >
        <Image
          src="/icons/logo.png"
          alt="СН — Слава Ніконоров"
          width={70}
          height={58}
          priority
          className="h-[52px] w-[70px] object-contain sm:h-[58px]"
        />
      </Link>

      <nav className="main-nav" aria-label="Розділи">
        {sections.map((section) => (
          <Link key={section.slug} href={`/${section.slug}`}>
            {section.title}
          </Link>
        ))}
      </nav>

      <Link className="exit-link" href="/exit" title="Вихід">
        ВИХІД ↗
      </Link>
    </header>
  );
}
