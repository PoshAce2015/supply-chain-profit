import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthUser } from "@/lib/auth-store";

export function RequireAuth() {
  const user = useAuthUser();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <Outlet />;
}

export function RedirectIfAuthed() {
  const user = useAuthUser();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
