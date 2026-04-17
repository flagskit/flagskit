'use client'

import type { ReactNode } from 'react'
import type { FlagSchema, FlagValue } from '@flagskit/core'
import { useFlag } from './use-flag'

export type VariantProps<T extends FlagSchema, K extends keyof T> = {
  /** Flag name to read */
  flag: K
  /**
   * Map of flag value → React node.
   * The key matching the current flag value will be rendered.
   * Use `String(value)` as the key for non-string flags (e.g. `"true"`, `"42"`).
   */
  variants: Record<string, ReactNode>
  /** Rendered when no variant key matches the current flag value */
  fallback?: ReactNode
}

/**
 * Render a different subtree for each flag value.
 *
 * Ideal for A/B tests or multi-variant experiments where you need a different
 * UI for each possible flag value.
 *
 * @example
 * // Multivariate experiment
 * <Variant<AppFlags, 'pricing-model'>
 *   flag="pricing-model"
 *   variants={{
 *     legacy: <LegacyPricing />,
 *     v2:     <PricingV2 />,
 *     v3:     <PricingV3 />,
 *   }}
 * />
 *
 * @example
 * // With fallback
 * <Variant flag="theme" variants={{ dark: <DarkUI /> }} fallback={<LightUI />} />
 */
export function Variant<T extends FlagSchema, K extends keyof T>({
  flag,
  variants,
  fallback = null,
}: VariantProps<T, K>) {
  const value = useFlag<T, K>(flag)
  const key = String(value)
  return (key in variants ? variants[key] : fallback) ?? null
}
