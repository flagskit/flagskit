import { describe, it, expect } from 'vitest'
import { matchRule } from '../src/rules'

describe('matchRule()', () => {
  it('returns true when all conditions match', () => {
    expect(matchRule({ role: 'admin' }, { role: 'admin' })).toBe(true)
  })

  it('returns true when multiple conditions all match', () => {
    expect(matchRule({ role: 'admin', env: 'staging' }, { role: 'admin', env: 'staging' })).toBe(
      true
    )
  })

  it('returns false when a string condition does not match', () => {
    expect(matchRule({ role: 'admin' }, { role: 'user' })).toBe(false)
  })

  it('returns false when any one of multiple conditions fails', () => {
    expect(matchRule({ role: 'admin', env: 'staging' }, { role: 'admin', env: 'production' })).toBe(
      false
    )
  })

  it('returns false when the context key is missing', () => {
    expect(matchRule({ role: 'admin' }, {})).toBe(false)
  })

  it('returns true for empty match conditions', () => {
    expect(matchRule({}, { role: 'admin' })).toBe(true)
    expect(matchRule({}, {})).toBe(true)
  })

  it('handles numeric conditions', () => {
    expect(matchRule({ age: 25 }, { age: 25 })).toBe(true)
    expect(matchRule({ age: 25 }, { age: 26 })).toBe(false)
  })

  it('handles boolean conditions', () => {
    expect(matchRule({ verified: true }, { verified: true })).toBe(true)
    expect(matchRule({ verified: true }, { verified: false })).toBe(false)
  })

  it('ignores extra keys in context', () => {
    expect(matchRule({ role: 'admin' }, { role: 'admin', env: 'prod', extra: 'ignored' })).toBe(
      true
    )
  })
})
