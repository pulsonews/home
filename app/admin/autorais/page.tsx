import { isAuthenticated } from "@/lib/auth";
import { database } from "@/lib/db";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";
import AutoralGenerator from "@/components/admin/AutoralGenerator";

export default async function AutoraisPage() {
  if (!isAuthenticated()) return <AdminLogin />;

  const artigos = await database.getArticles();
  const candidatos = artigos.filter((a) => !a.autoral).slice(0, 20);

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl mb-2">Matérias autorais</h1>
        <p className="font-ui text-charcoal/60 mb-4 max-w-2xl">
          Escolha uma notícia agregada abaixo e gere uma versão autoral com
          IA: um texto original, escrito pela redação do Pulso a partir da
          apuração da fonte, sem copiar frases e sem inventar fatos. A fonte
          original é sempre citada no texto e linkada na página da matéria.
        </p>
        <p className="font-ui text-xs text-charcoal/40 mb-8">
          Requer pelo menos uma chave configurada em{" "}
          <a href="/admin/integracoes" className="underline hover:text-alert">
            Admin → Integrações
          </a>{" "}
          (Claude ou Gemini). Escolha o motor na lista antes de gerar cada
          matéria. Cada geração consome créditos da conta correspondente.
        </p>
        <AutoralGenerator candidatos={candidatos} />
      </main>
    </div>
  );
}
