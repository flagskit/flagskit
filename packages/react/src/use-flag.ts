'use client'

import type { FlagSchema, FlagValue } from '@flagskit/core'
import { useFlagKitContext } from './context'

/**
 * Get the evaluated value of a single flag.
 *
 * The return type is inferred from your flag schema — pass it as the
 * first type parameter and the flag name as the second.
 *
 * @example
 * const isNew = useFlag<AppFlags, 'new-checkout'>('new-checkout')  // boolean
 * const plan  = useFlag<AppFlags, 'pricing'>('pricing')            // 'free' | 'pro'
 */
export function useFlag<T extends FlagSchema, K extends keyof T>(flagName: K): T[K] {
  const ctx = useFlagKitContext()
  return ctx.flags[flagName as string] as T[K]
}

// Convenience alias when the flag value is always boolean
export function useBoolFlag<T extends FlagSchema>(flagName: keyof T & string): boolean {
  return useFlag<T, typeof flagName>(flagName) as unknown as boolean
}
