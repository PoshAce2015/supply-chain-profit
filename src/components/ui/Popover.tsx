import { useEffect, useLayoutEffect, useState } from "react"
import { createPortal } from "react-dom"

type Props = {
  anchor: HTMLElement | null
  open: boolean
  onClose: () => void
  children: React.ReactNode
  maxWidth?: number
  alignRight?: boolean
}

export default function Popover({ anchor, open, onClose, children, maxWidth = 320, alignRight = true }: Props){
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: "hidden" })

  useLayoutEffect(()=>{
    if(!open || !anchor) return
    const place = () => {
      const r = anchor.getBoundingClientRect()
      const gap = 6
      const w = Math.min(maxWidth, Math.max(240, anchor.offsetWidth))
      let left = alignRight ? (r.right - w) : r.left
      left = Math.max(8, Math.min(left, innerWidth - w - 8)) // clamp to viewport
      const top = Math.min(r.bottom + gap, innerHeight - 8)
      setStyle({ top, left, width: w, visibility: "visible" })
    }
    place()
    const onR = () => place()
    addEventListener("scroll", onR, true)
    addEventListener("resize", onR)
    return () => {
      removeEventListener("scroll", onR, true)
      removeEventListener("resize", onR)
    }
  }, [open, anchor, maxWidth, alignRight])

  useEffect(()=>{
    if(!open) return
    const onDown = (e: Event) => {
      const t = e.target as Node
      if (anchor && (t === anchor || anchor.contains(t))) return
      const panel = document.querySelector('[data-popover-panel="true"]')
      if (panel && panel.contains(t)) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => { if(e.key === "Escape") onClose() }
    document.addEventListener("pointerdown", onDown, true)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown, true)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onClose, anchor])

  if(!open) return null
  return createPortal(
    <div className="popover-panel rounded-xl bg-white/95 ring-1 ring-black/10 backdrop-blur"
         style={style}
         data-popover-panel="true"
         role="dialog">
      {children}
    </div>,
    document.body
  )
}
