import { NextRequest, NextResponse } from "next/server";
import { database, type Banner } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const body = (await req.json()) as Partial<Banner>;
  const camposPermitidos: (keyof Banner)[] = [
    "posicao",
    "tipo",
    "slotId",
    "html",
    "ativo",
    "nome",
    "dataInicio",
    "dataFim",
    "maxImpressoes"
  ];
  const campos: Partial<Banner> = {};
  for (const campo of camposPermitidos) {
    if (campo in body) (campos as any)[campo] = body[campo];
  }

  await database.updateBanner(params.id, campos);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  await database.deleteBanner(params.id);
  return NextResponse.json({ ok: true });
}
