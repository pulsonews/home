import { cookies } from "next/headers";
import crypto from "node:crypto";

const COOKIE_NAME = "pulso_admin";

function secret() {
  return process.env.SESSION_SECRET || "dev-secret-troque-em-producao";
}

function sign(value: string) {
  const h = crypto.createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${h}`;
}

function verify(signed: string) {
  const [value, sig] = signed.split(".");
  if (!value || !sig) return null;
  const expected = crypto.createHmac("sha256", secret()).update(value).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? value : null;
}

export function createSessionCookieValue() {
  return sign(String(Date.now()));
}

export function isAuthenticated(): boolean {
  const cookie = cookies().get(COOKIE_NAME)?.value;
  if (!cookie) return false;
  return verify(cookie) !== null;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
