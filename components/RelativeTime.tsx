"use client";

import { useEffect, useState } from "react";

function calcular(dataISO: string) {
  const diffMs = Date.now() - new Date(dataISO).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

export default function RelativeTime({ dataISO }: { dataISO: string }) {
  const [texto, setTexto] = useState<string | null>(null);

  useEffect(() => {
    setTexto(calcular(dataISO));
    const id = setInterval(() => setTexto(calcular(dataISO)), 60000);
    return () => clearInterval(id);
  }, [dataISO]);

  // Antes de montar no navegador, não renderiza nada — evita divergência
  // entre o horário do servidor (quando a página foi gerada) e o horário
  // do navegador do usuário no momento em que ele efetivamente vê a página.
  if (!texto) return null;

  return <>{texto}</>;
}

export function FormattedDateTime({ dataISO }: { dataISO: string }) {
  const [texto, setTexto] = useState<string | null>(null);

  useEffect(() => {
    setTexto(new Date(dataISO).toLocaleString("pt-BR"));
  }, [dataISO]);

  if (!texto) return null;

  return <>{texto}</>;
}
