import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { defineFlags } from '@flagskit/core'
import { FlagProvider } from '../src/provider'
import { useFlag } from '../src/use-flag'

type TestFlags = {
  'bool-flag': boolean
  'string-flag': 'a' | 'b'
}

const flags = defineFlags<TestFlags>({
  'bool-flag': {
    defaultValue: false,
    rules: [{ match: { role: 'admin' }, value: true }],
  },
  'string-flag': {
    defaultValue: 'a',
    rules: [{ match: { plan: 'pro' }, value: 'b' }],
  },
})

function makeWrapper(context: Record<string, string> = {}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <FlagProvider flags={flags} context={context}>
        {children}
      </FlagProvider>
    )
  }
}

describe('useFlag()', () => {
  it('returns the default value', () => {
    const { result } = renderHook(() => useFlag<TestFlags, 'bool-flag'>('bool-flag'), {
      wrapper: makeWrapper(),
    })
    expect(result.current).toBe(false)
  })

  it('returns value matched by rule', () => {
    const { result } = renderHook(() => useFlag<TestFlags, 'bool-flag'>('bool-flag'), {
      wrapper: makeWrapper({ role: 'admin' }),
    })
    expect(result.current).toBe(true)
  })

  it('returns typed value for string flags', () => {
    const { result } = renderHook(() => useFlag<TestFlags, 'string-flag'>('string-flag'), {
      wrapper: makeWrapper({ plan: 'pro' }),
    })
    expect(result.current).toBe('b')
  })

  it('throws a descriptive error when used outside <FlagProvider>', () => {
    expect(() => renderHook(() => useFlag<TestFlags, 'bool-flag'>('bool-flag'))).toThrow(
      'FlagProvider'
    )
  })
})
