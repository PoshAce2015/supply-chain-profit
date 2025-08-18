export type DemoRole = "ops" | "finance";

export const DEMO_USERS = {
  ops:    { email: "ops@demo.co",     password: "demo123", role: "ops" as DemoRole,    name: "Operations" },
  finance:{ email: "finance@demo.co", password: "demo123", role: "finance" as DemoRole, name: "Finance" },
};

export function matchDemoUser(email: string, password: string) {
  const norm = (x: string) => x.trim().toLowerCase();
  const e = norm(email);
  const p = password;
  for (const key of Object.keys(DEMO_USERS) as (keyof typeof DEMO_USERS)[]) {
    const u = DEMO_USERS[key];
    if (norm(u.email) === e && u.password === p) return u;
  }
  return null;
}
