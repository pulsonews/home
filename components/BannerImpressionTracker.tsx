"use client";

import { useEffect } from "react";

export default function BannerImpressionTracker({ bannerId }: { bannerId: string }) {
  useEffect(() => {
    fetch("/api/track-banner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bannerId }),
      keepalive: true
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerId]);

  return null;
}
