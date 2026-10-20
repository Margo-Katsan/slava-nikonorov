"use client";

import { useEffect, useState } from "react";

import { ArrowUpRight, X } from "lucide-react";

import { WritingRichText } from "@/components/WritingRichText";

import { plainTextFromStored } from "@/lib/creative/rich-text";
import { UNTITLED_CREATIVE } from "@/lib/creative/sections";

type WritingItem = {
  id: string;
  title: string;
  categoryTag: string | null;
  body: string | null;
};

type Kind = "all" | "essay" | "poem" | "other";

function kindOf(category: string | null): Exclude<Kind, "all"> {
  const text = (category ?? "").toLocaleLowerCase("uk");
  if (text === "есе" || text === "эссе") return "essay";
  if (text === "вірш" || text === "стих") return "poem";
  return "other";
}

export function WritingPublicBoard({ items }: { items: WritingItem[] }) {
  const [filter, setFilter] = useState<Kind>("all");
  const [open, setOpen] = useState<WritingItem | null>(null);
  const filtered = items.filter((item) => filter === "all" || kindOf(item.categoryTag) === filter);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="mr-3 text-[10px] font-medium tracking-[0.2em] text-site-muted uppercase">
          Категорії
        </span>
        {(
          [
            ["all", "Усі"],
            ["essay", "Есе"],
            ["poem", "Вірші"],
            ["other", "Інше"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full border px-4 py-2 text-xs transition ${value === filter ? "border-site-accent bg-site-accent text-[#11211d]" : "border-site-border/70 text-site-muted hover:border-site-accent/50"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="py-12 text-sm text-site-muted">Поки немає текстів у цій категорії.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpen(item)}
              className="group min-w-0 rounded-2xl border border-site-border/50 bg-[#281d19] p-6 text-left transition hover:border-site-accent/45 sm:p-8"
            >
              <div className="mb-8 flex items-center justify-between text-xs text-site-accent">
                <span>
                  {String(index + 1).padStart(2, "0")} · {item.categoryTag || "Текст"}
                </span>
                <ArrowUpRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </div>
              {item.title !== UNTITLED_CREATIVE && (
                <h3 className="mb-4 font-serif text-2xl text-site-cream">{item.title}</h3>
              )}
              <p className="line-clamp-5 font-serif text-lg leading-8 whitespace-pre-wrap text-site-cream italic">
                {plainTextFromStored(item.body).trim() || "Текст незабаром з’явиться."}
              </p>
              <p className="mt-6 text-[11px] font-semibold tracking-widest text-site-accent uppercase">
                Читати повністю ↗
              </p>
            </button>
          ))}
        </div>
      )}
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setOpen(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={open.title === UNTITLED_CREATIVE ? "Прочитати текст" : open.title}
            className="flex max-h-[90dvh] w-full max-w-[800px] flex-col overflow-hidden rounded-[24px] border border-site-border bg-[#241a17] text-site-cream shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-site-border/50 p-5 sm:p-7">
              <div>
                <p className="text-xs tracking-[0.18em] text-site-accent uppercase">
                  {open.categoryTag || "Текст"}
                </p>
                {open.title !== UNTITLED_CREATIVE && (
                  <h3 className="mt-3 font-serif text-3xl">{open.title}</h3>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Закрити текст"
                className="rounded-lg p-2 text-site-muted hover:bg-white/10"
              >
                <X size={22} />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-8 sm:px-10 sm:py-12">
              <WritingRichText value={open.body} isPoem={kindOf(open.categoryTag) === "poem"} />
            </div>
          </section>
        </div>
      )}
    </>
  );
}
