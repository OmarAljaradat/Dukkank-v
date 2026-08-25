import { Router, type IRouter } from "express";
import { games, bundles, dbSave, requireAdmin } from "../lib/storeDb";

const router: IRouter = Router();

// Public: Get Games
router.get("/games", (_req, res) => {
  res.json([...games].filter(g => g.available !== false).sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
});

// Admin: Get All Games
router.get("/admin/games", (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json(games);
});

// Admin: Add Game
router.post("/admin/games", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const game = { ...req.body, id: req.body.id || `game-${Date.now()}` };
  games.push(game);
  await dbSave("games", games);
  res.json(game);
});

// Admin: Reorder Games
router.put("/admin/games/reorder", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { orderedIds } = req.body || {};
  if (Array.isArray(orderedIds)) {
    orderedIds.forEach((id: string, idx: number) => {
      const g = games.find((x: any) => x.id === id);
      if (g) g.order = idx;
    });
    await dbSave("games", games);
  }
  res.json({ ok: true, games });
});

// Admin: Update Game
router.put("/admin/games/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const idx = games.findIndex((g: any) => g.id === req.params.id);
  if (idx !== -1) {
    games[idx] = { ...games[idx], ...req.body };
    await dbSave("games", games);
    res.json(games[idx]);
  } else {
    res.status(404).json({ error: "اللعبة غير موجودة" });
  }
});

// Admin: Delete Game
router.delete("/admin/games/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const idx = games.findIndex((g: any) => g.id === req.params.id);
  if (idx !== -1) {
    games.splice(idx, 1);
    await dbSave("games", games);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: "اللعبة غير موجودة" });
  }
});

// ── BUNDLES ──────────────────────────────────────────────────────────────────

// Public: Get Bundles
router.get("/bundles", (_req, res) => res.json(bundles));

// Admin: Create Bundle
router.post("/admin/bundles", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const b = { ...req.body, id: req.body.id || `bundle-${Date.now()}` };
  bundles.push(b);
  await dbSave("bundles", bundles);
  res.json(b);
});

// Admin: Update Bundle
router.put("/admin/bundles/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const idx = bundles.findIndex((b: any) => b.id === req.params.id);
  if (idx !== -1) {
    bundles[idx] = { ...bundles[idx], ...req.body };
    await dbSave("bundles", bundles);
    res.json(bundles[idx]);
  } else {
    res.status(404).json({ error: "الباقة غير موجودة" });
  }
});

// Admin: Delete Bundle
router.delete("/admin/bundles/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const idx = bundles.findIndex((b: any) => b.id === req.params.id);
  if (idx !== -1) {
    bundles.splice(idx, 1);
    await dbSave("bundles", bundles);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: "الباقة غير موجودة" });
  }
});

export default router;
