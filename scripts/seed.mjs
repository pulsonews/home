import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não definida.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
});

const categorias = [
  { slug: "brasil", nome: "Brasil", cor: "#0B1F3A" },
  { slug: "mundo", nome: "Mundo", cor: "#D62839" },
  { slug: "economia", nome: "Economia", cor: "#C9962C" },
  { slug: "esportes", nome: "Esportes", cor: "#1C7A4B" },
  { slug: "tecnologia", nome: "Tecnologia", cor: "#2F5DA8" },
  { slug: "entretenimento", nome: "Entretenimento", cor: "#8E44AD" }
];

const fontes = [
  { id: "g1-brasil", nome: "G1 - Brasil", url: "https://g1.globo.com/rss/g1/brasil/", categoria: "brasil", ativo: true },
  { id: "g1-mundo", nome: "G1 - Mundo", url: "https://g1.globo.com/rss/g1/mundo/", categoria: "mundo", ativo: true },
  { id: "g1-economia", nome: "G1 - Economia", url: "https://g1.globo.com/rss/g1/economia/", categoria: "economia", ativo: true },
  { id: "g1-tecnologia", nome: "G1 - Tecnologia", url: "https://g1.globo.com/rss/g1/tecnologia/", categoria: "tecnologia", ativo: true }
];

const banners = [
  { id: "topo", posicao: "topo", tipo: "adsense", slotId: "0000000000", ativo: true },
  { id: "meio-feed", posicao: "meio-feed", tipo: "adsense", slotId: "0000000001", ativo: true },
  { id: "lateral", posicao: "lateral", tipo: "adsense", slotId: "0000000002", ativo: true },
  { id: "artigo", posicao: "artigo", tipo: "adsense", slotId: "0000000003", ativo: true }
];

try {
  for (const c of categorias) {
    await pool.query(
      `INSERT INTO categories (slug, nome, cor) VALUES ($1,$2,$3)
       ON CONFLICT (slug) DO UPDATE SET nome = $2, cor = $3`,
      [c.slug, c.nome, c.cor]
    );
  }
  for (const f of fontes) {
    await pool.query(
      `INSERT INTO sources (id, nome, url, categoria, ativo) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO NOTHING`,
      [f.id, f.nome, f.url, f.categoria, f.ativo]
    );
  }
  for (const b of banners) {
    await pool.query(
      `INSERT INTO banners (id, posicao, tipo, slot_id, ativo) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO NOTHING`,
      [b.id, b.posicao, b.tipo, b.slotId, b.ativo]
    );
  }
  console.log("Dados iniciais inseridos com sucesso.");
} catch (err) {
  console.error("Falha ao popular o banco:", err);
  process.exit(1);
} finally {
  await pool.end();
}
