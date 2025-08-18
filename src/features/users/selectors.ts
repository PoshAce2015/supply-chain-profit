// Minimal, backward-compatible selectors.
// Works whether state keeps `users.current` or `users.currentUser`
// and whether the user is a string ("ops@local") or object ({ email, role }).

export const selectCurrentUser = (s: any) =>
  s?.users?.current ?? s?.users?.currentUser ?? null;

export const selectIsAuthenticated = (s: any) => {
  const u = selectCurrentUser(s);
  return !!(u && (typeof u === "string" ? u : u.email));
};
