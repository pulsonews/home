import { isAuthenticated } from "@/lib/auth";
import { database } from "@/lib/db";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";
import Link from "next/link";

export default async function EstatisticasPage() {
  if (!isAuthenticated()) return <AdminLogin />;

  const stats = await database.getStats();

  const cards = [
    { label: "Visualizações totais", valor: stats.totalViews },
    { label: "Últimas 24h", valor: stats.viewsHoje },
    { label: "Últimos 7 dias", valor: stats.views7dias }
  ];

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl mb-2">Estatísticas</h1>
        <p className="font-ui text-charcoal/60 mb-8">
          Contagem de visualizações registradas a partir de agora — não há
          dados retroativos de antes de este recurso ter sido ativado.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10 font-ui">
          {cards.map((c) => (
            <div key={c.label} className="border border-line rounded-sm p-5">
              <div className="font-display text-3xl text-ink">{c.valor}</div>
              <div className="text-xs uppercase tracking-wide text-charcoal/60 mt-1">
                {c.label}
              </div>
            </div>
          ))}
        </div>

        <h2 className="font-display text-xl mb-4">
          Mais vistas nos últimos 30 dias
        </h2>
        <div className="border border-line rounded-sm overflow-hidden font-ui text-sm">
          <table className="w-full">
            <thead className="bg-white border-b border-line text-left">
              <tr>
                <th className="p-3">Notícia</th>
                <th className="p-3">Categoria</th>
                <th className="p-3 text-right">Views</th>
              </tr>
            </thead>
            <tbody>
              {stats.topArtigos.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <Link
                      href={`/noticia/${a.id}`}
                      target="_blank"
                      className="hover:text-alert hover:underline"
                    >
                      {a.titulo}
                    </Link>
                  </td>
                  <td className="p-3 capitalize text-charcoal/60">{a.categoria}</td>
                  <td className="p-3 text-right font-semibold">{a.views}</td>
                </tr>
              ))}
              {stats.topArtigos.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-charcoal/50">
                    Ainda sem dados suficientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
