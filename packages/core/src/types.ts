/** Possible flag value types */
export type FlagValue = boolean | string | number | Record<string, unknown>

/** Data about the current user/environment used for rule matching */
export type FlagContext = {
  userId?: string
  env?: string
  [key: string]: string | number | boolean | undefined
}

/** Conditions that must ALL match (AND logic). Equality only in v0.1. */
export type MatchCondition = Record<string, string | number | boolean>

/** A single rule: optional conditions + value to return when matched */
export type FlagRule<V extends FlagValue = FlagValue> = {
  /** All conditions must match (AND logic) */
  match?: MatchCondition
  /** Percentage of users to include (0–100). Requires userId in context. */
  percentage?: number
  /** Value to return when this rule matches */
  value?: V
}

/** Full definition of a single flag */
export type FlagDefinition<V extends FlagValue = FlagValue> = {
  description?: string
  defaultValue: V
  rules?: FlagRule<V>[]
}

/** User-defined schema: maps flag names to their value types */
export type FlagSchema = Record<string, FlagValue>

/** The full flags configuration object */
export type FlagsConfig<T extends FlagSchema> = {
  [K in keyof T]: FlagDefinition<T[K]>
}

/** Adapter interface for external flag sources */
export type FlagAdapter<T extends FlagSchema = FlagSchema> = {
  getOverrides(): Partial<T> | Promise<Partial<T>>
}

/** Result of evaluating a single flag */
export type EvaluationResult<V extends FlagValue> = {
  value: V
  source: 'override' | 'rule' | 'default'
  ruleIndex?: number
}
