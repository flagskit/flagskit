# FlagKit — Usage Examples

These examples define the target developer experience. Use them as acceptance criteria when implementing.

---

## Example 1: Minimal Setup (30 seconds to first flag)

```bash
pnpm add @flagskit/core @flagskit/react
```

```typescript
// flags.ts
import { defineFlags } from '@flagskit/core';

type AppFlags = {
  'dark-mode': boolean;
  'new-header': boolean;
};

export const flags = defineFlags<AppFlags>({
  'dark-mode': { defaultValue: false },
  'new-header': { defaultValue: false },
});
```

```tsx
// App.tsx
import { FlagProvider, useFlag, Feature } from '@flagskit/react';
import { flags } from './flags';

function App() {
  return (
    <FlagProvider flags={flags}>
      <Header />
      <Main />
    </FlagProvider>
  );
}

function Header() {
  const isDark = useFlag('dark-mode'); // boolean — typed!
  return <header className={isDark ? 'dark' : 'light'}>My App</header>;
}

function Main() {
  return (
    <Feature flag="new-header" fallback={<p>Old content</p>}>
      <p>New content!</p>
    </Feature>
  );
}
```

---

## Example 2: Percentage Rollout

```typescript
import { defineFlags } from '@flagskit/core';

type AppFlags = {
  'new-checkout': boolean;
};

const flags = defineFlags<AppFlags>({
  'new-checkout': {
    defaultValue: false,
    rules: [
      { percentage: 20, value: true }, // 20% of users
    ],
  },
});

// Provider must include userId for percentage rollout to be consistent
<FlagProvider flags={flags} context={{ userId: currentUser.id }}>
  <App />
</FlagProvider>

// In component:
const isNewCheckout = useFlag('new-checkout');
// Same userId always gets the same result
// Different userIds are distributed ~20/80
```

---

## Example 3: User Targeting with Rules

```typescript
import { defineFlags } from '@flagskit/core';

type AppFlags = {
  'admin-panel': boolean;
  'pricing': 'free' | 'pro' | 'enterprise';
};

const flags = defineFlags<AppFlags>({
  'admin-panel': {
    defaultValue: false,
    rules: [
      // Rule 1: admins always see it
      { match: { role: 'admin' }, value: true },
      // Rule 2: on staging, everyone sees it
      { match: { env: 'staging' }, value: true },
    ],
  },
  'pricing': {
    defaultValue: 'free',
    rules: [
      // Enterprise clients get enterprise pricing
      { match: { plan: 'enterprise' }, value: 'enterprise' },
      // 50% of remaining users get 'pro' (A/B test)
      { percentage: 50, value: 'pro' },
    ],
  },
});

<FlagProvider
  flags={flags}
  context={{
    userId: user.id,
    role: user.role,
    env: process.env.NODE_ENV,
    plan: user.subscription,
  }}
>
```

---

## Example 4: Combined match + percentage

```typescript
const flags = defineFlags<AppFlags>({
  'new-checkout': {
    defaultValue: false,
    rules: [
      // Only 30% of premium users get new checkout
      // Both conditions must be true
      {
        match: { plan: 'premium' },
        percentage: 30,
        value: true,
      },
    ],
  },
});
```

---

## Example 5: Overrides via JSON adapter

```typescript
import { jsonAdapter } from '@flagskit/core';

// Force specific flag values (e.g., for testing or local dev)
<FlagProvider
  flags={flags}
  context={{ userId: user.id }}
  adapter={jsonAdapter({
    overrides: {
      'new-checkout': true,
      'pricing': 'enterprise',
    },
  })}
>
```

---

## Example 6: Feature component with render prop

```tsx
import { Feature } from '@flagskit/react';

// Access the flag value in render
<Feature flag="max-upload-mb">
  {(maxSize) => (
    <div>
      <p>Maximum upload size: {maxSize}MB</p>
      <FileUploader maxSizeMB={maxSize} />
    </div>
  )}
</Feature>

// Boolean with fallback
<Feature flag="new-dashboard" fallback={<LegacyDashboard />}>
  <NewDashboard />
</Feature>

// Boolean without fallback (just hide if disabled)
<Feature flag="beta-badge">
  <span className="badge">BETA</span>
</Feature>
```

---

## Example 7: Multiple flags at once

```tsx
import { useFlags } from '@flagskit/react';

function Dashboard() {
  const flags = useFlags(['dark-mode', 'new-header', 'pricing']);
  // flags is typed: { 'dark-mode': boolean, 'new-header': boolean, 'pricing': 'free' | 'pro' | 'enterprise' }

  return (
    <div className={flags['dark-mode'] ? 'dark' : 'light'}>
      {flags['new-header'] && <NewHeader />}
      <PricingDisplay model={flags['pricing']} />
    </div>
  );
}
```

---

## Example 8: Type safety in action

```typescript
import { defineFlags } from '@flagskit/core';
import { useFlag } from '@flagskit/react';

type AppFlags = {
  'dark-mode': boolean;
  'pricing': 'v1' | 'v2';
};

const flags = defineFlags<AppFlags>({
  'dark-mode': { defaultValue: false },
  'pricing': { defaultValue: 'v1' },
});

// ✅ Correct usage
const isDark = useFlag('dark-mode');     // type: boolean
const model = useFlag('pricing');         // type: 'v1' | 'v2'

// ❌ TypeScript errors
const oops = useFlag('typo');            // Error: 'typo' not in AppFlags
const wrong = useFlag('dark-mode') + 1;  // Error: boolean + number

// ✅ defineFlags catches wrong defaults
const bad = defineFlags<AppFlags>({
  'dark-mode': { defaultValue: 'yes' },  // Error: 'yes' not assignable to boolean
  'pricing': { defaultValue: 'v3' },     // Error: 'v3' not assignable to 'v1' | 'v2'
});
```

---

## Anti-examples: What FlagKit does NOT do in v0.1

```typescript
// ❌ No async flag loading (v0.2)
const flag = await useFlag('feature'); // hooks are synchronous

// ❌ No real-time updates (v1.0)
// Flags don't auto-update when remote source changes

// ❌ No complex operators (v0.5)
{ match: { age: { $gt: 18 } } } // only equality in v0.1

// ❌ No server-side rendering helpers (v0.3)
import { getFlag } from '@flagskit/next'; // not yet

// ❌ No flag analytics / exposure tracking (v1.0)
// No built-in event emission on flag evaluation
```
