import { describe, it, expect } from 'vitest'
import { evaluate, evaluateAll } from '../src/evaluate'
import { defineFlags } from '../src/define-flags'

type TestFlags = {
  'bool-flag': boolean
  'string-flag': 'a' | 'b' | 'c'
  'number-flag': number
}

const config = defineFlags<TestFlags>({
  'bool-flag': {
    defaultValue: false,
    rules: [
      { match: { role: 'admin' }, value: true },
      { percentage: 50, value: true },
    ],
  },
  'string-flag': {
    defaultValue: 'a',
    rules: [
      { match: { plan: 'pro' }, value: 'b' },
      { match: { plan: 'enterprise' }, value: 'c' },
    ],
  },
  'number-flag': {
    defaultValue: 10,
    rules: [{ match: { plan: 'pro' }, value: 100 }],
  },
})

describe('evaluate()', () => {
  describe('default', () => {
    it('returns default value when no rules match', () => {
      const result = evaluate(config, 'bool-flag', {})
      expect(result.value).toBe(false)
      expect(result.source).toBe('default')
    })

    it('returns typed default for string flags', () => {
      const result = evaluate(config, 'string-flag', {})
      expect(result.value).toBe('a')
      expect(result.source).toBe('default')
    })

    it('returns typed default for number flags', () => {
      const result = evaluate(config, 'number-flag', {})
      expect(result.value).toBe(10)
      expect(result.source).toBe('default')
    })
  })

  describe('override', () => {
    it('returns override value', () => {
      const result = evaluate(config, 'bool-flag', {}, { 'bool-flag': true })
      expect(result.value).toBe(true)
      expect(result.source).toBe('override')
    })

    it('override takes priority over a matching rule', () => {
      const result = evaluate(config, 'string-flag', { plan: 'pro' }, { 'string-flag': 'c' })
      expect(result.value).toBe('c')
      expect(result.source).toBe('override')
    })
  })

  describe('rule matching', () => {
    it('returns value from first matching rule', () => {
      const result = evaluate(config, 'bool-flag', { role: 'admin' })
      expect(result.value).toBe(true)
      expect(result.source).toBe('rule')
      expect(result.ruleIndex).toBe(0)
    })

    it('evaluates rules top-to-bottom', () => {
      const result = evaluate(config, 'string-flag', { plan: 'pro' })
      expect(result.value).toBe('b')
      expect(result.ruleIndex).toBe(0)
    })

    it('falls through to the next rule when first does not match', () => {
      const result = evaluate(config, 'string-flag', { plan: 'enterprise' })
      expect(result.value).toBe('c')
      expect(result.ruleIndex).toBe(1)
    })
  })

  describe('percentage rollout', () => {
    it('skips percentage rule when userId is missing', () => {
      const result = evaluate(config, 'bool-flag', {})
      expect(result.source).toBe('default')
    })

    it('is deterministic — same userId always gets same result', () => {
      const r1 = evaluate(config, 'bool-flag', { userId: 'user-42' })
      const r2 = evaluate(config, 'bool-flag', { userId: 'user-42' })
      expect(r1.value).toBe(r2.value)
      expect(r1.source).toBe(r2.source)
    })

    it('enables flag for 100% of users', () => {
      type F = { f: boolean }
      const cfg = defineFlags<F>({
        f: { defaultValue: false, rules: [{ percentage: 100, value: true }] },
      })
      for (let i = 0; i < 50; i++) {
        expect(evaluate(cfg, 'f', { userId: `u-${i}` }).value).toBe(true)
      }
    })

    it('disables flag for 0% of users', () => {
      type F = { f: boolean }
      const cfg = defineFlags<F>({
        f: { defaultValue: false, rules: [{ percentage: 0, value: true }] },
      })
      for (let i = 0; i < 50; i++) {
        expect(evaluate(cfg, 'f', { userId: `u-${i}` }).value).toBe(false)
      }
    })

    it('distributes ~50% of users into a 50% rollout', () => {
      type F = { f: boolean }
      const cfg = defineFlags<F>({
        f: { defaultValue: false, rules: [{ percentage: 50, value: true }] },
      })
      let enabled = 0
      const total = 1000
      for (let i = 0; i < total; i++) {
        if (evaluate(cfg, 'f', { userId: `user-${i}` }).value) enabled++
      }
      // Allow ±10% deviation from 50%
      expect(enabled).toBeGreaterThan(400)
      expect(enabled).toBeLessThan(600)
    })
  })

  describe('match + percentage combined', () => {
    it('requires both conditions to pass', () => {
      type F = { f: boolean }
      const cfg = defineFlags<F>({
        f: {
          defaultValue: false,
          rules: [{ match: { plan: 'pro' }, percentage: 100, value: true }],
        },
      })
      expect(evaluate(cfg, 'f', { userId: 'u1', plan: 'pro' }).value).toBe(true)
      expect(evaluate(cfg, 'f', { userId: 'u1' }).value).toBe(false)
      expect(evaluate(cfg, 'f', { plan: 'pro' }).value).toBe(false)
    })
  })
})

describe('evaluateAll()', () => {
  it('returns values for all flags', () => {
    const result = evaluateAll(config, { plan: 'pro' })
    expect(result['string-flag']).toBe('b')
    expect(result['number-flag']).toBe(100)
  })

  it('applies overrides', () => {
    const result = evaluateAll(config, {}, { 'bool-flag': true })
    expect(result['bool-flag']).toBe(true)
  })

  it('returns defaults when context is empty', () => {
    const result = evaluateAll(config, {})
    expect(result['bool-flag']).toBe(false)
    expect(result['string-flag']).toBe('a')
    expect(result['number-flag']).toBe(10)
  })
})
