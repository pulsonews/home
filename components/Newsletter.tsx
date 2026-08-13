"use client";

import { useState, type FormEvent } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "erro">(
    "idle"
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("erro");
    }
  }

  return (
    <div
      id="newsletter"
      className="bg-ink text-paper px-6 py-10 sm:px-10 sm:py-12 rounded-sm"
    >
      <div className="max-w-xl">
        <span className="font-ui text-xs uppercase tracking-[0.2em] text-gold font-semibold">
          Direto na sua caixa de entrada
        </span>
        <h2 className="font-display text-3xl mt-2 mb-3">
          Receba o resumo do dia
        </h2>
        <p className="font-body text-paper/70 mb-6">
          As principais notícias, selecionadas por editoria, enviadas por
          e-mail. O mesmo conteúdo também alimenta nossos canais de WhatsApp
          e Instagram.
        </p>
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-sm text-charcoal font-ui text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-alert hover:bg-alert/90 transition-colors px-6 py-3 rounded-sm font-ui text-sm font-semibold uppercase tracking-wide disabled:opacity-60"
          >
            {status === "loading" ? "Enviando..." : "Quero receber"}
          </button>
        </form>
        {status === "ok" && (
          <p className="mt-3 text-sm font-ui text-gold">
            Inscrição confirmada. Obrigado!
          </p>
        )}
        {status === "erro" && (
          <p className="mt-3 text-sm font-ui text-alert">
            Não foi possível concluir. Tente novamente.
          </p>
        )}
      </div>
    </div>
  );
}
