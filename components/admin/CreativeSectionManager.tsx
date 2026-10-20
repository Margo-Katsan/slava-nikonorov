"use client";

import { useEffect, useState } from "react";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { CreativeEditor } from "@/components/admin/CreativeEditor";

import { plainTextFromStored } from "@/lib/creative/rich-text";
import {
  type CreativeItemUI,
  type CreativeMedia,
  type CreativeSlug,
  UNTITLED_CREATIVE,
} from "@/lib/creative/sections";

import { deleteCreativeItem, reorderCreativeItems } from "@/app/admin/creative-actions";

type Props = {
  slug: CreativeSlug;
  initialItems: CreativeItemUI[];
  media: CreativeMedia[];
};
type Editing = CreativeItemUI | "new" | null;

function ItemRow({
  item,
  index,
  total,
  disabled,
  onEdit,
  onDelete,
  onMove,
}: {
  item: CreativeItemUI;
  index: number;
  total: number;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (delta: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

  const displayTitle =
    item.title === UNTITLED_CREATIVE
      ? plainTextFromStored(item.body).trim().slice(0, 100) || "Без назви"
      : item.title;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-[#2b201c] p-3 transition-shadow sm:p-4 ${isDragging ? "z-20 shadow-[0_18px_40px_rgba(0,0,0,0.55)] ring-2 ring-[#31a88f]" : ""}`}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        type="button"
        disabled={disabled}
        title="Перетягнути для зміни порядку"
        aria-label={`Перемістити «${item.title}»`}
        className="cursor-grab touch-none rounded-lg p-2 text-[#35b69b] hover:bg-white/10 active:cursor-grabbing disabled:opacity-50"
      >
        <GripVertical size={22} />
      </button>
      <span className="hidden w-6 shrink-0 text-center text-xs text-[#9c877b] tabular-nums sm:block">
        {String(index + 1).padStart(2, "0")}
      </span>
      {item.mediaAsset?.resourceType === "image" ? (
        // Admin thumbnails intentionally use an ordinary img; media comes from our own Cloudinary database.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.mediaAsset.url}
          alt=""
          className="h-16 w-16 shrink-0 rounded-lg bg-black/20 object-cover sm:h-20 sm:w-24"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#3d2d27] text-[#aa9687] sm:h-20 sm:w-24">
          {item.mediaAsset?.resourceType === "video" ? "▶" : "✦"}
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-serif text-base text-[#efdfcd] sm:text-lg">{displayTitle}</p>
        <p className="truncate text-xs text-[#a99487]">
          {item.categoryTag || item.subtitle || "Без підзаголовка"}
        </p>
        <span
          className={`inline-block rounded-full px-2 py-1 text-[10px] ${item.published ? "bg-[#237e6a]/15 text-[#50ceb0]" : "bg-amber-800/20 text-amber-200"}`}
        >
          {item.published ? "Опубліковано" : "Чернетка"}
        </span>
      </div>
      <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
        <button
          type="button"
          disabled={disabled || index === 0}
          onClick={() => onMove(-1)}
          title="На позицію вище"
          aria-label={`Підняти «${item.title}»`}
          className="rounded-md p-2 text-[#b8a394] hover:bg-white/10 disabled:opacity-25"
        >
          <ArrowUp size={16} />
        </button>
        <button
          type="button"
          disabled={disabled || index === total - 1}
          onClick={() => onMove(1)}
          title="На позицію нижче"
          aria-label={`Опустити «${item.title}»`}
          className="rounded-md p-2 text-[#b8a394] hover:bg-white/10 disabled:opacity-25"
        >
          <ArrowDown size={16} />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onEdit}
          title="Редагувати"
          aria-label={`Редагувати «${item.title}»`}
          className="rounded-md p-2 text-[#48bba0] hover:bg-white/10 disabled:opacity-50"
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          title="Видалити"
          aria-label={`Видалити «${item.title}»`}
          className="rounded-md p-2 text-[#d5a39a] hover:bg-red-950/30 disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export function CreativeSectionManager({ slug, initialItems, media }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<Editing>(null);
  const [ordering, setOrdering] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function persistOrder(next: CreativeItemUI[]) {
    if (ordering || deleting) return;
    const previous = items;
    if (next.every((item, index) => item.id === previous[index]?.id)) return;
    setItems(next); // optimistic reorder
    setOrdering(true);
    setError("");
    setMessage("");
    try {
      const result = await reorderCreativeItems(
        slug,
        next.map((item) => item.id),
      );
      if (!result.ok) {
        setItems(previous);
        setError(result.message);
      } else {
        setMessage(result.message);
        router.refresh();
      }
    } catch {
      setItems(previous);
      setError("Не вдалося зберегти порядок.");
    } finally {
      setOrdering(false);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || ordering) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    void persistOrder(arrayMove(items, oldIndex, newIndex));
  }

  function onMove(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    void persistOrder(arrayMove(items, index, target));
  }

  async function onDelete(item: CreativeItemUI) {
    if (!window.confirm(`Видалити «${item.title}»? Сам файл у Cloudinary залишиться.`)) return;
    setDeleting(true);
    setError("");
    try {
      const result = await deleteCreativeItem(slug, item.id);
      if (!result.ok) setError(result.message);
      else {
        setItems((current) => current.filter((x) => x.id !== item.id));
        setMessage(result.message);
        router.refresh();
      }
    } catch {
      setError("Не вдалося видалити матеріал.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm leading-6 text-[#b49c8e]">
          <strong className="text-[#eddbca]">{items.length}</strong> матеріалів · Перетягуй за{" "}
          <GripVertical className="inline-block align-text-bottom" size={18} /> або використовуй
          стрілки.
          <span className="block text-xs text-[#8f7c70]">
            Порядок після переміщення зберігається автоматично.
          </span>
        </p>
        <button
          onClick={() => {
            setError("");
            setEditing("new");
          }}
          disabled={ordering || deleting}
          className="inline-flex items-center gap-2 rounded-xl bg-[#278d7a] px-5 py-3 text-sm font-semibold text-[#102019] hover:bg-[#38a68e] disabled:opacity-50"
        >
          <Plus size={18} /> Додати матеріал
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-400/30 bg-red-950/25 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          role="status"
          className="rounded-xl border border-[#2da58e]/30 bg-[#2da58e]/10 px-4 py-3 text-sm text-[#7be0c4]"
        >
          {message}
        </p>
      )}
      {ordering && (
        <p role="status" className="text-xs text-[#35b69b]">
          Зберігаємо порядок...
        </p>
      )}
      {editing !== null && (
        <CreativeEditor
          key={editing === "new" ? "new" : editing.id}
          slug={slug}
          editing={editing}
          media={media}
          onClose={() => setEditing(null)}
          onSaved={(text) => {
            setEditing(null);
            setMessage(text);
            router.refresh();
          }}
        />
      )}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#291d19] px-6 py-16 text-center text-sm text-[#aa9388]">
          Тут поки що немає матеріалів. Створи перший!
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  total={items.length}
                  disabled={ordering || deleting}
                  onEdit={() => setEditing(item)}
                  onDelete={() => void onDelete(item)}
                  onMove={(delta) => onMove(index, delta)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
