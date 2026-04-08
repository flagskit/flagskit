<p align="center">
  <img src="https://raw.githubusercontent.com/flagskit/flagskit/main/media/banner-react.png" alt="FlagsKit" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@flagskit/react"><img src="https://img.shields.io/npm/v/@flagskit/react" alt="npm" /></a>
  <a href="https://github.com/flagskit/flagskit/actions"><img src="https://github.com/flagskit/flagskit/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/flagskit/flagskit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@flagskit/react" alt="license" /></a>
  <img src="https://img.shields.io/badge/react-1.1KB-blue" alt="1.1KB gzipped" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="zero dependencies" />
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
  'pricing-model': 'legacy' | 'v2' | 'v3'
  'max-upload-mb': number
}

export const { FlagProvider, useFlag, useFlags, Feature, Variant } = createFlagKit<AppFlags>({
  'new-checkout': {
    defaultValue: false,
    rules: [
      { match: { role: 'beta' }, value: true },
      { percentage: 20, value: true },
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
})
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

**3. Use anywhere — fully typed**

```tsx
import { useFlag, Feature, Variant } from './flags'

// Hook — return type inferred from your schema
const isNew = useFlag('new-checkout')   // boolean
const model = useFlag('pricing-model')  // 'legacy' | 'v2' | 'v3'

// Boolean flag — show/hide
<Feature flag="new-checkout" fallback={<OldCheckout />}>
  <NewCheckout />
</Feature>

// Render prop — access the value
<Feature flag="max-upload-mb">
  {(maxMB) => <FileUpload limit={maxMB} />}
</Feature>

// Multivariate — render per value
<Variant
  flag="pricing-model"
  variants={{ legacy: <LegacyPricing />, v2: <PricingV2 />, v3: <PricingV3 /> }}
/>
```

---

## API

### `createFlagKit<T>(config)`

Primary API. Creates a fully typed set of React bindings bound to your flag schema. Import from `'./flags'` in your app — never import hooks directly from `@flagskit/react`.

Returns: `{ FlagProvider, useFlag, useFlags, Feature, Variant }`

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

Returns the evaluated value of a single flag. Return type inferred from your schema.

```typescript
const isNew = useFlag('new-checkout')   // boolean
const model = useFlag('pricing-model')  // 'legacy' | 'v2' | 'v3'
const oops  = useFlag('typo')          // TypeScript error
```

### `useFlags([...flagNames])`

Returns an object with values for multiple flags at once.

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

```tsx
<Feature flag="new-checkout" fallback={<OldCheckout />}>
  <NewCheckout />
</Feature>

<Feature flag="max-upload-mb">
  {(maxMB) => <Uploader limit={maxMB} />}
</Feature>
```

### `<Variant flag variants fallback?>`

Renders a different subtree for each possible flag value. Ideal for A/B tests and multivariate experiments.

```tsx
<Variant
  flag="pricing-model"
  variants={{
    legacy: <LegacyPricing />,
    v2:     <PricingV2 />,
    v3:     <PricingV3 />,
  }}
  fallback={<DefaultPricing />}
/>
```

### `jsonAdapter({ overrides })`

Static adapter — forces specific flag values. Useful for local development, tests, and CI.

```typescript
import { jsonAdapter } from '@flagskit/react'

<FlagProvider
  adapter={jsonAdapter({ overrides: { 'new-checkout': true } })}
>
```

### `httpAdapter({ url, refreshInterval?, headers? })`

Fetches flag overrides from a JSON endpoint. Optionally polls so flags stay fresh without a page reload.

```typescript
import { httpAdapter } from '@flagskit/react'

// Fetch once on mount
<FlagProvider adapter={httpAdapter({ url: '/api/flags' })}>

// With polling every 60 seconds
<FlagProvider adapter={httpAdapter({ url: '/api/flags', refreshInterval: 60_000 })}>

// With auth header
<FlagProvider adapter={httpAdapter({
  url: '/api/flags',
  headers: { Authorization: `Bearer ${token}` },
})}>
```

The endpoint must return a flat JSON object: `{ "flag-name": value, ... }`.

---

## Rules

```typescript
rules: [
  // Equality match — all conditions AND
  { match: { role: 'admin' }, value: true },

  // Percentage rollout — deterministic per userId
  { percentage: 20, value: true },

  // Combined — both conditions must pass
  { match: { plan: 'pro' }, percentage: 30, value: true },
]
```

Rules evaluate top-to-bottom. First matching rule wins.

---

## License

MIT
