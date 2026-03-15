export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes
    .filter((cls) => typeof cls === "string" && cls.trim())
    .join(" ");
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Auth helpers are now cookie-based (HttpOnly JWTs).
// Login state is determined server-side via /users/me/ rather than localStorage.