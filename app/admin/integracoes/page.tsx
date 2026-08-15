import { isAuthenticated } from "@/lib/auth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";
import AIKeysManager from "@/components/admin/AIKeysManager";

export default function IntegracoesPage() {
  if (!isAuthenticated()) return <AdminLogin />;

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl mb-2">Integrações</h1>
        <p className="font-ui text-charcoal/60 mb-8">
          Configure as chaves usadas para gerar matérias autorais. Nada
          disso exige acesso ao Railway — fica tudo salvo aqui.
        </p>
        <AIKeysManager />
      </main>
    </div>
  );
}
