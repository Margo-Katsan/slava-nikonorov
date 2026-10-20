"use client";

import { useState } from "react";

import { createAuthClient } from "better-auth/react";
import {
  ArrowUpRight,
  Clapperboard,
  Drama,
  Film,
  FolderOpen,
  Gamepad2,
  House,
  Images,
  LayoutDashboard,
  Link2,
  LogOut,
  type LucideIcon,
  Menu,
  MessageSquareQuote,
  Palette,
  PenLine,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const authClient = createAuthClient();

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const navGroups: {
  title: string;
  items: NavItem[];
}[] = [
  {
    title: "Панель керування",
    items: [
      {
        title: "Огляд",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Головна сторінка",
    items: [
      {
        title: "Думка на сьогодні",
        href: "/admin/status",
        icon: MessageSquareQuote,
      },
      {
        title: "Вступна гра",
        href: "/admin/intro",
        icon: Gamepad2,
      },
      {
        title: "Біографія",
        href: "/admin/bio",
        icon: UserRound,
      },
    ],
  },
  {
    title: "Моя творчість",
    items: [
      {
        title: "Кіно",
        href: "/admin/cinema",
        icon: Film,
      },
      {
        title: "Театр",
        href: "/admin/theatre",
        icon: Drama,
      },
      {
        title: "Моє кіно",
        href: "/admin/my-cinema",
        icon: Clapperboard,
      },
      {
        title: "Я малюю",
        href: "/admin/painting",
        icon: Palette,
      },
      {
        title: "Я пишу",
        href: "/admin/writing",
        icon: PenLine,
      },
      {
        title: "Фотогалерея",
        href: "/admin/gallery",
        icon: Images,
      },
      {
        title: "Медіатека",
        href: "/admin/media",
        icon: FolderOpen,
      },
    ],
  },
  {
    title: "Система",
    items: [
      {
        title: "Контакти",
        href: "/admin/contacts",
        icon: Link2,
      },
      {
        title: "Налаштування",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

type Props = {
  email?: string;
};

export function AdminSidebar({ email }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    setSigningOut(true);
    setError("");

    try {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error("Не вдалося вийти");
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError("Помилка виходу. Спробуйте ще раз.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      {/* Кнопка меню на мобильном */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Відкрити меню"
        aria-expanded={open}
        aria-controls="admin-sidebar"
        className="fixed top-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#2b201c] text-[#eadbcc] lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Затемнение при открытии */}
      {open && (
        <button
          type="button"
          aria-label="Закрити меню"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
        />
      )}

      {/* Боковая панель */}
      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-white/10 bg-[#241a17] shadow-[16px_0_50px_rgba(0,0,0,0.12)] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } `}
      >
        {/* Шапка */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-6">
          <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#278d7a]/30 bg-[#278d7a]/10">
              <span className="font-serif text-xl font-bold text-[#2da58e]">СН</span>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-[#eadbcc] uppercase">
                Адмін-панель
              </p>

              <p className="mt-1 text-[11px] text-[#9c877b]">Слава Ніконоров</p>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Закрити меню"
            onClick={() => setOpen(false)}
            className="text-[#a89287] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Навигация */}
        <nav
          aria-label="Адміністративне меню"
          className="min-h-0 flex-1 space-y-7 overflow-y-auto px-3 py-6"
        >
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.18em] text-[#288e7b] uppercase">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#35b59a] ${
                        active
                          ? "bg-[#278d7a]/15 font-medium text-[#eadbcc]"
                          : "text-[#b6a296] hover:bg-white/[0.05] hover:text-[#eadbcc]"
                      } `}
                    >
                      {active && (
                        <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[#2da58e]" />
                      )}

                      <Icon
                        size={18}
                        strokeWidth={1.7}
                        className={
                          active ? "text-[#31ae94]" : "text-[#958175] group-hover:text-[#31ae94]"
                        }
                      />

                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Нижняя часть */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <Link
            href="/"
            className="mb-4 flex items-center justify-between rounded-xl px-3 py-3 text-[12px] text-[#b6a296] transition-colors hover:bg-white/[0.05] hover:text-[#eadbcc]"
          >
            <span className="flex items-center gap-3">
              <House size={17} />
              Перейти на сайт
            </span>

            <ArrowUpRight size={15} />
          </Link>

          <div className="rounded-xl border border-white/[0.07] bg-black/10 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#278d7a]/15 font-serif text-[#31ae94]">
                С
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-[#eadbcc]">Адміністратор</p>

                <p className="truncate text-[11px] text-[#998579]">{email ?? "Слава Ніконоров"}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-[12px] text-[#bba79a] transition-colors hover:border-red-400/30 hover:text-red-300 disabled:opacity-50"
            >
              <LogOut size={15} />
              {signingOut ? "Вихід..." : "Вийти"}
            </button>

            {error && (
              <p role="alert" className="mt-2 text-xs text-red-300">
                {error}
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
