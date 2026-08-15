import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

function guard() {
  if (!isAuthenticated()) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }
  return null;
}

// Por segurança, nunca devolvemos o valor da chave de volta ao navegador —
// só se ela está configurada (para mostrar "configurada" ou um campo vazio).
export async function GET() {
  const blocked = guard();
  if (blocked) return blocked;

  const [anthropic, gemini] = await Promise.all([
    database.getSetting("anthropic_api_key"),
    database.getSetting("gemini_api_key")
  ]);

  return NextResponse.json({
    anthropicConfigured: !!anthropic && anthropic.trim().length > 0,
    geminiConfigured: !!gemini && gemini.trim().length > 0
  });
}

export async function POST(req: NextRequest) {
  const blocked = guard();
  if (blocked) return blocked;

  const { anthropicApiKey, geminiApiKey } = await req.json().catch(() => ({}));

  if (typeof anthropicApiKey === "string") {
    await database.setSetting("anthropic_api_key", anthropicApiKey.trim());
  }
  if (typeof geminiApiKey === "string") {
    await database.setSetting("gemini_api_key", geminiApiKey.trim());
  }

  return NextResponse.json({ ok: true });
}
