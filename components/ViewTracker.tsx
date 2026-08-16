"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ViewTracker({ articleId }: { articleId?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, articleId }),
      keepalive: true
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, articleId]);

  return null;
}
