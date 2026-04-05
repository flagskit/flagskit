import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { defineFlags } from '@flagskit/core'
import { FlagProvider } from '../src/provider'
import { Variant } from '../src/variant'

type TestFlags = {
  plan: 'free' | 'pro' | 'enterprise'
  'dark-mode': boolean
}

const flags = defineFlags<TestFlags>({
  plan: { defaultValue: 'free' },
  'dark-mode': { defaultValue: false },
})

describe('<Variant>', () => {
  it('renders the variant matching the current flag value', () => {
    render(
      <FlagProvider flags={flags} adapter={{ getOverrides: () => ({ plan: 'pro' }) }}>
        <Variant<TestFlags, 'plan'>
          flag="plan"
          variants={{
            free: <span>Free plan</span>,
            pro: <span>Pro plan</span>,
            enterprise: <span>Enterprise plan</span>,
          }}
        />
      </FlagProvider>
    )
    expect(screen.getByText('Pro plan')).toBeInTheDocument()
    expect(screen.queryByText('Free plan')).not.toBeInTheDocument()
  })

  it('renders the default value variant when no override', () => {
    render(
      <FlagProvider flags={flags}>
        <Variant<TestFlags, 'plan'>
          flag="plan"
          variants={{
            free: <span>Free plan</span>,
            pro: <span>Pro plan</span>,
          }}
        />
      </FlagProvider>
    )
    expect(screen.getByText('Free plan')).toBeInTheDocument()
  })

  it('renders fallback when no variant matches', () => {
    render(
      <FlagProvider flags={flags} adapter={{ getOverrides: () => ({ plan: 'enterprise' }) }}>
        <Variant<TestFlags, 'plan'>
          flag="plan"
          variants={{
            free: <span>Free plan</span>,
            pro: <span>Pro plan</span>,
          }}
          fallback={<span>Unknown plan</span>}
        />
      </FlagProvider>
    )
    expect(screen.getByText('Unknown plan')).toBeInTheDocument()
  })

  it('renders null when no variant matches and no fallback', () => {
    const { container } = render(
      <FlagProvider flags={flags} adapter={{ getOverrides: () => ({ plan: 'enterprise' }) }}>
        <Variant<TestFlags, 'plan'>
          flag="plan"
          variants={{
            free: <span>Free plan</span>,
          }}
        />
      </FlagProvider>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('works with boolean flags', () => {
    render(
      <FlagProvider flags={flags} adapter={{ getOverrides: () => ({ 'dark-mode': true }) }}>
        <Variant<TestFlags, 'dark-mode'>
          flag="dark-mode"
          variants={{
            true: <span>Dark</span>,
            false: <span>Light</span>,
          }}
        />
      </FlagProvider>
    )
    expect(screen.getByText('Dark')).toBeInTheDocument()
  })
})
