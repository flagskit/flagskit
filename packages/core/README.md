<p align="center">
  <img src="https://raw.githubusercontent.com/flagskit/flagskit/main/media/banner-core.png" alt="FlagsKit" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@flagskit/core"><img src="https://img.shields.io/npm/v/@flagskit/core" alt="npm" /></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="zero dependencies" />
  <a href="https://bundlejs.com/?q=%40flagskit%2Fcore&badge=detailed"><img src="https://deno.bundlejs.com/?q=@flagskit/core&badge=detailed" alt="core bundle size" /></a>
</p>

Feature flag evaluation engine. Zero dependencies. Works in React, Node.js, Edge, and any other runtime.

**If you're building a React app, install [`@flagskit/react`](https://www.npmjs.com/package/@flagskit/react) instead** — it includes everything from core plus Provider, hooks, and components.

Use `@flagskit/core` directly when:
- You're integrating with a non-React framework (Vue, Svelte, vanilla JS)
- You need server-side evaluation (Next.js Server Components, Node.js, Edge runtime)
- You're building your own framework adapter
- You're defining flags in an isomorphic file that imports from both server and client (use `defineFlags` from here, not from `@flagskit/react`)

```bash
npm install @flagskit/core
```

---

## Usage

```typescript
import { defineFlags, evaluate, evaluateAll, jsonAdapter } from '@flagskit/core'

type AppFlags = {
  'new-checkout': boolean
  'plan': 'free' | 'pro'
}

const config = defineFlags<AppFlags>({
  'new-checkout': {
    defaultValue: false,
    rules: [
      { match: { role: 'beta' }, value: true },
      { percentage: 20, value: true },
    ],
  },
  'plan': {
    defaultValue: 'free',
    rules: [{ match: { tier: 'pro' }, value: 'pro' }],
  },
})

// Evaluate all flags
const flags = evaluateAll(config, { userId: 'user-123', role: 'beta' })
// { 'new-checkout': true, 'plan': 'free' }

// Evaluate a single flag with full result
const result = evaluate(config, 'new-checkout', { userId: 'user-123', role: 'beta' })
// { value: true, source: 'rule', ruleIndex: 0 }
```

---

## API

### `defineFlags<T>(config)`

Type-safe config factory. Validates flag definitions against your schema at compile time.

```typescript
const config = defineFlags<AppFlags>({ ... })
```

### `evaluate(config, flagName, context, overrides?)`

Evaluate a single flag. Returns `{ value, source, ruleIndex? }`.

- `source` is `'override'`, `'rule'`, or `'default'`

### `evaluateAll(config, context, overrides?)`

Evaluate all flags at once. Returns `{ [flagName]: value }`.

### `matchRule(match, context)`

Check if a match condition is satisfied by the context. All conditions use AND logic.

### `murmurhash3(key, seed?)`

Inline MurmurHash3 (32-bit). Used for consistent percentage rollout — same `flagName + userId` always produces the same hash.

### `jsonAdapter({ overrides })`

Static adapter — returns fixed overrides synchronously. Useful for local dev, testing, and CI.

```typescript
const adapter = jsonAdapter({ overrides: { 'new-checkout': true } })
```

### `httpAdapter({ url, refreshInterval?, headers? })`

Fetches flag overrides from a JSON endpoint. Optionally polls on a fixed interval.

```typescript
// Fetch once
const adapter = httpAdapter({ url: '/api/flags' })

// With polling every 60 seconds
const adapter = httpAdapter({ url: '/api/flags', refreshInterval: 60_000 })

// With auth
const adapter = httpAdapter({
  url: '/api/flags',
  headers: { Authorization: `Bearer ${token}` },
})
```

The endpoint must return a flat JSON object: `{ "flag-name": value, ... }`. Poll errors are silently ignored.

---

## Types

```typescript
type FlagValue   = boolean | string | number | Record<string, unknown>
type FlagContext  = { userId?: string; env?: string; [key: string]: string | number | boolean | undefined }
type FlagRule<V> = { match?: MatchCondition; percentage?: number; value?: V }
type FlagAdapter<T> = {
  getOverrides(): Partial<T> | Promise<Partial<T>>
  subscribe?: (callback: (overrides: Partial<T>) => void) => () => void
}
```

---

## License

MIT
