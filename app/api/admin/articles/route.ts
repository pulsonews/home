import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  const artigos = await database.getAllArticlesAdmin();
  return NextResponse.json(artigos);
}
