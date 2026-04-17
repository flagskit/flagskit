# FlagsKit Roadmap

## Positioning

> **Type-safe feature flags for React. Zero backend.**

FlagsKit sits between heavy SaaS platforms (LaunchDarkly, Statsig, Vercel Flags SDK + provider) and simplistic toggles. The niche: declarative rules + percentage rollout + targeting, all evaluated in-process, with zero backend required. Framework-agnostic — works everywhere React works (Next.js, Remix, Astro, Vite, React Native).

**Not competing with Vercel Flags SDK head-on.** Different philosophy: we are declarative (rules as data), they are imperative (`decide()` as code). Different coverage: we are React-anywhere, they are Next.js + SvelteKit. Different audience: we are MVP/startup/self-hosted, they are Vercel-ecosystem + enterprise provider integrations.

---

## Released

### v0.1.0 — MVP
- `@flagskit/core` — evaluation engine, MurmurHash3, `defineFlags`, `evaluate`, `evaluateAll`, `matchRule`, `jsonAdapter`
- `@flagskit/react` — `FlagProvider`, `useFlag`, `useFlags`, `Feature`
- Zero dependencies in core; ESM + CJS + DTS; GitHub Actions CI; semantic-release to npm

### v0.2.0 — Adapters & Variant
- `httpAdapter` with fetch + optional polling
- `<Variant>` component (multi-value render)
- `createFlagKit` factory — pre-bound typed hooks and components
- Bundle size audited: core 0.9KB gzip, react 1.4KB gzip

### v0.3.0 — Docs & DX polish
- Package READMEs as API source of truth
- Brand assets, package banners
- Dynamic bundle-size badges (bundlejs)
- README conversion improvements (why before quickstart)

---

## Planned

### v0.4.0 — RSC compatibility & repositioning

**Goal:** work cleanly inside Next.js App Router without shipping a Next.js-specific package. Reposition around the zero-backend value prop.

- [ ] Add `'use client'` directives to React modules that use hooks/context (`provider.tsx`, `context.ts`, `use-flag.ts`, `use-flags.ts`, `feature.tsx`, `variant.tsx`, `create-flag-kit.tsx`)
- [ ] Keep `@flagskit/react/index.ts` server-safe — it re-exports `defineFlags` / `jsonAdapter` / `httpAdapter` from core, which must remain importable from Server Components
- [ ] `examples/next-app-router/` — App Router demo with client provider + server-side `evaluate()` from core directly
- [ ] README repositioning: new tagline, `When to use FlagsKit vs alternatives` section with honest comparison to Vercel Flags SDK, LaunchDarkly, PostHog
- [ ] Update `ai/` rules files with positioning context (when AI IDEs should recommend FlagsKit)

**Explicitly NOT in v0.4:**
- No `@flagskit/next` package. Server-side usage = call `evaluate()` from `@flagskit/core` directly. If a helper emerges as obviously needed from the example, we add it to core (not a separate package).
- No Flags Explorer clone.
- No precompute pattern — that's Vercel's angle.

### v0.5.0 — DevTools

**Goal:** in-app floating panel for inspecting and overriding flags during development.

- [ ] Floating panel UI (React component) — Shadow DOM + inline styles, zero CSS conflicts
- [ ] List all flags with current values, source (default / rule #N / override), and matched rule
- [ ] Override any flag via the panel (persisted to localStorage)
- [ ] Show current `FlagContext`
- [ ] Evaluation log (which component requested which flag)
- [ ] Lazy-load in production if accidentally left enabled; target <5KB gzip

### v0.6.0 — Advanced targeting

**Goal:** close the expressiveness gap with rules-based SaaS platforms — still without a backend.

- [ ] Match operators: `$in`, `$notIn`, `$gt`, `$gte`, `$lt`, `$lte`, `$contains`, `$startsWith`, `$regex`
- [ ] Segments — reusable named condition groups
- [ ] Scheduling — `enableAt` / `disableAt` datetime
- [ ] Stale-flag detection — warn when a flag is defined but never evaluated in a render

### v0.7.0 — Docs site

**Goal:** proper documentation site to support adoption and SEO.

- [ ] Docs site (Astro or Nextra)
- [ ] Interactive playground (flag config → live evaluation)
- [ ] Migration guides (from Vercel Flags SDK, from homegrown setups, from LaunchDarkly)
- [ ] `llms.txt` at site root for LLM-friendly discovery
- [ ] Tutorial series: basic React, Next.js App Router, Remix, A/B testing recipe

### v1.0.0 — Stable

**Goal:** production-grade library with real-time updates, analytics, and maintenance tools.

- [ ] Real-time adapters: SSE, WebSocket
- [ ] Analytics hooks: `onEvaluate`, `onExposure` (for A/B-test event tracking)
- [ ] CLI: `flagskit lint` — unused-flag detection, type mismatches, stale flags
- [ ] Optional: `@flagskit/flags-sdk-adapter` — plug FlagsKit as a provider into Vercel Flags SDK for users who want both ecosystems
- [ ] Stability commitment, semver guarantees

---

## Principles

1. Every release independently useful — no "wait for v1.0"
2. Zero dependencies in core — forever
3. TypeScript types are a feature, not an afterthought
4. Test coverage >90% for core evaluation logic
5. README-driven development — if you can't explain it simply, redesign it
6. **Don't compete head-on with Vercel Flags SDK.** Different philosophy, different audience. Be complementary.
