import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import Popover from "./ui/Popover"
import { clearUser } from "../app/auth"
import { clearCurrentUser } from "../features/users/actions"

export default function UserMenu() {
  const btnRef = useRef<HTMLButtonElement|null>(null)
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const loc = useLocation()

  // Close on route change
  useEffect(() => { 
    if(open) setOpen(false) 
  }, [loc.pathname])

  const go = (path: string) => { 
    setOpen(false); 
    navigate(path) 
  }

  const logout = async () => {
    setIsLoggingOut(true)
    setOpen(false)
    
    try {
      // Clear Redux state
      dispatch(clearCurrentUser())
      
      // Clear ALL known auth footprints to avoid RedirectIfAuthed loop
      clearUser()
      
      // Clear any additional storage
      localStorage.removeItem("demo:users")
      localStorage.removeItem("users")
      localStorage.removeItem("currentUser")
      sessionStorage.clear()
      
      // Simulate logout delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Navigate to login page
      navigate("/", { replace: true })
    } catch (error) {
      console.error("Logout error:", error)
      // Even if there's an error, still try to navigate to login
      navigate("/", { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <button
        ref={btnRef}
        data-testid="user-menu-button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 hover:bg-white/20 backdrop-blur-sm transition-colors"
        onPointerDown={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          setOpen(v => !v) 
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          "F"
        )}
      </button>

      <Popover anchor={btnRef.current} open={open} onClose={() => setOpen(false)} alignRight>
        <div 
          data-testid="user-menu-panel" 
          role="menu" 
          className="w-[240px] p-2 bg-white rounded-lg shadow-lg border border-slate-200"
        >
          <button 
            role="menuitem" 
            data-testid="menu-item-profile" 
            className="w-full text-left rounded-md px-3 h-9 hover:bg-slate-50 text-slate-700 transition-colors" 
            onClick={() => go("/users")}
            disabled={isLoggingOut}
          >
            Profile
          </button>
          <button 
            role="menuitem" 
            data-testid="menu-item-settings" 
            className="w-full text-left rounded-md px-3 h-9 hover:bg-slate-50 text-slate-700 transition-colors" 
            onClick={() => go("/settings")}
            disabled={isLoggingOut}
          >
            Settings
          </button>
          <div className="border-t border-slate-200 my-1"></div>
          <button 
            role="menuitem" 
            data-testid="menu-item-logout" 
            className={`w-full text-left rounded-md px-3 h-9 transition-colors ${
              isLoggingOut 
                ? 'text-slate-400 cursor-not-allowed' 
                : 'hover:bg-red-50 text-red-600 hover:text-red-700'
            }`} 
            onClick={logout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Signing out...</span>
              </div>
            ) : (
              "Sign out"
            )}
          </button>
        </div>
      </Popover>
    </>
  )
}
