import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  const [logoUrl, nomeSite, whatsappUrl, instagramUrl] = await Promise.all([
    database.getSetting("logo_url"),
    database.getSetting("nome_site"),
    database.getSetting("whatsapp_url"),
    database.getSetting("instagram_url")
  ]);
  return NextResponse.json({
    logoUrl: logoUrl || "",
    nomeSite: nomeSite || "",
    whatsappUrl: whatsappUrl || "",
    instagramUrl: instagramUrl || ""
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  const { logoUrl, nomeSite, whatsappUrl, instagramUrl } = await req.json().catch(() => ({}));

  if (typeof logoUrl === "string") await database.setSetting("logo_url", logoUrl.trim());
  if (typeof nomeSite === "string") await database.setSetting("nome_site", nomeSite.trim());
  if (typeof whatsappUrl === "string") await database.setSetting("whatsapp_url", whatsappUrl.trim());
  if (typeof instagramUrl === "string") await database.setSetting("instagram_url", instagramUrl.trim());

  return NextResponse.json({ ok: true });
}
