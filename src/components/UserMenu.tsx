import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// Import from the users feature
import { selectCurrentUser } from '../features/users/selectors'
import { setCurrentUser } from '../features/users/usersSlice'

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)
}

export default function UserMenu() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const [open, setOpen] = useState(false)
  const pop = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!pop.current) return
      if (!pop.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  if (!currentUser) {
    return (
      <button
        data-testid="btn-login"
        onClick={() => navigate('/users')}
        className="ml-3 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
        aria-label="Log in"
      >
        Log in
      </button>
    )
  }

  const badge = initials(currentUser.name || currentUser.email || 'U')

  return (
    <div ref={pop} className="relative ml-3" data-testid="user-menu">
      <button
        data-testid="user-menu-button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
      >
        <span
          aria-hidden
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs"
        >
          {badge}
        </span>
        <span className="hidden sm:inline">{currentUser.name || currentUser.email}</span>
        <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden>
          <path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          data-testid="user-menu-panel"
          className="absolute right-0 z-50 mt-2 w-44 rounded-md border bg-white py-1 shadow-lg text-gray-900"
        >
          <button
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            onClick={() => {
              setOpen(false)
              navigate('/users')
            }}
          >
            Switch user…
          </button>
          <button
            data-testid="btn-logout"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            onClick={() => {
              dispatch(setCurrentUser(null))
              setOpen(false)
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
