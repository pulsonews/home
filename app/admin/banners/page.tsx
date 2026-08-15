import { isAuthenticated } from "@/lib/auth";
import { database } from "@/lib/db";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";
import BannerManager from "@/components/admin/BannerManager";

export default async function BannersPage() {
  if (!isAuthenticated()) return <AdminLogin />;
  const banners = await database.getBanners();

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl mb-2">Banners de anúncio</h1>
        <p className="font-ui text-charcoal/60 mb-8">
          Configure o Google AdSense (informe o ID do cliente em{" "}
          <code>NEXT_PUBLIC_ADSENSE_CLIENT</code> nas variáveis de ambiente e
          o ID de cada bloco abaixo) ou cole código HTML de outra rede de
          monetização por posição.
        </p>
        <BannerManager bannersIniciais={banners} />
      </main>
    </div>
  );
}
