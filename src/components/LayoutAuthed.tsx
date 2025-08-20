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
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      {/* Header spans full viewport width */}
      <header className="relative z-[var(--z-header)] w-full">
        <div className="decorative-layer absolute inset-0 pointer-events-none" />
        <Header />
      </header>
      
      {/* Main content area with sticky sidebar */}
      <div className="flex min-h-[calc(100vh-5rem)]">
        <aside className="shrink-0 sticky top-0 h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)]">
          <Sidebar
            width={effective}
            collapsed={collapsed}
            onToggle={() => setCollapsed(v => !v)}
            onResize={(w) => { setCollapsed(false); setWidth(w); }}
          />
        </aside>
        <main className="flex-1 min-w-0 bg-gray-50">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
