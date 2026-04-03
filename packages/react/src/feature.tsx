import type { ReactNode } from 'react'
import type { FlagSchema } from '@flagskit/core'
import { useFlag } from './use-flag'

export type FeatureProps<T extends FlagSchema, K extends keyof T> = {
  flag: K
  fallback?: ReactNode
  children: ReactNode | ((value: T[K]) => ReactNode)
}

/**
 * Conditionally render children based on a flag value.
 *
 * - Boolean `true`  → renders children
 * - Boolean `false` → renders fallback (or null)
 * - Non-boolean     → always renders children as a render prop: `{(value) => <Component />}`
 *
 * @example
 * // Boolean flag — show/hide
 * <Feature<AppFlags, 'new-checkout'> flag="new-checkout" fallback={<OldCheckout />}>
 *   <NewCheckout />
 * </Feature>
 *
 * // Non-boolean flag — render prop
 * <Feature<AppFlags, 'max-upload-mb'> flag="max-upload-mb">
 *   {(maxMB) => <Uploader limit={maxMB} />}
 * </Feature>
 */
export function Feature<T extends FlagSchema, K extends keyof T>({
  flag,
  fallback = null,
  children,
}: FeatureProps<T, K>) {
  const value = useFlag<T, K>(flag)

  if (typeof children === 'function') {
    return (children as (v: T[K]) => ReactNode)(value)
  }

  if (typeof value === 'boolean') {
    return value ? children : fallback
  }

  return children
}
