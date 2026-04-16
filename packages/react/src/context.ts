'use client'

import { createContext, useContext } from 'react'
import type { FlagSchema, FlagValue } from '@flagskit/core'

export type FlagKitContextValue = {
  flags: Record<string, FlagValue>
}

export const FlagKitContext = createContext<FlagKitContextValue | null>(null)

export function useFlagKitContext(): FlagKitContextValue {
  const ctx = useContext(FlagKitContext)
  if (!ctx) {
    throw new Error(
      'useFlagKitContext must be used within a <FlagProvider>. ' +
        'Wrap your app in <FlagProvider flags={...}> to use feature flags.'
    )
  }
  return ctx
}

// Re-export the schema type so packages/react doesn't need to import it separately
export type { FlagSchema }
