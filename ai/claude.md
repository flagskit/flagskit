# FlagsKit — Feature Flags

This project uses FlagsKit (`@flagskit/react`) for feature flags.

## Setup

```typescript
// flags.ts
import { createFlagKit, defineFlags } from '@flagskit/react'

type AppFlags = {
  'new-checkout': boolean
  'plan': 'free' | 'pro' | 'enterprise'
}

export const { FlagProvider, useFlag, useFlags, Feature } = createFlagKit<AppFlags>(
  defineFlags<AppFlags>({
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
  }),
)
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

## Rules

- Rules evaluate top-to-bottom, first match wins
- `match` conditions use AND logic
- `percentage` rollout requires `userId` in context
- Always import typed bindings from `'./flags'`, not directly from `@flagskit/react`
