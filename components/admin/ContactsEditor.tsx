"use client";

import { useState, useTransition } from "react";

import { ArrowDown, ArrowUp, Save } from "lucide-react";
import Image from "next/image";

import { type ContactDraft, getContactDefinition } from "@/lib/contacts/config";

import { saveSiteContacts } from "@/app/admin/contacts/actions";

type Props = { initial: ContactDraft[] };

export function ContactsEditor({ initial }: Props) {
  const [rows, setRows] = useState<ContactDraft[]>(initial);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function change(index: number, patch: Partial<ContactDraft>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    setNotice("");
  }

  function move(index: number, direction: -1 | 1) {
    const other = index + direction;
    if (other < 0 || other >= rows.length) return;
    setRows((prev) => {
      const copy = [...prev];
      [copy[index], copy[other]] = [copy[other], copy[index]];
      return copy;
    });
    setNotice("");
  }

  function save() {
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        const result = await saveSiteContacts(rows);
        if (result.ok) setNotice("Контакти збережено. Зміни вже доступні на сайті.");
        else setError(result.error);
      } catch {
        setError("Не вдалося зберегти зміни. Спробуйте ще раз.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {rows.map((row, i) => {
          const def = getContactDefinition(row.id);
          return (
            <div
              key={row.id}
              className="rounded-[22px] border border-[#563e35] bg-[#291e1a] p-4 sm:p-5"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={def.icon}
                  alt=""
                  width={70}
                  height={70}
                  className="h-[60px] w-[60px] shrink-0 object-contain"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-xl text-[#f0dfcc]">{def.title}</p>
                  <p className="text-xs text-[#ad9586]">
                    {row.visible ? "Показується на сайті" : "Приховано"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Вище"
                    aria-label={`${def.title}: підняти`}
                    disabled={i === 0 || pending}
                    onClick={() => move(i, -1)}
                    className="rounded-lg border border-white/10 p-2 text-[#bdab9e] disabled:opacity-30"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    title="Нижче"
                    aria-label={`${def.title}: опустити`}
                    disabled={i === rows.length - 1 || pending}
                    onClick={() => move(i, 1)}
                    className="rounded-lg border border-white/10 p-2 text-[#bdab9e] disabled:opacity-30"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                <label className="block text-xs text-[#e3d1c0]">
                  {row.id === "email" ? "Email" : "Посилання"}
                  <input
                    type={row.id === "email" ? "text" : "url"}
                    placeholder={
                      row.id === "email"
                        ? "hello@example.com"
                        : `https://${row.id === "telegram" ? "t.me/" : row.id === "youtube" ? "youtube.com/@" : row.id + ".com/"}...`
                    }
                    value={row.url.replace(/^mailto:/, "")}
                    onChange={(e) => change(i, { url: e.target.value })}
                    maxLength={700}
                    className="mt-2 w-full rounded-xl border border-[#62483e] bg-[#1c1513] p-3 text-sm text-[#f1e2d2] outline-none focus:border-[#35ae94]"
                  />
                </label>
                <label className="block text-xs text-[#e3d1c0]">
                  Підпис
                  <input
                    value={row.description}
                    onChange={(e) => change(i, { description: e.target.value })}
                    maxLength={140}
                    className="mt-2 w-full rounded-xl border border-[#62483e] bg-[#1c1513] p-3 text-sm text-[#f1e2d2] outline-none focus:border-[#35ae94]"
                  />
                </label>
                <label className="flex min-h-[45px] cursor-pointer items-center gap-2 text-xs whitespace-nowrap text-[#dec9b7]">
                  <input
                    type="checkbox"
                    checked={row.visible}
                    onChange={(e) => change(i, { visible: e.target.checked })}
                    className="h-4 w-4 accent-[#31a88f]"
                  />{" "}
                  Показувати
                </label>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm" aria-live="polite">
          {error && (
            <p role="alert" className="text-red-300">
              {error}
            </p>
          )}
          {notice && <p className="text-[#66c4a9]">{notice}</p>}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2a9b85] px-6 py-3 text-sm font-semibold text-[#10211b] hover:bg-[#3db49c] disabled:opacity-60"
        >
          <Save size={17} />
          {pending ? "Збереження…" : "Зберегти контакти"}
        </button>
      </div>
    </div>
  );
}
