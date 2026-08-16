import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import crypto from "node:crypto";

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  const artigos = await database.getAllArticlesAdmin();
  return NextResponse.json(artigos);
}

// Cria uma notícia escrita manualmente pelo admin (sem RSS, sem IA).
export async function POST(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { titulo, resumo, conteudo, categoria, imagem, status } = body;

  if (!titulo || !resumo || !conteudo || !categoria) {
    return NextResponse.json(
      { erro: "Título, resumo, conteúdo e categoria são obrigatórios." },
      { status: 400 }
    );
  }

  const id = `manual-${crypto.randomBytes(8).toString("hex")}`;

  await database.createManualArticle({
    id,
    titulo,
    resumo,
    conteudo,
    imagem: imagem || undefined,
    categoria,
    status: status === "publicado" ? "publicado" : "rascunho"
  });

  return NextResponse.json({ ok: true, id });
}
