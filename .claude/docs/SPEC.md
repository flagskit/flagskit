# FlagKit API Specification (v0.1.0)

## Overview

FlagKit consists of two packages for v0.1:

- `@flagskit/core` — evaluation engine, zero dependencies
- `@flagskit/react` — React bindings (Provider, hooks, components)

---

## @flagskit/core

### Types

```typescript
// ── Flag value types ──
type FlagValue = boolean | string | number | Record<string, unknown>;

// ── Evaluation context: data about current user/environment ──
type FlagContext = {
  userId?: string;
  env?: string;
  [key: string]: string | number | boolean | undefined;
};

// ── Rule: a condition + value pair ──
type MatchCondition = Record<string, string | number | boolean>;

type FlagRule<V extends FlagValue = FlagValue> = {
  // Match: all conditions must be true (AND logic)
  match?: MatchCondition;
  // Percentage rollout (0-100). Requires userId in context.
  percentage?: number | Record<string, number>;
  // Value to return when rule matches
  value?: V;
};

// ── Flag definition ──
type FlagDefinition<V extends FlagValue = FlagValue> = {
  description?: string;
  defaultValue: V;
  rules?: FlagRule<V>[];
};

// ── Flags schema: user defines this ──
// Example: type AppFlags = { 'dark-mode': boolean; 'plan': 'free' | 'pro' }
type FlagSchema = Record<string, FlagValue>;

// ── Flags config: the full definition object ──
type FlagsConfig<T extends FlagSchema> = {
  [K in keyof T]: FlagDefinition<T[K]>;
};

// ── Adapter interface ──
type FlagAdapter<T extends FlagSchema = FlagSchema> = {
  getOverrides(): Partial<T> | Promise<Partial<T>>;
};

// ── Evaluation result ──
type EvaluationResult<V extends FlagValue> = {
  value: V;
  source: 'override' | 'rule' | 'default';
  ruleIndex?: number;
};
```

### defineFlags()

Factory function to create a typed flags configuration.

```typescript
function defineFlags<T extends FlagSchema>(
  config: FlagsConfig<T>
): FlagsConfig<T>;
```

Usage:

```typescript
import { defineFlags } from '@flagskit/core';

type AppFlags = {
  'new-checkout': boolean;
  'pricing-model': 'legacy' | 'v2' | 'v3';
  'max-upload-mb': number;
};

const flags = defineFlags<AppFlags>({
  'new-checkout': {
    description: 'New checkout flow',
    defaultValue: false,
    rules: [
      { match: { role: 'beta' }, value: true },
      { percentage: 20, value: true },
    ],
  },
  'pricing-model': {
    defaultValue: 'legacy',
    rules: [
      { match: { country: 'RU' }, value: 'v2' },
    ],
  },
  'max-upload-mb': {
    defaultValue: 10,
    rules: [
      { match: { plan: 'premium' }, value: 100 },
    ],
  },
});
```

### evaluate()

Evaluate a single flag for a given context.

```typescript
function evaluate<T extends FlagSchema, K extends keyof T>(
  config: FlagsConfig<T>,
  flagName: K,
  context: FlagContext,
  overrides?: Partial<T>,
): EvaluationResult<T[K]>;
```

**Algorithm:**

1. If `overrides[flagName]` exists → return `{ value, source: 'override' }`
2. Iterate `rules` top-to-bottom:
   a. If rule has `match` → check all conditions against context (AND logic, equality only in v0.1)
   b. If rule has `percentage` → compute `murmurhash3(String(flagName) + String(context.userId)) % 100`, check if < percentage
   c. If both `match` and `percentage` → both must pass
   d. If rule matches → return `{ value: rule.value ?? defaultValue, source: 'rule', ruleIndex }`
3. Return `{ value: defaultValue, source: 'default' }`

### evaluateAll()

Evaluate all flags at once.

```typescript
function evaluateAll<T extends FlagSchema>(
  config: FlagsConfig<T>,
  context: FlagContext,
  overrides?: Partial<T>,
): { [K in keyof T]: T[K] };
```

### murmurhash3()

Inline MurmurHash3 (32-bit). No external dependencies.

```typescript
function murmurhash3(key: string, seed?: number): number;
```

Used for consistent percentage rollout. Same (flagName + userId) always produces the same hash, ensuring a user consistently sees the same variant.

### matchRule()

Check if a rule's match condition is satisfied by the context.

```typescript
function matchRule(
  match: MatchCondition,
  context: FlagContext,
): boolean;
// Returns true if ALL conditions in match are satisfied (AND logic)
// Equality comparison only in v0.1
```

### JSON Adapter

Simplest adapter — returns static overrides.

```typescript
function jsonAdapter<T extends FlagSchema>(config: {
  overrides: Partial<T>;
}): FlagAdapter<T>;
```

---

## @flagskit/react

### <FlagProvider>

React context provider. Evaluates all flags and provides values to children.

```typescript
type FlagProviderProps<T extends FlagSchema> = {
  flags: FlagsConfig<T>;
  context?: FlagContext;
  adapter?: FlagAdapter<T>;
  children: React.ReactNode;
};

function FlagProvider<T extends FlagSchema>(
  props: FlagProviderProps<T>
): React.ReactElement;
```

Usage:

```tsx
import { FlagProvider } from '@flagskit/react';

<FlagProvider
  flags={flags}
  context={{ userId: user.id, role: user.role, env: 'production' }}
>
  <App />
</FlagProvider>
```

**Behavior:**

- Evaluates all flags on mount and when `context` or `adapter` changes
- Stores evaluated values in React context
- If adapter is async, evaluates synchronously with defaults first, then re-evaluates when adapter resolves

### useFlag()

Get a single flag value. Fully typed — return type inferred from flag schema.

```typescript
function useFlag<T extends FlagSchema, K extends keyof T>(
  flagName: K
): T[K];
```

Usage:

```tsx
import { useFlag } from '@flagskit/react';

const isNewCheckout = useFlag('new-checkout');    // boolean
const model = useFlag('pricing-model');            // 'legacy' | 'v2' | 'v3'
const maxUpload = useFlag('max-upload-mb');         // number
```

**Must be called inside <FlagProvider>.** Throws if context is missing.

### useFlags()

Get multiple flag values at once.

```typescript
function useFlags<T extends FlagSchema, K extends keyof T>(
  flagNames: K[]
): Pick<T, K>;
```

Usage:

```tsx
import { useFlags } from '@flagskit/react';

const { 'dark-mode': isDark, 'new-checkout': isNew } = useFlags([
  'dark-mode',
  'new-checkout',
]);
```

### <Feature>

Conditional rendering component.

```typescript
type FeatureProps<T extends FlagSchema, K extends keyof T> = {
  flag: K;
  fallback?: React.ReactNode;
  children: React.ReactNode | ((value: T[K]) => React.ReactNode);
};

function Feature<T extends FlagSchema, K extends keyof T>(
  props: FeatureProps<T, K>
): React.ReactElement | null;
```

Usage:

```tsx
import { Feature } from '@flagskit/react';

{/* Boolean: show/hide */}
<Feature flag="new-checkout" fallback={<OldCheckout />}>
  <NewCheckout />
</Feature>

{/* Render prop: access value */}
<Feature flag="max-upload-mb">
  {(maxSize) => <Uploader maxMB={maxSize} />}
</Feature>
```

**Behavior for boolean flags:**

- `true` → render children
- `false` → render fallback (or null)

**Behavior for non-boolean flags:**

- Always renders children (as render prop with value)
- fallback is used only if flag evaluation fails

---

## Public API Exports

### @flagskit/core — index.ts

```typescript
export { defineFlags } from './define-flags';
export { evaluate, evaluateAll } from './evaluate';
export { matchRule } from './rules';
export { murmurhash3 } from './hash';
export { jsonAdapter } from './adapters/json';
export type {
  FlagSchema,
  FlagValue,
  FlagContext,
  FlagRule,
  FlagDefinition,
  FlagsConfig,
  FlagAdapter,
  EvaluationResult,
  MatchCondition,
} from './types';
```

### @flagskit/react — index.ts

```typescript
export { FlagProvider } from './provider';
export { useFlag } from './use-flag';
export { useFlags } from './use-flags';
export { Feature } from './feature';
```
