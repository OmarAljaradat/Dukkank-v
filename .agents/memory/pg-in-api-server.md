---
name: pg-in-api-server
description: pg must be explicitly listed in api-server/package.json dependencies
---

**Rule:** When using `pg` directly in `artifacts/api-server/src/routes/*.ts`, always add `"pg": "^8.20.0"` to `artifacts/api-server/package.json` dependencies and run `pnpm install`.

**Why:** esbuild resolves imports at bundle time against the package's own node_modules. Even though `@workspace/db` depends on `pg`, it does NOT hoist pg into api-server's node_modules in a way esbuild can resolve. The build fails with "Could not resolve 'pg'" unless pg is an explicit dependency of api-server.

**How to apply:** Any time a new route in api-server needs pg directly, check api-server/package.json first. If pg is missing, add it and `pnpm --filter @workspace/api-server install`.
