import { NextRequest, NextResponse } from "next/server";
import { database, type Banner } from "@/lib/db";
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
  return NextResponse.json(await database.getBanners());
}

export async function POST(req: NextRequest) {
  const blocked = guard();
  if (blocked) return blocked;

  const body = (await req.json()) as Banner;
  const banners = await database.getBanners();
  const semDuplicata = banners.filter((b) => b.id !== body.id);
  await database.setBanners([...semDuplicata, body]);
  return NextResponse.json({ ok: true, banner: body });
}
