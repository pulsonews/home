import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3 font-ui text-sm">
        <div>
          <div className="font-display text-2xl mb-2">PULSO</div>
          <p className="opacity-70">
            Portal de notícias agregadas automaticamente via RSS, organizadas
            por editoria e atualizadas em tempo real.
          </p>
        </div>
        <div>
          <div className="font-semibold uppercase tracking-wide mb-2 text-xs opacity-80">
            Institucional
          </div>
          <ul className="space-y-1 opacity-70">
            <li>Sobre o Pulso</li>
            <li>Política de privacidade</li>
            <li>Anuncie no Pulso</li>
            <li>
              <Link href="/admin" className="hover:underline">
                Painel administrativo
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold uppercase tracking-wide mb-2 text-xs opacity-80">
            Siga o Pulso
          </div>
          <ul className="space-y-1 opacity-70">
            <li>WhatsApp Channel</li>
            <li>Instagram</li>
            <li>X (Twitter)</li>
            <li>Facebook</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-50 font-ui">
        © {new Date().getFullYear()} Pulso Notícias. Conteúdo de terceiros
        agregado via RSS — os direitos autorais pertencem às fontes originais.
      </div>
    </footer>
  );
}
