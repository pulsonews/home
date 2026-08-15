"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function atualizar() {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/rss/refresh", { method: "POST" });
      const data = await res.json();
      setMsg(
        `${data.novos} itens processados de ${data.fontes} fontes · ${data.total} no total.`
      );
      router.refresh();
    } catch {
      setMsg("Erro ao atualizar. Verifique as fontes cadastradas.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={atualizar}
        disabled={loading}
        className="bg-alert text-paper font-ui text-sm font-semibold uppercase tracking-wide px-5 py-2.5 rounded-sm hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Atualizando..." : "Atualizar RSS agora"}
      </button>
      {msg && <span className="font-ui text-sm text-charcoal/60">{msg}</span>}
    </div>
  );
}
