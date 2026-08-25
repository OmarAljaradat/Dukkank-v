import { Router, type IRouter } from "express";
import { isBlocked } from "./security";
import { recordVisit } from "./insights";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const router: IRouter = Router();

const TTL_MS = 2 * 60 * 1000;
const sessions = new Map<string, number>();

async function initSessions() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS visitor_sessions (
      session_id TEXT PRIMARY KEY,
      last_seen  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      source     TEXT DEFAULT 'direct',
      ip         TEXT DEFAULT ''
    )`);
    const cutoff = new Date(Date.now() - TTL_MS).toISOString();
    const { rows } = await pool.query(
      "SELECT session_id, EXTRACT(EPOCH FROM last_seen)*1000 AS ts FROM visitor_sessions WHERE last_seen > $1",
      [cutoff]
    );
    for (const r of rows) sessions.set(r.session_id, Number(r.ts));
  } catch (_) {}
}
initSessions();

function prune() {
  const now = Date.now();
  for (const [id, ts] of sessions) {
    if (now - ts > TTL_MS) sessions.delete(id);
  }
}

function getClientIP(req: any): string {
  return (req.headers["x-forwarded-for"] as string || "").split(",")[0].trim() ||
    req.socket?.remoteAddress || "";
}

router.post("/visitors/heartbeat", (req, res) => {
  const ip = getClientIP(req);
  if (ip && isBlocked(ip)) { res.status(403).json({ blocked: true }); return; }

  const sid = (req.body?.sessionId as string) || "";
  if (!sid || sid.length > 128) { res.status(400).json({ error: "invalid sessionId" }); return; }

  const isNew = !sessions.has(sid);
  sessions.set(sid, Date.now());
  prune();

  const source = String(req.body?.source || "direct").slice(0, 64);

  pool.query(
    `INSERT INTO visitor_sessions (session_id, last_seen, source, ip)
     VALUES ($1, NOW(), $2, $3)
     ON CONFLICT (session_id) DO UPDATE SET last_seen = NOW()`,
    [sid, source, ip]
  ).catch(() => {});

  if (isNew) {
    const hour = new Date().getHours();
    recordVisit(hour, source);
  }

  res.json({ online: sessions.size });
});

router.get("/visitors/count", (_req, res) => {
  prune();
  res.json({ online: sessions.size });
});

export default router;
