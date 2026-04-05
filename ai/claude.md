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

export const { FlagProvider, useFlag, useFlags, Feature, Variant } = createFlagKit<AppFlags>(
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

## Rules

- Rules evaluate top-to-bottom, first match wins
- `match` conditions use AND logic
- `percentage` rollout requires `userId` in context
- Always import typed bindings from `'./flags'`, not directly from `@flagskit/react`
