import { NextRequest, NextResponse } from "next/server";
import { database, type Banner } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import crypto from "node:crypto";

function guard() {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const blocked = guard();
  if (blocked) return blocked;
  return NextResponse.json(await database.getBanners());
}

// Cria um banner novo (várias posições podem ter vários banners em rotação).
export async function POST(req: NextRequest) {
  const blocked = guard();
  if (blocked) return blocked;

  const body = (await req.json()) as Partial<Banner>;
  if (!body.posicao || !body.tipo) {
    return NextResponse.json({ erro: "posicao e tipo são obrigatórios" }, { status: 400 });
  }

  const novo: Banner = {
    id: `banner-${crypto.randomBytes(6).toString("hex")}`,
    posicao: body.posicao,
    tipo: body.tipo,
    slotId: body.slotId,
    html: body.html,
    ativo: body.ativo ?? true,
    nome: body.nome,
    dataInicio: body.dataInicio,
    dataFim: body.dataFim,
    maxImpressoes: body.maxImpressoes
  };

  await database.createBanner(novo);
  return NextResponse.json({ ok: true, banner: novo });
}
