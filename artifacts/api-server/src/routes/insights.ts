import { Router, type IRouter } from "express";
import { verifyToken } from "./auth";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const router: IRouter = Router();

async function initTables() {
  const sqls = [
    `CREATE TABLE IF NOT EXISTS analytics_daily (
       date        DATE PRIMARY KEY,
       visits      INTEGER NOT NULL DEFAULT 0,
       cart_adds   INTEGER NOT NULL DEFAULT 0,
       subscribers INTEGER NOT NULL DEFAULT 0,
       updated_at  TIMESTAMPTZ DEFAULT NOW()
     )`,
    `CREATE TABLE IF NOT EXISTS analytics_hourly (
       date  DATE     NOT NULL,
       hour  SMALLINT NOT NULL,
       visits INTEGER NOT NULL DEFAULT 0,
       PRIMARY KEY (date, hour)
     )`,
    `CREATE TABLE IF NOT EXISTS analytics_sources (
       date   DATE NOT NULL,
       source TEXT NOT NULL,
       visits INTEGER NOT NULL DEFAULT 0,
       PRIMARY KEY (date, source)
     )`,
  ];
  for (const sql of sqls) {
    try { await pool.query(sql); } catch (_) {}
  }
}
initTables();

function today() { return new Date().toISOString().slice(0, 10); }

export function recordVisit(hour: number, source: string) {
  const d = today();
  const s = (source || "direct").slice(0, 64);
  Promise.all([
    pool.query(
      `INSERT INTO analytics_daily (date, visits) VALUES ($1, 1)
       ON CONFLICT (date) DO UPDATE SET visits = analytics_daily.visits + 1, updated_at = NOW()`,
      [d]
    ),
    pool.query(
      `INSERT INTO analytics_hourly (date, hour, visits) VALUES ($1, $2, 1)
       ON CONFLICT (date, hour) DO UPDATE SET visits = analytics_hourly.visits + 1`,
      [d, hour]
    ),
    pool.query(
      `INSERT INTO analytics_sources (date, source, visits) VALUES ($1, $2, 1)
       ON CONFLICT (date, source) DO UPDATE SET visits = analytics_sources.visits + 1`,
      [d, s]
    ),
  ]).catch(() => {});
}

export function recordCartAdd() {
  pool.query(
    `INSERT INTO analytics_daily (date, cart_adds) VALUES ($1, 1)
     ON CONFLICT (date) DO UPDATE SET cart_adds = analytics_daily.cart_adds + 1, updated_at = NOW()`,
    [today()]
  ).catch(() => {});
}

export function recordSubscriber() {
  pool.query(
    `INSERT INTO analytics_daily (date, subscribers) VALUES ($1, 1)
     ON CONFLICT (date) DO UPDATE SET subscribers = analytics_daily.subscribers + 1, updated_at = NOW()`,
    [today()]
  ).catch(() => {});
}

router.get("/admin/insights", async (req, res) => {
  if (!verifyToken(req.headers.authorization)) { res.status(401).json({ error: "غير مصرح" }); return; }
  try {
    const d = today();
    const [hourlyRes, sourcesRes, totalRes] = await Promise.all([
      pool.query("SELECT hour, visits FROM analytics_hourly WHERE date = $1", [d]),
      pool.query(
        "SELECT source, SUM(visits) AS visits FROM analytics_sources GROUP BY source ORDER BY visits DESC LIMIT 20"
      ),
      pool.query("SELECT COALESCE(SUM(visits),0) AS total FROM analytics_daily"),
    ]);

    const hourBuckets = new Array(24).fill(0);
    for (const r of hourlyRes.rows) hourBuckets[Number(r.hour)] = Number(r.visits);
    const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));
    const totalVisits = Number(totalRes.rows[0]?.total || 0);
    const sourceCounts = sourcesRes.rows.map(r => ({ source: r.source, count: Number(r.visits) }));

    res.json({
      hourBuckets: hourBuckets.map((count, hour) => ({ hour, count })),
      sourceCounts,
      peakHour,
      totalVisits,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
