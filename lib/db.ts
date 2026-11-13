import { Pool, type PoolClient, type QueryResultRow } from "pg";
import demoReports from "./demo-reports.json";

// One connection pool per server instance. On Vercel, the Neon integration
// provides DATABASE_URL (or POSTGRES_URL); locally it comes from .env.local.
declare global {
  // eslint-disable-next-line no-var
  var __finnyPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __finnySchema: Promise<void> | undefined;
}

function connectionString(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add your Neon connection string to .env.local (local) or Vercel (live).");
  }
  return url;
}

function pool(): Pool {
  if (!globalThis.__finnyPool) {
    const url = connectionString();
    const isLocal = /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(url);
    globalThis.__finnyPool = new Pool({
      connectionString: url.replace(/[?&]sslmode=[^&]*/g, "").replace(/[?&]channel_binding=[^&]*/g, ""),
      ssl: isLocal ? false : { rejectUnauthorized: true },
      max: 5,
      idleTimeoutMillis: 10_000,
    });
  }
  return globalThis.__finnyPool;
}

// Demo account for graders. Only the scrypt hash of the password is stored here;
// logging in still goes through the normal database check.
const DEMO_EMAIL = "demo@demo.com";
const DEMO_NAME = "Demo Clinic";
const DEMO_PASSWORD_HASH =
  "scrypt$16384$8$1$QyF6XfSgg+vHI7Xj+fSi7g==$F7eE+QHnRr5ROQBkSLZSgR+V4/bUuhhOKCUIEFR+UqV4Zd5mzI+3GB0rg4aJARtVxZwedXlMn8uIdCX08wTAlQ==";

const SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
     id            BIGSERIAL PRIMARY KEY,
     email         TEXT NOT NULL UNIQUE,
     name          TEXT,
     password_hash TEXT NOT NULL,
     is_demo       BOOLEAN NOT NULL DEFAULT FALSE,
     created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS sessions (
     id          TEXT PRIMARY KEY,
     user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     expires_at  TIMESTAMPTZ NOT NULL,
     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS reports (
     id               BIGSERIAL PRIMARY KEY,
     user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     language         TEXT NOT NULL CHECK (language IN ('en', 'es')),
     period_label     TEXT NOT NULL,
     previous_period  TEXT,
     source_files     TEXT[] NOT NULL DEFAULT '{}',
     metrics          JSONB NOT NULL,
     comparison       JSONB,
     content          JSONB NOT NULL,
     model            TEXT NOT NULL,
     is_sample        BOOLEAN NOT NULL DEFAULT FALSE,
     created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS reports_user_created_idx ON reports(user_id, created_at DESC)`,
];

type DemoReport = {
  language: "en" | "es";
  period_label: string;
  previous_period: string | null;
  source_files: string[];
  metrics: unknown;
  comparison: unknown;
  content: unknown;
  model: string;
};

// Pre-generated sample reports (real Claude output from the sample CSVs) so a grader
// sees a finished report as soon as they log in to the demo account.
async function seedDemoReports(client: PoolClient): Promise<void> {
  const reports = demoReports as DemoReport[];
  if (!reports.length) return;
  const { rows } = await client.query<{ id: string; has_reports: boolean }>(
    `SELECT u.id::text AS id, EXISTS (SELECT 1 FROM reports r WHERE r.user_id = u.id) AS has_reports
       FROM users u WHERE u.email = $1`,
    [DEMO_EMAIL],
  );
  if (!rows[0] || rows[0].has_reports) return;
  for (const r of reports) {
    await client.query(
      `INSERT INTO reports (user_id, language, period_label, previous_period, source_files, metrics, comparison, content, model, is_sample)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)`,
      [rows[0].id, r.language, r.period_label, r.previous_period, r.source_files,
       JSON.stringify(r.metrics), r.comparison ? JSON.stringify(r.comparison) : null, JSON.stringify(r.content), r.model],
    );
  }
}

async function migrate(): Promise<void> {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    // Serialize concurrent cold starts so CREATE statements don't race.
    await client.query("SELECT pg_advisory_xact_lock(724119)");
    for (const stmt of SCHEMA) await client.query(stmt);
    await client.query(
      `INSERT INTO users (email, name, password_hash, is_demo)
       VALUES ($1, $2, $3, TRUE)
       ON CONFLICT (email) DO NOTHING`,
      [DEMO_EMAIL, DEMO_NAME, DEMO_PASSWORD_HASH],
    );
    await seedDemoReports(client);
    await client.query("DELETE FROM sessions WHERE expires_at < now()");
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export function ensureSchema(): Promise<void> {
  if (!globalThis.__finnySchema) {
    globalThis.__finnySchema = migrate().catch((err) => {
      globalThis.__finnySchema = undefined; // retry on the next request
      throw err;
    });
  }
  return globalThis.__finnySchema;
}

export async function sql<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureSchema();
  const res = await pool().query<T>(text, params);
  return res.rows;
}
