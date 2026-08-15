import { isAuthenticated } from "@/lib/auth";
import { database } from "@/lib/db";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function CategoriasPage() {
  if (!isAuthenticated()) return <AdminLogin />;
  const categorias = await database.getCategories();

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl mb-2">Categorias</h1>
        <p className="font-ui text-charcoal/60 mb-8">
          Organize os tópicos das notícias publicadas no portal e no menu de
          navegação.
        </p>
        <CategoryManager categoriasIniciais={categorias} />
      </main>
    </div>
  );
}
