import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import ShareButtons from "@/components/ShareButtons";
import ArticleCard from "@/components/ArticleCard";
import { database } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

async function getData(id: string) {
  const artigo = await database.getArticleById(id);
  if (!artigo) return null;
  const relacionadas = (await database.getArticlesByCategory(artigo.categoria))
    .filter((a) => a.id !== id)
    .slice(0, 3);
  return { artigo, relacionadas };
}

export async function generateMetadata({
  params
}: {
  params: { id: string };
}): Promise<Metadata> {
  const data = await getData(params.id);
  if (!data) return {};
  return {
    title: `${data.artigo.titulo} — Pulso Notícias`,
    description: data.artigo.resumo,
    openGraph: {
      title: data.artigo.titulo,
      description: data.artigo.resumo,
      images: data.artigo.imagem ? [data.artigo.imagem] : []
    }
  };
}

export default async function NoticiaPage({
  params
}: {
  params: { id: string };
}) {
  const data = await getData(params.id);
  if (!data) notFound();
  const { artigo, relacionadas } = data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const urlCompleta = `${siteUrl}/noticia/${artigo.id}`;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <span className="font-ui text-xs uppercase tracking-wide text-alert font-semibold">
          {artigo.categoria}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl mt-2 mb-4 leading-tight">
          {artigo.titulo}
        </h1>
        <p className="font-ui text-sm text-charcoal/50 mb-6">
          Fonte: {artigo.fonte} ·{" "}
          {new Date(artigo.publicadoEm).toLocaleString("pt-BR")}
        </p>

        {artigo.imagem && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artigo.imagem}
            alt={artigo.titulo}
            className="w-full aspect-video object-cover mb-6"
          />
        )}

        <p className="font-body text-lg leading-relaxed text-charcoal/90 mb-6">
          {artigo.resumo}
        </p>

        <a
          href={artigo.link}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-block font-ui text-sm font-semibold uppercase tracking-wide bg-ink text-paper px-5 py-3 rounded-sm hover:bg-alert transition-colors mb-8"
        >
          Ler matéria completa na fonte original →
        </a>

        <ShareButtons url={urlCompleta} titulo={artigo.titulo} />

        <div className="my-8">
          <AdBanner posicao="artigo" />
        </div>

        {relacionadas.length > 0 && (
          <section>
            <h2 className="font-display text-xl uppercase tracking-tight mb-4 border-t border-line pt-6">
              Relacionadas
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {relacionadas.map((a) => (
                <ArticleCard key={a.id} artigo={a} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
