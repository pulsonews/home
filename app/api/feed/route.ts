import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";

// GET /api/feed?categoria=brasil&limite=10
//
// Retorna as últimas notícias em JSON. Use este endpoint em uma automação
// (Zapier, Make, n8n) agendada para publicar automaticamente nos canais de
// WhatsApp e Instagram — veja o README para um passo a passo.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoria = searchParams.get("categoria");
  const limite = Number(searchParams.get("limite") || 10);

  let artigos = await database.getArticles();
  if (categoria) artigos = artigos.filter((a) => a.categoria === categoria);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const payload = artigos.slice(0, limite).map((a) => ({
    id: a.id,
    titulo: a.titulo,
    resumo: a.resumo,
    imagem: a.imagem || null,
    categoria: a.categoria,
    fonte: a.fonte,
    publicadoEm: a.publicadoEm,
    urlPortal: `${siteUrl}/noticia/${a.id}`,
    urlOriginal: a.link
  }));

  return NextResponse.json({ total: payload.length, artigos: payload });
}
