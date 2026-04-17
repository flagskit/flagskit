'use client'

// Thin 'use client' wrapper around FlagProvider. The raw FlagProvider from
// @flagskit/react is already marked 'use client', but wrapping it here lets us
// receive the server-evaluated `context` as a prop and pass it in cleanly.

import type { ReactNode } from 'react'
import { FlagProvider } from '@flagskit/react'
import type { FlagContext } from '@flagskit/core'
import { flags } from '@/lib/flags'

type Props = {
  context: FlagContext
  children: ReactNode
}

export function Providers({ context, children }: Props) {
  return (
    <FlagProvider flags={flags} context={context}>
      {children}
    </FlagProvider>
  )
}
