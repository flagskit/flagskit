import { useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { evaluateAll } from '@flagskit/core'
import type { FlagSchema, FlagsConfig, FlagContext, FlagAdapter } from '@flagskit/core'
import { FlagKitContext } from './context'

export type FlagProviderProps<T extends FlagSchema> = {
  flags: FlagsConfig<T>
  context?: FlagContext
  adapter?: FlagAdapter<T>
  children: ReactNode
}

const EMPTY_CONTEXT: FlagContext = {}

/**
 * Evaluates all flags and provides their values to the component tree.
 *
 * Re-evaluates whenever `flags`, `context`, or `adapter` changes.
 * If the adapter is async, flags render with defaults first, then update
 * once the adapter resolves.
 */
export function FlagProvider<T extends FlagSchema>({
  flags,
  context = EMPTY_CONTEXT,
  adapter,
  children,
}: FlagProviderProps<T>) {
  const [overrides, setOverrides] = useState<Partial<T>>({})

  useEffect(() => {
    if (!adapter) {
      setOverrides({})
      return
    }

    let cancelled = false

    const result = adapter.getOverrides()
    if (result instanceof Promise) {
      result.then((v) => {
        if (!cancelled) setOverrides(v)
      })
    } else {
      setOverrides(result)
    }

    const unsubscribe = adapter.subscribe?.((v) => {
      if (!cancelled) setOverrides(v)
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [adapter])

  const evaluated = useMemo(
    () => evaluateAll(flags, context, overrides),
    [flags, context, overrides]
  )

  return <FlagKitContext.Provider value={{ flags: evaluated }}>{children}</FlagKitContext.Provider>
}
