import { Router, type IRouter } from "express";
import { DEFAULT_GAMES, DEFAULT_BUNDLES, dbLoad, dbSave, requireAdmin } from "../lib/storeDb.js";

const router: IRouter = Router();

// Public: Get Games
router.get("/games", async (_req, res) => {
  const list = await dbLoad("games", DEFAULT_GAMES);
  res.json([...list].filter((g: any) => g.available !== false).sort((a: any, b: any) => (a.order ?? 99) - (b.order ?? 99)));
});

// Admin: Get All Games
router.get("/admin/games", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const list = await dbLoad("games", DEFAULT_GAMES);
  res.json(list);
});

// Admin: Add Game
router.post("/admin/games", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("games", DEFAULT_GAMES);
  const game = { ...req.body, id: req.body.id || `game-${Date.now()}` };
  current.push(game);
  await dbSave("games", current);
  res.json(game);
});

// Admin: Reorder Games
router.put("/admin/games/reorder", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { orderedIds } = req.body || {};
  const current = await dbLoad("games", DEFAULT_GAMES);
  if (Array.isArray(orderedIds)) {
    orderedIds.forEach((id: string, idx: number) => {
      const g = current.find((x: any) => x.id === id);
      if (g) g.order = idx;
    });
    await dbSave("games", current);
  }
  res.json({ ok: true, games: current });
});

// Admin: Update Game
router.put("/admin/games/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("games", DEFAULT_GAMES);
  const idx = current.findIndex((g: any) => g.id === req.params.id);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...req.body };
    await dbSave("games", current);
    res.json(current[idx]);
  } else {
    res.status(404).json({ error: "اللعبة غير موجودة" });
  }
});

// Admin: Delete Game
router.delete("/admin/games/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("games", DEFAULT_GAMES);
  const idx = current.findIndex((g: any) => g.id === req.params.id);
  if (idx !== -1) {
    current.splice(idx, 1);
    await dbSave("games", current);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: "اللعبة غير موجودة" });
  }
});

// ── BUNDLES ──────────────────────────────────────────────────────────────────

// Public: Get Bundles
router.get("/bundles", async (_req, res) => {
  const list = await dbLoad("bundles", DEFAULT_BUNDLES);
  res.json(list);
});

// Admin: Create Bundle
router.post("/admin/bundles", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("bundles", DEFAULT_BUNDLES);
  const b = { ...req.body, id: req.body.id || `bundle-${Date.now()}` };
  current.push(b);
  await dbSave("bundles", current);
  res.json(b);
});

// Admin: Update Bundle
router.put("/admin/bundles/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("bundles", DEFAULT_BUNDLES);
  const idx = current.findIndex((b: any) => b.id === req.params.id);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...req.body };
    await dbSave("bundles", current);
    res.json(current[idx]);
  } else {
    res.status(404).json({ error: "الباقة غير موجودة" });
  }
});

// Admin: Delete Bundle
router.delete("/admin/bundles/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("bundles", DEFAULT_BUNDLES);
  const idx = current.findIndex((b: any) => b.id === req.params.id);
  if (idx !== -1) {
    current.splice(idx, 1);
    await dbSave("bundles", current);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: "الباقة غير موجودة" });
  }
});

export default router;
