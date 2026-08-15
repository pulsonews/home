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
        <h1 className="font-display text-3xl mb-2">Notícias</h1>
        <p className="font-ui text-charcoal/60 mb-8">
          Aprove rascunhos (matérias autorais recém-geradas), edite título,
          resumo, texto, categoria ou imagem, ou exclua qualquer notícia.
        </p>
        <NewsManager artigosIniciais={artigos} categorias={categorias} />
      </main>
    </div>
  );
}
