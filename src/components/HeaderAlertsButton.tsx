import { useRef, useState } from "react"
import Popover from "./ui/Popover"

export default function HeaderAlertsButton() {
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        ref={btnRef}
        data-testid="alerts-button"
        className="inline-flex items-center gap-2 rounded-full h-10 px-3 bg-white/15 hover:bg-white/20 backdrop-blur-sm"
        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(v => !v) }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        🔔 <span className="text-sm">Alerts</span>
        <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 text-white text-xs px-1">3</span>
      </button>

      <Popover anchor={btnRef.current} open={open} onClose={() => setOpen(false)} alignRight>
        <div data-testid="alerts-panel" className="w-full max-w-sm p-3">
          <div className="text-sm font-semibold mb-2">Recent alerts</div>
          <ul className="space-y-2">
            <li className="rounded-md p-2 bg-amber-50 ring-1 ring-amber-200">Settlement variance increased to 0.8%</li>
            <li className="rounded-md p-2 bg-emerald-50 ring-1 ring-emerald-200">Validator fixed 12 issues</li>
            <li className="rounded-md p-2 bg-sky-50 ring-1 ring-sky-200">3 CSVs imported successfully</li>
          </ul>
        </div>
      </Popover>
    </>
  )
}
