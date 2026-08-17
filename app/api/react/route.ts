import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";

const EMOJIS_VALIDOS = ["👍", "😮", "😢", "😡"];

export async function POST(req: NextRequest) {
  const { articleId, emoji } = await req.json().catch(() => ({}));
  if (!articleId || !EMOJIS_VALIDOS.includes(emoji)) {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }
  await database.addReaction(articleId, emoji);
  const contagem = await database.getReactionCounts(articleId);
  return NextResponse.json({ ok: true, contagem });
}
