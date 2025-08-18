
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./selectors";

// Protects private routes. If not authed -> /login
export function RequireAuth() {
  const isAuth = useSelector(selectIsAuthenticated);
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}

// For public pages like /login and /register.
// If already authed -> /imports (default landing)
export function PublicOnly() {
  const isAuth = useSelector(selectIsAuthenticated);
  return isAuth ? <Navigate to="/imports" replace /> : <Outlet />;
}
