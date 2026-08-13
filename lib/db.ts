import fs from "node:fs/promises";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

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

export type DB = {
  categories: Categoria[];
  sources: Fonte[];
  banners: Banner[];
  articles: Artigo[];
  newsletter: Inscrito[];
};

// Nota: este projeto usa um arquivo JSON como "banco de dados" para manter o
// setup simples (zero infraestrutura). Para produção com muito tráfego,
// troque este arquivo por Postgres/MySQL (ex: Prisma) sem alterar a API
// das funções abaixo — todas as telas do site chamam apenas estas funções.

async function readDB(): Promise<DB> {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw) as DB;
}

async function writeDB(db: DB): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export const database = {
  read: readDB,
  write: writeDB,

  async getCategories() {
    return (await readDB()).categories;
  },
  async setCategories(categories: Categoria[]) {
    const db = await readDB();
    db.categories = categories;
    await writeDB(db);
  },

  async getSources() {
    return (await readDB()).sources;
  },
  async setSources(sources: Fonte[]) {
    const db = await readDB();
    db.sources = sources;
    await writeDB(db);
  },

  async getBanners() {
    return (await readDB()).banners;
  },
  async setBanners(banners: Banner[]) {
    const db = await readDB();
    db.banners = banners;
    await writeDB(db);
  },
  async getBanner(posicao: string) {
    const banners = await this.getBanners();
    return banners.find((b) => b.posicao === posicao && b.ativo);
  },

  async getArticles() {
    return (await readDB()).articles;
  },
  async getArticleById(id: string) {
    return (await this.getArticles()).find((a) => a.id === id);
  },
  async getArticlesByCategory(slug: string) {
    return (await this.getArticles()).filter((a) => a.categoria === slug);
  },
  async replaceArticles(articles: Artigo[]) {
    const db = await readDB();
    db.articles = articles;
    await writeDB(db);
  },

  async addSubscriber(email: string) {
    const db = await readDB();
    if (!db.newsletter.find((n) => n.email === email)) {
      db.newsletter.push({ email, criadoEm: new Date().toISOString() });
      await writeDB(db);
    }
  },
  async getSubscribers() {
    return (await readDB()).newsletter;
  }
};
