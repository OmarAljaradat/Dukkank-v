import { Router, type IRouter } from "express";
import { recordCartAdd, recordSubscriber } from "./insights";
import {
  store, dbSave, requireAdmin
} from "../lib/storeDb";

const router: IRouter = Router();

// ── Store Data ────────────────────────────────────────────────────────────────
router.get("/store", (_req, res) => res.json(store));

router.put("/admin/store", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  Object.assign(store, req.body);
  await dbSave("store", store);
  res.json(store);
});

// ── SEO Endpoints ──────────────────────────────────────────────────────────────
router.get("/sitemap.xml", (req, res) => {
  const host = req.headers.host || "dukkank.com";
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;
  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const staticRoutes = ["/", "/games", "/reviews", "/account", "/cart", "/policies", "/login"];
  for (const r of staticRoutes) {
    xml += `  <url>\n    <loc>${baseUrl}${r}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${r === "/" ? "1.0" : "0.8"}</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;
  res.header("Content-Type", "application/xml");
  res.send(xml);
});

router.get("/robots.txt", (req, res) => {
  const host = req.headers.host || "dukkank.com";
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const content = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\nDisallow: /api/*\n\nSitemap: ${protocol}://${host}/sitemap.xml\n`;
  res.header("Content-Type", "text/plain");
  res.send(content);
});

// ── Subscribers ───────────────────────────────────────────────────────────────
const subscribers = new Set<string>();

router.post("/subscribers", (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "بريد إلكتروني غير صالح" }); return;
  }
  const isNew = !subscribers.has(email.toLowerCase().trim());
  subscribers.add(email.toLowerCase().trim());
  if (isNew) recordSubscriber();
  res.json({ ok: true });
});

router.get("/admin/subscribers", (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json([...subscribers].map(email => ({ email })));
});

router.delete("/admin/subscribers/:email", (req, res) => {
  if (!requireAdmin(req, res)) return;
  subscribers.delete(decodeURIComponent(req.params.email));
  res.json({ ok: true });
});

// ── Notify Requests ───────────────────────────────────────────────────────────
let notifyRequests: any[] = [
  {
    id: "nr-sample-1",
    gameId: "batman-arkham",
    name: "خالد العتيبي",
    contact: "966501234567",
    phone: "966501234567",
    email: "",
    contact_info: "966501234567",
    createdAt: new Date().toISOString()
  }
];

router.post("/notify-requests", async (req, res) => {
  const { gameId, name, contact, email, phone, contact_info } = req.body || {};
  if (!gameId) { res.status(400).json({ error: "gameId مطلوب" }); return; }
  const contactVal = String(contact || phone || email || contact_info || "").trim();
  const item = {
    id: `nr-${Date.now()}`,
    gameId,
    name: String(name || "عميل دُكانك").trim(),
    contact: contactVal,
    phone: contactVal,
    email: contactVal.includes("@") ? contactVal : "",
    contact_info: contactVal,
    createdAt: new Date().toISOString()
  };
  notifyRequests.push(item);
  await dbSave("notifyRequests", notifyRequests);
  res.status(201).json(item);
});

router.get("/admin/notify-requests", (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json(notifyRequests);
});

router.delete("/admin/notify-requests/:id", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const idx = notifyRequests.findIndex(n => n.id === req.params.id);
  if (idx !== -1) notifyRequests.splice(idx, 1);
  res.json({ ok: true });
});

router.post("/events/cart-add", (_req, res) => {
  recordCartAdd();
  res.json({ ok: true });
});

export default router;
