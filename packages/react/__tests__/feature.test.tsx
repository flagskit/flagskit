import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { defineFlags } from '@flagskit/core'
import { FlagProvider } from '../src/provider'
import { Feature } from '../src/feature'

type TestFlags = {
  'bool-flag': boolean
  plan: 'free' | 'pro'
}

const flags = defineFlags<TestFlags>({
  'bool-flag': { defaultValue: false },
  plan: { defaultValue: 'free' },
})

function wrap(context = {}, overrides?: Partial<TestFlags>) {
  const adapter = overrides ? { getOverrides: () => overrides } : undefined
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <FlagProvider flags={flags} context={context} adapter={adapter}>
        {children}
      </FlagProvider>
    )
  }
}

describe('<Feature>', () => {
  describe('boolean flag', () => {
    it('renders children when flag is true', () => {
      render(
        <FlagProvider flags={flags} adapter={{ getOverrides: () => ({ 'bool-flag': true }) }}>
          <Feature<TestFlags, 'bool-flag'> flag="bool-flag">
            <span>new feature</span>
          </Feature>
        </FlagProvider>
      )
      expect(screen.getByText('new feature')).toBeInTheDocument()
    })

    it('renders fallback when flag is false', () => {
      render(
        <FlagProvider flags={flags}>
          <Feature<TestFlags, 'bool-flag'> flag="bool-flag" fallback={<span>old feature</span>}>
            <span>new feature</span>
          </Feature>
        </FlagProvider>
      )
      expect(screen.getByText('old feature')).toBeInTheDocument()
      expect(screen.queryByText('new feature')).not.toBeInTheDocument()
    })

    it('renders nothing when flag is false and no fallback', () => {
      const { container } = render(
        <FlagProvider flags={flags}>
          <Feature<TestFlags, 'bool-flag'> flag="bool-flag">
            <span>new feature</span>
          </Feature>
        </FlagProvider>
      )
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('non-boolean flag (render prop)', () => {
    it('passes the flag value to the render prop', () => {
      render(
        <FlagProvider flags={flags} adapter={{ getOverrides: () => ({ plan: 'pro' }) }}>
          <Feature<TestFlags, 'plan'> flag="plan">{(plan) => <span>plan is {plan}</span>}</Feature>
        </FlagProvider>
      )
      expect(screen.getByText('plan is pro')).toBeInTheDocument()
    })

    it('renders children with default value when no override', () => {
      render(
        <FlagProvider flags={flags}>
          <Feature<TestFlags, 'plan'> flag="plan">{(plan) => <span>plan is {plan}</span>}</Feature>
        </FlagProvider>
      )
      expect(screen.getByText('plan is free')).toBeInTheDocument()
    })
  })
})
