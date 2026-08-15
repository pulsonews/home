"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha })
    });
    if (res.ok) {
      router.refresh();
    } else {
      setErro("Senha incorreta.");
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 font-ui">
      <form
        onSubmit={onSubmit}
        className="bg-paper w-full max-w-sm p-8 rounded-sm"
      >
        <h1 className="font-display text-2xl text-ink mb-1">PULSO · Admin</h1>
        <p className="text-charcoal/60 text-sm mb-6">
          Acesse o painel de configurações do portal.
        </p>
        <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
          Senha
        </label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full px-3 py-2 border border-line rounded-sm mb-3 focus:outline-none focus:ring-2 focus:ring-alert"
          autoFocus
        />
        {erro && <p className="text-alert text-sm mb-3">{erro}</p>}
        <button
          type="submit"
          className="w-full bg-ink text-paper py-2.5 rounded-sm font-semibold hover:bg-alert transition-colors"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
