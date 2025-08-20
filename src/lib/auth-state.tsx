import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type User = { email: string; role: string } | null;
type AuthCtx = {
  user: User;
  login: (u: Exclude<User, null>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

const READ = (): User => {
  try {
    const blob = localStorage.getItem("scp:v1");
    if (blob) {
      const parsed = JSON.parse(blob);
      return parsed?.users?.currentUser ?? null;
    }
    const legacy = localStorage.getItem("users.currentUser");
    return legacy ? JSON.parse(legacy) : null;
  } catch { return null; }
};

const WRITE = (u: Exclude<User, null>) => {
  localStorage.setItem("scp:v1", JSON.stringify({ users: { currentUser: u } }));
  localStorage.setItem("users.currentUser", JSON.stringify(u)); // keep legacy in sync
};

const CLEAR = () => {
  localStorage.removeItem("scp:v1");
  localStorage.removeItem("users.currentUser");
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(() => READ());

  const login = useCallback((u: Exclude<User, null>) => {
    WRITE(u);
    setUser(u);
    window.dispatchEvent(new Event("auth:changed"));
  }, []);

  const logout = useCallback(() => {
    CLEAR();
    setUser(null);
    window.dispatchEvent(new Event("auth:changed"));
  }, []);

  // Sync across tabs & imperative changes
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "scp:v1" || e.key === "users.currentUser") {
        setUser(READ());
      }
    };
    const onCustom = () => setUser(READ());
    window.addEventListener("storage", onStorage);
    window.addEventListener("auth:changed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth:changed", onCustom);
    };
  }, []);

  const value = useMemo<AuthCtx>(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
