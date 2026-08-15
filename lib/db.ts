import pg from "pg";

const { Pool } = pg;

export type Categoria = { slug: string; nome: string; cor: string };
export type Fonte = { id: string; nome: string; url: string; categoria: string; ativo: boolean };
export type Banner = { id: string; posicao: string; tipo: "adsense" | "html"; slotId?: string; html?: string; ativo: boolean };
export type Artigo = {
  id: string;
  titulo: string;
  resumo: string;
  link: string;
  imagem?: string;
  categoria: string;
  fonte: string;
  publicadoEm: string;
};
export type Inscrito = { email: string; criadoEm: string };

// Pool de conexões reutilizado entre requisições (padrão recomendado para
// Next.js em ambiente serverless/long-running). Em dev, guardamos no
// objeto global para sobreviver ao hot-reload sem esgotar conexões.
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: pg.Pool | undefined;
}

function buildConnectionString(): string {
  const raw = process.env.DATABASE_URL;

  // Detecta o caso mais comum de configuração quebrada no Railway: a
  // variável ficou com o texto literal da referência (ex: "${{Postgres.DATABASE_URL}}")
  // porque o nome do serviço na referência não bateu com o nome real do
  // serviço Postgres. Nesse caso, tentamos montar a URL a partir das
  // variáveis individuais (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE),
  // que o Railway também expõe e raramente têm esse problema.
  const pareceReferenciaQuebrada = !raw || raw.includes("${{") || raw.trim() === "";

  if (!pareceReferenciaQuebrada) {
    return raw as string;
  }

  const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;

  if (PGHOST && PGUSER && PGPASSWORD && PGDATABASE) {
    const port = PGPORT || "5432";
    return `postgresql://${encodeURIComponent(PGUSER)}:${encodeURIComponent(PGPASSWORD)}@${PGHOST}:${port}/${PGDATABASE}`;
  }

  throw new Error(
    "Configuração de banco inválida: a variável DATABASE_URL está vazia ou contém uma referência não resolvida " +
      `(valor atual: "${raw}"), e as variáveis individuais PGHOST/PGUSER/PGPASSWORD/PGDATABASE também não estão ` +
      "todas definidas neste serviço. No Railway, vá em Variables e configure DATABASE_URL colando o valor REAL " +
      "copiado da aba 'Connect' do serviço Postgres (não uma referência ${{...}})."
  );
}

function getPool() {
  if (!global.__pgPool) {
    global.__pgPool = new Pool({
      connectionString: buildConnectionString(),
      ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
    });
  }
  return global.__pgPool;
}

function bannerFromRow(row: any): Banner {
  return {
    id: row.id,
    posicao: row.posicao,
    tipo: row.tipo,
    slotId: row.slot_id ?? undefined,
    html: row.html ?? undefined,
    ativo: row.ativo
  };
}

function artigoFromRow(row: any): Artigo {
  return {
    id: row.id,
    titulo: row.titulo,
    resumo: row.resumo,
    link: row.link,
    imagem: row.imagem ?? undefined,
    categoria: row.categoria,
    fonte: row.fonte,
    publicadoEm: new Date(row.publicado_em).toISOString()
  };
}

export const database = {
  // ---------- Categorias ----------
  async getCategories(): Promise<Categoria[]> {
    const { rows } = await getPool().query(
      "SELECT slug, nome, cor FROM categories ORDER BY nome ASC"
    );
    return rows;
  },

  async setCategories(categories: Categoria[]): Promise<void> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM categories");
      for (const c of categories) {
        await client.query(
          "INSERT INTO categories (slug, nome, cor) VALUES ($1,$2,$3)",
          [c.slug, c.nome, c.cor]
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // ---------- Fontes RSS ----------
  async getSources(): Promise<Fonte[]> {
    const { rows } = await getPool().query(
      "SELECT id, nome, url, categoria, ativo FROM sources ORDER BY nome ASC"
    );
    return rows;
  },

  async setSources(sources: Fonte[]): Promise<void> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM sources");
      for (const s of sources) {
        await client.query(
          "INSERT INTO sources (id, nome, url, categoria, ativo) VALUES ($1,$2,$3,$4,$5)",
          [s.id, s.nome, s.url, s.categoria, s.ativo]
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // ---------- Banners ----------
  async getBanners(): Promise<Banner[]> {
    const { rows } = await getPool().query(
      "SELECT id, posicao, tipo, slot_id, html, ativo FROM banners ORDER BY posicao ASC"
    );
    return rows.map(bannerFromRow);
  },

  async setBanners(banners: Banner[]): Promise<void> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM banners");
      for (const b of banners) {
        await client.query(
          "INSERT INTO banners (id, posicao, tipo, slot_id, html, ativo) VALUES ($1,$2,$3,$4,$5,$6)",
          [b.id, b.posicao, b.tipo, b.slotId ?? null, b.html ?? null, b.ativo]
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async getBanner(posicao: string): Promise<Banner | undefined> {
    const { rows } = await getPool().query(
      "SELECT id, posicao, tipo, slot_id, html, ativo FROM banners WHERE posicao = $1 AND ativo = true LIMIT 1",
      [posicao]
    );
    return rows[0] ? bannerFromRow(rows[0]) : undefined;
  },

  // ---------- Artigos ----------
  async getArticles(): Promise<Artigo[]> {
    const { rows } = await getPool().query(
      "SELECT * FROM articles ORDER BY publicado_em DESC LIMIT 500"
    );
    return rows.map(artigoFromRow);
  },

  async getArticleById(id: string): Promise<Artigo | undefined> {
    const { rows } = await getPool().query("SELECT * FROM articles WHERE id = $1", [id]);
    return rows[0] ? artigoFromRow(rows[0]) : undefined;
  },

  async getArticlesByCategory(slug: string): Promise<Artigo[]> {
    const { rows } = await getPool().query(
      "SELECT * FROM articles WHERE categoria = $1 ORDER BY publicado_em DESC",
      [slug]
    );
    return rows.map(artigoFromRow);
  },

  // Faz "upsert" de cada artigo novo/atualizado e mantém só os 500 mais
  // recentes — sem apagar o restante da tabela a cada atualização de RSS.
  async replaceArticles(articles: Artigo[]): Promise<void> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      for (const a of articles) {
        await client.query(
          `INSERT INTO articles (id, titulo, resumo, link, imagem, categoria, fonte, publicado_em)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (id) DO UPDATE SET
             titulo = EXCLUDED.titulo,
             resumo = EXCLUDED.resumo,
             link = EXCLUDED.link,
             imagem = EXCLUDED.imagem,
             categoria = EXCLUDED.categoria,
             fonte = EXCLUDED.fonte,
             publicado_em = EXCLUDED.publicado_em`,
          [a.id, a.titulo, a.resumo, a.link, a.imagem ?? null, a.categoria, a.fonte, a.publicadoEm]
        );
      }
      // mantém a tabela enxuta: remove tudo além dos 500 mais recentes
      await client.query(`
        DELETE FROM articles WHERE id NOT IN (
          SELECT id FROM articles ORDER BY publicado_em DESC LIMIT 500
        )
      `);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // ---------- Newsletter ----------
  async addSubscriber(email: string): Promise<void> {
    await getPool().query(
      "INSERT INTO newsletter (email) VALUES ($1) ON CONFLICT (email) DO NOTHING",
      [email]
    );
  },

  async getSubscribers(): Promise<Inscrito[]> {
    const { rows } = await getPool().query(
      "SELECT email, criado_em FROM newsletter ORDER BY criado_em DESC"
    );
    return rows.map((r: any) => ({
      email: r.email,
      criadoEm: new Date(r.criado_em).toISOString()
    }));
  }
};
