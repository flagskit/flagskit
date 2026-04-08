import { useState } from 'react'
import { FlagProvider, useFlag, Feature, Variant } from './flags'

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '16px 20px',
}

const btn: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 6,
  border: 'none',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
}

function Dashboard() {
  const isNewCheckout = useFlag('new-checkout')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={card}>
        <h3 style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>useFlag</h3>
        <code style={{ fontSize: 14 }}>new-checkout</code>
        {' = '}
        <strong style={{ color: isNewCheckout ? '#16a34a' : '#dc2626' }}>
          {String(isNewCheckout)}
        </strong>
      </div>

      <div style={card}>
        <h3 style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>{'<Feature>'}</h3>
        <Feature
          flag="new-checkout"
          fallback={
            <button style={{ ...btn, background: '#e2e8f0', color: '#475569' }}>
              Checkout
            </button>
          }
        >
          <button style={{ ...btn, background: '#16a34a', color: '#fff' }}>
            Express Checkout
          </button>
        </Feature>
      </div>

      <div style={card}>
        <h3 style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>{'<Variant>'}</h3>
        <Variant
          flag="pricing-model"
          variants={{
            legacy: (
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>$9</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>per month — Basic</div>
              </div>
            ),
            v2: (
              <div style={{ padding: 16, background: '#eff6ff', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#2563eb' }}>$12</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>per month — Streamlined</div>
              </div>
            ),
            v3: (
              <div style={{ padding: 16, background: '#faf5ff', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#9333ea' }}>$0.01</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>per request — Usage-based</div>
              </div>
            ),
          }}
        />
      </div>
    </div>
  )
}

export function App() {
  const [userId, setUserId] = useState('user-1')
  const [role, setRole] = useState('viewer')
  const [plan, setPlan] = useState('free')

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: '#475569',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  }

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        padding: '48px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 360 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>FlagsKit</h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>
          Change the context below to see flags re-evaluate in real time.
        </p>

        <div
          style={{
            ...card,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <label style={labelStyle}>
            userId
            <input style={inputStyle} value={userId} onChange={(e) => setUserId(e.target.value)} />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              new-checkout enables for 30% of users — try different values to see it flip
            </span>
          </label>
          <label style={labelStyle}>
            role
            <select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)}>
              <option>viewer</option>
              <option>beta</option>
              <option>admin</option>
            </select>
          </label>
          <label style={labelStyle}>
            plan
            <select style={inputStyle} value={plan} onChange={(e) => setPlan(e.target.value)}>
              <option>free</option>
              <option>pro</option>
            </select>
          </label>
        </div>

        <FlagProvider context={{ userId, role, plan }}>
          <Dashboard />
        </FlagProvider>
      </div>
    </div>
  )
}
