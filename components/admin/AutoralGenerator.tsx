"use client";

import { useState } from "react";
import type { Artigo } from "@/lib/db";

export default function AutoralGenerator({ candidatos }: { candidatos: Artigo[] }) {
  const [gerando, setGerando] = useState<string | null>(null);
  const [feitos, setFeitos] = useState<Record<string, string>>({});
  const [erros, setErros] = useState<Record<string, string>>({});
  const [provedor, setProvedor] = useState<Record<string, "claude" | "gemini">>({});
  const [citarFonte, setCitarFonte] = useState<Record<string, boolean>>({});

  function provedorDe(id: string) {
    return provedor[id] || "claude";
  }
  function citarFonteDe(id: string) {
    return citarFonte[id] ?? true;
  }

  async function gerar(artigo: Artigo) {
    setGerando(artigo.id);
    setErros((prev) => ({ ...prev, [artigo.id]: "" }));
    try {
      const res = await fetch("/api/admin/autoral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: artigo.id,
          provedor: provedorDe(artigo.id),
          citarFonte: citarFonteDe(artigo.id)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Falha ao gerar");
      setFeitos((prev) => ({ ...prev, [artigo.id]: data.id }));
    } catch (e: any) {
      setErros((prev) => ({ ...prev, [artigo.id]: e.message }));
    } finally {
      setGerando(null);
    }
  }

  return (
    <div className="font-ui">
      <div className="border border-line rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper border-b border-line text-left">
            <tr>
              <th className="p-3">Notícia agregada</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Motor</th>
              <th className="p-3">Citar fonte</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {candidatos.map((a) => (
              <tr key={a.id} className="border-b border-line last:border-0">
                <td className="p-3">
                  <div className="font-semibold">{a.titulo}</div>
                  <div className="text-xs text-charcoal/50">{a.fonte}</div>
                  {erros[a.id] && (
                    <div className="text-xs text-alert mt-1">{erros[a.id]}</div>
                  )}
                </td>
                <td className="p-3 capitalize">{a.categoria}</td>
                <td className="p-3">
                  {feitos[a.id] ? (
                    <span className="text-xs text-charcoal/50 capitalize">
                      {provedorDe(a.id)}
                    </span>
                  ) : (
                    <select
                      value={provedorDe(a.id)}
                      onChange={(e) =>
                        setProvedor((prev) => ({
                          ...prev,
                          [a.id]: e.target.value as "claude" | "gemini"
                        }))
                      }
                      className="border border-line rounded-sm px-2 py-1 text-xs"
                    >
                      <option value="claude">Claude</option>
                      <option value="gemini">Gemini</option>
                    </select>
                  )}
                </td>
                <td className="p-3">
                  {!feitos[a.id] && (
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={citarFonteDe(a.id)}
                        onChange={(e) =>
                          setCitarFonte((prev) => ({ ...prev, [a.id]: e.target.checked }))
                        }
                      />
                      Citar
                    </label>
                  )}
                </td>
                <td className="p-3 text-right">
                  {feitos[a.id] ? (
                    <a
                      href={`/noticia/${feitos[a.id]}`}
                      target="_blank"
                      className="text-alert text-xs font-semibold underline"
                    >
                      Ver rascunho gerado →
                    </a>
                  ) : (
                    <button
                      onClick={() => gerar(a)}
                      disabled={gerando === a.id}
                      className="bg-ink text-paper px-4 py-2 rounded-sm text-xs font-semibold hover:bg-alert transition-colors disabled:opacity-60"
                    >
                      {gerando === a.id ? "Gerando..." : "Gerar matéria autoral"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {candidatos.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-charcoal/50">
                  Nenhuma notícia agregada disponível ainda. Atualize o RSS primeiro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-charcoal/40 mt-3">
        A matéria gerada nasce como <strong>rascunho</strong> — vá em{" "}
        <a href="/admin/noticias" className="underline hover:text-alert">
          Notícias
        </a>{" "}
        para revisar, editar e aprovar antes de publicar.
      </p>
    </div>
  );
}
