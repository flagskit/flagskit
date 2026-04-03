# FlagsKit — Feature Flags

This project uses FlagsKit (`@flagskit/react`) for feature flags.

## Setup

```typescript
// flags.ts
import { createFlagKit, defineFlags } from '@flagskit/react'

type AppFlags = {
  'feature-name': boolean
  'variant': 'a' | 'b' | 'c'
}

export const { FlagProvider, useFlag, useFlags, Feature } = createFlagKit<AppFlags>(
  defineFlags<AppFlags>({
    'feature-name': {
      defaultValue: false,
      rules: [
        { match: { role: 'beta' }, value: true },
        { percentage: 20, value: true },
      ],
    },
    'variant': { defaultValue: 'a' },
  }),
)
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

## Key rules

- Import from `'./flags'` not from `@flagskit/react`
- `userId` in context required for percentage rollout
- Rules: top-to-bottom, first match wins, all `match` conditions are AND
