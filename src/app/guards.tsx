import { Navigate, Outlet, useLocation } from "react-router-dom"
import { isAuthed } from "./auth"

export function RequireAuth(){
  const loc = useLocation()
  return isAuthed()
    ? <Outlet/>
    : <Navigate to="/login" replace state={{ from: loc.pathname }} />
}

export function RedirectIfAuthed(){
  return isAuthed()
    ? <Navigate to="/dashboard" replace />
    : <Outlet/>
}
