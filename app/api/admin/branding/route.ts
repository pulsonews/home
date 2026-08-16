import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  const [logoUrl, nomeSite] = await Promise.all([
    database.getSetting("logo_url"),
    database.getSetting("nome_site")
  ]);
  return NextResponse.json({ logoUrl: logoUrl || "", nomeSite: nomeSite || "" });
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  const { logoUrl, nomeSite } = await req.json().catch(() => ({}));

  if (typeof logoUrl === "string") {
    await database.setSetting("logo_url", logoUrl.trim());
  }
  if (typeof nomeSite === "string") {
    await database.setSetting("nome_site", nomeSite.trim());
  }

  return NextResponse.json({ ok: true });
}
