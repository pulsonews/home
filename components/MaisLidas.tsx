import Link from "next/link";
import { database } from "@/lib/db";

export default async function MaisLidas({
  periodoHoras = 24,
  titulo = "Mais lidas agora"
}: {
  periodoHoras?: number;
  titulo?: string;
}) {
  const artigos = await database.getMaisLidas(periodoHoras, 5);

  if (artigos.length === 0) return null;

  return (
    <div className="border border-line rounded-sm p-5 bg-white">
      <h2 className="font-display text-lg uppercase tracking-tight mb-4 border-l-4 border-alert pl-3">
        {titulo}
      </h2>
      <ol className="space-y-3">
        {artigos.map((a, i) => (
          <li key={a.id}>
            <Link href={`/noticia/${a.id}`} className="flex items-start gap-3 group">
              <span className="font-display text-2xl text-line group-hover:text-alert transition-colors leading-none w-6 shrink-0">
                {i + 1}
              </span>
              <span className="font-ui text-sm leading-snug text-charcoal group-hover:text-alert transition-colors">
                {a.titulo}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
