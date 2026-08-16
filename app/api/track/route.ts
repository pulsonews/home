import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { path, articleId } = await req.json().catch(() => ({}));
  if (!path || typeof path !== "string") {
    return NextResponse.json({ erro: "path é obrigatório" }, { status: 400 });
  }
  try {
    await database.trackView(path, articleId);
  } catch {
    // Nunca deixa o tracking quebrar a navegação do usuário.
  }
  return NextResponse.json({ ok: true });
}
