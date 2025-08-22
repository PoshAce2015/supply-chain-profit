import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";


type Props = {
  width: number;
  collapsed: boolean;
  onToggle: () => void;
  onResize: (w: number) => void;
};

const NAV = [
  { 
    to: "/dashboard", 
    label: "Dashboard", 
    icon: "📊", 
    testId: "nav-dashboard",
    description: "Overview and key metrics"
  },
  { 
    to: "/imports", 
    label: "Data Imports", 
    icon: "📥", 
    testId: "nav-imports",
    description: "Upload and manage data files"
  },
  { 
    to: "/calculator", 
    label: "Profit Calculator", 
    icon: "🧮", 
    testId: "nav-calculator",
    description: "Calculate margins and profits"
  },
  { 
    to: "/orders", 
    label: "Order Management", 
    icon: "📦", 
    testId: "nav-orders",
    description: "Track orders and compliance"
  },
  { 
    to: "/timeline", 
    label: "Order Timeline", 
    icon: "📅", 
    testId: "nav-timeline",
    description: "Unified view of sales and purchase events"
  },
  { 
    to: "/sla", 
    label: "SLA Monitoring", 
    icon: "⏱️", 
    testId: "nav-sla",
    description: "Service level agreements"
  },
  { 
    to: "/analytics", 
    label: "Analytics", 
    icon: "📈", 
    testId: "nav-analytics",
    description: "Performance insights and reports"
  },
  { 
    to: "/cashflow", 
    label: "Cash Flow", 
    icon: "💰", 
    testId: "nav-cashflow",
    description: "Financial projections and analysis"
  },
  { 
    to: "/reconcile", 
    label: "Settlement Reconciliation", 
    icon: "🔍", 
    testId: "nav-reconcile",
    description: "Match and verify transactions"
  },
  { 
    to: "/validator", 
    label: "Data Validation", 
    icon: "✅", 
    testId: "nav-validator",
    description: "Quality checks and validation"
  },
  { 
    to: "/users", 
    label: "User Management", 
    icon: "👥", 
    testId: "nav-users",
    description: "Manage users and permissions"
  },
  { 
    to: "/settings", 
    label: "System Settings", 
    icon: "⚙️", 
    testId: "nav-settings",
    description: "Application configuration"
  },
];

export default function Sidebar({ width, collapsed, onToggle, onResize }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    if (!dragging) return;
    const start = (window as any)._scp_startX ?? 0;
    const startW = (window as any)._scp_startW ?? width;
    const onMove = (e: MouseEvent) => {
      const next = Math.max(200, Math.min(320, startW + (e.clientX - start)));
      onResize(next);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, onResize, width]);

  const onMouseDownResizer = (e: React.MouseEvent) => {
    (window as any)._scp_startX = e.clientX;
    (window as any)._scp_startW = width;
    setDragging(true);
  };

  return (
    <aside
      ref={ref}
      data-testid="sidebar"
      data-collapsed={collapsed}
      className={`sidebar sidebar-modern relative overflow-hidden h-full flex flex-col ${dragging ? "dragging" : ""}`}
      style={{ width }}
      aria-expanded={!collapsed}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Navigation Header - Logo removed to prevent duplication with header */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-3">
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-slate-900 truncate">Navigation</h2>
              <p className="text-xs text-slate-500 truncate">Main menu</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="px-3 py-3">
        <button
          data-testid="sidebar-toggle"
          onClick={onToggle}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all duration-200 group"
          title={collapsed ? "Expand" : "Collapse"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center">
              <svg className={`w-3 h-3 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            {!collapsed && <span>Navigation</span>}
          </span>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto min-h-0">
        <ul className="space-y-1 nav-list h-full">
          {NAV.map((item, index) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                data-testid={item.testId}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  } ${
                    hoveredItem === item.to ? 'scale-105' : ''
                  }`
                }
                title={collapsed ? `${item.label} - ${item.description}` : item.description}
                onMouseEnter={() => setHoveredItem(item.to)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Active indicator - will be handled by background gradient */}
                
                {/* Icon */}
                <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center text-base transition-transform duration-200 ${
                  hoveredItem === item.to ? 'scale-110' : ''
                }`}>
                  {item.icon}
                </span>
                
                {/* Label */}
                {!collapsed && (
                  <span className="flex-1 truncate transition-all duration-200">
                    {item.label}
                  </span>
                )}
                
                {/* Hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 rounded-lg opacity-0 transition-opacity duration-200 ${
                  hoveredItem === item.to ? 'opacity-100' : ''
                }`} />
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Resize Handle */}
      {!collapsed && (
        <div
          data-testid="sidebar-resizer"
          className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:w-2 hover:bg-indigo-500/20 transition-all duration-200"
          onMouseDown={onMouseDownResizer}
          aria-label="Resize sidebar"
        />
      )}
    </aside>
  );
}
