"use client";

import { useEffect } from "react";

// Depois que os banners <ins class="adsbygoogle"> são renderizados,
// o Google exige que cada um seja "empurrado" para a fila de exibição.
export default function AdSenseInit() {
  useEffect(() => {
    try {
      const ads = document.querySelectorAll("ins.adsbygoogle:not([data-adsbygoogle-status])");
      ads.forEach(() => {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      });
    } catch (e) {
      // AdSense ainda não carregado ou bloqueado por ad-blocker — não quebra a página.
    }
  }, []);

  return null;
}
