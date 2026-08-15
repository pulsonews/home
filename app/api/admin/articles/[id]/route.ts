import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const camposPermitidos = ["titulo", "resumo", "conteudo", "categoria", "imagem", "status"];
  const campos: Record<string, any> = {};
  for (const campo of camposPermitidos) {
    if (campo in body) campos[campo] = body[campo];
  }

  if (campos.status && !["publicado", "rascunho"].includes(campos.status)) {
    return NextResponse.json({ erro: "Status inválido" }, { status: 400 });
  }

  await database.updateArticle(params.id, campos);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  await database.deleteArticle(params.id);
  return NextResponse.json({ ok: true });
}
