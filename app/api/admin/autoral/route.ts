import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";
import { gerarMateriaAutoral, type ProvedorIA } from "@/lib/ai";
import { isAuthenticated } from "@/lib/auth";
import crypto from "node:crypto";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const { articleId, provedor } = await req.json().catch(() => ({ articleId: null, provedor: "claude" }));
  if (!articleId) {
    return NextResponse.json({ erro: "articleId é obrigatório" }, { status: 400 });
  }

  const engineEscolhido: ProvedorIA = provedor === "gemini" ? "gemini" : "claude";

  const original = await database.getArticleById(articleId);
  if (!original) {
    return NextResponse.json({ erro: "Artigo original não encontrado" }, { status: 404 });
  }

  try {
    const gerado = await gerarMateriaAutoral(original, engineEscolhido);
    const novoId = `autoral-${crypto.randomBytes(8).toString("hex")}`;

    await database.createAutoralArticle({
      id: novoId,
      titulo: gerado.titulo,
      resumo: gerado.resumo,
      conteudo: gerado.corpo.join("\n\n"),
      imagem: original.imagem,
      categoria: original.categoria,
      fonteOriginalId: original.id,
      fonteOriginalLink: original.link,
      geradoPor: engineEscolhido
    });

    return NextResponse.json({ ok: true, id: novoId });
  } catch (err: any) {
    return NextResponse.json(
      { erro: err.message || "Falha ao gerar matéria autoral" },
      { status: 500 }
    );
  }
}
