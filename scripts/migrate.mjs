import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

function buildConnectionString() {
  const raw = process.env.DATABASE_URL;
  const quebrada = !raw || raw.includes("${{") || raw.trim() === "";
  if (!quebrada) return raw;

  const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;
  if (PGHOST && PGUSER && PGPASSWORD && PGDATABASE) {
    const port = PGPORT || "5432";
    return `postgresql://${encodeURIComponent(PGUSER)}:${encodeURIComponent(PGPASSWORD)}@${PGHOST}:${port}/${PGDATABASE}`;
  }

  console.error(
    `DATABASE_URL inválida ou vazia (valor: "${raw}") e variáveis PG* individuais incompletas.`
  );
  process.exit(1);
}

const dir = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(path.join(dir, "schema.sql"), "utf-8");

const pool = new Pool({
  connectionString: buildConnectionString(),
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
