import { Fragment, type ReactNode, createElement } from "react";

import styles from "./writing-rich-text.module.css";

import { type RichNode, docFromStored } from "@/lib/creative/rich-text";

// Structured JSON -> explicit React elements. No dangerouslySetInnerHTML.
function renderNode(node: RichNode, key: string): ReactNode {
  if (node.type === "text") {
    let content: ReactNode = node.text ?? "";
    for (const mark of node.marks ?? []) {
      content = createElement(
        mark.type === "bold" ? "strong" : "em",
        { key: `${key}-${mark.type}` },
        content,
      );
    }
    return createElement(Fragment, { key }, content);
  }
  if (node.type === "hardBreak") return createElement("br", { key });

  const children = (node.content ?? []).map((child, i) => renderNode(child, `${key}.${i}`));
  switch (node.type) {
    case "doc":
      return createElement(Fragment, { key }, ...children);
    case "paragraph":
      return createElement("p", { key }, ...children);
    case "heading":
      return createElement(node.attrs?.level === 3 ? "h3" : "h2", { key }, ...children);
    case "blockquote":
      return createElement("blockquote", { key }, ...children);
    case "bulletList":
      return createElement("ul", { key }, ...children);
    case "orderedList":
      return createElement("ol", { key, start: node.attrs?.start ?? 1 }, ...children);
    case "listItem":
      return createElement("li", { key }, ...children);
    default:
      return null;
  }
}

export function WritingRichText({
  value,
  isPoem = false,
}: {
  value: string | null;
  isPoem?: boolean;
}) {
  const doc = docFromStored(value);
  return (
    <div className={`${styles.article} ${isPoem ? styles.poem : ""}`}>
      {doc ? (
        renderNode(doc, "root")
      ) : (
        <p className="whitespace-pre-wrap">
          {value?.startsWith("NIKONOROV_RICH_TEXT_V1:") ? "" : value}
        </p>
      )}
    </div>
  );
}
