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
  autoral?: boolean;
  conteudo?: string;
  fonteOriginalId?: string;
  fonteOriginalLink?: string;
  geradoPor?: string;
  status?: "publicado" | "rascunho";
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
    publicadoEm: new Date(row.publicado_em).toISOString(),
    autoral: row.autoral ?? false,
    conteudo: row.conteudo ?? undefined,
    fonteOriginalId: row.fonte_original_id ?? undefined,
    fonteOriginalLink: row.fonte_original_link ?? undefined,
    geradoPor: row.gerado_por ?? undefined,
    status: row.status === "rascunho" ? "rascunho" : "publicado"
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
  // Só retorna artigos publicados — usado pelas páginas públicas do site.
  async getArticles(): Promise<Artigo[]> {
    const { rows } = await getPool().query(
      "SELECT * FROM articles WHERE status = 'publicado' ORDER BY publicado_em DESC LIMIT 500"
    );
    return rows.map(artigoFromRow);
  },

  // Retorna qualquer artigo por id, independente do status — usado tanto
  // pela página pública de notícia (permite pré-visualizar rascunhos por
  // link direto) quanto pelo admin.
  async getArticleById(id: string): Promise<Artigo | undefined> {
    const { rows } = await getPool().query("SELECT * FROM articles WHERE id = $1", [id]);
    return rows[0] ? artigoFromRow(rows[0]) : undefined;
  },

  async getArticlesByCategory(slug: string): Promise<Artigo[]> {
    const { rows } = await getPool().query(
      "SELECT * FROM articles WHERE categoria = $1 AND status = 'publicado' ORDER BY publicado_em DESC",
      [slug]
    );
    return rows.map(artigoFromRow);
  },

  // Todos os artigos, de qualquer status — só para o painel administrativo.
  async getAllArticlesAdmin(limit = 150): Promise<Artigo[]> {
    const { rows } = await getPool().query(
      "SELECT * FROM articles ORDER BY publicado_em DESC LIMIT $1",
      [limit]
    );
    return rows.map(artigoFromRow);
  },

  async updateArticle(
    id: string,
    campos: Partial<Pick<Artigo, "titulo" | "resumo" | "conteudo" | "categoria" | "imagem" | "status">>
  ): Promise<void> {
    const colunas: string[] = [];
    const valores: any[] = [];
    let i = 1;

    const mapa: Record<string, string> = {
      titulo: "titulo",
      resumo: "resumo",
      conteudo: "conteudo",
      categoria: "categoria",
      imagem: "imagem",
      status: "status"
    };

    for (const [chave, coluna] of Object.entries(mapa)) {
      if (chave in campos) {
        colunas.push(`${coluna} = $${i}`);
        valores.push((campos as any)[chave] ?? null);
        i++;
      }
    }

    if (colunas.length === 0) return;

    valores.push(id);
    await getPool().query(
      `UPDATE articles SET ${colunas.join(", ")} WHERE id = $${i}`,
      valores
    );
  },

  async deleteArticle(id: string): Promise<void> {
    await getPool().query("DELETE FROM articles WHERE id = $1", [id]);
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
      // (nunca apaga matérias autorais, que são conteúdo próprio do site)
      await client.query(`
        DELETE FROM articles WHERE autoral = false AND id NOT IN (
          SELECT id FROM articles WHERE autoral = false ORDER BY publicado_em DESC LIMIT 500
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
  },

  // ---------- Configurações (chave/valor) ----------
  async getSetting(key: string): Promise<string | null> {
    const { rows } = await getPool().query("SELECT value FROM settings WHERE key = $1", [key]);
    return rows[0]?.value ?? null;
  },

  async setSetting(key: string, value: string): Promise<void> {
    await getPool().query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, value]
    );
  },

  // ---------- Matérias autorais ----------
  async createAutoralArticle(data: {
    id: string;
    titulo: string;
    resumo: string;
    conteudo: string;
    imagem?: string;
    categoria: string;
    fonteOriginalId?: string;
    fonteOriginalLink?: string;
    geradoPor?: string;
  }): Promise<void> {
    await getPool().query(
      `INSERT INTO articles (id, titulo, resumo, link, imagem, categoria, fonte, publicado_em, autoral, conteudo, fonte_original_id, fonte_original_link, gerado_por, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7, now(), true, $8, $9, $10, $11, 'rascunho')`,
      [
        data.id,
        data.titulo,
        data.resumo,
        data.fonteOriginalLink || "",
        data.imagem ?? null,
        data.categoria,
        "Pulso Notícias",
        data.conteudo,
        data.fonteOriginalId ?? null,
        data.fonteOriginalLink ?? null,
        data.geradoPor ?? null
      ]
    );
  },

  async createManualArticle(data: {
    id: string;
    titulo: string;
    resumo: string;
    conteudo: string;
    imagem?: string;
    categoria: string;
    status: "publicado" | "rascunho";
  }): Promise<void> {
    await getPool().query(
      `INSERT INTO articles (id, titulo, resumo, link, imagem, categoria, fonte, publicado_em, autoral, conteudo, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7, now(), true, $8, $9)`,
      [
        data.id,
        data.titulo,
        data.resumo,
        "",
        data.imagem ?? null,
        data.categoria,
        "Pulso Notícias",
        data.conteudo,
        data.status
      ]
    );
  },

  // ---------- Página "todas as notícias" ----------
  async getArticlesPaginated(pagina: number, porPagina = 24) {
    const offset = (pagina - 1) * porPagina;
    const [{ rows }, { rows: totalRows }] = await Promise.all([
      getPool().query(
        "SELECT * FROM articles WHERE status = 'publicado' ORDER BY publicado_em DESC LIMIT $1 OFFSET $2",
        [porPagina, offset]
      ),
      getPool().query("SELECT COUNT(*)::int AS total FROM articles WHERE status = 'publicado'")
    ]);
    return { artigos: rows.map(artigoFromRow), total: totalRows[0]?.total ?? 0 };
  },

  // ---------- Visualizações / estatísticas ----------
  async trackView(path: string, articleId?: string): Promise<void> {
    await getPool().query(
      "INSERT INTO page_views (path, article_id) VALUES ($1, $2)",
      [path, articleId ?? null]
    );
  },

  async getStats() {
    const pool = getPool();
    const [totalRes, hojeRes, semanaRes, topRes] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS n FROM page_views"),
      pool.query("SELECT COUNT(*)::int AS n FROM page_views WHERE criado_em >= now() - interval '1 day'"),
      pool.query("SELECT COUNT(*)::int AS n FROM page_views WHERE criado_em >= now() - interval '7 days'"),
      pool.query(`
        SELECT a.id, a.titulo, a.categoria, COUNT(pv.id)::int AS views
        FROM page_views pv
        JOIN articles a ON a.id = pv.article_id
        WHERE pv.criado_em >= now() - interval '30 days'
        GROUP BY a.id, a.titulo, a.categoria
        ORDER BY views DESC
        LIMIT 10
      `)
    ]);
    return {
      totalViews: totalRes.rows[0]?.n ?? 0,
      viewsHoje: hojeRes.rows[0]?.n ?? 0,
      views7dias: semanaRes.rows[0]?.n ?? 0,
      topArtigos: topRes.rows as { id: string; titulo: string; categoria: string; views: number }[]
    };
  }
};
