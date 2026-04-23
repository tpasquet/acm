import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { GitRemoteSource } from '../git-remote.js'

describe('GitRemoteSource', () => {
  it('describe() returns remote URL and branch', () => {
    const source = new GitRemoteSource({
      type: 'git-remote',
      url: 'git@github.com:user/repo.git',
      branch: 'main',
    })
    expect(source.describe()).toBe('git-remote: git@github.com:user/repo.git@main')
  })

  it('describe() includes the configured branch', () => {
    const source = new GitRemoteSource({
      type: 'git-remote',
      url: 'https://github.com/user/repo.git',
      branch: 'develop',
    })
    expect(source.describe()).toContain('develop')
  })

  it('uses a stable cache slug derived from the URL', async () => {
    const url = 'git@github.com:user/repo.git'
    const source1 = new GitRemoteSource({ type: 'git-remote', url, branch: 'main' })
    const source2 = new GitRemoteSource({ type: 'git-remote', url, branch: 'main' })
    // Both instances must point at the same cache path
    const slug = (source1 as unknown as { cachePath: string }).cachePath
    expect(slug).toBe((source2 as unknown as { cachePath: string }).cachePath)
    expect(slug).toContain(path.join(os.homedir(), '.acm', 'cache'))
  })
})
