import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../features/users/selectors";

/** Renders children only when NOT authenticated; otherwise redirects to /imports */
export default function PublicOnly({ children }: { children: React.ReactNode }) {
  const isAuth = useSelector(selectIsAuthenticated);
  if (isAuth) return <Navigate to="/imports" replace />;
  return <>{children}</>;
}
