// Isomorphic flag definitions — imported by BOTH Server Components (via
// `evaluate()` from @flagskit/core) and Client Components (via FlagProvider).
//
// Note: we import `defineFlags` from @flagskit/core, NOT @flagskit/react.
// The react package is a client boundary — anything imported from it can only
// be used on the client. The core package is framework-agnostic and isomorphic.

import { defineFlags } from '@flagskit/core'

export type AppFlags = {
  'new-homepage': boolean
  'pricing-model': 'legacy' | 'v2' | 'v3'
  'max-upload-mb': number
}

export const flags = defineFlags<AppFlags>({
  'new-homepage': {
    description: 'New homepage design',
    defaultValue: false,
    rules: [
      { match: { role: 'beta' }, value: true },
      { percentage: 30, value: true },
    ],
  },
  'pricing-model': {
    defaultValue: 'legacy',
    rules: [
      { match: { plan: 'pro' }, value: 'v2' },
      { match: { country: 'US' }, value: 'v3' },
    ],
  },
  'max-upload-mb': {
    defaultValue: 10,
    rules: [{ match: { plan: 'pro' }, value: 100 }],
  },
})
