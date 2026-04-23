import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { LocalSource } from '../local.js'

describe('LocalSource', () => {
  it('resolves ~ to home directory in describe()', () => {
    const source = new LocalSource({ type: 'local', path: '~/my-context' })
    expect(source.describe()).toBe(`local: ${path.join(os.homedir(), 'my-context')}`)
  })

  it('keeps an absolute path as-is', () => {
    const source = new LocalSource({ type: 'local', path: '/absolute/path' })
    expect(source.describe()).toBe('local: /absolute/path')
  })

  it('fetch() returns the resolved path', async () => {
    const source = new LocalSource({ type: 'local', path: '/some/path' })
    expect(await source.fetch()).toBe('/some/path')
  })

  it('fetch() resolves ~ correctly', async () => {
    const source = new LocalSource({ type: 'local', path: '~/foo' })
    expect(await source.fetch()).toBe(path.join(os.homedir(), 'foo'))
  })

  it('validate() returns true for an existing directory', async () => {
    const source = new LocalSource({ type: 'local', path: os.tmpdir() })
    expect(await source.validate()).toBe(true)
  })

  it('validate() returns false for a non-existing path', async () => {
    const source = new LocalSource({ type: 'local', path: '/this/does/not/exist/acm-test-xyz' })
    expect(await source.validate()).toBe(false)
  })
})
