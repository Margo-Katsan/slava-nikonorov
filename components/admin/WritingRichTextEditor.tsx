"use client";

import { type ReactNode, useMemo, useState } from "react";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Eye,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";

import { WritingRichText } from "@/components/WritingRichText";
import styles from "@/components/writing-rich-text.module.css";

import {
  MAX_WRITING_CHARS,
  RICH_TEXT_PREFIX,
  editorDocFromStored,
  plainTextFromStored,
  serializeRichDoc,
} from "@/lib/creative/rich-text";

type Props = {
  initialValue: string | null;
  isPoem: boolean;
  previewTitle: string;
  previewCategory: string;
};

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function ToolbarButton({ label, active, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active ?? false}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 transition-colors disabled:opacity-30 ${
        active
          ? "border-[#35b69b]/65 bg-[#35b69b]/20 text-[#79e1c6]"
          : "border-transparent text-[#d8c4b6] hover:border-white/10 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

export function WritingRichTextEditor({
  initialValue,
  isPoem,
  previewTitle,
  previewCategory,
}: Props) {
  // CreativeEditor is keyed by item id, so this initial content belongs to one draft.
  const initialDoc = useMemo(() => editorDocFromStored(initialValue), [initialValue]);
  const [serialized, setSerialized] = useState(() => serializeRichDoc(initialDoc));
  const [characterCount, setCharacterCount] = useState(
    () => plainTextFromStored(initialValue).length,
  );
  const [, refreshToolbar] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false,
        link: false,
        underline: false,
      }),
    ],
    content: initialDoc,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `${styles.editorArea} outline-none`,
        "aria-label": "Текст твору",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor: current }) => {
      const text = current.getText({ blockSeparator: "\n" });
      setCharacterCount(text.length);

      // Keep the full draft even when it temporarily exceeds the limit.
      // The server validates size and content before saving.
      const json = current.getJSON();
      try {
        setSerialized(serializeRichDoc(json));
      } catch {
        setSerialized(RICH_TEXT_PREFIX + JSON.stringify(json));
      }
    },
    onSelectionUpdate: () => refreshToolbar((n) => n + 1),
  });

  const tooLong = characterCount > MAX_WRITING_CHARS;
  const hasContent = useMemo(() => {
    if (tooLong) return true;
    return plainTextFromStored(serialized).trim().length > 0;
  }, [serialized, tooLong]);

  return (
    <div className="grid items-start gap-5 xl:grid-cols-2 xl:gap-6">
      {/* Editable text */}
      <div className="min-w-0 space-y-3">
        <label className="block text-xs font-medium text-[#dac6b5]" id="writing-editor-label">
          Твій текст *
        </label>
        <div className="overflow-hidden rounded-xl border border-white/15 bg-[#1a1311] focus-within:border-[#35b69b]">
          <div
            role="toolbar"
            aria-label="Форматування тексту"
            className="flex flex-wrap items-center gap-1 border-b border-white/10 p-2"
          >
            <ToolbarButton
              label="Звичайний абзац"
              active={editor?.isActive("paragraph")}
              disabled={!editor}
              onClick={() => editor?.chain().focus().setParagraph().run()}
            >
              <Pilcrow size={17} />
            </ToolbarButton>
            <ToolbarButton
              label="Заголовок другого рівня"
              active={editor?.isActive("heading", { level: 2 })}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 size={18} />
            </ToolbarButton>
            <ToolbarButton
              label="Заголовок третього рівня"
              active={editor?.isActive("heading", { level: 3 })}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 size={18} />
            </ToolbarButton>
            <span className="mx-1 h-6 w-px bg-white/10" aria-hidden="true" />
            <ToolbarButton
              label="Жирний (Ctrl+B)"
              active={editor?.isActive("bold")}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <Bold size={17} />
            </ToolbarButton>
            <ToolbarButton
              label="Курсив (Ctrl+I)"
              active={editor?.isActive("italic")}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <Italic size={17} />
            </ToolbarButton>
            <span className="mx-1 h-6 w-px bg-white/10" aria-hidden="true" />
            <ToolbarButton
              label="Маркований список"
              active={editor?.isActive("bulletList")}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <List size={17} />
            </ToolbarButton>
            <ToolbarButton
              label="Нумерований список"
              active={editor?.isActive("orderedList")}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered size={17} />
            </ToolbarButton>
            <ToolbarButton
              label="Цитата"
              active={editor?.isActive("blockquote")}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            >
              <Quote size={17} />
            </ToolbarButton>
            <span className="mx-1 h-6 w-px bg-white/10" aria-hidden="true" />
            <ToolbarButton
              label="Скасувати (Ctrl+Z)"
              disabled={!editor?.can().undo()}
              onClick={() => editor?.chain().focus().undo().run()}
            >
              <Undo2 size={17} />
            </ToolbarButton>
            <ToolbarButton
              label="Повторити (Ctrl+Y)"
              disabled={!editor?.can().redo()}
              onClick={() => editor?.chain().focus().redo().run()}
            >
              <Redo2 size={17} />
            </ToolbarButton>
          </div>
          <div className={`${styles.editor} ${isPoem ? styles.poem : ""}`}>
            <EditorContent editor={editor} aria-labelledby="writing-editor-label" />
          </div>
        </div>
        <input type="hidden" name="body" value={serialized} readOnly />
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#af998e]">
          <span>Enter — абзац · Shift+Enter — новий рядок для віршів</span>
          <span className={tooLong ? "text-red-300" : ""} aria-live="polite">
            {characterCount.toLocaleString("uk-UA")} / {MAX_WRITING_CHARS.toLocaleString("uk-UA")}
          </span>
        </div>
        {tooLong && (
          <p role="alert" className="text-xs text-red-300">
            Скороти текст перед збереженням.
          </p>
        )}
      </div>

      {/* Live preview: same renderer and styles as the public page */}
      <aside aria-label="Живий попередній перегляд твору" className="min-w-0 xl:sticky xl:top-6">
        <div className="overflow-hidden rounded-[18px] border border-[#6b5044]/60 bg-[#1d1715]">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#2b211c] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#efdfcd]">
              <Eye size={16} className="text-[#42baa0]" />
              Як виглядатиме на сайті
            </div>
            <span className="text-[10px] tracking-[0.12em] text-[#42baa0] uppercase">
              Живий перегляд
            </span>
          </div>
          <div className="max-h-[650px] min-h-[360px] overflow-y-auto bg-[radial-gradient(ellipse_at_20%_0%,rgba(84,55,43,.24),transparent_62%)] px-5 py-8 sm:px-7 sm:py-10">
            <p className="mb-7 text-[10px] font-semibold tracking-[0.22em] text-[#35b69b] uppercase">
              Слова та історії <span className="text-[#9a8475]">/</span>{" "}
              {previewCategory || "Текст"}
            </p>
            {previewTitle.trim() && (
              <h3 className="mb-6 font-serif text-3xl leading-tight break-words text-[#efdfcd] sm:text-[34px]">
                {previewTitle.trim()}
              </h3>
            )}
            {tooLong ? (
              <p className="text-sm leading-7 text-[#d4a695]">
                Текст перевищує ліміт. Скороти його, щоб повернути попередній перегляд.
              </p>
            ) : hasContent ? (
              <WritingRichText value={serialized} isPoem={isPoem} />
            ) : (
              <p className="font-serif text-lg text-[#aa9587] italic">
                Почни писати — і твій текст одразу з’явиться тут…
              </p>
            )}
          </div>
          <div className="border-t border-white/10 px-5 py-3 text-[11px] text-[#a99286]">
            Лише попередній перегляд. Публікація — після натискання «Зберегти».
          </div>
        </div>
      </aside>
    </div>
  );
}
