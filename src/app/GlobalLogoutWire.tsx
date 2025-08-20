import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout as authLogout } from "@/lib/auth-store";

export default function GlobalLogoutWire() {
  const navigate = useNavigate();
  useEffect(() => {
    const on = (e: Event) => {
      const t = e.target as HTMLElement | null;
      
      // Handle logout
      const logoutBtn = t?.closest?.('[data-action="logout"]') as HTMLElement | null;
      if (logoutBtn) {
        e.preventDefault();
        e.stopPropagation();
        authLogout();
        navigate("/login", { replace: true });
        setTimeout(() => { if (!location.pathname.endsWith("/login")) location.replace("/login"); }, 0);
        return;
      }

      // Handle profile navigation
      const profileBtn = t?.closest?.('[data-action="profile"]') as HTMLElement | null;
      if (profileBtn) {
        e.preventDefault();
        e.stopPropagation();
        navigate("/users");
        return;
      }

      // Handle settings navigation
      const settingsBtn = t?.closest?.('[data-action="settings"]') as HTMLElement | null;
      if (settingsBtn) {
        e.preventDefault();
        e.stopPropagation();
        navigate("/settings");
        return;
      }
    };
    document.addEventListener("pointerdown", on, true);
    document.addEventListener("click", on, true);
    return () => {
      document.removeEventListener("pointerdown", on, true);
      document.removeEventListener("click", on, true);
    };
  }, [navigate]);
  return null;
}
