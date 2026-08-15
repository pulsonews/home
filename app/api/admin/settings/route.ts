import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  const [somenteComFoto, mostrarSeloAutoral, mostrarAvisoIA] = await Promise.all([
    database.getSetting("somente_com_foto"),
    database.getSetting("mostrar_selo_autoral"),
    database.getSetting("mostrar_aviso_ia")
  ]);
  return NextResponse.json({
    somenteComFoto: somenteComFoto === "true",
    mostrarSeloAutoral: mostrarSeloAutoral === "true",
    mostrarAvisoIA: mostrarAvisoIA === "true"
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  if (typeof body.somenteComFoto === "boolean") {
    await database.setSetting("somente_com_foto", body.somenteComFoto ? "true" : "false");
  }
  if (typeof body.mostrarSeloAutoral === "boolean") {
    await database.setSetting("mostrar_selo_autoral", body.mostrarSeloAutoral ? "true" : "false");
  }
  if (typeof body.mostrarAvisoIA === "boolean") {
    await database.setSetting("mostrar_aviso_ia", body.mostrarAvisoIA ? "true" : "false");
  }

  return NextResponse.json({ ok: true });
}
