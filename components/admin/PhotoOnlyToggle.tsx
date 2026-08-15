"use client";

import { useState } from "react";

export default function PhotoOnlyToggle({ inicial }: { inicial: boolean }) {
  const [ativo, setAtivo] = useState(inicial);
  const [salvando, setSalvando] = useState(false);

  async function alternar() {
    const novo = !ativo;
    setAtivo(novo);
    setSalvando(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ somenteComFoto: novo })
    });
    setSalvando(false);
  }

  return (
    <label className="flex items-center gap-3 font-ui text-sm cursor-pointer">
      <input type="checkbox" checked={ativo} onChange={alternar} className="h-4 w-4" />
      <span>
        Importar somente notícias com foto{" "}
        {salvando && <span className="text-charcoal/40">(salvando...)</span>}
      </span>
    </label>
  );
}
