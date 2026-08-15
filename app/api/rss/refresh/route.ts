import { NextRequest, NextResponse } from "next/server";
import { refreshAllFeeds } from "@/lib/rss";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET: chamado pelo Vercel Cron (configurado em vercel.json) ou por
// qualquer serviço externo de agendamento (cron-job.org, GitHub Actions, etc).
// Protegido por um cabeçalho Authorization: Bearer <RSS_REFRESH_SECRET>.
export async function GET(req: NextRequest) {
  const secret = process.env.RSS_REFRESH_SECRET;
  const auth = req.headers.get("authorization");

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const resultado = await refreshAllFeeds();
  return NextResponse.json({ ok: true, ...resultado });
}

// POST: usado pelo botão "Atualizar agora" do painel administrativo.
export async function POST() {
  const resultado = await refreshAllFeeds();
  return NextResponse.json({ ok: true, ...resultado });
}
