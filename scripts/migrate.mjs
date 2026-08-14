import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL não definida. Configure-a (o Railway injeta essa variável automaticamente ao adicionar um Postgres ao projeto) e rode novamente."
  );
  process.exit(1);
}

const dir = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(path.join(dir, "schema.sql"), "utf-8");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
});

try {
  await pool.query(sql);
  console.log("Schema aplicado com sucesso.");
} catch (err) {
  console.error("Falha ao aplicar o schema:", err);
  process.exit(1);
} finally {
  await pool.end();
}
