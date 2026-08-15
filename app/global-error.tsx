"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="pt-BR">
      <body style={{ fontFamily: "Arial, sans-serif", background: "#F6F5F1" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            textAlign: "center"
          }}
        >
          <div style={{ maxWidth: 420 }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: "#0B1F3A" }}>
              PULSO
            </div>
            <h1 style={{ fontSize: 20, color: "#1C1C1E", margin: "12px 0" }}>
              Não foi possível carregar o site agora
            </h1>
            <p style={{ color: "#5F5E5A", marginBottom: 20 }}>
              Tente novamente em instantes.
            </p>
            <button
              onClick={() => reset()}
              style={{
                background: "#0B1F3A",
                color: "#F6F5F1",
                border: "none",
                padding: "10px 20px",
                borderRadius: 2,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
