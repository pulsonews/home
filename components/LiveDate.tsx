"use client";

import { useEffect, useState } from "react";

export default function LiveDate() {
  const [texto, setTexto] = useState<string>("");

  useEffect(() => {
    setTexto(
      new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long"
      })
    );
  }, []);

  // Antes de montar no navegador, não renderiza nada — evita qualquer
  // divergência entre o horário do servidor e o do navegador do usuário
  // (causa comum de erros de hidratação do React).
  if (!texto) return null;

  return <span className="capitalize opacity-80 shrink-0">{texto}</span>;
}
