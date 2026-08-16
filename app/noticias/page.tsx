import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import AdBanner from "@/components/AdBanner";
import ViewTracker from "@/components/ViewTracker";
import { database } from "@/lib/db";

export const dynamic = "force-dynamic";

const POR_PAGINA = 24;

export default async function TodasNoticiasPage({
  searchParams
}: {
  searchParams: { pagina?: string };
}) {
  const pagina = Math.max(1, parseInt(searchParams.pagina || "1", 10) || 1);
  const [{ artigos, total }, mostrarSeloAutoral] = await Promise.all([
    database.getArticlesPaginated(pagina, POR_PAGINA),
    database.getSetting("mostrar_selo_autoral")
  ]);
  const seloAtivo = mostrarSeloAutoral === "true";
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <>
      <ViewTracker />
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-4xl uppercase tracking-tight mb-6 border-l-4 border-alert pl-4">
          Todas as notícias
        </h1>

        {artigos.length === 0 ? (
          <p className="font-ui text-charcoal/60">Nenhuma notícia publicada ainda.</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-6">
            {artigos.map((a) => (
              <ArticleCard key={a.id} artigo={a} mostrarSeloAutoral={seloAtivo} />
            ))}
          </div>
        )}

        <div className="my-8">
          <AdBanner posicao="meio-feed" />
        </div>

        {totalPaginas > 1 && (
          <nav className="flex items-center justify-center gap-2 font-ui text-sm py-6">
            {pagina > 1 && (
              <Link
                href={`/noticias?pagina=${pagina - 1}`}
                className="px-3 py-1.5 border border-line rounded-sm hover:border-alert"
              >
                ← Anterior
              </Link>
            )}
            <span className="px-3 py-1.5 text-charcoal/60">
              Página {pagina} de {totalPaginas}
            </span>
            {pagina < totalPaginas && (
              <Link
                href={`/noticias?pagina=${pagina + 1}`}
                className="px-3 py-1.5 border border-line rounded-sm hover:border-alert"
              >
                Próxima →
              </Link>
            )}
          </nav>
        )}
      </main>
      <Footer />
    </>
  );
}
