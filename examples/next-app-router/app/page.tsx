// Server Component — evaluates flags directly via @flagskit/core.
// No provider, no hooks, no client bundle cost. Just a pure function call.
//
// This is the key insight: because @flagskit/core has zero dependencies and
// is pure TypeScript, it runs anywhere — Server Components, middleware, Edge
// runtime, or plain Node. You don't need a Next.js-specific package.

import { cookies } from 'next/headers'
import { evaluate } from '@flagskit/core'
import { flags } from '@/lib/flags'
import { ClientDemo } from './client-demo'

export default function Page() {
  const context = readContextFromCookies()

  // Evaluate on the server — this runs once during the request, zero client cost.
  const newHomepage = evaluate(flags, 'new-homepage', context)
  const pricingModel = evaluate(flags, 'pricing-model', context)

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 28, margin: '0 0 8px' }}>FlagsKit × Next.js App Router</h1>
      <p style={{ color: '#64748b', margin: '0 0 32px' }}>
        Zero-backend feature flags, evaluated on the server and re-evaluated on the client.
      </p>

      <section style={sectionStyle}>
        <h2 style={h2Style}>Server Component (this page)</h2>
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#64748b' }}>
          Evaluated once on the server via <code>evaluate()</code> from <code>@flagskit/core</code>.
          The client receives pre-rendered HTML — no hydration mismatch, no extra bundle weight.
        </p>
        <Row label="new-homepage" value={String(newHomepage.value)} source={newHomepage.source} />
        <Row label="pricing-model" value={pricingModel.value} source={pricingModel.source} />
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>Client Component</h2>
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#64748b' }}>
          Same flags, read via hooks. Updates reactively when context changes on the client.
        </p>
        <ClientDemo />
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>Current context (from cookies)</h2>
        <pre style={preStyle}>{JSON.stringify(context, null, 2)}</pre>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 12 }}>
          Set cookies (e.g. <code>role=beta</code>, <code>plan=pro</code>) and refresh to see flags flip.
        </p>
      </section>
    </main>
  )
}

function Row({ label, value, source }: { label: string; value: string; source: string }) {
  return (
    <div style={rowStyle}>
      <code style={{ fontSize: 14 }}>{label}</code>
      <div>
        <strong>{value}</strong>
        <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>({source})</span>
      </div>
    </div>
  )
}

function readContextFromCookies() {
  const store = cookies()
  return {
    userId: store.get('userId')?.value ?? 'anon',
    role: store.get('role')?.value ?? 'viewer',
    plan: store.get('plan')?.value ?? 'free',
    country: store.get('country')?.value ?? 'US',
  }
}

const sectionStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: 20,
  marginBottom: 16,
}

const h2Style: React.CSSProperties = {
  fontSize: 14,
  margin: '0 0 8px',
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px solid #f1f5f9',
}

const preStyle: React.CSSProperties = {
  background: '#f8fafc',
  padding: 12,
  borderRadius: 6,
  fontSize: 13,
  margin: 0,
  overflow: 'auto',
}
