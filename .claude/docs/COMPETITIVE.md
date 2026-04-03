# FlagKit — Competitive Landscape & Positioning

## The Problem

Feature flags in 2026 fall into two camps with nothing useful in between:

### Camp A: Heavyweight Platforms (require backend)

| Tool | GitHub Stars | Backend Required | Pricing | React SDK Quality |
|---|---|---|---|---|
| LaunchDarkly | closed-source | Yes (SaaS) | From $10k/yr | Good (hooks + HOC), but heavy (~30KB) |
| Unleash | ~13k | Yes (self-host or cloud) | Free (OSS core) | Basic proxy SDK, no generics |
| Flagsmith | ~5k | Yes (self-host or cloud) | Free tier | Decent (hooks), isomorphic support |
| PostHog | ~22k | Yes (SaaS or self-host) | Free tier | Good hooks, but it's a full analytics platform |
| GrowthBook | ~6k | Yes (self-host or cloud) | Free (OSS) | Good, focused on A/B testing |
| Reflag | new | Yes (SaaS) | Free tier | Good (TypeScript types, CLI codegen) |
| ConfigCat | closed-source | Yes (SaaS) | Free tier | HOC + hooks, polling modes |

**Common weakness:** You must run or pay for a backend service just to use feature flags. For many teams this is overkill — they have 5-20 flags and just want them to work.

### Camp B: Lightweight React Libraries (no real features)

| Tool | GitHub Stars | Last Updated | Percentage Rollout | Targeting | SSR | TypeScript |
|---|---|---|---|---|---|---|
| flagged (sergiodxa) | ~434 | Oct 2025 | ❌ | ❌ | ❌ | Basic |
| @ttoss/react-feature-flags | ~? | Active | ❌ | ❌ | ❌ | Module augmentation |
| react-feature-flags (romaindso) | ~? | Abandoned | ❌ | ❌ | ❌ | ❌ |
| flag (garbles) | ~373 | Jul 2023 (dead) | ❌ | ❌ | Partial (Suspense) | Good generics |
| next-feature-flags | ~1k | Dec 2025 | ❌ | ❌ | Next.js only | Basic |

**Common weakness:** These are essentially `React.createContext` + `useContext` wrappers. No percentage rollout, no user targeting, no consistent hashing. If you need any real feature flag functionality, you outgrow them immediately.

## FlagKit's Position: The Missing Middle

```
                    Features
                       ↑
   LaunchDarkly ●      |
   Unleash ●           |
   GrowthBook ●        |
   Flagsmith ●         |
                       |
         ← ← ← FlagKit fills this gap → → →
                       |
   flagged ●           |
   @ttoss ●            |
   flag ●              |
                       +————————————————→ Simplicity / No Backend
```

FlagKit provides:

- ✅ Percentage rollout (consistent hashing)
- ✅ User targeting (rule-based)
- ✅ Type-safe (TypeScript generics, not module augmentation)
- ✅ SSR support (Next.js App Router)
- ✅ DevTools
- ✅ Zero dependencies
- ✅ No backend required
- ✅ Pluggable adapters (use any backend when you need one)

## Key Differentiators

### 1. TypeScript Generics (not module augmentation)

`@ttoss/react-feature-flags` uses module augmentation:

```typescript
// Their approach — global type override
declare module '@ttoss/react-feature-flags' {
  export type FeatureFlags = 'my-feature' | 'other-feature';
}
```

FlagKit uses generics — more explicit, works in monorepos, no global pollution:

```typescript
// Our approach — explicit schema
type AppFlags = { 'my-feature': boolean; 'pricing': 'v1' | 'v2' };
const flags = defineFlags<AppFlags>({ ... });
// useFlag('my-feature') returns boolean
// useFlag('pricing') returns 'v1' | 'v2'
// useFlag('typo') → TypeScript error
```

### 2. Percentage Rollout Without a Backend

No existing lightweight library does this. FlagKit uses MurmurHash3:

```
hash = murmurhash3(flagName + userId) % 100
hash < percentage → enabled
```

Same user always gets the same result. Different flags get different distributions.

### 3. Adapter Pattern

Start simple, grow as needed:

```
Day 1:    JSON file / env vars (no backend)
Month 3:  Own HTTP API (custom backend)
Year 1:   Unleash / LaunchDarkly (enterprise migration)
```

All without changing your React code.

### 4. Actually Good Developer Experience

- `<Feature flag="x">` instead of `{isEnabled && <Component />}` scattered everywhere
- `<Variant flag="pricing">{{ v1: ..., v2: ... }}</Variant>` for A/B
- DevTools panel to override flags without touching code
- Error boundaries per flag (one broken feature doesn't crash the app)

## Target Users

1. **Small-medium React teams (5-50 devs)** who need feature flags but don't want to deploy Unleash or pay for LaunchDarkly
2. **Solo developers / startups** who want percentage rollout and targeting without infrastructure
3. **Enterprise teams** who want to start simple and migrate to a platform later (adapter pattern)
4. **Specifically:** WB Tech (author's workplace) — internal adoption as dogfooding

## npm

- Scope: `@flagskit`
- Install: `pnpm add @flagskit/core @flagskit/react`
- GitHub: `github.com/flagskit/flagskit`

## SEO / Discovery Keywords

- react feature flags
- feature flags typescript
- feature flags without backend
- react feature toggle
- nextjs feature flags
- lightweight feature flags
- feature flags sdk
- feature flags hooks react
- percentage rollout react
- feature flags open source
