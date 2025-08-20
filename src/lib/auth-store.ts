// src/lib/auth-store.ts
import { useSyncExternalStore } from "react";

type User = { email: string; role?: string } | null;
const KEY_MAIN = "scp:v1";
const KEY_LEGACY = "users.currentUser";

function readUser(): User {
  try {
    const raw = localStorage.getItem(KEY_MAIN);
    if (raw) {
      const j = JSON.parse(raw);
      const u = j?.users?.currentUser ?? null;
      if (u) return u;
    }
  } catch {}
  try {
    const raw = localStorage.getItem(KEY_LEGACY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

let snapshot: User = readUser();
const subs = new Set<() => void>();
const emit = () => { snapshot = readUser(); subs.forEach(fn => fn()); };

export function login(user: Exclude<User,null>) {
  localStorage.setItem(KEY_MAIN, JSON.stringify({ users: { currentUser: user } }));
  localStorage.setItem(KEY_LEGACY, JSON.stringify(user));
  window.dispatchEvent(new Event("auth:changed"));
  emit();
}

export function logout() {
  localStorage.removeItem(KEY_MAIN);
  localStorage.removeItem(KEY_LEGACY);
  window.dispatchEvent(new Event("auth:changed"));
  emit();
}

function subscribe(cb: () => void) {
  subs.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key === KEY_MAIN || e.key === KEY_LEGACY) emit();
  };
  const onCustom = () => emit();
  window.addEventListener("storage", onStorage);
  window.addEventListener("auth:changed", onCustom);
  return () => {
    subs.delete(cb);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("auth:changed", onCustom);
  };
}

export function useAuthUser() {
  return useSyncExternalStore(subscribe, () => snapshot, () => null);
}
