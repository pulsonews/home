import { isAuthenticated } from "@/lib/auth";
import { database } from "@/lib/db";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";
import NewsManager from "@/components/admin/NewsManager";

export default async function NoticiasPage() {
  if (!isAuthenticated()) return <AdminLogin />;

  const [artigos, categorias] = await Promise.all([
    database.getAllArticlesAdmin(),
    database.getCategories()
  ]);

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
          <h1 className="font-display text-3xl">Notícias</h1>
          <a
            href="/admin/noticias/nova"
            className="bg-ink text-paper font-ui text-sm font-semibold px-4 py-2 rounded-sm hover:bg-alert transition-colors"
          >
            + Nova notícia
          </a>
        </div>
        <p className="font-ui text-charcoal/60 mb-8">
          Aprove rascunhos (matérias autorais recém-geradas), edite título,
          resumo, texto, categoria ou imagem, ou exclua qualquer notícia.
        </p>
        <NewsManager artigosIniciais={artigos} categorias={categorias} />
      </main>
    </div>
  );
}
