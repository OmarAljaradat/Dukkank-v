import { Router, type IRouter } from "express";
import { reviews, faqs, dbSave, requireAdmin } from "../lib/storeDb";

const router: IRouter = Router();

// ── REVIEWS ──────────────────────────────────────────────────────────────────

// Public: Get Reviews
router.get("/reviews", (_req, res) => res.json([...reviews].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))));

// Admin: Add Review
router.post("/admin/reviews", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const r = { ...req.body, id: Date.now() };
  reviews.push(r);
  await dbSave("reviews", reviews);
  res.json(r);
});

// Admin: Update Review
router.put("/admin/reviews/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = Number(req.params.id);
  const idx = reviews.findIndex((x: any) => x.id === id);
  if (idx !== -1) {
    reviews[idx] = { ...reviews[idx], ...req.body };
    await dbSave("reviews", reviews);
    res.json(reviews[idx]);
  } else {
    res.status(404).json({ error: "التقييم غير موجود" });
  }
});

// Admin: Delete Review
router.delete("/admin/reviews/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = Number(req.params.id);
  const idx = reviews.findIndex((x: any) => x.id === id);
  if (idx !== -1) {
    reviews.splice(idx, 1);
    await dbSave("reviews", reviews);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: "التقييم غير موجود" });
  }
});

// ── FAQS ─────────────────────────────────────────────────────────────────────

// Public: Get FAQs
router.get("/faqs", (_req, res) => res.json([...faqs].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))));

// Admin: Add FAQ
router.post("/admin/faqs", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const f = { ...req.body, id: Date.now() };
  faqs.push(f);
  await dbSave("faqs", faqs);
  res.json(f);
});

// Admin: Update FAQ
router.put("/admin/faqs/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = Number(req.params.id);
  const idx = faqs.findIndex((x: any) => x.id === id);
  if (idx !== -1) {
    faqs[idx] = { ...faqs[idx], ...req.body };
    await dbSave("faqs", faqs);
    res.json(faqs[idx]);
  } else {
    res.status(404).json({ error: "السؤال غير موجود" });
  }
});

// Admin: Delete FAQ
router.delete("/admin/faqs/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = Number(req.params.id);
  const idx = faqs.findIndex((x: any) => x.id === id);
  if (idx !== -1) {
    faqs.splice(idx, 1);
    await dbSave("faqs", faqs);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: "السؤال غير موجود" });
  }
});

export default router;
