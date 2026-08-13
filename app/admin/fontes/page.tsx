import { isAuthenticated } from "@/lib/auth";
import { database } from "@/lib/db";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";
import SourceManager from "@/components/admin/SourceManager";

export default async function FontesPage() {
  if (!isAuthenticated()) return <AdminLogin />;
  const [fontes, categorias] = await Promise.all([
    database.getSources(),
    database.getCategories()
  ]);

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl mb-2">Fontes RSS</h1>
        <p className="font-ui text-charcoal/60 mb-8">
          Cadastre os feeds RSS que alimentam o portal automaticamente.
          Associe cada fonte a uma categoria — as notícias entram já
          organizadas por editoria.
        </p>
        <SourceManager fontesIniciais={fontes} categorias={categorias} />
      </main>
    </div>
  );
}
