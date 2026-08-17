"use client";

import { useEffect, useState } from "react";

const OPCOES = [
  { emoji: "👍", label: "Gostei" },
  { emoji: "😮", label: "Surpreendeu" },
  { emoji: "😢", label: "Triste" },
  { emoji: "😡", label: "Revoltante" }
];

export default function ReactionBar({
  articleId,
  contagemInicial
}: {
  articleId: string;
  contagemInicial: Record<string, number>;
}) {
  const [contagem, setContagem] = useState(contagemInicial);
  const [jaReagiu, setJaReagiu] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem(`reacao:${articleId}`);
    if (salvo) setJaReagiu(salvo);
  }, [articleId]);

  async function reagir(emoji: string) {
    if (jaReagiu || enviando) return;
    setEnviando(true);
    setContagem((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    setJaReagiu(emoji);
    localStorage.setItem(`reacao:${articleId}`, emoji);
    try {
      const res = await fetch("/api/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, emoji })
      });
      const data = await res.json();
      if (res.ok) setContagem(data.contagem);
    } catch {
      /* mantém a contagem otimista mesmo se a rede falhar */
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 font-ui">
      <span className="text-xs uppercase tracking-wide text-charcoal/50 font-semibold">
        O que você achou?
      </span>
      {OPCOES.map((o) => (
        <button
          key={o.emoji}
          onClick={() => reagir(o.emoji)}
          disabled={!!jaReagiu}
          title={o.label}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
            jaReagiu === o.emoji
              ? "border-alert bg-alert/10"
              : "border-line hover:border-charcoal/30"
          } ${jaReagiu && jaReagiu !== o.emoji ? "opacity-50" : ""}`}
        >
          <span className="text-base">{o.emoji}</span>
          <span className="text-charcoal/70">{contagem[o.emoji] || 0}</span>
        </button>
      ))}
    </div>
  );
}
