# FlagsKit × Next.js App Router

Zero-backend feature flags in a Next.js 14 App Router application.

## What this example shows

- **Isomorphic flag config** (`lib/flags.ts`) — defined once with `defineFlags` from `@flagskit/core`, used on both server and client.
- **Server Component evaluation** (`app/page.tsx`) — reads cookies, calls `evaluate()` from `@flagskit/core` directly. No provider. No client bundle cost.
- **Client Component hooks** (`app/client-demo.tsx`) — `useFlag`, `useFlags`, `Feature`, `Variant` inside the provider set up in the layout.
- **Cookie-based context** (`app/layout.tsx`) — reads `userId`, `role`, `plan`, `country` from cookies and passes the same context to both server evaluation and the client provider.

## Why no `@flagskit/next` package

`@flagskit/core` is zero-dependency and framework-agnostic. It runs in Server Components, middleware, Edge runtime, and Node. Nothing Next.js-specific is needed — just call `evaluate()` directly. Adding a Next.js package would duplicate what's already in core.

If patterns in this example feel repetitive (e.g. the `readContextFromCookies` helper appearing in both `layout.tsx` and `page.tsx`), you would factor them into your own `lib/server-flags.ts`. They're intentionally inlined here to keep the example honest about what the library provides vs. what you compose yourself.

## Run it

```bash
cd examples/next-app-router
npm install
npm run dev
```

Open http://localhost:3000 and set cookies in DevTools (e.g. `role=beta`, `plan=pro`) to see flags flip.

## Packages used

- `@flagskit/core` — evaluation engine (server + client)
- `@flagskit/react` — `FlagProvider`, hooks, components (client only, auto-marked `'use client'`)

## Important: `defineFlags` must come from `@flagskit/core`

Not `@flagskit/react`. The react package is marked as a React Server Components client boundary, so anything imported from it is client-only. `@flagskit/core` is isomorphic and works on both sides.
