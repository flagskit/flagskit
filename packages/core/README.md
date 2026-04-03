<p align="center">
  <img src="https://raw.githubusercontent.com/flagskit/flagskit/main/media/icon-64.png" alt="FlagsKit" height="64" />
</p>

# @flagskit/core

Framework-agnostic feature flag evaluation engine. Zero dependencies.

Used internally by `@flagskit/react`. If you're building a React app, install that instead:

```bash
pnpm add @flagskit/react
```

## When to use `@flagskit/core` directly

- Non-React frameworks (Vue, Svelte, vanilla JS)
- Node.js / Edge runtime (server-side evaluation)
- Building your own framework adapter

## Install

```bash
pnpm add @flagskit/core
```

## Usage

```typescript
import { defineFlags, evaluate, evaluateAll, jsonAdapter } from '@flagskit/core'

type AppFlags = {
  'new-checkout': boolean
  'plan': 'free' | 'pro'
}

const config = defineFlags<AppFlags>({
  'new-checkout': {
    defaultValue: false,
    rules: [
      { match: { role: 'beta' }, value: true },
      { percentage: 20, value: true },
    ],
  },
  'plan': { defaultValue: 'free' },
})

// Evaluate a single flag
const result = evaluate(config, 'new-checkout', { userId: 'user-123', role: 'beta' })
// { value: true, source: 'rule', ruleIndex: 0 }

// Evaluate all flags at once
const flags = evaluateAll(config, { userId: 'user-123', plan: 'pro' })
// { 'new-checkout': false, 'plan': 'free' }
```

## API

- `defineFlags<T>(config)` — typed config factory
- `evaluate(config, flagName, context, overrides?)` — single flag evaluation
- `evaluateAll(config, context, overrides?)` — all flags at once
- `matchRule(match, context)` — check if conditions match
- `murmurhash3(key, seed?)` — consistent hash for percentage rollout
- `jsonAdapter({ overrides })` — static override adapter

Full documentation: [github.com/flagskit/flagskit](https://github.com/flagskit/flagskit)

## License

MIT
