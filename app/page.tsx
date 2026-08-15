import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import AdBanner from "@/components/AdBanner";
import Newsletter from "@/components/Newsletter";
import { database } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [articles, categories, mostrarSeloAutoral] = await Promise.all([
    database.getArticles(),
    database.getCategories(),
    database.getSetting("mostrar_selo_autoral")
  ]);
  const seloAtivo = mostrarSeloAutoral === "true";

  const destaque = articles[0];
  const restante = articles.slice(1);
  const primeiroBloco = restante.slice(0, 5);
  const segundoBloco = restante.slice(5, 11);

  return (
    <>
      <Header />
      <AdBanner posicao="topo" />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {articles.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <section className="grid sm:grid-cols-3 gap-6">
              {destaque && <ArticleCard artigo={destaque} destaque mostrarSeloAutoral={seloAtivo} />}
              {primeiroBloco.map((a) => (
                <ArticleCard key={a.id} artigo={a} mostrarSeloAutoral={seloAtivo} />
              ))}
            </section>

            <div className="my-10">
              <AdBanner posicao="meio-feed" />
            </div>

            {categories.slice(0, 3).map((cat) => {
              const items = articles
                .filter((a) => a.categoria === cat.slug)
                .slice(0, 4);
              if (items.length === 0) return null;
              return (
                <section key={cat.slug} className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-2xl uppercase tracking-tight border-l-4 pl-3" style={{ borderColor: cat.cor }}>
                      {cat.nome}
                    </h2>
                    <a
                      href={`/categoria/${cat.slug}`}
                      className="font-ui text-xs uppercase tracking-wide text-alert font-semibold hover:underline"
                    >
                      Ver tudo
                    </a>
                  </div>
                  <div className="grid sm:grid-cols-4 gap-6">
                    {items.map((a) => (
                      <ArticleCard key={a.id} artigo={a} mostrarSeloAutoral={seloAtivo} />
                    ))}
                  </div>
                </section>
              );
            })}

            {segundoBloco.length > 0 && (
              <section className="grid sm:grid-cols-3 gap-6 mb-12">
                {segundoBloco.map((a) => (
                  <ArticleCard key={a.id} artigo={a} mostrarSeloAutoral={seloAtivo} />
                ))}
              </section>
            )}
          </>
        )}

        <Newsletter />
      </main>

      <Footer />
    </>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24 font-ui">
      <p className="font-display text-2xl mb-2">Nenhuma notícia publicada ainda</p>
      <p className="text-charcoal/60 max-w-md mx-auto">
        Cadastre fontes RSS no{" "}
        <a href="/admin/fontes" className="text-alert underline">
          painel administrativo
        </a>{" "}
        e clique em &quot;Atualizar agora&quot;, ou aguarde a próxima
        atualização automática.
      </p>
    </div>
  );
}
