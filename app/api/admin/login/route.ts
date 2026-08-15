import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createSessionCookieValue } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { senha } = await req.json().catch(() => ({ senha: "" }));
  const senhaCorreta = process.env.ADMIN_PASSWORD || "admin";

  if (senha !== senhaCorreta) {
    return NextResponse.json({ erro: "Senha incorreta" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, createSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8
  });
  return res;
}
