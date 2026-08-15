"use client";

import { useState } from "react";
import type { Banner } from "@/lib/db";

const POSICOES = [
  { id: "topo", label: "Topo do site" },
  { id: "meio-feed", label: "Meio do feed (home)" },
  { id: "lateral", label: "Lateral" },
  { id: "artigo", label: "Dentro da notícia" }
];

export default function BannerManager({
  bannersIniciais
}: {
  bannersIniciais: Banner[];
}) {
  const [banners, setBanners] = useState<Record<string, Banner>>(
    Object.fromEntries(bannersIniciais.map((b) => [b.posicao, b]))
  );

  async function salvar(posicao: string) {
    const banner = banners[posicao];
    await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(banner)
    });
  }

  function atualizar(posicao: string, campo: keyof Banner, valor: any) {
    setBanners((prev) => ({
      ...prev,
      [posicao]: {
        ...(prev[posicao] || { id: posicao, posicao, tipo: "adsense", ativo: true }),
        [campo]: valor
      }
    }));
  }

  return (
    <div className="font-ui space-y-6">
      {POSICOES.map((pos) => {
        const banner = banners[pos.id] || {
          id: pos.id,
          posicao: pos.id,
          tipo: "adsense" as const,
          ativo: true
        };
        return (
          <div key={pos.id} className="border border-line rounded-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg">{pos.label}</h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={banner.ativo}
                  onChange={(e) => atualizar(pos.id, "ativo", e.target.checked)}
                />
                Ativo
              </label>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
                  Tipo
                </label>
                <select
                  value={banner.tipo}
                  onChange={(e) => atualizar(pos.id, "tipo", e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm"
                >
                  <option value="adsense">Google AdSense</option>
                  <option value="html">HTML personalizado</option>
                </select>
              </div>
              {banner.tipo === "adsense" && (
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
                    ID do bloco de anúncio (data-ad-slot)
                  </label>
                  <input
                    value={banner.slotId || ""}
                    onChange={(e) => atualizar(pos.id, "slotId", e.target.value)}
                    placeholder="0000000000"
                    className="w-full px-3 py-2 border border-line rounded-sm text-sm"
                  />
                </div>
              )}
            </div>

            {banner.tipo === "html" && (
              <div className="mb-4">
                <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
                  Código HTML (outro parceiro de monetização, afiliado, etc.)
                </label>
                <textarea
                  value={banner.html || ""}
                  onChange={(e) => atualizar(pos.id, "html", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-line rounded-sm text-sm font-mono"
                  placeholder="<script>...</script> ou <a href=...>"
                />
              </div>
            )}

            <button
              onClick={() => salvar(pos.id)}
              className="bg-ink text-paper px-5 py-2 rounded-sm font-semibold hover:bg-alert transition-colors text-sm"
            >
              Salvar
            </button>
          </div>
        );
      })}
    </div>
  );
}
