import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import type { FlagContext } from '@flagskit/core'
import { Providers } from './providers'

export const metadata = {
  title: 'FlagsKit + Next.js App Router',
  description: 'Feature flags in Next.js with FlagsKit — zero backend required.',
}

// This Server Component reads the flag context from cookies at the edge, then
// passes it down to the client provider. The same context is available in
// Server Components via lib/server-flags.ts.
export default function RootLayout({ children }: { children: ReactNode }) {
  const context: FlagContext = readContextFromCookies()

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0 }}>
        <Providers context={context}>{children}</Providers>
      </body>
    </html>
  )
}

function readContextFromCookies(): FlagContext {
  const store = cookies()
  return {
    userId: store.get('userId')?.value ?? 'anon',
    role: store.get('role')?.value ?? 'viewer',
    plan: store.get('plan')?.value ?? 'free',
    country: store.get('country')?.value ?? 'US',
  }
}
