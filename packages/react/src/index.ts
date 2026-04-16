export { createFlagKit } from './create-flag-kit'
export { FlagProvider } from './provider'
export { useFlag, useBoolFlag } from './use-flag'
export { useFlags } from './use-flags'
export { Feature } from './feature'
export { Variant } from './variant'
export type { FlagProviderProps } from './provider'
export type { FeatureProps } from './feature'
export type { VariantProps } from './variant'

// Re-export client-safe core utilities. `defineFlags` is intentionally NOT
// re-exported here — it is needed both server-side (for Server Component
// evaluation via @flagskit/core's `evaluate()`) and client-side. Because this
// package is marked as a React Server Components client boundary, re-exporting
// `defineFlags` from here would make it callable only on the client. Import it
// from @flagskit/core instead:
//
//   import { defineFlags } from '@flagskit/core'
export { jsonAdapter, httpAdapter } from '@flagskit/core'
export type {
  FlagSchema,
  FlagValue,
  FlagContext,
  FlagRule,
  FlagDefinition,
  FlagsConfig,
  FlagAdapter,
} from '@flagskit/core'
