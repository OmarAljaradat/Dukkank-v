import { Router, type IRouter } from "express";
import {
  sections, promo, socialProof, waTemplates, content,
  siteSettings, launchAnnouncement, dbSave, requireAdmin
} from "../lib/storeDb.js";

const router: IRouter = Router();

// ── SECTIONS ─────────────────────────────────────────────────────────────────
router.get("/sections", (_req, res) => res.json(sections));

router.put("/admin/sections", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  let newSecs = req.body;
  if (Array.isArray(newSecs)) {
    sections.length = 0;
    sections.push(...newSecs);
    await dbSave("sections", sections);
  }
  res.json(sections);
});

// ── LAUNCH ANNOUNCEMENT ───────────────────────────────────────────────────────
router.get("/launch-announcement", (_req, res) => res.json(launchAnnouncement));

router.put("/admin/launch-announcement", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  Object.assign(launchAnnouncement, req.body);
  await dbSave("launchAnnouncement", launchAnnouncement);
  res.json(launchAnnouncement);
});

// ── PROMO BANNER & OFFERS ─────────────────────────────────────────────────────
router.get("/promo", (_req, res) => res.json(promo));

router.put("/admin/promo", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  Object.assign(promo, req.body);
  await dbSave("promo", promo);
  res.json(promo);
});

// ── SOCIAL PROOF TOASTS ───────────────────────────────────────────────────────
router.get("/social-proof", (_req, res) => res.json(socialProof));

router.put("/admin/social-proof", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  Object.assign(socialProof, req.body);
  await dbSave("socialProof", socialProof);
  res.json(socialProof);
});

// ── WHATSAPP TEMPLATES ───────────────────────────────────────────────────────
router.get("/wa-templates", (_req, res) => res.json(waTemplates));

router.put("/admin/wa-templates", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  Object.assign(waTemplates, req.body);
  await dbSave("waTemplates", waTemplates);
  res.json(waTemplates);
});

// ── HERO & STORE CONTENT ──────────────────────────────────────────────────────
router.get("/content", (_req, res) => res.json(content));

router.put("/admin/content", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  Object.assign(content, req.body);
  await dbSave("content", content);
  res.json(content);
});

// ── SITE SETTINGS ─────────────────────────────────────────────────────────────
router.get("/site-settings", (_req, res) => res.json(siteSettings));

router.put("/admin/site-settings", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  Object.assign(siteSettings, req.body);
  await dbSave("siteSettings", siteSettings);
  res.json(siteSettings);
});

export default router;
