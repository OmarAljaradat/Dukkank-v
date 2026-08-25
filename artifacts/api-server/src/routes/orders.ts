import { Router, type IRouter } from "express";
import { verifyToken } from "./auth";

const router: IRouter = Router();

interface Order {
  id: string;
  productId: string;
  productName: string;
  productType: string;
  platform: string;
  price: number;
  currency: string;
  couponCode?: string;
  discountAmount?: number;
  finalPrice: number;
  status: "pending" | "completed" | "cancelled";
  source: string;
  timestamp: number;
}

const orders: Order[] = [];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

router.post("/orders", (req, res) => {
  const o = req.body as Partial<Order>;
  if (!o.productName) { res.status(400).json({ error: "productName required" }); return; }
  const order: Order = {
    id: uid(),
    productId: o.productId || "",
    productName: o.productName,
    productType: o.productType || "game",
    platform: o.platform || "",
    price: Number(o.price) || 0,
    currency: o.currency || "USD",
    couponCode: o.couponCode,
    discountAmount: o.discountAmount,
    finalPrice: Number(o.finalPrice ?? o.price) || 0,
    status: "pending",
    source: o.source || "direct",
    timestamp: Date.now(),
  };
  orders.push(order);
  res.status(201).json(order);
});

router.get("/admin/orders", (req, res) => {
  if (!verifyToken(req.headers.authorization)) { res.status(401).json({ error: "غير مصرح" }); return; }
  const sorted = [...orders].sort((a, b) => b.timestamp - a.timestamp);
  res.json({ orders: sorted, total: sorted.length });
});

router.patch("/admin/orders/:id", (req, res) => {
  if (!verifyToken(req.headers.authorization)) { res.status(401).json({ error: "غير مصرح" }); return; }
  const idx = orders.findIndex((o) => o.id === req.params.id);
  if (idx < 0) { res.status(404).json({ error: "not found" }); return; }
  if (req.body.status) orders[idx].status = req.body.status;
  res.json(orders[idx]);
});

router.delete("/admin/orders/:id", (req, res) => {
  if (!verifyToken(req.headers.authorization)) { res.status(401).json({ error: "غير مصرح" }); return; }
  const idx = orders.findIndex((o) => o.id === req.params.id);
  if (idx < 0) { res.status(404).json({ error: "not found" }); return; }
  orders.splice(idx, 1);
  res.json({ ok: true });
});

export default router;
