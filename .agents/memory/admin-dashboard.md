---
name: Admin dashboard architecture
description: 20+ tab admin panel at /admin — tabs, auth model, and storage pattern.
---

## Tabs
analytics, orders, insights, weeklyReport, store, coupons, subscriptions, games, bundles, scheduler, productsCSV, content, theme, seo, sections, reviews, faqs, marketing, notify, security, siteSettings, audit, account

## Auth
Admin login POSTs to /api/auth/admin-login. Returns a `local.<base64url(JSON)>` token. Token is stored in localStorage. Admin pages verify via Authorization header on every request.

## Storage model
localStorage + API hybrid — UI state and drafts in localStorage, persistent data in the in-memory API server. Server resets on restart.

## Route file
`artifacts/api-server/src/routes/store.ts` handles all store/admin data. Other admin endpoints (orders, coupons, analytics, security, insights) are in their own separate route files.
