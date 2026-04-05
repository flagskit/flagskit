import type { FlagSchema, FlagAdapter } from '../types'

/**
 * HTTP adapter — fetches flag overrides from a remote URL.
 *
 * Optionally polls the URL on a fixed interval so flags stay fresh
 * without a page reload.
 *
 * The URL must return a JSON object whose keys are flag names and
 * values are the override values (same shape as `jsonAdapter`).
 *
 * @example
 * <FlagProvider
 *   flags={flags}
 *   adapter={httpAdapter({ url: '/api/flags' })}
 * />
 *
 * @example
 * // With polling every 60 seconds
 * <FlagProvider
 *   flags={flags}
 *   adapter={httpAdapter({ url: '/api/flags', refreshInterval: 60_000 })}
 * />
 */
export function httpAdapter<T extends FlagSchema>(config: {
  /** URL that returns a JSON object of flag overrides */
  url: string
  /** Polling interval in milliseconds. Omit to disable polling. */
  refreshInterval?: number
  /** Extra request headers (e.g. Authorization) */
  headers?: Record<string, string>
}): FlagAdapter<T> {
  async function fetchOverrides(): Promise<Partial<T>> {
    const res = await fetch(config.url, {
      headers: config.headers,
    })
    if (!res.ok) {
      throw new Error(`httpAdapter: ${res.status} ${res.statusText} (${config.url})`)
    }
    return res.json() as Promise<Partial<T>>
  }

  return {
    getOverrides: fetchOverrides,

    subscribe: config.refreshInterval
      ? (callback) => {
          const interval = setInterval(() => {
            fetchOverrides()
              .then(callback)
              .catch(() => {
                // Silently ignore poll errors — last known values remain active
              })
          }, config.refreshInterval)
          return () => clearInterval(interval)
        }
      : undefined,
  }
}
