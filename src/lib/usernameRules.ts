// Reserved handles: brand/impersonation + route names + system words.
// Note: "bankroller" is intentionally NOT here — the owner claims it via the
// unique constraint; once created, nobody else can take it anyway.
const RESERVED = new Set([
  "admin", "administrator", "root", "superuser", "sysadmin",
  "support", "help", "helpdesk", "contact", "info", "billing", "abuse",
  "official", "team", "staff", "mod", "mods", "moderator",
  "api", "app", "www", "mail", "system", "security", "null", "undefined",
  // route names — avoid confusion with app paths
  "feed", "dashboard", "login", "register", "profile", "tip", "tips", "u", "me", "settings",
]);

// Basic disallowed substrings. Deliberately small/conservative — not a full filter.
const BLOCKED_SUBSTRINGS = [
  "fuck", "shit", "cunt", "nigger", "faggot", "rape", "nazi", "hitler",
];

export function validateUsername(raw: string): string | null {
  const u = raw.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(u)) {
    return "Username must be 3–20 chars: letters, numbers, underscore.";
  }
  if (RESERVED.has(u)) return "That username is reserved.";
  if (BLOCKED_SUBSTRINGS.some((w) => u.includes(w))) return "That username isn't allowed.";
  return null;
}
