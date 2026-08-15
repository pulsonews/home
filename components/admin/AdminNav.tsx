"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/fontes", label: "Fontes RSS" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/autorais", label: "Matérias autorais" },
  { href: "/admin/newsletter", label: "Newsletter" }
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function sair() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link href="/admin" className="font-display text-xl">
          PULSO · Admin
        </Link>
        <div className="flex items-center gap-4 font-ui text-sm">
          <Link href="/" target="_blank" className="opacity-70 hover:opacity-100">
            Ver site ↗
          </Link>
          <button onClick={sair} className="text-alert font-semibold">
            Sair
          </button>
        </div>
      </div>
      <nav className="mx-auto max-w-5xl px-4 flex gap-5 overflow-x-auto font-ui text-sm pb-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap pb-1 border-b-2 ${
              pathname === l.href
                ? "border-alert text-paper"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
