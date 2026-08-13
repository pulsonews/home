"use client";

import { useState, type FormEvent } from "react";
import type { Categoria } from "@/lib/db";

export default function CategoryManager({
  categoriasIniciais
}: {
  categoriasIniciais: Categoria[];
}) {
  const [categorias, setCategorias] = useState(categoriasIniciais);
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("#0B1F3A");

  function slugify(s: string) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function adicionar(e: FormEvent) {
    e.preventDefault();
    const slug = slugify(nome);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, nome, cor })
    });
    if (res.ok) {
      const { categoria } = await res.json();
      setCategorias((prev) => [...prev.filter((c) => c.slug !== slug), categoria]);
      setNome("");
    }
  }

  async function remover(slug: string) {
    await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug })
    });
    setCategorias((prev) => prev.filter((c) => c.slug !== slug));
  }

  return (
    <div className="font-ui">
      <form
        onSubmit={adicionar}
        className="border border-line rounded-sm p-6 mb-8 flex flex-wrap gap-3 items-end"
      >
        <div>
          <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
            Nome da categoria
          </label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Saúde"
            className="px-3 py-2 border border-line rounded-sm text-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
            Cor
          </label>
          <input
            type="color"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
            className="h-10 w-16 border border-line rounded-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-ink text-paper px-5 py-2.5 rounded-sm font-semibold hover:bg-alert transition-colors text-sm"
        >
          Adicionar categoria
        </button>
      </form>

      <div className="grid sm:grid-cols-3 gap-4">
        {categorias.map((c) => (
          <div
            key={c.slug}
            className="border border-line rounded-sm p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: c.cor }}
              />
              <span className="font-semibold">{c.nome}</span>
            </div>
            <button
              onClick={() => remover(c.slug)}
              className="text-alert text-xs font-semibold"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
