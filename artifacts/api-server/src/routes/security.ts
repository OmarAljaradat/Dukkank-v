import { Router, type IRouter } from "express";
import { verifyToken } from "./auth";

const router: IRouter = Router();

const blockedIPs = new Set<string>();

export function isBlocked(ip: string): boolean {
  return blockedIPs.has(ip);
}

router.get("/admin/ip-blocks", (req, res) => {
  if (!verifyToken(req.headers.authorization)) { res.status(401).json({ error: "غير مصرح" }); return; }
  res.json({ blocked: [...blockedIPs] });
});

router.post("/admin/ip-blocks", (req, res) => {
  if (!verifyToken(req.headers.authorization)) { res.status(401).json({ error: "غير مصرح" }); return; }
  const ip = String(req.body?.ip || "").trim();
  if (!ip) { res.status(400).json({ error: "ip required" }); return; }
  blockedIPs.add(ip);
  res.json({ ok: true, blocked: [...blockedIPs] });
});

router.delete("/admin/ip-blocks/:ip", (req, res) => {
  if (!verifyToken(req.headers.authorization)) { res.status(401).json({ error: "غير مصرح" }); return; }
  blockedIPs.delete(decodeURIComponent(req.params.ip));
  res.json({ ok: true, blocked: [...blockedIPs] });
});

export default router;
