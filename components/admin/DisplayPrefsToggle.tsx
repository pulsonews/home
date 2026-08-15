"use client";

import { useState } from "react";

export default function DisplayPrefsToggle({
  seloInicial,
  avisoInicial
}: {
  seloInicial: boolean;
  avisoInicial: boolean;
}) {
  const [selo, setSelo] = useState(seloInicial);
  const [aviso, setAviso] = useState(avisoInicial);
  const [salvando, setSalvando] = useState(false);

  async function salvar(campo: "selo" | "aviso", valor: boolean) {
    setSalvando(true);
    if (campo === "selo") setSelo(valor);
    else setAviso(valor);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        campo === "selo" ? { mostrarSeloAutoral: valor } : { mostrarAvisoIA: valor }
      )
    });
    setSalvando(false);
  }

  return (
    <div className="font-ui space-y-3">
      <label className="flex items-center gap-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={selo}
          onChange={(e) => salvar("selo", e.target.checked)}
          className="h-4 w-4"
        />
        Mostrar selo &quot;Autoral&quot; nos cards de notícia
      </label>
      <label className="flex items-center gap-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={aviso}
          onChange={(e) => salvar("aviso", e.target.checked)}
          className="h-4 w-4"
        />
        Mostrar aviso de transparência (IA) na página da matéria
      </label>
      {salvando && <p className="text-xs text-charcoal/40">Salvando...</p>}
    </div>
  );
}
