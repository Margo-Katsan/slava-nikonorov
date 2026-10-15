"use client";

import { useEffect, useState } from "react";

const KEY = "nikonorov:dailyQuote";

const initial = "Людина — найдивовижніша історія. Кожен день — нова роль.";

export function DailyQuote() {
  const [value, setValue] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);

      if (saved) {
        setValue(saved);
        setDraft(saved);
      }
    } catch {}
  }, []);

  function save() {
    const next = draft.trim() || initial;

    try {
      localStorage.setItem(KEY, next);
    } catch {}

    setValue(next);
    setEditing(false);
  }

  return (
    <aside className="quote-sketch">
      {/* Нарисованная рамка */}

      <svg
        className="quote-frame-lines"
        viewBox="0 0 440 150"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Верхние штрихи */}
        <path d="M 25 15 L 450 11" />
        <path d="M 12 22 L 430 18" />

        {/* Нижние штрихи */}
        <path d="M -10 141 L 452 135" />
        <path d="M 5 147 L 438 142" />

        {/* Левая сторона */}
        <path d="M 35 -8 L -8 160" />
        <path d="M 42 -2 L 5 151" />

        {/* Правая сторона */}
        <path d="M 407 -5 L 424 160" />
        <path d="M 418 -5 L 434 154" />
      </svg>

      <div className="quote-top">
        <span>НАСТРІЙ СЬОГОДНІ</span>

        <button
          type="button"
          onClick={() => {
            setDraft(value);
            setEditing(!editing);
          }}
        >
          {editing ? "СКАСУВАТИ" : "✎ ЗМІНИТИ"}
        </button>
      </div>

      {editing ? (
        <div className="quote-edit">
          <textarea
            aria-label="Текст цитати"
            value={draft}
            maxLength={240}
            onChange={(e) => setDraft(e.target.value)}
          />

          <button type="button" className="tiny-button" onClick={save}>
            ЗБЕРЕГТИ
          </button>
        </div>
      ) : (
        <p>«{value}»</p>
      )}
    </aside>
  );
}
