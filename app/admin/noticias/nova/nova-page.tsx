import { isAuthenticated } from "@/lib/auth";
import { database } from "@/lib/db";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";
import NewArticleForm from "@/components/admin/NewArticleForm";

export default async function NovaNoticiaPage() {
  if (!isAuthenticated()) return <AdminLogin />;

  const categorias = await database.getCategories();

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl mb-2">Nova notícia</h1>
        <p className="font-ui text-charcoal/60 mb-8">
          Escreva uma notícia do zero — sem RSS, sem IA. Salve como rascunho
          para revisar depois em Notícias, ou publique direto.
        </p>
        <NewArticleForm categorias={categorias} />
      </main>
    </div>
  );
}
