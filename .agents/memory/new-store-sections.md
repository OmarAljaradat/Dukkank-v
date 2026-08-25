---
name: new-store-sections
description: HowItWorks, GoldenGuarantee, AboutStore sections added to the store
---

**What was added:**
- 3 new frontend components: `HowItWorks.jsx`, `AboutStore.jsx`, `GoldenGuarantee.jsx`
- Content keys in store.ts `content` object: `howItWorks`, `aboutStore`, `goldenGuarantee`
- New entries in `sections[]` array in store.ts (visible: true, added after "faq")
- Section renderers added to `SECTION_RENDERERS` in App.tsx
- Admin editable via `StoreInfoTab` in the "design" group of AdminDashboard

**Orders:**
- `store_orders` table in PostgreSQL: id, order_number, customer_name, product_type, game_name, subscription_type, subscription_duration, contact_instagram, contact_whatsapp, account_email, platform, notes, status, created_at, updated_at
- `order_number_seq` table for sequential admin order numbers (DK-00001 format)
- WhatsApp order numbers use timestamp+random format: DK-YYMMDD-XXXX (generated in whatsapp.js)
- Admin orders CRUD at `/api/admin/store-orders` (GET, POST, PUT/:id, DELETE/:id)

**Why:** User requested these sections to build trust and explain the purchase flow to customers. Orders need PostgreSQL persistence so they survive server restarts.
