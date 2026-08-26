import { Router, type IRouter } from "express";
import { DEFAULT_SUBSCRIPTIONS, dbLoad, dbSave, requireAdmin } from "../lib/storeDb.js";

const router: IRouter = Router();

// Public: Get Subscriptions
router.get("/subscriptions", async (_req, res) => {
  const list = await dbLoad("subscriptions", DEFAULT_SUBSCRIPTIONS);
  res.json(list);
});

// Admin: Add Subscription
router.post("/admin/subscriptions", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("subscriptions", DEFAULT_SUBSCRIPTIONS);
  const sub = { ...req.body, id: req.body.id || `sub-${Date.now()}` };
  current.push(sub);
  await dbSave("subscriptions", current);
  res.json(sub);
});

// Admin: Update Subscription
router.put("/admin/subscriptions/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("subscriptions", DEFAULT_SUBSCRIPTIONS);
  const idx = current.findIndex((s: any) => s.id === req.params.id);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...req.body };
    await dbSave("subscriptions", current);
    res.json(current[idx]);
  } else {
    res.status(404).json({ error: "الاشتراك غير موجود" });
  }
});

// Admin: Delete Subscription
router.delete("/admin/subscriptions/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("subscriptions", DEFAULT_SUBSCRIPTIONS);
  const idx = current.findIndex((s: any) => s.id === req.params.id);
  if (idx !== -1) {
    current.splice(idx, 1);
    await dbSave("subscriptions", current);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: "الاشتراك غير موجود" });
  }
});

export default router;
