import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getPool } from "../config/database.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "../../db/schema.sql");

async function migrate() {
  const sql = readFileSync(schemaPath, "utf-8");
  const pool = getPool();
  await pool.query(sql);
  console.log("Migration complete.");
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
