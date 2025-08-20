// src/components/ui/Popover.tsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  button: (p:{ref: React.RefObject<HTMLButtonElement>, toggle: ()=>void}) => React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
};

const Z_OVERLAY = 9999;
const Z_PANEL   = 10000;

export default function Popover({ button, children, align="end" }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggle = () => setOpen(v => !v);

  useLayoutEffect(() => {
    if (!open || !btnRef.current || !panelRef.current) return;
    const br = btnRef.current.getBoundingClientRect();
    const panel = panelRef.current;
    const pad = 8;
    const leftBase = align === "end" ? br.right - panel.offsetWidth : br.left;
    const left = Math.max(pad, Math.min(leftBase, window.innerWidth - panel.offsetWidth - pad));
    const top  = Math.max(pad, Math.min(br.bottom + pad, window.innerHeight - panel.offsetHeight - pad));
    panel.style.left = `${left}px`;
    panel.style.top  = `${top}px`;
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {button({ ref: btnRef, toggle })}
      {open && createPortal(
        <>
          <div
            data-testid="popover-overlay"
            style={{ position: "fixed", inset: 0, zIndex: Z_OVERLAY, background: "transparent" }}
            onPointerDown={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            data-testid="popover-panel"
            style={{
              position: "fixed",
              zIndex: Z_PANEL,
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 20px 40px rgba(0,0,0,.12)",
              maxHeight: "80vh",
              overflow: "auto",
              minWidth: 224,
              padding: 8
            }}
            onPointerDownCapture={(e) => e.stopPropagation()}
            onClickCapture={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
