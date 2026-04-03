<p align="center">
  <img src="https://raw.githubusercontent.com/flagskit/flagskit/main/media/banner-github.png" alt="FlagsKit" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@flagskit/react"><img src="https://img.shields.io/npm/v/@flagskit/react" alt="npm" /></a>
  <a href="https://github.com/flagskit/flagskit/actions"><img src="https://github.com/flagskit/flagskit/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/@flagskit/react" alt="license" /></a>
</p>

Feature flags for React and TypeScript. Percentage rollout, user targeting, type-safe — no backend required.

```bash
pnpm add @flagskit/react
```

---

## Quickstart

**1. Define your flags once**

```typescript
// flags.ts
import { defineFlags, createFlagKit } from '@flagskit/react'

type AppFlags = {
  'new-checkout': boolean
  'pricing-model': 'legacy' | 'v2' | 'v3'
  'max-upload-mb': number
}

export const { FlagProvider, useFlag, useFlags, Feature } = createFlagKit<AppFlags>(
  defineFlags<AppFlags>({
    'new-checkout': {
      defaultValue: false,
      rules: [
        { match: { role: 'beta' }, value: true },   // beta users always get it
        { percentage: 20, value: true },             // 20% of everyone else
      ],
    },
    'pricing-model': {
      defaultValue: 'legacy',
      rules: [{ match: { country: 'US' }, value: 'v2' }],
    },
    'max-upload-mb': {
      defaultValue: 10,
      rules: [{ match: { plan: 'pro' }, value: 100 }],
    },
  }),
)
```

**2. Wrap your app**

```tsx
// App.tsx
import { FlagProvider } from './flags'

function App() {
  return (
    <FlagProvider context={{ userId: user.id, role: user.role, plan: user.plan }}>
      <Router />
    </FlagProvider>
  )
}
```

**3. Use anywhere — fully typed, no generics**

```tsx
import { useFlag, Feature } from './flags'

// Hook — return type inferred from your schema
function CheckoutButton() {
  const isNew = useFlag('new-checkout')  // boolean ✓
  return isNew ? <NewCheckout /> : <OldCheckout />
}

// Component — declarative show/hide
function Page() {
  return (
    <Feature flag="new-checkout" fallback={<OldCheckout />}>
      <NewCheckout />
    </Feature>
  )
}

// Render prop — access the value directly
function Uploader() {
  return (
    <Feature flag="max-upload-mb">
      {(maxMB) => <FileUpload limit={maxMB} />}
    </Feature>
  )
}
```

TypeScript catches mistakes at compile time:

```typescript
useFlag('new-checkout')           // boolean ✓
useFlag('pricing-model')          // 'legacy' | 'v2' | 'v3' ✓
useFlag('typo')                   // TypeScript error ✓
useFlag('new-checkout') + 1       // TypeScript error ✓
```

---

## Why FlagsKit

Most feature flag tools force you to choose between two bad options:

- **Heavyweight platforms** (LaunchDarkly, Unleash, Flagsmith) — you pay or deploy a server just to ship a feature behind a flag
- **Lightweight wrappers** (`flagged`, `react-feature-flags`) — basically `createContext` with no rollout, no targeting, no real types

FlagsKit sits in the middle: real feature flag functionality, zero infrastructure.

### Percentage rollout without a backend

Uses MurmurHash3 to consistently assign users to buckets client-side:

```
hash(flagName + userId) % 100 < percentage → enabled
```

Same user always sees the same variant. No server needed.

```typescript
rules: [{ percentage: 10, value: true }]  // 10% of users
```

### Rules + percentage together

```typescript
rules: [
  // Only 30% of pro users get the new dashboard
  { match: { plan: 'pro' }, percentage: 30, value: true },
]
```

### Adapter pattern — start simple, grow as needed

```typescript
import { jsonAdapter } from '@flagskit/core'

// Override any flag — useful for local dev and testing
<FlagProvider
  context={{ userId: user.id }}
  adapter={jsonAdapter({ overrides: { 'new-checkout': true } })}
>
```

When you need a remote source, swap the adapter. Your components stay the same.

```
Day 1:   JSON / env vars        no infrastructure
Month 3: Your own HTTP API      custom backend
Year 1:  Unleash / LaunchDarkly enterprise migration
```

---

## API

### `createFlagKit<T>(config)`

Primary API. Creates typed bindings for your flag schema. Returns `{ FlagProvider, useFlag, useFlags, Feature }`.

### `defineFlags<T>(config)`

Type-safe config factory. Validates your flag definitions against the schema at compile time.

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
- Boolean `false` → renders `fallback` (or nothing)
- Non-boolean → renders children as render prop: `{(value) => <Component />}`

---

## Packages

| Package | Description |
|---|---|
| `@flagskit/core` | Evaluation engine, types, adapters. Zero dependencies. Works in Node, Edge, browser. |
| `@flagskit/react` | Provider, hooks, components. Peer dep: `react >=18`. |
| `@flagskit/next` | SSR support, Server Components, middleware. _(coming in v0.3)_ |
| `@flagskit/devtools` | Inspect and override flags at runtime. _(coming in v0.4)_ |

---

## What v0.1 does not include

- Real-time flag updates — polling/SSE _(v0.2)_
- HTTP adapter _(v0.2)_
- Next.js SSR helpers _(v0.3)_
- DevTools panel _(v0.4)_
- Advanced match operators: `$in`, `$gt`, etc _(v0.5)_

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
