import { isAuthenticated } from "@/lib/auth";
import { database } from "@/lib/db";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";
import RefreshButton from "@/components/admin/RefreshButton";
import PhotoOnlyToggle from "@/components/admin/PhotoOnlyToggle";
import Link from "next/link";

export default async function AdminHome() {
  if (!isAuthenticated()) return <AdminLogin />;

  const [articles, sources, categories, subscribers, somenteComFoto] = await Promise.all([
    database.getArticles(),
    database.getSources(),
    database.getCategories(),
    database.getSubscribers(),
    database.getSetting("somente_com_foto")
  ]);

  const cards = [
    { label: "Notícias publicadas", valor: articles.length, href: "/" },
    { label: "Fontes RSS ativas", valor: sources.filter((s) => s.ativo).length, href: "/admin/fontes" },
    { label: "Categorias", valor: categories.length, href: "/admin/categorias" },
    { label: "Inscritos na newsletter", valor: subscribers.length, href: "/admin/newsletter" }
  ];

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl mb-2">Visão geral</h1>
        <p className="font-ui text-charcoal/60 mb-8">
          Configure fontes de notícias, categorias, banners de anúncio e
          acompanhe a newsletter.
        </p>

        <div className="grid sm:grid-cols-4 gap-4 mb-10">
          {cards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="border border-line rounded-sm p-5 hover:border-alert transition-colors"
            >
              <div className="font-display text-3xl text-ink">{c.valor}</div>
              <div className="font-ui text-xs uppercase tracking-wide text-charcoal/60 mt-1">
                {c.label}
              </div>
            </Link>
          ))}
        </div>

        <div className="border border-line rounded-sm p-6 mb-10">
          <h2 className="font-display text-xl mb-2">Atualização de notícias</h2>
          <p className="font-ui text-sm text-charcoal/60 mb-4">
            As fontes RSS ativas são buscadas automaticamente a cada 15
            minutos (configurado em <code>vercel.json</code>). Você também
            pode forçar uma atualização manual agora.
          </p>
          <RefreshButton />
          <div className="mt-4 pt-4 border-t border-line">
            <PhotoOnlyToggle inicial={somenteComFoto === "true"} />
            <p className="font-ui text-xs text-charcoal/40 mt-1">
              Vale só para notícias importadas a partir de agora — não remove
              retroativamente as que já foram salvas sem foto.
            </p>
          </div>
        </div>

        <div className="border border-line rounded-sm p-6 mb-10">
          <h2 className="font-display text-xl mb-2">Matérias autorais com IA</h2>
          <p className="font-ui text-sm text-charcoal/60 mb-4">
            Gere conteúdo original do Pulso a partir de notícias agregadas —
            bom para SEO e para diferenciar o site de um simples agregador.
          </p>
          <Link
            href="/admin/autorais"
            className="inline-block bg-ink text-paper px-5 py-2.5 rounded-sm font-ui text-sm font-semibold hover:bg-alert transition-colors"
          >
            Ir para Matérias autorais
          </Link>
        </div>

        <div className="border border-line rounded-sm p-6">
          <h2 className="font-display text-xl mb-2">Integração com WhatsApp e Instagram</h2>
          <p className="font-ui text-sm text-charcoal/60">
            Use o endpoint <code>/api/feed</code> para conectar uma automação
            (Zapier, Make ou n8n) que publica as últimas notícias no seu
            Canal do WhatsApp e no Instagram automaticamente. Veja o passo a
            passo completo no arquivo <code>README.md</code> do projeto.
          </p>
        </div>
      </main>
    </div>
  );
}
