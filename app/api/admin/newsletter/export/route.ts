import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const inscritos = await database.getSubscribers();
  const csv = [
    "email,criado_em",
    ...inscritos.map((i) => `${i.email},${i.criadoEm}`)
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=inscritos-newsletter.csv"
    }
  });
}
