"use client";

import { useEffect, useState } from "react";

export default function AIKeysManager() {
  const [anthropicConfigured, setAnthropicConfigured] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [anthropicInput, setAnthropicInput] = useState("");
  const [geminiInput, setGeminiInput] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState<"anthropic" | "gemini" | null>(null);
  const [msg, setMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/ai-keys")
      .then((r) => r.json())
      .then((data) => {
        setAnthropicConfigured(!!data.anthropicConfigured);
        setGeminiConfigured(!!data.geminiConfigured);
      })
      .finally(() => setCarregando(false));
  }, []);

  async function salvar(campo: "anthropic" | "gemini") {
    setSalvando(campo);
    setMsg((prev) => ({ ...prev, [campo]: "" }));
    const body =
      campo === "anthropic"
        ? { anthropicApiKey: anthropicInput }
        : { geminiApiKey: geminiInput };
    try {
      const res = await fetch("/api/admin/ai-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error();
      if (campo === "anthropic") {
        setAnthropicConfigured(anthropicInput.trim().length > 0);
        setAnthropicInput("");
      } else {
        setGeminiConfigured(geminiInput.trim().length > 0);
        setGeminiInput("");
      }
      setMsg((prev) => ({ ...prev, [campo]: "Salvo." }));
    } catch {
      setMsg((prev) => ({ ...prev, [campo]: "Erro ao salvar." }));
    } finally {
      setSalvando(null);
    }
  }

  if (carregando) {
    return <p className="font-ui text-sm text-charcoal/50">Carregando...</p>;
  }

  return (
    <div className="font-ui space-y-6">
      <div className="border border-line rounded-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg">Claude (Anthropic)</h3>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-sm ${
              anthropicConfigured ? "bg-green-100 text-green-700" : "bg-line text-charcoal/50"
            }`}
          >
            {anthropicConfigured ? "Configurada" : "Não configurada"}
          </span>
        </div>
        <p className="text-sm text-charcoal/60 mb-3">
          Crie uma chave em{" "}
          <a
            href="https://platform.anthropic.com"
            target="_blank"
            className="underline hover:text-alert"
          >
            platform.anthropic.com
          </a>{" "}
          e cole abaixo.
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={anthropicInput}
            onChange={(e) => setAnthropicInput(e.target.value)}
            placeholder={anthropicConfigured ? "•••••••••••••••• (colar nova chave para trocar)" : "sk-ant-..."}
            className="flex-1 px-3 py-2 border border-line rounded-sm text-sm"
          />
          <button
            onClick={() => salvar("anthropic")}
            disabled={salvando === "anthropic" || !anthropicInput.trim()}
            className="bg-ink text-paper px-4 py-2 rounded-sm text-sm font-semibold hover:bg-alert transition-colors disabled:opacity-50"
          >
            {salvando === "anthropic" ? "Salvando..." : "Salvar"}
          </button>
        </div>
        {msg.anthropic && <p className="text-xs text-charcoal/50 mt-2">{msg.anthropic}</p>}
      </div>

      <div className="border border-line rounded-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg">Gemini (Google)</h3>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-sm ${
              geminiConfigured ? "bg-green-100 text-green-700" : "bg-line text-charcoal/50"
            }`}
          >
            {geminiConfigured ? "Configurada" : "Não configurada"}
          </span>
        </div>
        <p className="text-sm text-charcoal/60 mb-3">
          Crie uma chave em{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            className="underline hover:text-alert"
          >
            aistudio.google.com/apikey
          </a>{" "}
          (tem cota gratuita) e cole abaixo.
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={geminiInput}
            onChange={(e) => setGeminiInput(e.target.value)}
            placeholder={geminiConfigured ? "•••••••••••••••• (colar nova chave para trocar)" : "AIza..."}
            className="flex-1 px-3 py-2 border border-line rounded-sm text-sm"
          />
          <button
            onClick={() => salvar("gemini")}
            disabled={salvando === "gemini" || !geminiInput.trim()}
            className="bg-ink text-paper px-4 py-2 rounded-sm text-sm font-semibold hover:bg-alert transition-colors disabled:opacity-50"
          >
            {salvando === "gemini" ? "Salvando..." : "Salvar"}
          </button>
        </div>
        {msg.gemini && <p className="text-xs text-charcoal/50 mt-2">{msg.gemini}</p>}
      </div>

      <p className="text-xs text-charcoal/40">
        As chaves ficam guardadas no banco de dados do site (não no
        navegador), e nunca são reexibidas depois de salvas — só é possível
        substituir por uma nova.
      </p>
    </div>
  );
}
