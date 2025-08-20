// src/components/UserMenu.tsx
import { useEffect, useRef } from "react";
import Popover from "@/components/ui/Popover";
import { useNavigate } from "react-router-dom";
import { logout as authLogout } from "@/lib/auth-store";

export default function UserMenu() {
  const navigate = useNavigate();
  const logoutRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLButtonElement>(null);
  const settingsRef = useRef<HTMLButtonElement>(null);

  const doLogout = (evt?: any) => {
    evt?.preventDefault?.();
    evt?.stopPropagation?.();
    authLogout();                                // clears keys + emits
    navigate("/", { replace: true });
    setTimeout(() => { if (!location.pathname.endsWith("/")) location.replace("/"); }, 0);
  };

  const goToProfile = (evt?: any) => {
    evt?.preventDefault?.();
    evt?.stopPropagation?.();
    navigate("/users");
  };

  const goToSettings = (evt?: any) => {
    evt?.preventDefault?.();
    evt?.stopPropagation?.();
    navigate("/settings");
  };

  // Native capture listeners on the actual DOM nodes (beats any React quirks)
  useEffect(() => {
    const logoutEl = logoutRef.current;
    const profileEl = profileRef.current;
    const settingsEl = settingsRef.current;

    if (logoutEl) {
      const logoutHandler = (e: Event) => doLogout(e);
      logoutEl.addEventListener("pointerdown", logoutHandler, { capture: true });
      logoutEl.addEventListener("click", logoutHandler, { capture: true });
    }

    if (profileEl) {
      const profileHandler = (e: Event) => goToProfile(e);
      profileEl.addEventListener("pointerdown", profileHandler, { capture: true });
      profileEl.addEventListener("click", profileHandler, { capture: true });
    }

    if (settingsEl) {
      const settingsHandler = (e: Event) => goToSettings(e);
      settingsEl.addEventListener("pointerdown", settingsHandler, { capture: true });
      settingsEl.addEventListener("click", settingsHandler, { capture: true });
    }

    return () => {
      if (logoutEl) {
        const logoutHandler = (e: Event) => doLogout(e);
        logoutEl.removeEventListener("pointerdown", logoutHandler, { capture: true } as any);
        logoutEl.removeEventListener("click", logoutHandler, { capture: true } as any);
      }
      if (profileEl) {
        const profileHandler = (e: Event) => goToProfile(e);
        profileEl.removeEventListener("pointerdown", profileHandler, { capture: true } as any);
        profileEl.removeEventListener("click", profileHandler, { capture: true } as any);
      }
      if (settingsEl) {
        const settingsHandler = (e: Event) => goToSettings(e);
        settingsEl.removeEventListener("pointerdown", settingsHandler, { capture: true } as any);
        settingsEl.removeEventListener("click", settingsHandler, { capture: true } as any);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Popover
      align="end"
      button={({ ref, toggle }) => (
        <button
          ref={ref}
          data-testid="user-menu-button"
          type="button"
          aria-haspopup="menu"
          aria-expanded="false"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 hover:bg-white/20 backdrop-blur-sm"
          onClick={toggle}
        >
          F
        </button>
      )}
    >
      <div role="menu" data-testid="user-menu-panel">
        <button
          ref={profileRef}
          role="menuitem"
          data-testid="menu-item-profile"
          data-action="profile"
          type="button"
          className="w-full px-3 py-2 text-left rounded hover:bg-slate-50"
          onPointerDown={goToProfile}
          onClick={goToProfile}
        >
          Profile
        </button>
        <button
          ref={settingsRef}
          role="menuitem"
          data-testid="menu-item-settings"
          data-action="settings"
          type="button"
          className="w-full px-3 py-2 text-left rounded hover:bg-slate-50"
          onPointerDown={goToSettings}
          onClick={goToSettings}
        >
          Settings
        </button>
        <button
          ref={logoutRef}
          role="menuitem"
          data-testid="menu-item-logout"
          data-action="logout"
          type="button"
          className="w-full px-3 py-2 text-left rounded hover:bg-red-50 text-red-600"
          onPointerDown={doLogout}
          onClick={doLogout}
        >
          Logout
        </button>
      </div>
    </Popover>
  );
}
