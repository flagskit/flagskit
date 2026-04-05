export { createFlagKit } from './create-flag-kit'
export { FlagProvider } from './provider'
export { useFlag, useBoolFlag } from './use-flag'
export { useFlags } from './use-flags'
export { Feature } from './feature'
export { Variant } from './variant'
export type { FlagProviderProps } from './provider'
export type { FeatureProps } from './feature'
export type { VariantProps } from './variant'

// Re-export core utilities — React users only need @flagskit/react
export { defineFlags, jsonAdapter, httpAdapter } from '@flagskit/core'
export type {
  FlagSchema,
  FlagValue,
  FlagContext,
  FlagRule,
  FlagDefinition,
  FlagsConfig,
  FlagAdapter,
} from '@flagskit/core'
