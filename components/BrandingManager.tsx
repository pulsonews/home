"use client";

import { useEffect, useState } from "react";

export default function BrandingManager() {
  const [logoUrl, setLogoUrl] = useState("");
  const [nomeSite, setNomeSite] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/branding")
      .then((r) => r.json())
      .then((data) => {
        setLogoUrl(data.logoUrl || "");
        setNomeSite(data.nomeSite || "");
        setWhatsappUrl(data.whatsappUrl || "");
        setInstagramUrl(data.instagramUrl || "");
      })
      .finally(() => setCarregando(false));
  }, []);

  async function salvar() {
    setSalvando(true);
    setMsg("");
    try {
      await fetch("/api/admin/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl, nomeSite, whatsappUrl, instagramUrl })
      });
      setMsg("Salvo. Atualize o site para ver a mudança.");
    } catch {
      setMsg("Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p className="font-ui text-sm text-charcoal/50">Carregando...</p>;
  }

  return (
    <div className="font-ui max-w-xl space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
          Nome do site
        </label>
        <input
          value={nomeSite}
          onChange={(e) => setNomeSite(e.target.value)}
          placeholder="PULSO"
          className="w-full px-3 py-2 border border-line rounded-sm text-sm"
        />
        <p className="text-xs text-charcoal/40 mt-1">
          Usado no cabeçalho (quando não há logo em imagem) e no rodapé.
        </p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
          URL da logo (imagem)
        </label>
        <input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://... ou /logo.png"
          className="w-full px-3 py-2 border border-line rounded-sm text-sm"
        />
        <p className="text-xs text-charcoal/40 mt-1">
          Cole a URL de uma imagem já hospedada (ex: um link direto para um
          PNG/SVG). Deixe em branco para usar o nome em texto no lugar da
          logo. Se você tiver o arquivo da logo no repositório dentro de{" "}
          <code>public/</code> (ex: <code>public/logo.png</code>), pode usar
          só <code>/logo.png</code> aqui.
        </p>
        {logoUrl && (
          <div className="mt-3 p-4 border border-dashed border-line rounded-sm inline-block bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Pré-visualização da logo" className="h-10 w-auto" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
          Link do Canal do WhatsApp
        </label>
        <input
          value={whatsappUrl}
          onChange={(e) => setWhatsappUrl(e.target.value)}
          placeholder="https://whatsapp.com/channel/..."
          className="w-full px-3 py-2 border border-line rounded-sm text-sm"
        />
        <p className="text-xs text-charcoal/40 mt-1">
          Usado no rodapé e na chamada ao fim de cada notícia. Deixe em
          branco para ocultar essa chamada.
        </p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide font-semibold mb-1">
          Link do Instagram
        </label>
        <input
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://instagram.com/seuportal"
          className="w-full px-3 py-2 border border-line rounded-sm text-sm"
        />
      </div>

      <button
        onClick={salvar}
        disabled={salvando}
        className="bg-ink text-paper px-5 py-2.5 rounded-sm text-sm font-semibold hover:bg-alert transition-colors disabled:opacity-60"
      >
        {salvando ? "Salvando..." : "Salvar"}
      </button>
      {msg && <p className="text-xs text-charcoal/50">{msg}</p>}
    </div>
  );
}
