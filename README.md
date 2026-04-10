<p align="center">
  <img src="https://raw.githubusercontent.com/flagskit/flagskit/main/media/banner-github.png" alt="FlagsKit" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@flagskit/react"><img src="https://img.shields.io/npm/v/@flagskit/react" alt="npm" /></a>
  <a href="https://github.com/flagskit/flagskit/actions"><img src="https://github.com/flagskit/flagskit/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/@flagskit/react" alt="license" /></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="zero dependencies" />
  <img src="https://img.shields.io/badge/core-0.9KB-blue" alt="core bundle size" />
  <img src="https://img.shields.io/badge/react-1.4KB-blue" alt="react bundle size" />
</p>

Type-safe feature flags for React — percentage rollout and user targeting without any backend.

```bash
npm install @flagskit/react
```

> **[Try the live example on StackBlitz](https://stackblitz.com/github/flagskit/flagskit/tree/main/examples/basic?file=src/App.tsx)**

---

## Why FlagsKit

Most tools force you to choose:

- **SaaS platforms** (LaunchDarkly, Unleash, Flagsmith) — need their cloud service or a self-hosted server
- **Context wrappers** (`flagged` and similar) — boolean flags only, no rollout, no targeting

FlagsKit sits in the middle: real rollout logic, no external service required.

|  | SaaS platforms | Context wrappers | **FlagsKit** |
|---|---|---|---|
| Percentage rollout | ✅ | ❌ | ✅ |
| User targeting | ✅ | ❌ | ✅ |
| Typed flag schema | ❌ | ❌ | ✅ |
| No external service | ❌ | ✅ | ✅ |

---

## Quickstart

**1. Define your flags once**

```typescript
// flags.ts
import { createFlagKit } from '@flagskit/react'

type AppFlags = {
  'new-checkout': boolean
}

export const { FlagProvider, useFlag, useFlags, Feature, Variant } = createFlagKit<AppFlags>({
  'new-checkout': {
    defaultValue: false,
    rules: [
      { match: { role: 'beta' }, value: true },  // beta users always get it
      { percentage: 20, value: true },            // 20% of everyone else
    ],
  },
})
```

**2. Wrap your app**

```tsx
// App.tsx
import { FlagProvider } from './flags'

function App() {
  return (
    <FlagProvider context={{ userId: user.id, role: user.role }}>
      <Router />
    </FlagProvider>
  )
}
```

**3. Use anywhere — fully typed**

```tsx
import { useFlag, Feature } from './flags'

function Page() {
  const isNew = useFlag('new-checkout')  // boolean — type inferred from schema

  return (
    <div>
      <h1>{isNew ? 'New Checkout' : 'Classic Checkout'}</h1>

      <Feature flag="new-checkout" fallback={<OldCheckout />}>
        <NewCheckout />
      </Feature>
    </div>
  )
}
```

TypeScript catches mistakes at compile time:

```typescript
useFlag('new-checkout')      // boolean ✓
useFlag('typo')              // TypeScript error ✓
useFlag('new-checkout') + 1  // TypeScript error ✓
```

---

## Features

### Roll out to a percentage of users

No server needed — consistent hashing assigns each user to a bucket client-side.

```typescript
// flags.ts
const { FlagProvider, useFlag, Feature, Variant } = createFlagKit<AppFlags>({
  'new-checkout': {
    defaultValue: false,
    rules: [{ percentage: 10, value: true }],  // 10% of users
  },
})
```

### Target specific users

Combine attribute matching with percentage for precise rollouts.

```typescript
'premium-dashboard': {
  defaultValue: false,
  rules: [
    { match: { role: 'beta' }, value: true },                // all beta users
    { match: { plan: 'pro' }, percentage: 30, value: true }, // 30% of pro users
  ],
}
```

### A/B test with multiple variants

Define a flag with a string union, then render a different UI per value — no if/else chains.

```typescript
// flags.ts
'pricing-model': {
  defaultValue: 'legacy',
  rules: [
    { match: { country: 'US' }, value: 'v2' },
    { match: { country: 'DE' }, value: 'v3' },
  ],
}
```

```tsx
// PricingPage.tsx
import { Variant } from './flags'

function PricingPage() {
  return (
    <Variant
      flag="pricing-model"
      variants={{
        legacy: <LegacyPricing />,  // everyone else
        v2:     <PricingV2 />,      // US users
        v3:     <PricingV3 />,      // DE users
      }}
    />
  )
}
```

### Start without a backend, add one later

Swap the adapter — your components stay the same.

```tsx
import { jsonAdapter, httpAdapter } from '@flagskit/react'

// Day 1 — static overrides for dev/testing
<FlagProvider adapter={jsonAdapter({ overrides: { 'new-checkout': true } })}>

// Later — fetch from your own API, with optional polling
<FlagProvider adapter={httpAdapter({ url: '/api/flags', refreshInterval: 60_000 })}>
```

---

## API

### `createFlagKit<T>(config)`

Primary API. Creates typed bindings for your flag schema. Returns `{ FlagProvider, useFlag, useFlags, Feature, Variant }`.

> Using `@flagskit/core` directly? See [`defineFlags`](./packages/core/README.md) — a type-safe config factory for non-React usage.

### `<FlagProvider context? adapter?>`

Evaluates all flags and provides values to the component tree. Re-evaluates when `context` or `adapter` changes.

| Prop | Type | Description |
|---|---|---|
| `context` | `FlagContext` | User/environment data for rule matching |
| `adapter` | `FlagAdapter<T>` | Optional override source |

```typescript
type FlagContext = {
  userId?: string   // required for percentage rollout
  env?: string
  [key: string]: string | number | boolean | undefined
}
```

### `useFlag(flagName)`

Returns the evaluated value of a single flag. Type inferred from your schema.

### `useFlags([...flagNames])`

Returns an object with values for multiple flags.

```typescript
const { 'new-checkout': isNew, 'pricing-model': model } = useFlags([
  'new-checkout',
  'pricing-model',
])
```

### `<Feature flag fallback? children>`

Conditional rendering based on a flag value.

- Boolean `true` → renders children
- Boolean `false` → renders `fallback` (or null)
- Non-boolean → renders children as render prop: `{(value) => <Component />}`

### `<Variant flag variants fallback?>`

Render a different subtree for each possible flag value. Ideal for A/B tests with more than two variants.

```tsx
<Variant
  flag="pricing-model"
  variants={{ legacy: <LegacyPricing />, v2: <PricingV2 /> }}
  fallback={<DefaultPricing />}
/>
```

### `jsonAdapter({ overrides })`

Static adapter — forces specific flag values. Useful for local development, tests, and CI.

### `httpAdapter({ url, refreshInterval?, headers? })`

Fetches flag overrides from a JSON endpoint. Optionally polls on a fixed interval so flags stay fresh without a page reload.

| Option | Type | Description |
|---|---|---|
| `url` | `string` | Endpoint returning `{ flagName: value }` JSON |
| `refreshInterval` | `number` | Polling interval in ms (omit to disable) |
| `headers` | `Record<string, string>` | Extra request headers (e.g. `Authorization`) |

---

## Packages

| Package | Description |
|---|---|
| `@flagskit/core` | Evaluation engine, types, adapters. Zero dependencies. Works in Node, Edge, browser. |
| `@flagskit/react` | Provider, hooks, components. Peer dep: `react >=18`. |

---

## Using with AI assistants

FlagsKit ships ready-made rules files for all major AI coding tools. Add them once — your AI will always generate correct FlagsKit code.

**Universal (`AGENTS.md`)** — works with Claude Code, Cursor, Copilot, Windsurf, Cline, Gemini CLI, Zed, Warp, and more:

```bash
curl -o AGENTS.md \
  https://raw.githubusercontent.com/flagskit/flagskit/main/AGENTS.md
```

**Tool-specific files** (if you need per-tool customization):

| Tool | Command |
|---|---|
| Cursor | `curl -o .cursor/rules/flagskit.mdc https://raw.githubusercontent.com/flagskit/flagskit/main/ai/cursor.mdc` |
| GitHub Copilot | `curl -o .github/copilot-instructions.md https://raw.githubusercontent.com/flagskit/flagskit/main/ai/copilot.md` |
| Claude Code | `curl -o CLAUDE.md https://raw.githubusercontent.com/flagskit/flagskit/main/ai/claude.md` |
| Windsurf | `curl -o .windsurf/rules/flagskit.md https://raw.githubusercontent.com/flagskit/flagskit/main/ai/windsurf.md` |

See [`ai/`](./ai/) for all files.

---

## License

MIT
