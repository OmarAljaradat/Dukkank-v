---
name: Auth token format
description: How admin authentication works in the Dukkank API server.
---

## Token format
`local.<base64url(JSON)>` — the payload is a JSON object with `email` and `exp`.

## verifyToken()
Exported from `artifacts/api-server/src/routes/auth.ts`. Takes `req.headers.authorization`, returns the admin email string or null if invalid/expired.

**Why:** Simple base64 token approach chosen to avoid external auth dependencies. Not cryptographically signed — relies on server-side secret stored in env vars for production.
