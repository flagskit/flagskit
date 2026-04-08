# FlagsKit — Feature Flags

This project uses FlagsKit (`@flagskit/react`) for feature flags.

## Setup

```typescript
// flags.ts
import { createFlagKit } from '@flagskit/react'

type AppFlags = {
  'feature-name': boolean
  'variant': 'a' | 'b' | 'c'
}

export const { FlagProvider, useFlag, useFlags, Feature, Variant } = createFlagKit<AppFlags>({
  'feature-name': {
    defaultValue: false,
    rules: [
      { match: { role: 'beta' }, value: true },
      { percentage: 20, value: true },
    ],
  },
  'variant': { defaultValue: 'a' },
})
```

## Usage in components

```tsx
import { FlagProvider, useFlag, Feature } from './flags'

// Provider — wrap app once
<FlagProvider context={{ userId: user.id, role: user.role }}>
  <App />
</FlagProvider>

// Hook
const isEnabled = useFlag('feature-name')  // boolean
const variant   = useFlag('variant')        // 'a' | 'b' | 'c'

// Component — boolean show/hide
<Feature flag="feature-name" fallback={<Old />}>
  <New />
</Feature>

// Component — render prop
<Feature flag="variant">{(v) => <Component variant={v} />}</Feature>
```

## Variant component

```tsx
// Multivariate — renders different UI per flag value
<Variant
  flag="variant"
  variants={{ a: <VariantA />, b: <VariantB />, c: <VariantC /> }}
  fallback={<Default />}
/>
```

## Adapters

```typescript
import { jsonAdapter, httpAdapter } from '@flagskit/react'

// Static overrides — dev/testing
adapter={jsonAdapter({ overrides: { 'feature-name': true } })}

// Remote flags from your backend
adapter={httpAdapter({ url: '/api/flags' })}

// With polling every 60 seconds
adapter={httpAdapter({ url: '/api/flags', refreshInterval: 60_000 })}
```

## Key rules

- Import from `'./flags'` not from `@flagskit/react`
- `userId` in context required for percentage rollout
- Rules: top-to-bottom, first match wins, all `match` conditions are AND
