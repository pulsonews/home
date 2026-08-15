"use client";

import { useState, type FormEvent } from "react";
import type { Fonte, Categoria } from "@/lib/db";

export default function SourceManager({
  fontesIniciais,
  categorias
}: {
  fontesIniciais: Fonte[];
  categorias: Categoria[];
}) {
  const [fontes, setFontes] = useState(fontesIniciais);
  const [nome, setNome] = useState("");
  const [url, setUrl] = useState("");
  const [categoria, setCategoria] = useState(categorias[0]?.slug || "");
  const [erro, setErro] = useState("");

  async function adicionar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    const res = await fetch("/api/admin/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, url, categoria, ativo: true })
    });
    if (!res.ok) {
      setErro("Não foi possível adicionar a fonte. Verifique os campos.");
      return;
    }
    const { fonte } = await res.json();
    setFontes((prev) => [...prev.filter((f) => f.id !== fonte.id), fonte]);
    setNome("");
    setUrl("");
  }

  async function alternarAtivo(fonte: Fonte) {
    const atualizado = { ...fonte, ativo: !fonte.ativo };
    await fetch("/api/admin/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(atualizado)
    });
    setFontes((prev) => prev.map((f) => (f.id === fonte.id ? atualizado : f)));
  }

  async function remover(id: string) {
    await fetch("/api/admin/sources", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    setFontes((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="font-ui">
      <form
        onSubmit={adicionar}
        className="border border-line rounded-sm p-6 mb-8 grid sm:grid-cols-4 gap-3 items-end"
      >
        <div className="sm:col-span-1">
          <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
            Nome da fonte
          </label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: G1 - Brasil"
            className="w-full px-3 py-2 border border-line rounded-sm text-sm"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
            URL do feed RSS
          </label>
          <input
            required
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemplo.com/rss"
            className="w-full px-3 py-2 border border-line rounded-sm text-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
            Categoria
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm text-sm"
          >
            {categorias.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-ink text-paper py-2.5 rounded-sm font-semibold hover:bg-alert transition-colors text-sm"
        >
          Adicionar fonte
        </button>
        {erro && <p className="text-alert text-sm sm:col-span-4">{erro}</p>}
      </form>

      <div className="border border-line rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper border-b border-line text-left">
            <tr>
              <th className="p-3">Fonte</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {fontes.map((f) => (
              <tr key={f.id} className="border-b border-line last:border-0">
                <td className="p-3">
                  <div className="font-semibold">{f.nome}</div>
                  <div className="text-xs text-charcoal/50 break-all">{f.url}</div>
                </td>
                <td className="p-3 capitalize">{f.categoria}</td>
                <td className="p-3">
                  <button
                    onClick={() => alternarAtivo(f)}
                    className={`px-2 py-1 rounded-sm text-xs font-semibold ${
                      f.ativo ? "bg-green-100 text-green-700" : "bg-line text-charcoal/50"
                    }`}
                  >
                    {f.ativo ? "Ativa" : "Inativa"}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => remover(f.id)}
                    className="text-alert text-xs font-semibold"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
            {fontes.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-charcoal/50">
                  Nenhuma fonte cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
