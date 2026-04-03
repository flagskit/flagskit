import type { FlagSchema, FlagAdapter } from '../types'

/**
 * Static JSON adapter — returns fixed overrides synchronously.
 *
 * Useful for local development, testing, and CI environments
 * where you want to force specific flag values without a remote source.
 *
 * @example
 * <FlagProvider
 *   flags={flags}
 *   adapter={jsonAdapter({ overrides: { 'new-checkout': true } })}
 * >
 */
export function jsonAdapter<T extends FlagSchema>(config: {
  overrides: Partial<T>
}): FlagAdapter<T> {
  return {
    getOverrides() {
      return config.overrides
    },
  }
}
