"use client";

import { useState } from "react";

export default function ShareButtons({
  url,
  titulo
}: {
  url: string;
  titulo: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitulo = encodeURIComponent(titulo);

  const links = [
    {
      nome: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitulo}%20${encodedUrl}`,
      cor: "#25D366"
    },
    {
      nome: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      cor: "#1877F2"
    },
    {
      nome: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitulo}&url=${encodedUrl}`,
      cor: "#000000"
    }
  ];

  async function compartilharInstagram() {
    // O Instagram não possui um endpoint web de compartilhamento direto de link.
    // A prática recomendada é copiar o texto/link e abrir o app para colar
    // em Stories ou Direct.
    try {
      await navigator.clipboard.writeText(`${titulo} ${url}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* ignore */
    }
    window.location.href = "instagram://story-camera";
  }

  return (
    <>
      {/* Linha normal, dentro do fluxo da página (desktop e mobile) */}
      <div className="flex flex-wrap items-center gap-2 font-ui text-xs">
        <span className="uppercase tracking-wide text-charcoal/50 font-semibold mr-1">
          Compartilhar
        </span>
        {links.map((l) => (
          <a
            key={l.nome}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-sm text-white font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: l.cor }}
          >
            {l.nome}
          </a>
        ))}
        <button
          onClick={compartilharInstagram}
          className="px-3 py-1.5 rounded-sm text-white font-semibold hover:opacity-90 transition-opacity"
          style={{
            background:
              "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)"
          }}
        >
          {copiado ? "Link copiado!" : "Instagram"}
        </button>
      </div>

      {/* Barra fixa, só no mobile, fica visível durante toda a leitura */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-paper/95 backdrop-blur border-t border-line px-3 py-2 flex items-center justify-center gap-2 font-ui text-xs">
        {links.map((l) => (
          <a
            key={l.nome}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-2 py-2 rounded-sm text-white font-semibold"
            style={{ backgroundColor: l.cor }}
          >
            {l.nome}
          </a>
        ))}
        <button
          onClick={compartilharInstagram}
          className="flex-1 text-center px-2 py-2 rounded-sm text-white font-semibold"
          style={{
            background:
              "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)"
          }}
        >
          {copiado ? "Copiado!" : "Instagram"}
        </button>
      </div>
      {/* Espaço reservado no fim da página no mobile, pra barra fixa não tapar o rodapé */}
      <div className="sm:hidden h-14" />
    </>
  );
}
