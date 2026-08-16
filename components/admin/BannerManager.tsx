"use client";

import { useState } from "react";
import type { Banner } from "@/lib/db";

const POSICOES = [
  { id: "topo", label: "Topo do site" },
  { id: "meio-feed", label: "Meio do feed (home)" },
  { id: "lateral", label: "Lateral" },
  { id: "artigo", label: "Dentro da notícia" }
];

function formatarData(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function estaExpirado(b: Banner) {
  const agora = Date.now();
  if (b.dataFim && new Date(b.dataFim).getTime() < agora) return true;
  if (b.maxImpressoes && (b.impressoes ?? 0) >= b.maxImpressoes) return true;
  return false;
}

export default function BannerManager({ bannersIniciais }: { bannersIniciais: Banner[] }) {
  const [banners, setBanners] = useState(bannersIniciais);
  const [novo, setNovo] = useState<Partial<Banner>>({
    posicao: "topo",
    tipo: "adsense",
    ativo: true
  });
  const [criando, setCriando] = useState(false);

  async function criarBanner() {
    setCriando(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novo)
      });
      const data = await res.json();
      if (res.ok) {
        setBanners((prev) => [...prev, data.banner]);
        setNovo({ posicao: novo.posicao, tipo: "adsense", ativo: true });
      }
    } finally {
      setCriando(false);
    }
  }

  async function atualizar(id: string, campos: Partial<Banner>) {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...campos } : b)));
    await fetch(`/api/admin/banners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campos)
    });
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este banner?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="font-ui space-y-8">
      {/* Formulário de novo banner */}
      <div className="border border-line rounded-sm p-6">
        <h3 className="font-display text-lg mb-4">Adicionar banner</h3>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
              Posição
            </label>
            <select
              value={novo.posicao}
              onChange={(e) => setNovo((p) => ({ ...p, posicao: e.target.value }))}
              className="w-full px-3 py-2 border border-line rounded-sm text-sm"
            >
              {POSICOES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
              Nome (só para identificar no painel)
            </label>
            <input
              value={novo.nome || ""}
              onChange={(e) => setNovo((p) => ({ ...p, nome: e.target.value }))}
              placeholder="Ex: Campanha Natal 2026"
              className="w-full px-3 py-2 border border-line rounded-sm text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
              Tipo
            </label>
            <select
              value={novo.tipo}
              onChange={(e) => setNovo((p) => ({ ...p, tipo: e.target.value as "adsense" | "html" }))}
              className="w-full px-3 py-2 border border-line rounded-sm text-sm"
            >
              <option value="adsense">Google AdSense</option>
              <option value="html">HTML personalizado</option>
            </select>
          </div>
          {novo.tipo === "adsense" ? (
            <div>
              <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
                ID do bloco (data-ad-slot)
              </label>
              <input
                value={novo.slotId || ""}
                onChange={(e) => setNovo((p) => ({ ...p, slotId: e.target.value }))}
                placeholder="0000000000"
                className="w-full px-3 py-2 border border-line rounded-sm text-sm"
              />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
                Código HTML
              </label>
              <textarea
                value={novo.html || ""}
                onChange={(e) => setNovo((p) => ({ ...p, html: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-line rounded-sm text-sm font-mono"
                placeholder="<a href=...>...</a>"
              />
            </div>
          )}
          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
              Início (opcional)
            </label>
            <input
              type="datetime-local"
              onChange={(e) =>
                setNovo((p) => ({
                  ...p,
                  dataInicio: e.target.value ? new Date(e.target.value).toISOString() : undefined
                }))
              }
              className="w-full px-3 py-2 border border-line rounded-sm text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
              Fim (opcional)
            </label>
            <input
              type="datetime-local"
              onChange={(e) =>
                setNovo((p) => ({
                  ...p,
                  dataFim: e.target.value ? new Date(e.target.value).toISOString() : undefined
                }))
              }
              className="w-full px-3 py-2 border border-line rounded-sm text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
              Limite de impressões (opcional)
            </label>
            <input
              type="number"
              min={1}
              onChange={(e) =>
                setNovo((p) => ({
                  ...p,
                  maxImpressoes: e.target.value ? Number(e.target.value) : undefined
                }))
              }
              placeholder="Sem limite"
              className="w-full px-3 py-2 border border-line rounded-sm text-sm"
            />
          </div>
        </div>
        <button
          onClick={criarBanner}
          disabled={criando}
          className="bg-ink text-paper px-5 py-2.5 rounded-sm text-sm font-semibold hover:bg-alert transition-colors disabled:opacity-60"
        >
          {criando ? "Adicionando..." : "Adicionar banner"}
        </button>
      </div>

      {/* Lista por posição */}
      {POSICOES.map((pos) => {
        const doPos = banners.filter((b) => b.posicao === pos.id);
        return (
          <div key={pos.id}>
            <h3 className="font-display text-lg mb-3">{pos.label}</h3>
            {doPos.length === 0 ? (
              <p className="text-sm text-charcoal/50 mb-4">Nenhum banner cadastrado aqui ainda.</p>
            ) : (
              <div className="border border-line rounded-sm overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-paper border-b border-line text-left">
                    <tr>
                      <th className="p-3">Banner</th>
                      <th className="p-3">Período</th>
                      <th className="p-3">Impressões</th>
                      <th className="p-3">Status</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {doPos.map((b) => {
                      const expirado = estaExpirado(b);
                      return (
                        <tr key={b.id} className="border-b border-line last:border-0">
                          <td className="p-3">
                            <div className="font-semibold">{b.nome || `(sem nome) · ${b.tipo}`}</div>
                            <div className="text-xs text-charcoal/50 capitalize">{b.tipo}</div>
                          </td>
                          <td className="p-3 text-xs text-charcoal/60">
                            {formatarData(b.dataInicio)} → {formatarData(b.dataFim)}
                          </td>
                          <td className="p-3 text-xs">
                            {b.impressoes ?? 0}
                            {b.maxImpressoes ? ` / ${b.maxImpressoes}` : ""}
                          </td>
                          <td className="p-3">
                            {expirado ? (
                              <span className="px-2 py-1 rounded-sm text-xs font-semibold bg-line text-charcoal/50">
                                Expirado
                              </span>
                            ) : (
                              <button
                                onClick={() => atualizar(b.id, { ativo: !b.ativo })}
                                className={`px-2 py-1 rounded-sm text-xs font-semibold ${
                                  b.ativo ? "bg-green-100 text-green-700" : "bg-line text-charcoal/50"
                                }`}
                              >
                                {b.ativo ? "Ativo" : "Pausado"}
                              </button>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => excluir(b.id)}
                              className="text-alert text-xs font-semibold"
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
