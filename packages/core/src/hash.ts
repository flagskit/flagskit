const C1 = 0xcc9e2d51
const C2 = 0x1b873593

/**
 * MurmurHash3 (32-bit) — inline implementation, zero dependencies.
 *
 * Used for consistent percentage rollout: the same (flagName + userId)
 * always produces the same bucket, so a user consistently sees the same variant.
 */
export function murmurhash3(key: string, seed = 0): number {
  let h1 = seed
  const length = key.length
  const nblocks = Math.floor(length / 4)

  for (let i = 0; i < nblocks; i++) {
    const i4 = i * 4
    let k1 =
      (key.charCodeAt(i4) & 0xff) |
      ((key.charCodeAt(i4 + 1) & 0xff) << 8) |
      ((key.charCodeAt(i4 + 2) & 0xff) << 16) |
      ((key.charCodeAt(i4 + 3) & 0xff) << 24)

    k1 = Math.imul(k1, C1)
    k1 = (k1 << 15) | (k1 >>> 17)
    k1 = Math.imul(k1, C2)

    h1 ^= k1
    h1 = (h1 << 13) | (h1 >>> 19)
    h1 = (Math.imul(h1, 5) + 0xe6546b64) | 0
  }

  let k1 = 0
  const tail = nblocks * 4

  switch (length & 3) {
    case 3:
      k1 ^= (key.charCodeAt(tail + 2) & 0xff) << 16
    // falls through
    case 2:
      k1 ^= (key.charCodeAt(tail + 1) & 0xff) << 8
    // falls through
    case 1:
      k1 ^= key.charCodeAt(tail) & 0xff
      k1 = Math.imul(k1, C1)
      k1 = (k1 << 15) | (k1 >>> 17)
      k1 = Math.imul(k1, C2)
      h1 ^= k1
  }

  h1 ^= length
  h1 ^= h1 >>> 16
  h1 = Math.imul(h1, 0x85ebca6b)
  h1 ^= h1 >>> 13
  h1 = Math.imul(h1, 0xc2b2ae35)
  h1 ^= h1 >>> 16

  return h1 >>> 0
}
