import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { bannerId } = await req.json().catch(() => ({}));
  if (!bannerId || typeof bannerId !== "string") {
    return NextResponse.json({ erro: "bannerId é obrigatório" }, { status: 400 });
  }
  try {
    await database.incrementarImpressaoBanner(bannerId);
  } catch {
    // Nunca deixa o tracking quebrar a navegação do usuário.
  }
  return NextResponse.json({ ok: true });
}
