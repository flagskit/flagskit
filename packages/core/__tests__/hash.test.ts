import { describe, it, expect } from 'vitest'
import { murmurhash3 } from '../src/hash'

describe('murmurhash3()', () => {
  it('returns a number', () => {
    expect(typeof murmurhash3('test')).toBe('number')
  })

  it('is deterministic — same input always produces same output', () => {
    expect(murmurhash3('hello')).toBe(murmurhash3('hello'))
    expect(murmurhash3('new-checkout' + 'user-123')).toBe(murmurhash3('new-checkout' + 'user-123'))
  })

  it('produces different values for different inputs', () => {
    expect(murmurhash3('abc')).not.toBe(murmurhash3('abd'))
    expect(murmurhash3('flag-a' + 'user-1')).not.toBe(murmurhash3('flag-b' + 'user-1'))
    expect(murmurhash3('flag-a' + 'user-1')).not.toBe(murmurhash3('flag-a' + 'user-2'))
  })

  it('returns an unsigned 32-bit integer', () => {
    const h = murmurhash3('test')
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xffffffff)
  })

  it('handles empty string', () => {
    expect(typeof murmurhash3('')).toBe('number')
  })

  it('handles strings of various lengths (tests all switch cases)', () => {
    // length % 4 === 0
    expect(typeof murmurhash3('abcd')).toBe('number')
    // length % 4 === 1
    expect(typeof murmurhash3('abcde')).toBe('number')
    // length % 4 === 2
    expect(typeof murmurhash3('abcdef')).toBe('number')
    // length % 4 === 3
    expect(typeof murmurhash3('abcdefg')).toBe('number')
  })

  it('distributes evenly across 10 buckets', () => {
    const buckets = new Array(10).fill(0)
    for (let i = 0; i < 10_000; i++) {
      const h = murmurhash3(`flag-${i}`)
      buckets[h % 10]++
    }
    // Each bucket should get ~1000 items. Allow ±20% deviation.
    for (const count of buckets) {
      expect(count).toBeGreaterThan(800)
      expect(count).toBeLessThan(1200)
    }
  })
})
