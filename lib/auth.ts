import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "admin_session";

function secret() {
  return process.env.ADMIN_SECRET || "";
}

// Jeton signe a partir du mot de passe admin et du secret.
export function adminToken() {
  return createHmac("sha256", secret()).update(process.env.ADMIN_PASSWORD || "").digest("hex");
}

export function isValidToken(token: string | undefined) {
  if (!token || !process.env.ADMIN_PASSWORD || !secret()) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(adminToken());
  return a.length === b.length && timingSafeEqual(a, b);
}

export function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
