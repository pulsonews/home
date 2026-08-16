-- Schema do Pulso Notícias.
-- Execute com: npm run db:migrate  (ou psql "$DATABASE_URL" -f scripts/schema.sql)
--
-- Sem foreign keys entre categorias/fontes/artigos de propósito: o painel
-- admin substitui listas inteiras (categorias, fontes, banners) em uma
-- transação de "apagar tudo e reinserir", e uma FK com cascade apagaria
-- dados relacionados por engano. A integridade é garantida pela aplicação.

CREATE TABLE IF NOT EXISTS categories (
  slug TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  cor  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sources (
  id        TEXT PRIMARY KEY,
  nome      TEXT NOT NULL,
  url       TEXT NOT NULL,
  categoria TEXT NOT NULL,
  ativo     BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS banners (
  id       TEXT PRIMARY KEY,
  posicao  TEXT NOT NULL,
  tipo     TEXT NOT NULL DEFAULT 'adsense',
  slot_id  TEXT,
  html     TEXT,
  ativo    BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS articles (
  id            TEXT PRIMARY KEY,
  titulo        TEXT NOT NULL,
  resumo        TEXT NOT NULL DEFAULT '',
  link          TEXT NOT NULL,
  imagem        TEXT,
  categoria     TEXT NOT NULL,
  fonte         TEXT NOT NULL,
  publicado_em  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_publicado_em ON articles (publicado_em DESC);
CREATE INDEX IF NOT EXISTS idx_articles_categoria ON articles (categoria);

CREATE TABLE IF NOT EXISTS newsletter (
  email      TEXT PRIMARY KEY,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Matérias autorais geradas por IA a partir de notícias agregadas.
ALTER TABLE articles ADD COLUMN IF NOT EXISTS autoral BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS conteudo TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS fonte_original_id TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS fonte_original_link TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS gerado_por TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'publicado';

-- Configurações gerais do site (chave/valor), editáveis pelo admin.
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Registro de visualizações, usado para estatísticas no admin.
CREATE TABLE IF NOT EXISTS page_views (
  id         BIGSERIAL PRIMARY KEY,
  path       TEXT NOT NULL,
  article_id TEXT,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_page_views_article ON page_views (article_id);
CREATE INDEX IF NOT EXISTS idx_page_views_criado_em ON page_views (criado_em);

-- Agendamento e limite de impressões dos banners.
ALTER TABLE banners ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS data_inicio TIMESTAMPTZ;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS data_fim TIMESTAMPTZ;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS max_impressoes INTEGER;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS impressoes INTEGER NOT NULL DEFAULT 0;
