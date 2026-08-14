"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 font-ui">
      <div className="max-w-md text-center">
        <div className="font-display text-6xl text-ink mb-2">PULSO</div>
        <h1 className="font-display text-2xl text-charcoal mb-3">
          Algo deu errado ao carregar esta página
        </h1>
        <p className="text-charcoal/60 mb-6">
          Já estamos cientes do problema. Você pode tentar novamente ou
          voltar para a página inicial.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="bg-ink text-paper px-5 py-2.5 rounded-sm font-semibold hover:bg-alert transition-colors text-sm"
          >
            Tentar novamente
          </button>
          
            href="/"
            className="border border-line px-5 py-2.5 rounded-sm font-semibold text-sm hover:border-alert transition-colors"
          >
            Página inicial
          </a>
        </div>
      </div>
    </div>
  );
}
