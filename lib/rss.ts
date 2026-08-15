import Parser from "rss-parser";
import { database, type Artigo, type Fonte } from "./db";

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "PortalPulso/1.0 (+https://seusite.com.br)" }
});

function slugifyId(url: string) {
  return Buffer.from(url).toString("base64url").slice(0, 24);
}

function extractImage(item: any): string | undefined {
  if (item.enclosure?.url) return item.enclosure.url;
  const mediaContent = item["media:content"];
  if (mediaContent?.$?.url) return mediaContent.$.url;
  const match = (item["content:encoded"] || item.content || "").match(
    /<img[^>]+src="([^">]+)"/i
  );
  return match?.[1];
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Busca todas as fontes RSS ativas, normaliza os itens e grava no banco.
 * Chamada pelo endpoint /api/rss/refresh (via cron) ou manualmente pelo admin.
 */
export async function refreshAllFeeds() {
  const sources = (await database.getSources()).filter((s) => s.ativo);
  const existing = await database.getArticles();
  const existingById = new Map(existing.map((a) => [a.id, a]));

  const somenteComFoto = (await database.getSetting("somente_com_foto")) === "true";

  const results = await Promise.allSettled(
    sources.map((source) => fetchFeed(source))
  );

  let novos: Artigo[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") novos.push(...r.value);
    else console.error(`Falha ao buscar feed ${sources[i].nome}:`, r.reason);
  });

  if (somenteComFoto) {
    novos = novos.filter((a) => !!a.imagem);
  }

  for (const artigo of novos) {
    existingById.set(artigo.id, artigo);
  }

  const merged = Array.from(existingById.values())
    .sort((a, b) => +new Date(b.publicadoEm) - +new Date(a.publicadoEm))
    .slice(0, 500); // mantém o banco enxuto

  await database.replaceArticles(merged);
  return { fontes: sources.length, novos: novos.length, total: merged.length };
}

async function fetchFeed(source: Fonte): Promise<Artigo[]> {
  const feed = await parser.parseURL(source.url);
  return (feed.items || []).map((item) => {
    const link = item.link || "";
    return {
      id: slugifyId(link || item.guid || item.title || Math.random().toString()),
      titulo: item.title?.trim() || "(sem título)",
      resumo: stripHtml(item.contentSnippet || item.summary || "").slice(0, 320),
      link,
      imagem: extractImage(item),
      categoria: source.categoria,
      fonte: source.nome,
      publicadoEm: item.isoDate || item.pubDate || new Date().toISOString()
    };
  });
}
