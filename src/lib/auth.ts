// src/lib/auth.ts
const KEY = "scp:v1";

type CurrentUser = { email: string; role?: string } | null;
type Payload = { users?: { currentUser?: CurrentUser } };

export function getCurrentUser(): CurrentUser {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: Payload = JSON.parse(raw);
    return parsed?.users?.currentUser ?? null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: CurrentUser) {
  const payload: Payload = { users: { currentUser: user } };
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function clearAuth() {
  // Clear canonical key and any legacy keys we've seen in tests
  localStorage.removeItem(KEY);
  localStorage.removeItem("users.currentUser");
}
