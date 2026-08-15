import { NextRequest, NextResponse } from "next/server";
import { database, type Fonte } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

function guard() {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const blocked = guard();
  if (blocked) return blocked;
  return NextResponse.json(await database.getSources());
}

export async function POST(req: NextRequest) {
  const blocked = guard();
  if (blocked) return blocked;

  const body = (await req.json()) as Partial<Fonte>;
  if (!body.nome || !body.url || !body.categoria) {
    return NextResponse.json({ erro: "Campos obrigatórios ausentes" }, { status: 400 });
  }

  const sources = await database.getSources();
  const nova: Fonte = {
    id: body.id || `fonte-${Date.now()}`,
    nome: body.nome,
    url: body.url,
    categoria: body.categoria,
    ativo: body.ativo ?? true
  };

  const semDuplicata = sources.filter((s) => s.id !== nova.id);
  await database.setSources([...semDuplicata, nova]);
  return NextResponse.json({ ok: true, fonte: nova });
}

export async function DELETE(req: NextRequest) {
  const blocked = guard();
  if (blocked) return blocked;

  const { id } = await req.json();
  const sources = await database.getSources();
  await database.setSources(sources.filter((s) => s.id !== id));
  return NextResponse.json({ ok: true });
}
