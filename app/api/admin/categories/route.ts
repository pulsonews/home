import { NextRequest, NextResponse } from "next/server";
import { database, type Categoria } from "@/lib/db";
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
  return NextResponse.json(await database.getCategories());
}

export async function POST(req: NextRequest) {
  const blocked = guard();
  if (blocked) return blocked;

  const body = (await req.json()) as Partial<Categoria>;
  if (!body.slug || !body.nome) {
    return NextResponse.json({ erro: "Campos obrigatórios ausentes" }, { status: 400 });
  }

  const categories = await database.getCategories();
  const nova: Categoria = {
    slug: body.slug,
    nome: body.nome,
    cor: body.cor || "#0B1F3A"
  };

  const semDuplicata = categories.filter((c) => c.slug !== nova.slug);
  await database.setCategories([...semDuplicata, nova]);
  return NextResponse.json({ ok: true, categoria: nova });
}

export async function DELETE(req: NextRequest) {
  const blocked = guard();
  if (blocked) return blocked;

  const { slug } = await req.json();
  const categories = await database.getCategories();
  await database.setCategories(categories.filter((c) => c.slug !== slug));
  return NextResponse.json({ ok: true });
}
