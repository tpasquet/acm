import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
  },
  {
    entry: { bin: 'src/bin.ts' },
    format: ['esm'],
    dts: false,
    sourcemap: true,
    banner: { js: '#!/usr/bin/env node' },
  },
])
