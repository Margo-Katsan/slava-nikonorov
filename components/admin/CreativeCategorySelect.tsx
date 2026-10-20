"use client";

import {
  CREATIVE_CATEGORY_OPTIONS,
  type CategorizedAdminSlug,
} from "@/lib/creative/category-groups";

type Props = {
  slug: CategorizedAdminSlug;
  defaultValue?: string | null;
};

export function CreativeCategorySelect({ slug, defaultValue }: Props) {
  const options: readonly string[] = CREATIVE_CATEGORY_OPTIONS[slug];
  const previous = defaultValue?.trim() ?? "";
  const known = options.includes(previous);

  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-medium text-[#dac6b5]">Категорія *</span>
      <select
        name="categoryTag"
        required
        defaultValue={known ? previous : ""}
        className="w-full rounded-xl border border-white/15 bg-[#1a1311] px-4 py-3 text-sm text-[#efdfcd] outline-none focus:border-[#35b69b]"
      >
        <option value="" disabled>
          Обери категорію
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {previous && !known && (
        <p className="mt-2 text-xs leading-5 text-amber-200/80">
          Раніше було: «{previous}». Обери нову категорію, щоб робота потрапила в потрібний розділ
          на сайті.
        </p>
      )}
    </label>
  );
}
