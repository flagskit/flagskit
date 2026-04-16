import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  // Mark the whole bundle as a React Server Components client boundary.
  // esbuild strips per-file 'use client' directives when bundling, so we
  // inject it at the top of the output. Server-safe APIs (defineFlags,
  // evaluate) live in @flagskit/core and must be imported from there.
  banner: { js: "'use client';" },
})
