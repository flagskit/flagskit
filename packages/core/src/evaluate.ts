import type { FlagSchema, FlagsConfig, FlagContext, EvaluationResult } from './types'
import { matchRule } from './rules'
import { murmurhash3 } from './hash'

/**
 * Evaluate a single flag for the given context.
 *
 * Priority order:
 * 1. Adapter overrides (highest)
 * 2. Rules — evaluated top-to-bottom, first match wins
 * 3. Default value (lowest)
 */
export function evaluate<T extends FlagSchema, K extends keyof T>(
  config: FlagsConfig<T>,
  flagName: K,
  context: FlagContext,
  overrides?: Partial<T>
): EvaluationResult<T[K]> {
  if (overrides && flagName in overrides) {
    return { value: overrides[flagName] as T[K], source: 'override' }
  }

  const definition = config[flagName]

  if (definition.rules) {
    for (let i = 0; i < definition.rules.length; i++) {
      const rule = definition.rules[i]

      if (rule.match && !matchRule(rule.match, context)) continue

      if (rule.percentage !== undefined) {
        if (!context.userId) continue
        const hash = murmurhash3(String(flagName) + context.userId)
        if (hash % 100 >= rule.percentage) continue
      }

      const value = rule.value !== undefined ? rule.value : definition.defaultValue
      return { value: value as T[K], source: 'rule', ruleIndex: i }
    }
  }

  return { value: definition.defaultValue as T[K], source: 'default' }
}

/**
 * Evaluate all flags at once and return a plain map of flag name → value.
 */
export function evaluateAll<T extends FlagSchema>(
  config: FlagsConfig<T>,
  context: FlagContext,
  overrides?: Partial<T>
): { [K in keyof T]: T[K] } {
  const result = {} as { [K in keyof T]: T[K] }
  for (const key in config) {
    result[key] = evaluate(config, key, context, overrides).value
  }
  return result
}
