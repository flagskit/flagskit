import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { defineFlags, jsonAdapter } from '@flagskit/core'
import { FlagProvider } from '../src/provider'
import { useFlag } from '../src/use-flag'

type TestFlags = {
  feature: boolean
  plan: 'free' | 'pro'
}

const flags = defineFlags<TestFlags>({
  feature: { defaultValue: false },
  plan: {
    defaultValue: 'free',
    rules: [{ match: { tier: 'paid' }, value: 'pro' }],
  },
})

function FeatureDisplay() {
  const value = useFlag<TestFlags, 'feature'>('feature')
  return <div>{value ? 'enabled' : 'disabled'}</div>
}

function PlanDisplay() {
  const value = useFlag<TestFlags, 'plan'>('plan')
  return <div>{value}</div>
}

describe('<FlagProvider>', () => {
  it('renders children', () => {
    render(
      <FlagProvider flags={flags}>
        <div>hello</div>
      </FlagProvider>
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('provides default flag values', () => {
    render(
      <FlagProvider flags={flags}>
        <FeatureDisplay />
      </FlagProvider>
    )
    expect(screen.getByText('disabled')).toBeInTheDocument()
  })

  it('evaluates rules from context', () => {
    render(
      <FlagProvider flags={flags} context={{ tier: 'paid' }}>
        <PlanDisplay />
      </FlagProvider>
    )
    expect(screen.getByText('pro')).toBeInTheDocument()
  })

  it('applies synchronous adapter overrides', () => {
    render(
      <FlagProvider flags={flags} adapter={jsonAdapter({ overrides: { feature: true } })}>
        <FeatureDisplay />
      </FlagProvider>
    )
    expect(screen.getByText('enabled')).toBeInTheDocument()
  })

  it('applies async adapter overrides after resolution', async () => {
    const asyncAdapter = {
      getOverrides: () => Promise.resolve({ feature: true } as Partial<TestFlags>),
    }

    render(
      <FlagProvider flags={flags} adapter={asyncAdapter}>
        <FeatureDisplay />
      </FlagProvider>
    )

    // Starts with default
    expect(screen.getByText('disabled')).toBeInTheDocument()

    // After promise resolves
    await act(async () => {})
    expect(screen.getByText('enabled')).toBeInTheDocument()
  })
})
