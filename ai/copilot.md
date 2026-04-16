# FlagsKit — GitHub Copilot Instructions

This project uses FlagsKit (`@flagskit/react`) for feature flags.

## Setup pattern

Feature flags are defined once in `flags.ts` using `createFlagKit`:

```typescript
import { createFlagKit } from '@flagskit/react'

type AppFlags = {
  'feature-name': boolean
  'variant': 'a' | 'b'
}

export const { FlagProvider, useFlag, useFlags, Feature, Variant } = createFlagKit<AppFlags>({
  'feature-name': { defaultValue: false },
  'variant': { defaultValue: 'a' },
})
```

## Using flags in components

Always import from `'./flags'` (or wherever the app exports them), not from `@flagskit/react`:

```typescript
import { useFlag, Feature } from './flags'

// Hook
const isEnabled = useFlag('feature-name')  // boolean

// Component
<Feature flag="feature-name" fallback={<Old />}>
  <New />
</Feature>
```

## Rules for rollout

```typescript
rules: [
  { match: { role: 'admin' }, value: true },  // user targeting
  { percentage: 20, value: true },             // 20% rollout (needs userId in context)
  { match: { plan: 'pro' }, percentage: 50, value: true },  // combined
]
```

## Provider

Wrap the app once with context data:

```tsx
<FlagProvider context={{ userId: user.id, role: user.role }}>
  <App />
</FlagProvider>
```

## Variant component

For multivariate experiments — renders a different subtree per flag value:

```tsx
import { Variant } from './flags'

<Variant
  flag="variant"
  variants={{ a: <VariantA />, b: <VariantB /> }}
  fallback={<Default />}
/>
```

## Adapters

```typescript
import { jsonAdapter, httpAdapter } from '@flagskit/react'

// Static overrides — dev/testing
adapter={jsonAdapter({ overrides: { 'feature-name': true } })}

// Remote flags from backend
adapter={httpAdapter({ url: '/api/flags' })}

// With polling every 60 seconds
adapter={httpAdapter({ url: '/api/flags', refreshInterval: 60_000 })}
```

## Next.js App Router

`@flagskit/react` is marked `'use client'` (full bundle). For isomorphic flag files, import `defineFlags` from `@flagskit/core`:

```typescript
// lib/flags.ts — isomorphic
import { defineFlags } from '@flagskit/core'  // NOT @flagskit/react
export const flags = defineFlags<AppFlags>({ /* ... */ })
```

In Server Components, call `evaluate()` from core directly. There is no `@flagskit/next` package.

```tsx
// app/page.tsx
import { evaluate } from '@flagskit/core'
import { flags } from '@/lib/flags'

const { value } = evaluate(flags, 'new-homepage', { userId: '123' })
```

## Rules

- Import typed bindings from `'./flags'`, not from `@flagskit/react` directly
- In Next.js App Router, `defineFlags` must come from `@flagskit/core` (the react package is a client boundary)
- For Server Component evaluation, use `evaluate()` from `@flagskit/core` — there is no `@flagskit/next` package
- `userId` in context required for percentage rollout
- Rules: top-to-bottom, first match wins, all `match` conditions are AND
