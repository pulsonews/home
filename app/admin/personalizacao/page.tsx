import { isAuthenticated } from "@/lib/auth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";
import BrandingManager from "@/components/admin/BrandingManager";

export default function PersonalizacaoPage() {
  if (!isAuthenticated()) return <AdminLogin />;

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl mb-2">Personalização</h1>
        <p className="font-ui text-charcoal/60 mb-8">
          Troque a logo e o nome exibidos no cabeçalho e rodapé do site.
        </p>
        <BrandingManager />
      </main>
    </div>
  );
}
