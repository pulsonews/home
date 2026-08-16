import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import AdBanner from "@/components/AdBanner";
import ViewTracker from "@/components/ViewTracker";
import { database } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CategoriaPage({
  params
}: {
  params: { slug: string };
}) {
  const categories = await database.getCategories();
  const categoria = categories.find((c) => c.slug === params.slug);
  if (!categoria) notFound();

  const [artigos, mostrarSeloAutoral] = await Promise.all([
    database.getArticlesByCategory(params.slug),
    database.getSetting("mostrar_selo_autoral")
  ]);
  const seloAtivo = mostrarSeloAutoral === "true";

  return (
    <>
      <ViewTracker />
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1
          className="font-display text-4xl uppercase tracking-tight mb-6 border-l-4 pl-4"
          style={{ borderColor: categoria.cor }}
        >
          {categoria.nome}
        </h1>

        {artigos.length === 0 ? (
          <p className="font-ui text-charcoal/60">
            Nenhuma notícia nesta editoria ainda.
          </p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-6">
            {artigos.slice(0, 3).map((a) => (
              <ArticleCard key={a.id} artigo={a} mostrarSeloAutoral={seloAtivo} />
            ))}
          </div>
        )}

        <div className="my-8">
          <AdBanner posicao="meio-feed" />
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {artigos.slice(3).map((a) => (
            <ArticleCard key={a.id} artigo={a} mostrarSeloAutoral={seloAtivo} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
