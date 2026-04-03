import type { MatchCondition, FlagContext } from './types'

/**
 * Check if all conditions in a match object are satisfied by the context.
 * Uses AND logic — every condition must pass.
 * Only equality comparisons in v0.1.
 */
export function matchRule(match: MatchCondition, context: FlagContext): boolean {
  return Object.entries(match).every(([key, value]) => context[key] === value)
}
