'use client'

// Client Component — same flags, same context, read via hooks.
// The provider in app/layout.tsx makes all flags available here.

import { useFlag, useFlags, Feature, Variant } from '@flagskit/react'
import type { AppFlags } from '@/lib/flags'

export function ClientDemo() {
  const newHomepage = useFlag<AppFlags, 'new-homepage'>('new-homepage')
  const { 'max-upload-mb': maxUpload } = useFlags<AppFlags, 'max-upload-mb'>(['max-upload-mb'])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Row label="useFlag('new-homepage')" value={String(newHomepage)} />
      <Row label="useFlags(['max-upload-mb'])" value={`${maxUpload} MB`} />

      <div style={{ marginTop: 8 }}>
        <Feature<AppFlags, 'new-homepage'>
          flag="new-homepage"
          fallback={<Badge color="#dc2626">Old homepage</Badge>}
        >
          <Badge color="#16a34a">New homepage active</Badge>
        </Feature>
      </div>

      <div style={{ marginTop: 8 }}>
        <Variant<AppFlags, 'pricing-model'>
          flag="pricing-model"
          variants={{
            legacy: <Badge color="#64748b">Pricing: legacy</Badge>,
            v2: <Badge color="#2563eb">Pricing: v2</Badge>,
            v3: <Badge color="#9333ea">Pricing: v3</Badge>,
          }}
        />
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <code>{label}</code>
      <strong>{value}</strong>
    </div>
  )
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: color,
        color: '#fff',
        padding: '4px 10px',
        borderRadius: 4,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  )
}
