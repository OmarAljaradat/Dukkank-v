import { Router, type IRouter } from "express";
import { verifyToken } from "./auth.js";

const router: IRouter = Router();

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: number | null;
  active: boolean;
}

const coupons: Coupon[] = [];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

router.get("/admin/coupons", (req, res) => {
  if (!verifyToken(req.headers.authorization)) { res.status(401).json({ error: "غير مصرح" }); return; }
  res.json(coupons);
});

router.post("/admin/coupons", (req, res) => {
  if (!verifyToken(req.headers.authorization)) { res.status(401).json({ error: "غير مصرح" }); return; }
  const b = req.body as Partial<Coupon>;
  if (!b.code) { res.status(400).json({ error: "code required" }); return; }
  if (coupons.find((c) => c.code.toUpperCase() === b.code!.toUpperCase())) {
    res.status(409).json({ error: "الكود موجود مسبقاً" }); return;
  }
  const coupon: Coupon = {
    id: uid(),
    code: b.code.toUpperCase().trim(),
    type: b.type === "fixed" ? "fixed" : "percentage",
    value: Number(b.value) || 10,
    minOrder: Number(b.minOrder) || 0,
    maxUses: b.maxUses ? Number(b.maxUses) : null,
    usedCount: 0,
    expiresAt: b.expiresAt ? Number(b.expiresAt) : null,
    active: true,
  };
  coupons.push(coupon);
  res.status(201).json(coupon);
});

router.patch("/admin/coupons/:id", (req, res) => {
  if (!verifyToken(req.headers.authorization)) { res.status(401).json({ error: "غير مصرح" }); return; }
  const c = coupons.find((c) => c.id === req.params.id);
  if (!c) { res.status(404).json({ error: "not found" }); return; }
  if (req.body.active !== undefined) c.active = req.body.active;
  res.json(c);
});

router.delete("/admin/coupons/:id", (req, res) => {
  if (!verifyToken(req.headers.authorization)) { res.status(401).json({ error: "غير مصرح" }); return; }
  const idx = coupons.findIndex((c) => c.id === req.params.id);
  if (idx < 0) { res.status(404).json({ error: "not found" }); return; }
  coupons.splice(idx, 1);
  res.json({ ok: true });
});

// Public: validate coupon code
router.post("/coupons/validate", (req, res) => {
  const { code, orderTotal } = req.body || {};
  const c = coupons.find((c) => c.code === String(code || "").toUpperCase() && c.active);
  if (!c) { res.status(404).json({ error: "الكود غير صحيح أو منتهي" }); return; }
  if (c.expiresAt && Date.now() > c.expiresAt) { res.status(410).json({ error: "انتهت صلاحية الكود" }); return; }
  if (c.maxUses !== null && c.usedCount >= c.maxUses) { res.status(410).json({ error: "تم استخدام الكود الحد الأقصى من المرات" }); return; }
  if (orderTotal && Number(orderTotal) < c.minOrder) {
    res.status(400).json({ error: `الحد الأدنى للطلب ${c.minOrder}$` }); return;
  }
  const discount = c.type === "percentage"
    ? ((orderTotal || 0) * c.value) / 100
    : c.value;
  res.json({ valid: true, coupon: c, discount: Math.round(discount * 100) / 100 });
});

// Public: use coupon (increment usedCount)
router.post("/coupons/use", (req, res) => {
  const c = coupons.find((c) => c.code === String(req.body?.code || "").toUpperCase());
  if (c) c.usedCount++;
  res.json({ ok: true });
});

export default router;
