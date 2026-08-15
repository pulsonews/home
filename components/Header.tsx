import Link from "next/link";
import { database } from "@/lib/db";
import LiveDate from "./LiveDate";

export default async function Header() {
  const categories = await database.getCategories();

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-line">
      {/* Barra "ao vivo" — elemento de assinatura do portal */}
      <div className="bg-ink text-paper text-xs font-ui">
        <div className="mx-auto max-w-6xl px-4 h-8 flex items-center gap-3 overflow-hidden">
          <span className="flex items-center gap-1.5 shrink-0 text-alert font-semibold tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-alert" />
            </span>
            AO VIVO
          </span>
          <LiveDate />
          <span className="opacity-50 hidden sm:inline">
            · Atualizado automaticamente via RSS
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-3xl tracking-tight text-ink">
            PULSO
          </span>
          <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-alert font-semibold">
            notícias
          </span>
        </Link>

        <Link
          href="/#newsletter"
          className="hidden sm:inline-block font-ui text-xs font-semibold uppercase tracking-wide bg-ink text-paper px-4 py-2 rounded-sm hover:bg-alert transition-colors"
        >
          Assinar newsletter
        </Link>
      </div>

      <nav className="mx-auto max-w-6xl px-4 pb-2 flex gap-5 overflow-x-auto font-ui text-sm">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/categoria/${c.slug}`}
            className="whitespace-nowrap uppercase tracking-wide font-semibold text-charcoal/80 hover:text-alert transition-colors pb-1 border-b-2 border-transparent hover:border-alert"
          >
            {c.nome}
          </Link>
        ))}
      </nav>
    </header>
  );
}
