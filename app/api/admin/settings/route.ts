import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  const somenteComFoto = (await database.getSetting("somente_com_foto")) === "true";
  return NextResponse.json({ somenteComFoto });
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  const { somenteComFoto } = await req.json();
  await database.setSetting("somente_com_foto", somenteComFoto ? "true" : "false");
  return NextResponse.json({ ok: true });
}
