import Header from "./Header";
import Sidebar from "./Navigation";
import { Outlet } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useLocalStorage } from "../lib/useLocalStorage";

export default function LayoutAuthed() {
  const [collapsed, setCollapsed] = useLocalStorage<boolean>("scp.sidebar.collapsed", false);
  const [width, setWidth] = useLocalStorage<number>("scp.sidebar.width", 240);

  // clamp width
  const clamped = useMemo(
    () => Math.min(Math.max(width,  parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sidebar-min") || "200")), 
                   parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sidebar-max") || "320")),
    [width]
  );

  const effective = collapsed ? 64 : clamped;

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-w", `${effective}px`);
  }, [effective]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "\\") { e.preventDefault(); setCollapsed(v => !v); }
      if (e.shiftKey && (e.key === "[" || e.key === "]")) {
        e.preventDefault();
        setCollapsed(false);
        setWidth(w => Math.round((w + (e.key === "]" ? 16 : -16)) / 2) * 2);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] [grid-template-columns:var(--sidebar-w,240px)_1fr]">
      <div className="col-span-2 z-30">
        <Header />
      </div>
      <Sidebar
        width={effective}
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        onResize={(w) => { setCollapsed(false); setWidth(w); }}
      />
      <main className="p-4 sm:p-6 lg:p-8 bg-white/50">
        <Outlet />
      </main>
    </div>
  );
}
