import { Router, type IRouter } from "express";
import { subscriptions, dbSave, requireAdmin } from "../lib/storeDb.js";

const router: IRouter = Router();

// Public: Get Subscriptions
router.get("/subscriptions", (_req, res) => res.json(subscriptions));

// Admin: Add Subscription
router.post("/admin/subscriptions", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const sub = { ...req.body, id: req.body.id || `sub-${Date.now()}` };
  subscriptions.push(sub);
  await dbSave("subscriptions", subscriptions);
  res.json(sub);
});

// Admin: Update Subscription
router.put("/admin/subscriptions/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const idx = subscriptions.findIndex((s: any) => s.id === req.params.id);
  if (idx !== -1) {
    subscriptions[idx] = { ...subscriptions[idx], ...req.body };
    await dbSave("subscriptions", subscriptions);
    res.json(subscriptions[idx]);
  } else {
    res.status(404).json({ error: "الاشتراك غير موجود" });
  }
});

// Admin: Delete Subscription
router.delete("/admin/subscriptions/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const idx = subscriptions.findIndex((s: any) => s.id === req.params.id);
  if (idx !== -1) {
    subscriptions.splice(idx, 1);
    await dbSave("subscriptions", subscriptions);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: "الاشتراك غير موجود" });
  }
});

export default router;
