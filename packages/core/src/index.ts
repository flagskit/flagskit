export { defineFlags } from './define-flags'
export { evaluate, evaluateAll } from './evaluate'
export { matchRule } from './rules'
export { murmurhash3 } from './hash'
export { jsonAdapter } from './adapters/json'
export { httpAdapter } from './adapters/http'
export type {
  FlagSchema,
  FlagValue,
  FlagContext,
  FlagRule,
  FlagDefinition,
  FlagsConfig,
  FlagAdapter,
  EvaluationResult,
  MatchCondition,
} from './types'
