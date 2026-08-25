---
name: Dukkank store architecture
description: Full-stack Arabic digital games/PS subscriptions store — stack, data flow, and missing-route pattern.
---

## Stack
- Frontend: React + Vite + Tailwind + Tajawal font, Arabic RTL
- API: Express in `artifacts/api-server/`
- DB: No database — all store data lives in-memory inside `store.ts`

## Data flow
Frontend (DataContext.jsx) calls `/api/*`, catches 404/errors, and falls back to `src/data/products.js`. This means the store renders fine even if the API is unreachable.

## Missing routes (now built)
The original GitHub repo only included: auth, visitors, analytics, orders, coupons, security, insights.
The main store data routes were missing and were added in `artifacts/api-server/src/routes/store.ts`:
- GET /api/store, /api/subscriptions, /api/games, /api/bundles, /api/reviews, /api/faqs, /api/sections, /api/promo, /api/social-proof, /api/wa-templates, /api/content, /api/site-settings
- POST /api/subscribers, /api/notify-requests, /api/events/cart-add
- Full admin CRUD: /api/admin/store, /admin/games, /admin/subscriptions, /admin/bundles, /admin/reviews, /admin/faqs, /admin/sections, /admin/promo, /admin/social-proof, /admin/wa-templates, /admin/content, /admin/site-settings

## In-memory storage
All store data is initialized with default values in store.ts and lives in module-level variables. It resets on server restart. If persistence is needed, add a database or file-based storage.

**Why:** User said significant modifications are coming, so kept it simple and in-memory for now.
