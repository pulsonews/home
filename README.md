# Pulso Notícias

Portal de notícias responsivo, alimentado automaticamente por feeds RSS,
com banners de anúncio (Google AdSense), compartilhamento social
(WhatsApp, Facebook, X, Instagram), newsletter e um painel administrativo
para configurar tudo — sem precisar mexer no código no dia a dia.

Feito em **Next.js 14 (App Router) + TypeScript + Tailwind CSS**.

---

## 1. O que já vem pronto

- **Home + páginas de categoria + página de notícia**, responsivas, com
  identidade visual própria (tipografia, cores, "barra ao vivo").
- **Agregador de RSS** (`lib/rss.ts`): busca os feeds cadastrados, extrai
  título, resumo, imagem e categoria, e evita duplicatas.
- **Atualização automática**: endpoint `/api/rss/refresh`, chamado por um
  cron (já configurado em `vercel.json` para rodar a cada 15 minutos na
  Vercel). Também pode ser disparado manualmente pelo painel admin.
- **4 espaços de banner** prontos para Google AdSense (topo, meio do feed,
  lateral, dentro da notícia) — ou para colar HTML de qualquer outra rede
  de monetização.
- **Compartilhamento** com um clique para WhatsApp, Facebook e X. Para
  Instagram (que não tem link de compartilhamento direto na web), o botão
  copia o texto/link e abre o app para colar em Stories/Direct.
- **Newsletter**: formulário público grava e-mails; painel admin lista e
  exporta CSV.
- **Painel administrativo** (`/admin`) protegido por senha, para gerenciar
  fontes RSS, categorias, banners e ver os inscritos da newsletter.
- **SEO básico**: `sitemap.xml` dinâmico, `robots.txt`, `ads.txt` e
  metadados Open Graph em cada notícia.

## 2. Como rodar localmente

Pré-requisitos: Node.js 18+.

```bash
npm install
cp .env.example .env.local
# edite .env.local com sua senha de admin, chaves e domínio
npm run dev
```

Acesse `http://localhost:3000` (site) e `http://localhost:3000/admin`
(painel — senha definida em `ADMIN_PASSWORD`).

Ao abrir o admin, cadastre fontes RSS em **Fontes RSS** (algumas já vêm de
exemplo em `data/db.json`) e clique em **Atualizar RSS agora** na Visão
geral para popular o site.

## 3. Variáveis de ambiente (`.env.local`)

| Variável | Para que serve |
|---|---|
| `ADMIN_PASSWORD` | Senha de acesso ao painel `/admin` |
| `SESSION_SECRET` | Chave usada para assinar o cookie de sessão do admin |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Seu ID do Google AdSense (`ca-pub-...`) |
| `RSS_REFRESH_SECRET` | Protege o endpoint de atualização automática do RSS |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site (usada em sitemap e compartilhamento) |

**Troque todos os valores padrão antes de publicar o site.**

## 4. Publicando o site (deploy)

A forma mais simples é a **Vercel** (mesma empresa do Next.js), pois ela
já executa o cron definido em `vercel.json` automaticamente:

1. Suba este projeto para um repositório no GitHub/GitLab.
2. Em [vercel.com](https://vercel.com), importe o repositório.
3. Configure as variáveis de ambiente da tabela acima nas configurações
   do projeto.
4. Faça o deploy. O cron `/api/rss/refresh` passará a rodar a cada 15
   minutos automaticamente.

Se preferir outro provedor (Railway, Render, VPS própria), tudo funciona
normalmente com `npm run build && npm start` — só configure um cron
externo (ex: [cron-job.org](https://cron-job.org) ou GitHub Actions) para
chamar `GET /api/rss/refresh` com o cabeçalho
`Authorization: Bearer <RSS_REFRESH_SECRET>` no intervalo desejado.

### Deploy no Railway

1. Suba o projeto para um repositório no GitHub.
2. Em [railway.app](https://railway.app), crie um projeto a partir do
   repositório — o Railway detecta o Next.js automaticamente.
3. No mesmo projeto, clique em **New → Database → PostgreSQL** para
   adicionar um banco gerenciado.
4. No serviço da aplicação, em **Variables**, adicione todas as chaves da
   tabela acima. Para `DATABASE_URL`, referencie o Postgres criado (o
   Railway sugere `${{Postgres.DATABASE_URL}}` automaticamente).
5. Gere um domínio público em **Settings → Networking → Generate Domain**
   e preencha `NEXT_PUBLIC_SITE_URL` com essa URL.
6. Configure um cron externo (o Railway não tem cron nativo apontando
   para uma URL) para chamar `GET /api/rss/refresh` a cada 15 minutos.

## 4.1 Banco de dados (Postgres)

Os dados do site (notícias, fontes RSS, categorias, banners e inscritos
da newsletter) ficam em **Postgres** — importante porque provedores como
Railway e Vercel não garantem um sistema de arquivos persistente entre
deploys, então um banco de verdade evita perder tudo a cada atualização
de código.

Depois de ter uma `DATABASE_URL` válida em `.env.local` (ou nas variáveis
de ambiente do provedor), rode uma vez:

```bash
npm run db:migrate   # cria as tabelas (categories, sources, banners, articles, newsletter)
npm run db:seed      # popula categorias, fontes RSS e banners de exemplo
```

Esses dois comandos também podem ser rodados apontando `DATABASE_URL`
para o Postgres do Railway a partir da sua máquina local (o Railway
expõe uma URL pública de conexão em **Postgres → Connect**), sem precisar
abrir um shell no servidor.

A implementação inteira do acesso ao banco fica isolada em `lib/db.ts` —
nenhuma página, componente ou rota de API precisa saber que por trás
existe Postgres; se um dia você quiser trocar de banco, só este arquivo
muda.

## 5. Configurando o Google AdSense

1. Crie uma conta em [adsense.google.com](https://adsense.google.com) e
   adicione seu domínio.
2. Copie seu ID de cliente (`ca-pub-XXXXXXXXXXXXXXXX`) e coloque em
   `NEXT_PUBLIC_ADSENSE_CLIENT`.
3. Crie um "bloco de anúncios" para cada posição (topo, meio do feed,
   lateral, artigo) e copie o `data-ad-slot` de cada um.
4. No painel admin, vá em **Banners** e cole o ID de cada slot na posição
   correspondente.
5. Atualize `public/ads.txt` com a linha exata fornecida pelo Google (em
   *Anúncios → Por site → Baixar ads.txt*) — isso é obrigatório para o
   AdSense aprovar e exibir anúncios no domínio.
6. Para usar **outra rede de monetização** (Ezoic, Media.net, um link de
   afiliado, etc.) em qualquer posição, escolha "HTML personalizado" no
   painel de Banners e cole o código fornecido pela rede.

## 6. Cadastrando fontes RSS e organizando tópicos

No painel, em **Fontes RSS**, cadastre a URL do feed e a categoria em que
ele deve entrar. Cada fonte é buscada automaticamente e as notícias já
nascem separadas por editoria (Brasil, Mundo, Economia, Esportes,
Tecnologia, Entretenimento — ou as categorias que você criar em
**Categorias**).

Dicas:
- Prefira fontes que você tem direito de agregar (o portal publica
  título + resumo curto + link "Ler matéria completa na fonte original",
  o que é a prática padrão de agregadores de notícia).
- Você pode ativar/desativar uma fonte sem excluí-la.
- O botão **Atualizar RSS agora** força uma busca imediata em todas as
  fontes ativas.

## 7. Newsletter e canais de WhatsApp/Instagram

O formulário de newsletter (na home, seção "Receba o resumo do dia")
grava e-mails que você pode exportar em **Admin → Newsletter → Exportar
CSV** e importar em uma ferramenta de e-mail marketing (Mailchimp, Brevo,
RD Station, etc.).

Para **publicar automaticamente no seu Canal do WhatsApp e no
Instagram**, o portal expõe um feed JSON pronto para automações:

```
GET /api/feed?categoria=brasil&limite=5
```

Retorna as últimas notícias em JSON (título, resumo, imagem, link).
Passo a passo recomendado:

1. Crie uma conta gratuita em uma ferramenta de automação, como
   [Zapier](https://zapier.com), [Make](https://make.com) ou
   [n8n](https://n8n.io) (auto-hospedável).
2. Configure um gatilho agendado (ex: a cada 30 minutos) que chama
   `GET https://seusite.com.br/api/feed`.
3. Adicione uma etapa que publica o texto/imagem retornados no seu
   **Canal do WhatsApp** (via WhatsApp Business API/Cloud API da Meta) e
   no **Instagram** (via Instagram Graph API, para contas comerciais).
4. Tanto a WhatsApp Business Platform quanto a Instagram Graph API exigem
   uma conta comercial verificada na Meta — a automação acima cobre a
   parte de "buscar e formatar as notícias"; a publicação em si depende
   das credenciais que a Meta fornece para o seu negócio.

## 8. Estrutura do projeto

```
app/
  page.tsx                  → Home
  categoria/[slug]/page.tsx → Listagem por categoria
  noticia/[id]/page.tsx     → Página da notícia + compartilhamento
  admin/                    → Painel administrativo (protegido por senha)
  api/
    rss/refresh/            → Atualiza os artigos a partir dos feeds RSS
    newsletter/subscribe/   → Recebe inscrições na newsletter
    feed/                   → Feed JSON para automações (WhatsApp/Instagram)
    admin/                  → CRUD de fontes, categorias, banners e login
components/       → Header, Footer, ArticleCard, AdBanner, ShareButtons...
components/admin/ → Telas e formulários do painel administrativo
lib/
  db.ts   → Acesso aos dados (Postgres)
  rss.ts  → Leitura e normalização dos feeds RSS
  auth.ts → Autenticação do painel admin
scripts/
  schema.sql   → Definição das tabelas do Postgres
  migrate.mjs  → Aplica o schema.sql (npm run db:migrate)
  seed.mjs     → Popula categorias, fontes e banners iniciais (npm run db:seed)
```

## 9. Próximos passos sugeridos

- Adicionar autenticação multiusuário no admin (hoje é uma senha única).
- Conectar um serviço de e-mail transacional (Resend, SendGrid) para
  enviar de fato o resumo diário por e-mail aos inscritos.
- Adicionar Google Analytics / Search Console para acompanhar tráfego e
  facilitar a aprovação e otimização do AdSense.
