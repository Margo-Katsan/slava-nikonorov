/**
 * Safe, intentionally small rich-text format for the «Я пишу» section.
 * Existing plain-text CreativeItem.body values remain supported.
 * No HTML is stored or rendered.
 */
export const RICH_TEXT_PREFIX = "NIKONOROV_RICH_TEXT_V1:";
export const MAX_WRITING_CHARS = 30_000;
export const MAX_WRITING_PAYLOAD = 150_000;

type Mark = { type: "bold" | "italic" };
export type RichNode = {
  type:
    | "doc"
    | "paragraph"
    | "heading"
    | "text"
    | "hardBreak"
    | "blockquote"
    | "bulletList"
    | "orderedList"
    | "listItem";
  text?: string;
  attrs?: { level?: 2 | 3; start?: number };
  marks?: Mark[];
  content?: RichNode[];
};
export type RichDoc = RichNode & { type: "doc"; content: RichNode[] };

type Stats = { count: number; length: number };
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function fail(): never {
  throw new Error("Некоректний формат тексту. Збережіть текст ще раз.");
}

function cleanNode(value: unknown, depth: number, stats: Stats): RichNode {
  if (depth > 12 || !isObject(value) || typeof value.type !== "string") fail();
  if (++stats.count > 2_000) fail();
  const type = value.type;
  if (type === "text") {
    if (typeof value.text !== "string") fail();
    stats.length += value.text.length;
    if (stats.length > MAX_WRITING_CHARS) {
      throw new Error(`Максимальна довжина тексту — ${MAX_WRITING_CHARS} символів.`);
    }
    const marks: Mark[] = [];
    if (value.marks != null) {
      if (!Array.isArray(value.marks)) fail();
      for (const mark of value.marks) {
        if (!isObject(mark) || (mark.type !== "bold" && mark.type !== "italic")) fail();
        if (!marks.some((m) => m.type === mark.type)) marks.push({ type: mark.type });
      }
    }
    return { type: "text", text: value.text, ...(marks.length ? { marks } : {}) };
  }
  if (type === "hardBreak") return { type: "hardBreak" };
  const permitted: Record<string, string[]> = {
    doc: ["paragraph", "heading", "blockquote", "bulletList", "orderedList"],
    paragraph: ["text", "hardBreak"],
    heading: ["text", "hardBreak"],
    blockquote: ["paragraph", "heading"],
    bulletList: ["listItem"],
    orderedList: ["listItem"],
    listItem: ["paragraph", "bulletList", "orderedList"],
  };
  if (!Object.prototype.hasOwnProperty.call(permitted, type)) fail();
  if (value.content != null && !Array.isArray(value.content)) fail();
  const children = ((value.content ?? []) as unknown[]).map((child) =>
    cleanNode(child, depth + 1, stats),
  );
  if (children.some((child) => !permitted[type].includes(child.type))) fail();
  const base: RichNode = {
    type: type as RichNode["type"],
    content: children,
  };
  if (type === "heading") {
    const attrs = value.attrs;
    if (!isObject(attrs) || (attrs.level !== 2 && attrs.level !== 3)) fail();
    base.attrs = { level: attrs.level };
  }
  if (type === "orderedList") {
    const start = isObject(value.attrs) ? (value.attrs.start ?? 1) : 1;
    if (
      start !== undefined &&
      (typeof start !== "number" || !Number.isInteger(start) || start < 1 || start > 10_000)
    )
      fail();
    base.attrs = { start: (start as number | undefined) ?? 1 };
  }
  return base;
}

export function normalizeRichDoc(value: unknown): RichDoc {
  const result = cleanNode(value, 0, { count: 0, length: 0 });
  if (result.type !== "doc") fail();
  return result as RichDoc;
}

function joinText(node: RichNode): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";
  const nodes = node.content ?? [];
  const separator = node.type === "paragraph" || node.type === "heading" ? "" : "\n";
  return nodes.map(joinText).join(separator);
}

export function plainTextFromStored(value: string | null | undefined): string {
  if (!value) return "";
  if (!value.startsWith(RICH_TEXT_PREFIX)) return value;
  try {
    return joinText(normalizeRichDoc(JSON.parse(value.slice(RICH_TEXT_PREFIX.length))));
  } catch {
    return "";
  }
}

export function docFromStored(value: string | null | undefined): RichDoc | null {
  if (!value?.startsWith(RICH_TEXT_PREFIX)) return null;
  try {
    return normalizeRichDoc(JSON.parse(value.slice(RICH_TEXT_PREFIX.length)));
  } catch {
    return null;
  }
}

export function editorDocFromStored(value: string | null | undefined): RichDoc {
  const rich = docFromStored(value);
  if (rich) return rich;
  if (value?.startsWith(RICH_TEXT_PREFIX))
    return { type: "doc", content: [{ type: "paragraph", content: [] }] };
  // Old plain text: blank line -> paragraph, single newline -> hard break.
  const text = value ?? "";
  const paragraphs = text.split(/\n\s*\n/g).map((p): RichNode => {
    const lines = p.split("\n");
    const children: RichNode[] = [];
    lines.forEach((line, i) => {
      if (i) children.push({ type: "hardBreak" });
      if (line) children.push({ type: "text", text: line });
    });
    return { type: "paragraph", content: children };
  });
  return {
    type: "doc",
    content: paragraphs.length ? paragraphs : [{ type: "paragraph", content: [] }],
  };
}

export function serializeRichDoc(value: unknown): string {
  return RICH_TEXT_PREFIX + JSON.stringify(normalizeRichDoc(value));
}

export function validateWritingBody(value: string): string {
  if (value.length > MAX_WRITING_PAYLOAD) {
    throw new Error("Текст занадто великий для збереження.");
  }
  let stored = value;
  if (value.startsWith(RICH_TEXT_PREFIX)) {
    try {
      stored = serializeRichDoc(JSON.parse(value.slice(RICH_TEXT_PREFIX.length)));
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Максимальна довжина")) throw error;
      fail();
    }
  } else if (value.length > MAX_WRITING_CHARS) {
    throw new Error(`Максимальна довжина тексту — ${MAX_WRITING_CHARS} символів.`);
  }
  if (!plainTextFromStored(stored).trim()) {
    throw new Error("Напиши текст перед збереженням.");
  }
  return stored;
}
