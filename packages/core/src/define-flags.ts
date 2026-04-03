import type { FlagSchema, FlagsConfig } from './types'

/**
 * Define a typed flags configuration.
 *
 * Pass your flag schema as the type parameter to get full type inference
 * across all hooks and components.
 *
 * @example
 * type AppFlags = { 'new-checkout': boolean; 'plan': 'free' | 'pro' }
 *
 * const flags = defineFlags<AppFlags>({
 *   'new-checkout': { defaultValue: false },
 *   'plan': { defaultValue: 'free' },
 * })
 */
export function defineFlags<T extends FlagSchema>(config: FlagsConfig<T>): FlagsConfig<T> {
  return config
}
