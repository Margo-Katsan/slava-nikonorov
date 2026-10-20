import {
  BookOpen,
  Camera,
  Clapperboard,
  Film,
  FolderOpen,
  Gamepad2,
  Images,
  MessageSquareQuote,
  Palette,
  PenLine,
  Settings,
  Theater,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getMediaAdmin } from "@/lib/admin/media-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Огляд · Адмін-панель" };

const sections = [
  { slug: "cinema", label: "Кіно", key: "CINEMA", icon: Film },
  { slug: "theatre", label: "Театр", key: "THEATRE", icon: Theater },
  { slug: "my-cinema", label: "Моє кіно", key: "MY_CINEMA", icon: Clapperboard },
  { slug: "painting", label: "Я малюю", key: "PAINTING", icon: Palette },
  { slug: "writing", label: "Я пишу", key: "WRITING", icon: PenLine },
  { slug: "gallery", label: "Фотогалерея", key: "GALLERY", icon: Images },
] as const;

export default async function AdminDashboard() {
  const admin = await getMediaAdmin();
  if (!admin) redirect("/login");

  const [items, media, published, status, bio, intro, contacts] = await Promise.all([
    prisma.creativeItem.groupBy({ by: ["section"], _count: { _all: true } }),
    prisma.mediaAsset.count(),
    prisma.creativeItem.count({ where: { published: true } }),
    prisma.siteStatus.findUnique({
      where: { id: "home" },
      select: { content: true, updatedAt: true },
    }),
    prisma.bioProfile.count(),
    prisma.introGameSettings.count(),
    prisma.siteContact.count({ where: { visible: true } }),
  ]);
  const countBySection = new Map(items.map((entry) => [entry.section, entry._count._all]));
  const total = items.reduce((sum, entry) => sum + entry._count._all, 0);

  const quick = [
    { href: "/admin/status", text: "Оновити думку", icon: MessageSquareQuote },
    { href: "/admin/media", text: "Завантажити файли", icon: FolderOpen },
    { href: "/admin/intro", text: "Налаштувати гру", icon: Gamepad2 },
    { href: "/admin/bio", text: "Редагувати біографію", icon: BookOpen },
    { href: "/admin/contacts", text: "Змінити контакти", icon: Users },
    { href: "/admin/settings", text: "Безпека акаунта", icon: Settings },
  ] as const;

  return (
    <section className="space-y-9">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.22em] text-[#31a88f] uppercase">
          Панель керування / Огляд
        </p>
        <h1 className="mt-4 font-serif text-4xl text-[#efdfcd] sm:text-5xl">
          Творчий <span className="text-[#31a88f] italic">простір</span>
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#b49c8e]">
          Тут зібрано все, що можна змінювати на сайті. Увійшли як {admin.email}.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Усі роботи", number: total, icon: BookOpen },
          { label: "Опубліковано", number: published, icon: Clapperboard },
          { label: "Файли", number: media, icon: Camera },
          { label: "Активні контакти", number: contacts, icon: Users },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-[20px] border border-[#583e34] bg-[#291e1a] p-5"
            >
              <div className="flex items-center justify-between text-[#b9a295]">
                <span className="text-xs">{stat.label}</span>
                <Icon size={19} className="text-[#36a990]" />
              </div>
              <p className="mt-4 font-serif text-4xl text-[#f0dfce]">
                {stat.number.toString().padStart(2, "0")}
              </p>
            </div>
          );
        })}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-[24px] border border-[#583e34] bg-[#291e1a] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-2xl text-[#efdfcd]">Моя творчість</h2>
            <span className="text-[11px] text-[#b49c8e]">Кількість матеріалів</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.slug}
                  href={`/admin/${s.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-white/10 px-4 py-4 transition-colors hover:border-[#2d9c85] hover:bg-white/[0.03]"
                >
                  <Icon size={18} className="text-[#31a88f]" />
                  <span className="flex-1 text-sm text-[#ebd9ca]">{s.label}</span>
                  <span className="text-sm text-[#bda497]">{countBySection.get(s.key) ?? 0}</span>
                  <span className="text-xs text-[#31a88f]">↗</span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[#583e34] bg-[#291e1a] p-5 sm:p-6">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#31a88f] uppercase">
              Думка на сьогодні
            </p>
            <p className="mt-4 font-serif text-lg leading-relaxed text-[#efdfcd]">
              {status?.content ? `«${status.content}»` : "Текст поки не опубліковано."}
            </p>
            {status?.updatedAt && (
              <p className="mt-3 text-xs text-[#b49c8e]">
                Оновлено: {status.updatedAt.toLocaleDateString("uk-UA", { timeZone: "UTC" })}
              </p>
            )}
            <Link
              href="/admin/status"
              className="mt-5 inline-block text-sm text-[#49b99e] hover:underline"
            >
              Редагувати →
            </Link>
          </div>
          <div className="rounded-[24px] border border-[#583e34] bg-[#291e1a] p-5 sm:p-6">
            <h2 className="font-serif text-2xl text-[#efdfcd]">Ще налаштувати</h2>
            <p className="mt-3 text-sm leading-7 text-[#b49c8e]">
              Біографія: {bio ? "збережена" : "ще не заповнена"}. Вступна гра:{" "}
              {intro ? "налаштована" : "використовує стандартні параметри"}.
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-[24px] border border-[#583e34] bg-[#291e1a] p-5 sm:p-6">
        <h2 className="font-serif text-2xl text-[#efdfcd]">Швидкі дії</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quick.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                href={q.href}
                key={q.href}
                className="flex items-center gap-3 rounded-xl border border-[#584238] px-4 py-3 text-sm text-[#e9d7c8] hover:border-[#32a68e]"
              >
                <Icon size={18} className="text-[#32a68e]" />
                {q.text}
                <span className="ml-auto text-[#32a68e]">↗</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
