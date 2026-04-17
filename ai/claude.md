# FlagsKit — Feature Flags

This project uses FlagsKit (`@flagskit/react`) for feature flags.

## Setup

```typescript
// flags.ts
import { createFlagKit } from '@flagskit/react'

type AppFlags = {
  'new-checkout': boolean
  'plan': 'free' | 'pro' | 'enterprise'
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
})
```

## Usage

```tsx
// Wrap app
<FlagProvider context={{ userId: user.id, role: user.role }}>
  <App />
</FlagProvider>

// Hook — import from './flags', not from '@flagskit/react'
const isNew = useFlag('new-checkout')  // boolean
const plan  = useFlag('plan')          // 'free' | 'pro' | 'enterprise'

// Component
<Feature flag="new-checkout" fallback={<OldCheckout />}>
  <NewCheckout />
</Feature>

// Render prop for non-boolean
<Feature flag="plan">{(plan) => <Badge plan={plan} />}</Feature>
```

## Variant component

```tsx
// Multivariate — render different UI per flag value
<Variant
  flag="plan"
  variants={{ free: <FreePlan />, pro: <ProPlan />, enterprise: <EnterprisePlan /> }}
  fallback={<DefaultPlan />}
/>
```

## Adapters

```typescript
import { jsonAdapter, httpAdapter } from '@flagskit/react'

// Static overrides — dev/testing
adapter={jsonAdapter({ overrides: { 'new-checkout': true } })}

// Remote flags from backend
adapter={httpAdapter({ url: '/api/flags' })}

// With polling
adapter={httpAdapter({ url: '/api/flags', refreshInterval: 60_000 })}
```

## Next.js App Router

`@flagskit/react` is marked `'use client'` (full bundle). For isomorphic flag files, import `defineFlags` from `@flagskit/core`:

```typescript
// lib/flags.ts — isomorphic
import { defineFlags } from '@flagskit/core'  // NOT @flagskit/react
export const flags = defineFlags<AppFlags>({ /* ... */ })
```

In Server Components, call `evaluate()` from core directly — there is no `@flagskit/next` package:

```tsx
// app/page.tsx
import { evaluate } from '@flagskit/core'
import { flags } from '@/lib/flags'

const { value } = evaluate(flags, 'new-homepage', { userId: '123' })
```

## Rules

- Rules evaluate top-to-bottom, first match wins
- `match` conditions use AND logic
- `percentage` rollout requires `userId` in context
- Always import typed bindings from `'./flags'`, not directly from `@flagskit/react`
- In Next.js App Router, `defineFlags` must come from `@flagskit/core` (not `@flagskit/react`) — the react package is a client boundary
- For Server Component evaluation, use `evaluate()` from `@flagskit/core` — there is no `@flagskit/next` package
