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

export const { FlagProvider, useFlag, useFlags, Feature } = createFlagKit<AppFlags>(
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
