"use client";

import { useState } from "react";
import type { Artigo, Categoria } from "@/lib/db";

export default function NewsManager({
  artigosIniciais,
  categorias
}: {
  artigosIniciais: Artigo[];
  categorias: Categoria[];
}) {
  const [artigos, setArtigos] = useState(artigosIniciais);
  const [editando, setEditando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Partial<Artigo>>({});
  const [salvando, setSalvando] = useState(false);
  const [filtro, setFiltro] = useState<"todos" | "publicado" | "rascunho">("todos");

  const visiveis = artigos.filter((a) => filtro === "todos" || a.status === filtro);

  function abrirEdicao(a: Artigo) {
    setEditando(a.id);
    setRascunho({
      titulo: a.titulo,
      resumo: a.resumo,
      conteudo: a.conteudo || "",
      categoria: a.categoria,
      imagem: a.imagem || ""
    });
  }

  async function salvarEdicao(id: string) {
    setSalvando(true);
    try {
      await fetch(`/api/admin/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rascunho)
      });
      setArtigos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...rascunho } : a))
      );
      setEditando(null);
    } finally {
      setSalvando(false);
    }
  }

  async function alternarStatus(a: Artigo) {
    const novoStatus = a.status === "publicado" ? "rascunho" : "publicado";
    await fetch(`/api/admin/articles/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus })
    });
    setArtigos((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, status: novoStatus } : x))
    );
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta notícia definitivamente? Não dá pra desfazer.")) return;
    await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    setArtigos((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="font-ui">
      <div className="flex gap-2 mb-4">
        {(["todos", "publicado", "rascunho"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wide ${
              filtro === f ? "bg-ink text-paper" : "bg-line/40 text-charcoal/60"
            }`}
          >
            {f === "todos" ? "Todos" : f === "publicado" ? "Publicados" : "Rascunhos"}
          </button>
        ))}
      </div>

      <div className="border border-line rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper border-b border-line text-left">
            <tr>
              <th className="p-3">Notícia</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((a) => (
              <tr key={a.id} className="border-b border-line last:border-0 align-top">
                <td className="p-3">
                  {editando === a.id ? (
                    <div className="space-y-2 max-w-md">
                      <input
                        value={rascunho.titulo || ""}
                        onChange={(e) =>
                          setRascunho((prev) => ({ ...prev, titulo: e.target.value }))
                        }
                        className="w-full px-2 py-1 border border-line rounded-sm text-sm font-semibold"
                        placeholder="Título"
                      />
                      <textarea
                        value={rascunho.resumo || ""}
                        onChange={(e) =>
                          setRascunho((prev) => ({ ...prev, resumo: e.target.value }))
                        }
                        rows={2}
                        className="w-full px-2 py-1 border border-line rounded-sm text-xs"
                        placeholder="Resumo"
                      />
                      {a.autoral && (
                        <textarea
                          value={rascunho.conteudo || ""}
                          onChange={(e) =>
                            setRascunho((prev) => ({ ...prev, conteudo: e.target.value }))
                          }
                          rows={6}
                          className="w-full px-2 py-1 border border-line rounded-sm text-xs font-mono"
                          placeholder="Corpo da matéria (parágrafos separados por linha em branco)"
                        />
                      )}
                      <input
                        value={rascunho.imagem || ""}
                        onChange={(e) =>
                          setRascunho((prev) => ({ ...prev, imagem: e.target.value }))
                        }
                        className="w-full px-2 py-1 border border-line rounded-sm text-xs"
                        placeholder="URL da imagem"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="font-semibold">{a.titulo}</div>
                      <div className="text-xs text-charcoal/50">
                        {a.fonte}
                        {a.autoral && " · Autoral"}
                      </div>
                    </>
                  )}
                </td>
                <td className="p-3">
                  {editando === a.id ? (
                    <select
                      value={rascunho.categoria}
                      onChange={(e) =>
                        setRascunho((prev) => ({ ...prev, categoria: e.target.value }))
                      }
                      className="border border-line rounded-sm px-2 py-1 text-xs"
                    >
                      {categorias.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="capitalize">{a.categoria}</span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => alternarStatus(a)}
                    className={`px-2 py-1 rounded-sm text-xs font-semibold ${
                      a.status === "publicado"
                        ? "bg-green-100 text-green-700"
                        : "bg-gold/20 text-gold"
                    }`}
                  >
                    {a.status === "publicado" ? "Publicado" : "Rascunho · aprovar"}
                  </button>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  {editando === a.id ? (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditando(null)}
                        className="text-xs text-charcoal/50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => salvarEdicao(a.id)}
                        disabled={salvando}
                        className="bg-ink text-paper px-3 py-1.5 rounded-sm text-xs font-semibold hover:bg-alert transition-colors disabled:opacity-60"
                      >
                        {salvando ? "Salvando..." : "Salvar"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3 justify-end items-center">
                      <a
                        href={`/noticia/${a.id}`}
                        target="_blank"
                        className="text-xs text-charcoal/50 hover:text-alert"
                      >
                        Ver
                      </a>
                      <button
                        onClick={() => abrirEdicao(a)}
                        className="text-xs font-semibold hover:text-alert"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluir(a.id)}
                        className="text-xs font-semibold text-alert"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {visiveis.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-charcoal/50">
                  Nenhuma notícia nesse filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
