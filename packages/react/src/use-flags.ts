import { useMemo } from 'react'
import type { FlagSchema } from '@flagskit/core'
import { useFlagKitContext } from './context'

/**
 * Get the evaluated values of multiple flags at once.
 *
 * @example
 * const { 'dark-mode': isDark, 'new-checkout': isNew } = useFlags<AppFlags>([
 *   'dark-mode',
 *   'new-checkout',
 * ])
 */
export function useFlags<T extends FlagSchema, K extends keyof T>(flagNames: K[]): Pick<T, K> {
  const ctx = useFlagKitContext()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => {
    const result = {} as Pick<T, K>
    for (const name of flagNames) {
      result[name] = ctx.flags[name as string] as T[K]
    }
    return result
  }, [ctx, ...flagNames])
}
