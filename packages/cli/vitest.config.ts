import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@acmjs/core': path.resolve(__dirname, '../core/src/index.ts'),
      '@acmjs/sources': path.resolve(__dirname, '../sources/src/index.ts'),
      '@acmjs/targets': path.resolve(__dirname, '../targets/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
  },
})
