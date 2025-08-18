import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type PopoverProps = {
  anchorRef: React.RefObject<HTMLElement>;
  open: boolean;
  onClose: () => void;
  align?: "left" | "right";
  children: React.ReactNode;
  panelTestId?: string;
};

export default function Popover({
  anchorRef,
  open,
  onClose,
  align = "right",
  children,
  panelTestId,
}: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ position: "fixed", top: 0, left: 0, opacity: 0 });

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const p = panelRef.current;
      const a = anchorRef.current;
      if (!p || !a) return;
      if (p.contains(e.target as Node) || a.contains(e.target as Node)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  // Position to anchor
  useLayoutEffect(() => {
    if (!open) return;
    const a = anchorRef.current;
    const p = panelRef.current;
    if (!a || !p) return;
    const r = a.getBoundingClientRect();
    const spacing = 8;
    const top = r.bottom + spacing;
    const width = p.offsetWidth;
    const left = align === "right" ? Math.max(8, r.right - width) : r.left;
    setStyle({ position: "fixed", top, left, zIndex: 60, opacity: 1 });
  }, [open, anchorRef, align]);

  if (!open) return null;
  return createPortal(
    <div
      ref={panelRef}
      data-testid={panelTestId}
      className="rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 overflow-hidden"
      style={style}
      role="menu"
    >
      {children}
    </div>,
    document.body
  );
}
