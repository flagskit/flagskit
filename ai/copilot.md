# FlagsKit — GitHub Copilot Instructions

This project uses FlagsKit (`@flagskit/react`) for feature flags.

## Setup pattern

Feature flags are defined once in `flags.ts` using `createFlagKit`:

```typescript
import { createFlagKit, defineFlags } from '@flagskit/react'

type AppFlags = {
  'feature-name': boolean
  'variant': 'a' | 'b'
}

export const { FlagProvider, useFlag, useFlags, Feature, Variant } = createFlagKit<AppFlags>(
  defineFlags<AppFlags>({
    'feature-name': { defaultValue: false },
    'variant': { defaultValue: 'a' },
  }),
)
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
  { match: { plan: 'pro' }, percentage: 50 },  // combined
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
