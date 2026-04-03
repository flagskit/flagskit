# FlagKit Roadmap

## v0.1.0 — MVP

Goal: publishable to npm, usable in a real React app.

### @flagskit/core

- [ ] `types.ts` — all TypeScript types (FlagSchema, FlagContext, FlagRule, FlagDefinition, FlagsConfig, FlagAdapter, EvaluationResult, MatchCondition, FlagValue)
- [ ] `hash.ts` — MurmurHash3 32-bit implementation (inline, zero deps)
- [ ] `define-flags.ts` — defineFlags<T>() factory (validates config, returns typed config)
- [ ] `rules.ts` — matchRule() function (equality matching, AND logic)
- [ ] `evaluate.ts` — evaluate() single flag, evaluateAll() all flags
- [ ] `adapters/types.ts` — FlagAdapter interface
- [ ] `adapters/json.ts` — jsonAdapter() static overrides
- [ ] `index.ts` — re-exports
- [ ] Tests: hash correctness & distribution, rule matching, evaluate with rules + percentage + overrides

### @flagskit/react

- [ ] `context.ts` — React context (FlagKitContext)
- [ ] `provider.tsx` — FlagProvider component (accepts flags, context, adapter)
- [ ] `use-flag.ts` — useFlag() hook (typed, throws if outside provider)
- [ ] `use-flags.ts` — useFlags() hook (multiple flags)
- [ ] `feature.tsx` — Feature component (conditional render, render prop support)
- [ ] `index.ts` — re-exports
- [ ] Tests: provider renders, useFlag returns correct value, Feature shows/hides, context changes trigger re-evaluation

### Project setup

- [ ] pnpm workspace with packages/core and packages/react
- [ ] tsup build for both packages (ESM + CJS + DTS)
- [ ] vitest config
- [ ] tsconfig.base.json + per-package tsconfig
- [ ] README.md with quickstart
- [ ] LICENSE (MIT)
- [ ] .gitignore
- [ ] Basic CI (GitHub Actions: lint + test + build)

### Package.json essentials for both packages

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

### README must include

- One-line description
- Install: `pnpm add @flagskit/core @flagskit/react`
- 30-second quickstart (defineFlags → FlagProvider → useFlag)
- Feature table (what FlagKit does vs doesn't)
- API reference links
- License

---

## v0.2.0 — Adapters & Variant

- [ ] HTTP adapter (fetch + polling interval)
- [ ] Env adapter (reads FF_* environment variables)
- [ ] compose() to merge multiple adapters (priority order)
- [ ] `<Variant>` component (render map by flag value)
- [ ] Evaluation events (onEvaluate callback)
- [ ] Error boundary in Feature component (errorFallback prop)
- [ ] evaluateSync() imperative API (no React)
- [ ] Bundle size audit — target <3KB gzipped for core

---

## v0.3.0 — Next.js (`@flagskit/next`)

- [ ] SSR-safe FlagProvider (serializes state to client)
- [ ] getFlag() for Server Components
- [ ] createFlagMiddleware() for Next.js middleware (rewrites based on flags)
- [ ] Edge Runtime compatibility
- [ ] App Router + Pages Router support

---

## v0.4.0 — DevTools (`@flagskit/devtools`)

- [ ] Floating panel UI (React component)
- [ ] Show all flags with current values and which rule matched
- [ ] Override any flag value in the panel (dev only)
- [ ] Show current FlagContext
- [ ] Evaluation log (which component requested which flag)
- [ ] Export/import flag state (JSON) for bug reproduction

---

## v0.5.0 — Advanced Targeting

- [ ] Match operators: $in, $notIn, $gt, $gte, $lt, $lte, $contains, $startsWith, $regex
- [ ] Segments: reusable named groups of conditions
- [ ] Scheduling: enable flag at specific datetime
- [ ] Expiry: auto-disable flag after datetime
- [ ] Stale flag detection (flag defined but never evaluated)

---

## v1.0.0 — Stable

- [ ] Unleash-compatible adapter
- [ ] LaunchDarkly-compatible adapter
- [ ] Real-time updates (SSE adapter, WebSocket adapter)
- [ ] Analytics hooks (onEvaluate, onExposure for A/B tracking)
- [ ] CLI tool: `flagkit lint` — detect unused flags, type mismatches
- [ ] Documentation site (Astro or Nextra)
- [ ] Comprehensive examples: basic React, Next.js App Router, Next.js Pages Router, Remix

---

## Principles

1. Every release must be independently useful — no "wait for v1.0"
2. Zero dependencies in core — forever
3. TypeScript types are a feature, not an afterthought
4. Test coverage >90% for core evaluation logic
5. README-driven development — if you can't explain it simply, redesign it
