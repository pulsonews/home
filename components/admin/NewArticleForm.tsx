"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Categoria } from "@/lib/db";

export default function NewArticleForm({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState(categorias[0]?.slug || "");
  const [imagem, setImagem] = useState("");
  const [salvando, setSalvando] = useState<"rascunho" | "publicado" | null>(null);
  const [erro, setErro] = useState("");

  async function salvar(status: "rascunho" | "publicado") {
    setSalvando(status);
    setErro("");
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, resumo, conteudo, categoria, imagem, status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Falha ao salvar");
      router.push("/admin/noticias");
    } catch (e: any) {
      setErro(e.message);
      setSalvando(null);
    }
  }

  return (
    <div className="font-ui space-y-4 max-w-2xl">
      <div>
        <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
          Título
        </label>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full px-3 py-2 border border-line rounded-sm text-sm"
          placeholder="Manchete da notícia"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
          Resumo (linha de apoio)
        </label>
        <textarea
          value={resumo}
          onChange={(e) => setResumo(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-line rounded-sm text-sm"
          placeholder="1-2 frases que resumem a notícia"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
          Corpo da matéria
        </label>
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          rows={12}
          className="w-full px-3 py-2 border border-line rounded-sm text-sm font-mono"
          placeholder={"Separe os parágrafos com uma linha em branco.\n\nAssim, por exemplo, este é o segundo parágrafo."}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
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
        <div>
          <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
            URL da imagem (opcional)
          </label>
          <input
            value={imagem}
            onChange={(e) => setImagem(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm text-sm"
            placeholder="https://..."
          />
        </div>
      </div>

      {erro && <p className="text-alert text-sm">{erro}</p>}

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => salvar("rascunho")}
          disabled={!!salvando || !titulo || !resumo || !conteudo || !categoria}
          className="border border-line px-5 py-2.5 rounded-sm text-sm font-semibold hover:border-alert transition-colors disabled:opacity-50"
        >
          {salvando === "rascunho" ? "Salvando..." : "Salvar como rascunho"}
        </button>
        <button
          onClick={() => salvar("publicado")}
          disabled={!!salvando || !titulo || !resumo || !conteudo || !categoria}
          className="bg-ink text-paper px-5 py-2.5 rounded-sm text-sm font-semibold hover:bg-alert transition-colors disabled:opacity-50"
        >
          {salvando === "publicado" ? "Publicando..." : "Publicar agora"}
        </button>
      </div>
    </div>
  );
}
