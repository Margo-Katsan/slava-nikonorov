"use client";

import { useActionState, useState } from "react";

import { type StatusActionState, saveSiteStatus } from "@/app/admin/status/actions";

const initialState: StatusActionState = { ok: false, message: "" };

export function StatusEditor({ initialContent }: { initialContent: string }) {
  const [draft, setDraft] = useState(initialContent);
  const [state, formAction, pending] = useActionState(saveSiteStatus, initialState);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
      <form
        action={formAction}
        className="rounded-[24px] border border-white/10 bg-[#291e1a] p-6 sm:p-8"
      >
        <label htmlFor="site-status" className="block font-serif text-2xl text-[#efdfcd]">
          Текст на головній
        </label>
        <p className="mt-2 text-sm leading-6 text-[#aa9488]">
          Напиши думку, жарт або невелику історію. Після збереження вона з’явиться на сайті.
        </p>
        <textarea
          id="site-status"
          name="content"
          required
          maxLength={500}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={7}
          placeholder="Сьогодні я знову граю самого себе..."
          className="mt-6 w-full resize-y rounded-2xl border border-[#6c5145] bg-[#1e1614] px-5 py-4 text-base leading-7 text-[#efdfcd] transition outline-none focus:border-[#2ca48c] focus:ring-2 focus:ring-[#2ca48c]/20"
        />
        <div className="mt-2 flex justify-end text-xs text-[#9d887b]">{draft.length} / 500</div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={pending || draft.trim().length === 0}
            className="rounded-full bg-[#278d7a] px-7 py-3 text-sm font-semibold text-[#161310] transition hover:bg-[#36b29b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Зберігаємо..." : "Зберегти та опублікувати"}
          </button>
          <p
            role="status"
            aria-live="polite"
            className={state.ok ? "text-sm text-[#71d7ba]" : "text-sm text-[#e9b4a7]"}
          >
            {state.message}
          </p>
        </div>
      </form>

      <aside className="self-start rounded-[24px] border border-[#694d3f]/65 bg-[#241a17] p-6 sm:p-8">
        <span className="text-[10px] font-semibold tracking-[0.22em] text-[#31a88f] uppercase">
          Попередній перегляд
        </span>
        <div className="mt-6 h-px w-12 bg-[#31a88f]" />
        <h2 className="mt-5 font-serif text-2xl text-[#efdfcd]">Думка на сьогодні</h2>
        <p className="mt-5 font-serif text-xl leading-[1.6] break-words whitespace-pre-wrap text-[#efdfcd] italic">
          «{draft.trim() || "Тут з’явиться твоя думка..."}»
        </p>
        <p className="mt-8 text-xs text-[#a18d80]">
          Це попередній перегляд. Публікація відбудеться після натискання кнопки збереження.
        </p>
      </aside>
    </div>
  );
}
