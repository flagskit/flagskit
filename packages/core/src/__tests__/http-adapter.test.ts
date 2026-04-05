import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { httpAdapter } from '../adapters/http'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockResponse(data: unknown, ok = true, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status,
    statusText: ok ? 'OK' : 'Not Found',
    json: () => Promise.resolve(data),
  })
}

beforeEach(() => {
  mockFetch.mockReset()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('httpAdapter()', () => {
  it('fetches overrides from the given URL', async () => {
    mockResponse({ 'dark-mode': true, plan: 'pro' })
    const adapter = httpAdapter({ url: '/api/flags' })
    const result = await adapter.getOverrides()
    expect(result).toEqual({ 'dark-mode': true, plan: 'pro' })
    expect(mockFetch).toHaveBeenCalledWith('/api/flags', { headers: undefined })
  })

  it('passes custom headers to fetch', async () => {
    mockResponse({})
    const adapter = httpAdapter({
      url: '/api/flags',
      headers: { Authorization: 'Bearer token' },
    })
    await adapter.getOverrides()
    expect(mockFetch).toHaveBeenCalledWith('/api/flags', {
      headers: { Authorization: 'Bearer token' },
    })
  })

  it('throws on non-ok response', async () => {
    mockResponse(null, false, 404)
    const adapter = httpAdapter({ url: '/api/flags' })
    await expect(adapter.getOverrides()).rejects.toThrow('httpAdapter: 404')
  })

  it('has no subscribe when refreshInterval is not set', () => {
    const adapter = httpAdapter({ url: '/api/flags' })
    expect(adapter.subscribe).toBeUndefined()
  })

  it('calls subscribe callback on each poll interval', async () => {
    // Initial fetch
    mockResponse({ 'dark-mode': false })
    const adapter = httpAdapter({ url: '/api/flags', refreshInterval: 5_000 })

    await adapter.getOverrides()

    const callback = vi.fn()
    const unsubscribe = adapter.subscribe!(callback)

    // Trigger one poll
    mockResponse({ 'dark-mode': true })
    await vi.advanceTimersByTimeAsync(5_000)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith({ 'dark-mode': true })

    // Trigger second poll
    mockResponse({ 'dark-mode': false })
    await vi.advanceTimersByTimeAsync(5_000)
    expect(callback).toHaveBeenCalledTimes(2)

    unsubscribe()

    // After unsubscribe — no more calls
    mockResponse({})
    await vi.advanceTimersByTimeAsync(5_000)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('silently ignores poll errors', async () => {
    mockResponse({})
    const adapter = httpAdapter({ url: '/api/flags', refreshInterval: 1_000 })
    await adapter.getOverrides()

    const callback = vi.fn()
    adapter.subscribe!(callback)

    // Simulate fetch failure during poll
    mockFetch.mockRejectedValueOnce(new Error('network error'))
    await vi.advanceTimersByTimeAsync(1_000)

    // callback not called — previous values remain
    expect(callback).not.toHaveBeenCalled()

    adapter.subscribe!(callback)()
  })
})
