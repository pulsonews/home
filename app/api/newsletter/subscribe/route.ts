import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({ email: null }));

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ erro: "E-mail inválido" }, { status: 400 });
  }

  await database.addSubscriber(email.toLowerCase().trim());
  return NextResponse.json({ ok: true });
}
