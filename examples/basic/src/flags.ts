import { createFlagKit } from '@flagskit/react'

type AppFlags = {
  'new-checkout': boolean
  'pricing-model': 'legacy' | 'v2' | 'v3'
}

export const { FlagProvider, useFlag, useFlags, Feature, Variant } = createFlagKit<AppFlags>({
  'new-checkout': {
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
      { match: { role: 'admin' }, value: 'v3' },
    ],
  },
})
