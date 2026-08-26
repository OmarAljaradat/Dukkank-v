import { Router, type IRouter } from "express";
import {
  DEFAULT_SECTIONS, DEFAULT_PROMO, DEFAULT_SOCIAL_PROOF, DEFAULT_WA_TEMPLATES,
  DEFAULT_CONTENT, DEFAULT_SITE_SETTINGS, DEFAULT_LAUNCH_ANNOUNCEMENT,
  dbLoad, dbSave, requireAdmin
} from "../lib/storeDb.js";

const router: IRouter = Router();

// ── SECTIONS ─────────────────────────────────────────────────────────────────
router.get("/sections", async (_req, res) => {
  const list = await dbLoad("sections", DEFAULT_SECTIONS);
  res.json(list);
});

router.put("/admin/sections", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const newSecs = Array.isArray(req.body) ? req.body : (Array.isArray(req.body?.sections) ? req.body.sections : null);
  if (newSecs) {
    await dbSave("sections", newSecs);
    res.json(newSecs);
  } else {
    res.status(400).json({ error: "تنسيق البيانات غير صحيح" });
  }
});

// ── LAUNCH ANNOUNCEMENT ───────────────────────────────────────────────────────
router.get("/launch-announcement", async (_req, res) => {
  const data = await dbLoad("launchAnnouncement", DEFAULT_LAUNCH_ANNOUNCEMENT);
  res.json(data);
});

router.put("/admin/launch-announcement", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const updated = req.body;
  await dbSave("launchAnnouncement", updated);
  res.json(updated);
});

// ── PROMO BANNER & OFFERS ─────────────────────────────────────────────────────
router.get("/promo", async (_req, res) => {
  const data = await dbLoad("promo", DEFAULT_PROMO);
  res.json(data);
});

router.put("/admin/promo", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("promo", DEFAULT_PROMO);
  const updated = { ...DEFAULT_PROMO, ...current, ...req.body };
  await dbSave("promo", updated);
  res.json(updated);
});

// ── SOCIAL PROOF TOASTS ───────────────────────────────────────────────────────
router.get("/social-proof", async (_req, res) => {
  const data = await dbLoad("socialProof", DEFAULT_SOCIAL_PROOF);
  res.json(data);
});

router.put("/admin/social-proof", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("socialProof", DEFAULT_SOCIAL_PROOF);
  const updated = { ...current, ...req.body };
  await dbSave("socialProof", updated);
  res.json(updated);
});

// ── WHATSAPP TEMPLATES ───────────────────────────────────────────────────────
router.get("/wa-templates", async (_req, res) => {
  const data = await dbLoad("waTemplates", DEFAULT_WA_TEMPLATES);
  res.json(data);
});

router.put("/admin/wa-templates", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("waTemplates", DEFAULT_WA_TEMPLATES);
  const updated = { ...current, ...req.body };
  await dbSave("waTemplates", updated);
  res.json(updated);
});

// ── HERO & STORE CONTENT ──────────────────────────────────────────────────────
router.get("/content", async (_req, res) => {
  const data = await dbLoad("content", DEFAULT_CONTENT);
  res.json(data);
});

router.put("/admin/content", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("content", DEFAULT_CONTENT);
  const updated = { ...current, ...req.body };
  await dbSave("content", updated);
  res.json(updated);
});

// ── SITE SETTINGS ─────────────────────────────────────────────────────────────
router.get("/site-settings", async (_req, res) => {
  const data = await dbLoad("siteSettings", DEFAULT_SITE_SETTINGS);
  res.json(data);
});

router.put("/admin/site-settings", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("siteSettings", DEFAULT_SITE_SETTINGS);
  const updated = { ...DEFAULT_SITE_SETTINGS, ...current, ...req.body };
  await dbSave("siteSettings", updated);
  res.json(updated);
});

// ── THEME OVERRIDES ──────────────────────────────────────────────────────────
router.get("/theme", async (_req, res) => {
  const data = await dbLoad("theme", {});
  res.json(data);
});

router.put("/admin/theme", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const theme = req.body || {};
  await dbSave("theme", theme);
  res.json(theme);
});

export default router;
