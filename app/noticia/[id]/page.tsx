import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import ShareButtons from "@/components/ShareButtons";
import ArticleCard from "@/components/ArticleCard";
import { FormattedDateTime } from "@/components/RelativeTime";
import ViewTracker from "@/components/ViewTracker";
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
      images: data.artigo.imagem ? [data.artigo.imagem] : [],
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
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
  const [data, mostrarAvisoIA, mostrarSeloAutoral, logoUrl, nomeSiteConfig, whatsappUrl] =
    await Promise.all([
      getData(params.id),
      database.getSetting("mostrar_aviso_ia"),
      database.getSetting("mostrar_selo_autoral"),
      database.getSetting("logo_url"),
      database.getSetting("nome_site"),
      database.getSetting("whatsapp_url")
    ]);
  if (!data) notFound();
  const { artigo, relacionadas } = data;
  const avisoAtivo = mostrarAvisoIA === "true";
  const seloAtivo = mostrarSeloAutoral === "true";
  const nomeSite = nomeSiteConfig || "Pulso Notícias";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const urlCompleta = `${siteUrl}/noticia/${artigo.id}`;

  // Dados estruturados (Schema.org NewsArticle) — ajuda o Google a entender
  // que a página é uma notícia, o que favorece aparecer no Google News/Discover.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: artigo.titulo,
    description: artigo.resumo,
    image: artigo.imagem ? [artigo.imagem] : undefined,
    datePublished: artigo.publicadoEm,
    dateModified: artigo.publicadoEm,
    author: [{ "@type": "Organization", name: nomeSite }],
    publisher: {
      "@type": "Organization",
      name: nomeSite,
      logo: logoUrl ? { "@type": "ImageObject", url: logoUrl } : undefined
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": urlCompleta }
  };

  // Divide o corpo em duas metades para encaixar um segundo banner no meio
  // de matérias autorais longas (só faz sentido quando há parágrafos
  // suficientes para não ficar dois anúncios colados).
  const paragrafos = artigo.autoral && artigo.conteudo ? artigo.conteudo.split("\n\n") : [];
  const meio = Math.ceil(paragrafos.length / 2);
  const primeiraMetade = paragrafos.slice(0, meio);
  const segundaMetade = paragrafos.slice(meio);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker articleId={artigo.id} />
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">
          <article className="max-w-3xl">
            <span className="font-ui text-xs uppercase tracking-wide text-alert font-semibold">
              {artigo.categoria}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl mt-2 mb-4 leading-tight">
              {artigo.titulo}
            </h1>
            <p className="font-ui text-sm text-charcoal/50 mb-6">
              Fonte: {artigo.fonte} · <FormattedDateTime dataISO={artigo.publicadoEm} />
            </p>

            {artigo.autoral && avisoAtivo ? (
              <div className="mb-6 bg-gold/10 border border-gold/40 rounded-sm px-4 py-3 font-ui text-sm text-charcoal/80">
                <strong className="text-gold">Matéria autoral do Pulso.</strong>{" "}
                Texto original elaborado com apoio de{" "}
                {artigo.geradoPor === "gemini" ? "Google Gemini" : "Claude (Anthropic)"} e
                supervisão editorial, com base em apuração de{" "}
                {artigo.fonte === "Pulso Notícias" ? "terceiros" : artigo.fonte}.
                {artigo.fonteOriginalLink && (
                  <>
                    {" "}
                    <a
                      href={artigo.fonteOriginalLink}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="underline hover:text-alert"
                    >
                      Veja a apuração original
                    </a>
                    .
                  </>
                )}
              </div>
            ) : null}

            {artigo.imagem && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artigo.imagem}
                alt={artigo.titulo}
                className="w-full aspect-video object-cover mb-6"
              />
            )}

            {artigo.autoral && artigo.conteudo ? (
              <div className="font-body text-lg leading-relaxed text-charcoal/90 mb-6 space-y-4">
                {primeiraMetade.map((paragrafo, i) => (
                  <p key={`a-${i}`}>{paragrafo}</p>
                ))}
                {segundaMetade.length > 0 && paragrafos.length >= 6 && (
                  <div className="not-prose py-2">
                    <AdBanner posicao="artigo" />
                  </div>
                )}
                {segundaMetade.map((paragrafo, i) => (
                  <p key={`b-${i}`}>{paragrafo}</p>
                ))}
              </div>
            ) : (
              <p className="font-body text-lg leading-relaxed text-charcoal/90 mb-6">
                {artigo.resumo}
              </p>
            )}

            {!artigo.autoral && (
              <a
                href={artigo.link}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-block font-ui text-sm font-semibold uppercase tracking-wide bg-ink text-paper px-5 py-3 rounded-sm hover:bg-alert transition-colors mb-8"
              >
                Ler matéria completa na fonte original →
              </a>
            )}

            <ShareButtons url={urlCompleta} titulo={artigo.titulo} />

            <div className="my-8">
              <AdBanner posicao="artigo" />
            </div>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#25D366] text-white rounded-sm px-5 py-4 mb-8 font-ui text-center hover:opacity-90 transition-opacity"
              >
                <span className="font-semibold">
                  📲 Acompanhe as notícias em tempo real no nosso canal do WhatsApp
                </span>
              </a>
            )}

            {relacionadas.length > 0 && (
              <section>
                <h2 className="font-display text-xl uppercase tracking-tight mb-4 border-t border-line pt-6">
                  Relacionadas
                </h2>
                <div className="grid sm:grid-cols-3 gap-6">
                  {relacionadas.map((a) => (
                    <ArticleCard key={a.id} artigo={a} mostrarSeloAutoral={seloAtivo} />
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <AdBanner posicao="lateral" />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
