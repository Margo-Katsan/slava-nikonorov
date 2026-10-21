"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

import Image from "next/image";

type View = { scale: number; x: number; y: number };
type Point = { x: number; y: number };
type Pinch = {
  distance: number;
  center: Point;
  scale: number;
  offset: Point;
};

const INITIAL: View = { scale: 1, x: 0, y: 0 };
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

function limit(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function center(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Photo fits fully into the viewport at 1x. When zoomed, limit panning to the
 * actual painted image (not the transparent area of the object-contain box).
 */
function boundedView(
  view: View,
  viewport: HTMLElement | null,
  naturalSize: { width: number; height: number },
): View {
  const scale = limit(view.scale, MIN_ZOOM, MAX_ZOOM);
  if (!viewport || !naturalSize.width || !naturalSize.height) {
    return { scale, x: 0, y: 0 };
  }

  const w = viewport.clientWidth;
  const h = viewport.clientHeight;
  if (!w || !h) return { scale, x: 0, y: 0 };

  const fit = Math.min(w / naturalSize.width, h / naturalSize.height);
  const photoWidth = naturalSize.width * fit;
  const photoHeight = naturalSize.height * fit;
  const maxX = Math.max(0, (photoWidth * scale - w) / 2);
  const maxY = Math.max(0, (photoHeight * scale - h) / 2);

  return {
    scale,
    x: limit(view.x, -maxX, maxX),
    y: limit(view.y, -maxY, maxY),
  };
}

export type ZoomablePhotoProps = {
  /** Image URL from the same source you already use in the photo lightbox. */
  src: string;
  alt: string;
  /** Parent must have an explicit height. Example: h-[65dvh]. */
  className?: string;
  /** Optional: change this to force zoom reset for the next slide. */
  resetKey?: string | number;
  /** Receives live scale updates for toolbar controls in the modal frame. */
  onScaleChange?: (scale: number) => void;
};

export type ZoomablePhotoHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
};

/**
 * Drop-in image area for an existing gallery modal. Does not replace the
 * modal, its close button, or its previous/next navigation.
 */
export const ZoomablePhoto = forwardRef<ZoomablePhotoHandle, ZoomablePhotoProps>(
  function ZoomablePhoto({ src, alt, className = "", resetKey, onScaleChange }, ref) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const naturalSizeRef = useRef({ width: 0, height: 0 });
    const viewRef = useRef<View>(INITIAL);
    const [view, setView] = useState<View>(INITIAL);
    const [dragging, setDragging] = useState(false);

    const pointersRef = useRef(new Map<number, Point>());
    const pointerStartsRef = useRef(new Map<number, Point>());
    const dragRef = useRef<{ start: Point; view: View } | null>(null);
    const pinchRef = useRef<Pinch | null>(null);
    const lastTapRef = useRef<{ at: number; point: Point } | null>(null);
    const lastTouchZoomRef = useRef(0);

    const applyView = useCallback(
      (next: View) => {
        const bounded = boundedView(next, viewportRef.current, naturalSizeRef.current);
        viewRef.current = bounded;
        setView(bounded);
        onScaleChange?.(bounded.scale);
      },
      [onScaleChange],
    );

    const zoomAt = useCallback(
      (newScale: number, clientPoint?: Point) => {
        const previous = viewRef.current;
        const scale = limit(newScale, MIN_ZOOM, MAX_ZOOM);
        const rect = viewportRef.current?.getBoundingClientRect();
        const anchor =
          clientPoint && rect
            ? {
                x: clientPoint.x - rect.left - rect.width / 2,
                y: clientPoint.y - rect.top - rect.height / 2,
              }
            : { x: 0, y: 0 };

        const factor = scale / previous.scale;
        applyView({
          scale,
          x: previous.x * factor + (1 - factor) * anchor.x,
          y: previous.y * factor + (1 - factor) * anchor.y,
        });
      },
      [applyView],
    );

    const toggleAt = useCallback(
      (point: Point) => zoomAt(viewRef.current.scale > 1.05 ? 1 : 2.5, point),
      [zoomAt],
    );

    // Frame controls call these methods; the toolbar is intentionally NOT
    // placed inside the image viewport so it never covers portraits.
    useImperativeHandle(
      ref,
      () => ({
        zoomIn: () => zoomAt(viewRef.current.scale + 0.5),
        zoomOut: () => zoomAt(viewRef.current.scale - 0.5),
        reset: () => applyView(INITIAL),
      }),
      [zoomAt, applyView],
    );

    // A new slide always starts fully visible, not with the previous slide's zoom.
    useEffect(() => {
      naturalSizeRef.current = { width: 0, height: 0 };
      viewRef.current = INITIAL;
      setView(INITIAL);
      onScaleChange?.(1);
      pointersRef.current.clear();
      pointerStartsRef.current.clear();
      pinchRef.current = null;
      dragRef.current = null;
      setDragging(false);
    }, [src, resetKey, onScaleChange]);

    // Reapply the pan bounds when the modal changes size or the phone rotates.
    useEffect(() => {
      const element = viewportRef.current;
      if (!element) return;
      const resizeObserver = new ResizeObserver(() => applyView(viewRef.current));
      resizeObserver.observe(element);
      return () => resizeObserver.disconnect();
    }, [applyView]);

    // Native listener is intentionally non-passive so the page doesn't scroll
    // while the cursor is zooming the photo with the mouse wheel / trackpad.
    useEffect(() => {
      const element = viewportRef.current;
      if (!element) return;
      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const factor = Math.exp(-event.deltaY * 0.0015);
        zoomAt(viewRef.current.scale * factor, { x: event.clientX, y: event.clientY });
      };
      element.addEventListener("wheel", onWheel, { passive: false });
      return () => element.removeEventListener("wheel", onWheel);
    }, [zoomAt]);

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      viewportRef.current?.setPointerCapture(event.pointerId);

      const point = { x: event.clientX, y: event.clientY };
      pointersRef.current.set(event.pointerId, point);
      pointerStartsRef.current.set(event.pointerId, point);

      const points = [...pointersRef.current.values()];
      if (points.length === 1) {
        dragRef.current = { start: point, view: viewRef.current };
        pinchRef.current = null;
        setDragging(viewRef.current.scale > 1);
      } else if (points.length === 2) {
        pinchRef.current = {
          distance: Math.max(1, distance(points[0], points[1])),
          center: center(points[0], points[1]),
          scale: viewRef.current.scale,
          offset: { x: viewRef.current.x, y: viewRef.current.y },
        };
        dragRef.current = null;
        setDragging(true);
      }
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!pointersRef.current.has(event.pointerId)) return;
      const point = { x: event.clientX, y: event.clientY };
      pointersRef.current.set(event.pointerId, point);

      const points = [...pointersRef.current.values()];
      if (points.length === 2 && pinchRef.current) {
        const pinch = pinchRef.current;
        const newCenter = center(points[0], points[1]);
        const newScale = limit(
          (pinch.scale * distance(points[0], points[1])) / pinch.distance,
          MIN_ZOOM,
          MAX_ZOOM,
        );
        const ratio = newScale / pinch.scale;
        const rect = viewportRef.current?.getBoundingClientRect();
        if (!rect) return;

        const anchorX = pinch.center.x - rect.left - rect.width / 2;
        const anchorY = pinch.center.y - rect.top - rect.height / 2;
        applyView({
          scale: newScale,
          x: pinch.offset.x * ratio + (1 - ratio) * anchorX + newCenter.x - pinch.center.x,
          y: pinch.offset.y * ratio + (1 - ratio) * anchorY + newCenter.y - pinch.center.y,
        });
      } else if (points.length === 1 && dragRef.current && viewRef.current.scale > 1) {
        const drag = dragRef.current;
        applyView({
          scale: viewRef.current.scale,
          x: drag.view.x + point.x - drag.start.x,
          y: drag.view.y + point.y - drag.start.y,
        });
      }
    };

    const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!pointersRef.current.has(event.pointerId)) return;
      const start = pointerStartsRef.current.get(event.pointerId);
      const wasSinglePointer = pointersRef.current.size === 1;

      pointersRef.current.delete(event.pointerId);
      pointerStartsRef.current.delete(event.pointerId);

      if (
        event.type === "pointerup" &&
        event.pointerType === "touch" &&
        wasSinglePointer &&
        start &&
        distance(start, { x: event.clientX, y: event.clientY }) < 12
      ) {
        const now = Date.now();
        const point = { x: event.clientX, y: event.clientY };
        const lastTap = lastTapRef.current;
        if (lastTap && now - lastTap.at < 350 && distance(lastTap.point, point) < 35) {
          toggleAt(point);
          lastTouchZoomRef.current = now;
          lastTapRef.current = null;
        } else {
          lastTapRef.current = { at: now, point };
        }
      }

      const remaining = [...pointersRef.current.values()];
      pinchRef.current = null;
      dragRef.current =
        remaining.length === 1 ? { start: remaining[0], view: viewRef.current } : null;
      setDragging(remaining.length > 0 && viewRef.current.scale > 1);
    };

    const handleDoubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
      // Some touch browsers synthesize dblclick after our explicit double-tap.
      if (Date.now() - lastTouchZoomRef.current < 500) return;
      toggleAt({ x: event.clientX, y: event.clientY });
    };

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomAt(viewRef.current.scale + 0.5);
      } else if (event.key === "-") {
        event.preventDefault();
        zoomAt(viewRef.current.scale - 0.5);
      } else if (event.key === "0") {
        event.preventDefault();
        applyView(INITIAL);
      }
      // Escape and arrow keys deliberately remain under the existing lightbox's control.
    };

    return (
      <div
        ref={viewportRef}
        tabIndex={0}
        aria-label="Фотографія. Масштаб: кнопки плюс і мінус, подвійне натискання або жест двома пальцями."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        className={`focus-visible:outline-inset relative h-full w-full overflow-hidden bg-[#110c0a] outline-none select-none focus-visible:outline-2 focus-visible:outline-[#35b69b] ${className}`}
        style={{
          touchAction: "none",
          cursor: view.scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
        }}
      >
        <div
          className={`pointer-events-none absolute inset-0 origin-center ${dragging ? "" : "motion-safe:transition-transform motion-safe:duration-150"}`}
          style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})` }}
        >
          <Image
            key={src}
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 1100px"
            draggable={false}
            className="object-contain"
            onLoad={(event) => {
              const image = event.currentTarget;
              naturalSizeRef.current = {
                width: image.naturalWidth,
                height: image.naturalHeight,
              };
              applyView(viewRef.current);
            }}
          />
        </div>
      </div>
    );
  },
);
