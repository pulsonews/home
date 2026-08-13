import { isAuthenticated } from "@/lib/auth";
import { database } from "@/lib/db";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";

export default async function NewsletterPage() {
  if (!isAuthenticated()) return <AdminLogin />;
  const inscritos = (await database.getSubscribers()).sort(
    (a, b) => +new Date(b.criadoEm) - +new Date(a.criadoEm)
  );

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
          <h1 className="font-display text-3xl">Newsletter</h1>
          <a
            href="/api/admin/newsletter/export"
            className="bg-ink text-paper font-ui text-sm font-semibold uppercase tracking-wide px-4 py-2 rounded-sm hover:bg-alert transition-colors"
          >
            Exportar CSV
          </a>
        </div>
        <p className="font-ui text-charcoal/60 mb-8">
          {inscritos.length} inscrito(s). Use o CSV exportado para importar
          a lista em uma ferramenta de e-mail marketing (Mailchimp, Brevo,
          RD Station) ou em uma automação que dispara mensagens para o Canal
          de WhatsApp e o Instagram — veja o README.
        </p>

        <div className="border border-line rounded-sm overflow-hidden">
          <table className="w-full text-sm font-ui">
            <thead className="bg-white border-b border-line text-left">
              <tr>
                <th className="p-3">E-mail</th>
                <th className="p-3">Inscrito em</th>
              </tr>
            </thead>
            <tbody>
              {inscritos.map((i) => (
                <tr key={i.email} className="border-b border-line last:border-0">
                  <td className="p-3">{i.email}</td>
                  <td className="p-3 text-charcoal/60">
                    {new Date(i.criadoEm).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
              {inscritos.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-6 text-center text-charcoal/50">
                    Nenhum inscrito ainda.
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
