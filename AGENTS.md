# FlagsKit — Feature Flags

This project uses FlagsKit (`@flagskit/react`) for feature flags.

## Setup

Feature flags are defined once using `createFlagKit` and exported as typed bindings:

```typescript
// flags.ts
import { createFlagKit } from '@flagskit/react'

type AppFlags = {
  'new-checkout': boolean
  'plan': 'free' | 'pro' | 'enterprise'
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
  'plan': {
    defaultValue: 'free',
    rules: [
      { match: { tier: 'pro' }, value: 'pro' },
      { match: { tier: 'enterprise' }, value: 'enterprise' },
    ],
  },
  'max-upload-mb': {
    defaultValue: 10,
    rules: [{ match: { tier: 'pro' }, value: 100 }],
  },
})
```

## Provider

Wrap the app once. Pass user/environment data via `context`:

```tsx
import { FlagProvider } from './flags'

<FlagProvider context={{ userId: user.id, role: user.role, tier: user.tier }}>
  <App />
</FlagProvider>
```

`context` shape — all fields optional, all values must be primitives:

```typescript
{
  userId?: string   // required for percentage rollout
  env?: string
  [key: string]: string | number | boolean | undefined
}
```

## useFlag

```typescript
import { useFlag } from './flags'

const isNew   = useFlag('new-checkout')   // boolean
const plan    = useFlag('plan')           // 'free' | 'pro' | 'enterprise'
const maxSize = useFlag('max-upload-mb')  // number
```

## useFlags

```typescript
import { useFlags } from './flags'

const { 'new-checkout': isNew, 'plan': plan } = useFlags(['new-checkout', 'plan'])
```

## Feature component

```tsx
import { Feature } from './flags'

// Boolean flag — show/hide
<Feature flag="new-checkout" fallback={<OldCheckout />}>
  <NewCheckout />
</Feature>

// Non-boolean flag — render prop, always renders
<Feature flag="plan">
  {(plan) => <PlanBadge plan={plan} />}
</Feature>
```

## Rules

Rules evaluate top-to-bottom. First matching rule wins. All `match` conditions are AND logic.

```typescript
rules: [
  { match: { role: 'admin' }, value: true },              // user attribute match
  { percentage: 20, value: true },                        // 20% rollout (needs userId)
  { match: { plan: 'pro' }, percentage: 50, value: true }, // combined — both must pass
]
```

## Variant component

For A/B tests and multivariate experiments — renders a different subtree per flag value:

```tsx
import { Variant } from './flags'

<Variant
  flag="plan"
  variants={{
    free:       <FreeDashboard />,
    pro:        <ProDashboard />,
    enterprise: <EnterpriseDashboard />,
  }}
  fallback={<LoadingDashboard />}
/>
```

Use `<Variant>` instead of chained `if/else` or multiple `<Feature>` blocks when a flag has more than two meaningful values.

## Adapters

### jsonAdapter — static overrides (dev/testing)

```typescript
import { jsonAdapter } from '@flagskit/react'

<FlagProvider
  context={{ userId: user.id }}
  adapter={jsonAdapter({ overrides: { 'new-checkout': true } })}
>
```

### httpAdapter — remote flags from your backend

```typescript
import { httpAdapter } from '@flagskit/react'

// Fetch once
<FlagProvider
  context={{ userId: user.id }}
  adapter={httpAdapter({ url: '/api/flags' })}
>

// With polling — flags refresh every 60s without a page reload
<FlagProvider
  context={{ userId: user.id }}
  adapter={httpAdapter({ url: '/api/flags', refreshInterval: 60_000 })}
>

// With auth header
adapter={httpAdapter({ url: '/api/flags', headers: { Authorization: `Bearer ${token}` } })}
```

The endpoint must return a flat JSON object: `{ "flag-name": value, ... }`.
Poll errors are silently ignored — last known values stay active.

## Rules to follow

- Always import `useFlag`, `Feature`, `FlagProvider` from `'./flags'` (app's typed exports), not from `@flagskit/react` directly
- `userId` in context is required for percentage rollout — without it, percentage rules are skipped
- `defaultValue` must be assignable to the flag's type in `AppFlags`
- Never put sensitive logic behind client-side flags — they are visible in the browser
