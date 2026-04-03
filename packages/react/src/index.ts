export { createFlagKit } from './create-flag-kit'
export { FlagProvider } from './provider'
export { useFlag, useBoolFlag } from './use-flag'
export { useFlags } from './use-flags'
export { Feature } from './feature'
export type { FlagProviderProps } from './provider'
export type { FeatureProps } from './feature'

// Re-export core utilities — React users only need @flagskit/react
export { defineFlags, jsonAdapter } from '@flagskit/core'
export type {
  FlagSchema,
  FlagValue,
  FlagContext,
  FlagRule,
  FlagDefinition,
  FlagsConfig,
  FlagAdapter,
} from '@flagskit/core'
