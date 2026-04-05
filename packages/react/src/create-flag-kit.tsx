import type { ReactNode, ReactElement } from 'react'
import type { FlagSchema, FlagsConfig, FlagContext, FlagAdapter } from '@flagskit/core'
import { FlagProvider as RawFlagProvider } from './provider'
import { useFlag as rawUseFlag } from './use-flag'
import { useFlags as rawUseFlags } from './use-flags'
import { Feature as RawFeature } from './feature'
import { Variant as RawVariant } from './variant'

/**
 * Create a fully typed set of React bindings bound to your flag schema.
 *
 * Returns typed FlagProvider, useFlag, useFlags, Feature, and Variant — no explicit
 * type parameters needed at the call site.
 *
 * @example
 * // flags.ts — define once
 * type AppFlags = { 'new-checkout': boolean; 'plan': 'free' | 'pro' }
 *
 * export const { FlagProvider, useFlag, useFlags, Feature } = createFlagKit<AppFlags>({
 *   'new-checkout': { defaultValue: false, rules: [{ percentage: 20, value: true }] },
 *   'plan': { defaultValue: 'free' },
 * })
 *
 * // App.tsx
 * <FlagProvider context={{ userId: user.id, plan: user.plan }}>
 *   <App />
 * </FlagProvider>
 *
 * // Component.tsx
 * const isNew = useFlag('new-checkout')  // boolean ✓
 * const plan  = useFlag('plan')          // 'free' | 'pro' ✓
 * const oops  = useFlag('typo')          // TypeScript error ✓
 */
export function createFlagKit<T extends FlagSchema>(config: FlagsConfig<T>) {
  /** Provider with flags baked in — only pass context and adapter */
  function FlagProvider({
    context,
    adapter,
    children,
  }: {
    context?: FlagContext
    adapter?: FlagAdapter<T>
    children: ReactNode
  }) {
    return (
      <RawFlagProvider flags={config} context={context} adapter={adapter}>
        {children}
      </RawFlagProvider>
    )
  }

  /** Get the value of a single flag. Return type inferred from schema. */
  function useFlag<K extends keyof T>(flagName: K): T[K] {
    return rawUseFlag<T, K>(flagName)
  }

  /** Get the values of multiple flags at once. */
  function useFlags<K extends keyof T>(flagNames: K[]): Pick<T, K> {
    return rawUseFlags<T, K>(flagNames)
  }

  /** Conditionally render children based on a flag value. */
  const Feature = RawFeature as unknown as <K extends keyof T>(props: {
    flag: K
    fallback?: ReactNode
    children: ReactNode | ((value: T[K]) => ReactNode)
  }) => ReactElement | null

  /** Render a different subtree for each possible flag value. */
  const Variant = RawVariant as unknown as <K extends keyof T>(props: {
    flag: K
    variants: Record<string, ReactNode>
    fallback?: ReactNode
  }) => ReactElement | null

  return { FlagProvider, useFlag, useFlags, Feature, Variant }
}
