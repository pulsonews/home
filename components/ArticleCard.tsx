import Link from "next/link";
import type { Artigo } from "@/lib/db";

function tempoRelativo(dataISO: string) {
  const diffMs = Date.now() - new Date(dataISO).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

export default function ArticleCard({
  artigo,
  destaque = false
}: {
  artigo: Artigo;
  destaque?: boolean;
}) {
  return (
    <Link
      href={`/noticia/${artigo.id}`}
      className={`group block ${destaque ? "sm:col-span-2 sm:row-span-2" : ""}`}
    >
      <article className="h-full flex flex-col">
        <div
          className={`relative overflow-hidden bg-line/40 mb-3 ${
            destaque ? "aspect-[16/9]" : "aspect-[4/3]"
          }`}
        >
          {artigo.imagem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artigo.imagem}
              alt={artigo.titulo}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center font-display text-line text-4xl">
              PULSO
            </div>
          )}
          <span className="absolute top-2 left-2 -rotate-3 bg-ink text-paper font-ui text-[10px] font-bold uppercase tracking-wider px-2 py-1 shadow-sm">
            {artigo.categoria}
          </span>
        </div>
        <h3
          className={`font-display leading-snug text-charcoal group-hover:text-alert transition-colors ${
            destaque ? "text-2xl sm:text-3xl" : "text-lg"
          }`}
        >
          {artigo.titulo}
        </h3>
        {destaque && (
          <p className="font-body text-charcoal/70 mt-2 line-clamp-2">
            {artigo.resumo}
          </p>
        )}
        <div className="mt-auto pt-2 font-ui text-xs text-charcoal/50">
          {artigo.fonte} · {tempoRelativo(artigo.publicadoEm)}
        </div>
      </article>
    </Link>
  );
}
