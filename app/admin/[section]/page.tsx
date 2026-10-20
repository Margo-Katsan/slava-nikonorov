import { ArrowLeft, Construction } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const sections: Record<string, string> = {
  status: "Думка на сьогодні",
  intro: "Вступна гра",
  bio: "Біографія",
  cinema: "Кіно",
  theatre: "Театр",
  "my-cinema": "Моє кіно",
  painting: "Я малюю",
  writing: "Я пишу",
  gallery: "Фотогалерея",
  contacts: "Контакти",
  settings: "Налаштування",
};

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = sections[section];

  if (!title) {
    notFound();
  }

  return (
    <div>
      <p className="text-[11px] tracking-[0.2em] text-[#278d7a] uppercase">
        Панель керування / {title}
      </p>

      <h1 className="mt-4 font-serif text-4xl text-[#eadbcc] sm:text-5xl">{title}</h1>

      <div className="mt-10 flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-white/10 bg-[#281d19] p-8 text-center">
        <Construction size={34} className="text-[#278d7a]" />

        <h2 className="mt-5 font-serif text-2xl text-[#eadbcc]">Розділ готується</h2>

        <p className="mt-3 max-w-[350px] text-sm leading-7 text-[#aa978b]">
          Тут незабаром можна буде керувати вмістом цього розділу сайту.
        </p>

        <Link
          href="/admin"
          className="mt-7 inline-flex items-center gap-2 text-sm text-[#36b097] hover:underline"
        >
          <ArrowLeft size={16} />
          До панелі керування
        </Link>
      </div>
    </div>
  );
}
