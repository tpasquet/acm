import { describe, expect, it } from 'vitest'

import type { AcmConfig } from '@acm/core'

import { getActiveProfile, resolveSource } from '../config-loader.js'

const CONFIG: AcmConfig = {
  active_profile: 'work',
  profiles: {
    work: {
      source: { type: 'local', path: '~/work-context' },
      targets: {},
    },
    perso: {
      source: { type: 'local', path: '~/perso-context' },
      targets: {},
    },
  },
}

describe('getActiveProfile', () => {
  it('returns the active profile when no override given', () => {
    const { name, profile } = getActiveProfile(CONFIG)
    expect(name).toBe('work')
    expect(profile.source.type).toBe('local')
  })

  it('returns the overridden profile', () => {
    const { name } = getActiveProfile(CONFIG, 'perso')
    expect(name).toBe('perso')
  })

  it('throws when the profile does not exist', () => {
    expect(() => getActiveProfile(CONFIG, 'nonexistent')).toThrow('Profile "nonexistent" not found')
  })
})

describe('resolveSource', () => {
  it('returns a LocalSource for type local', () => {
    const source = resolveSource({ type: 'local', path: '/tmp' })
    expect(source.describe()).toContain('local:')
  })

  it('returns a GitRemoteSource for type git-remote', () => {
    const source = resolveSource({
      type: 'git-remote',
      url: 'https://github.com/user/repo.git',
      branch: 'main',
    })
    expect(source.describe()).toContain('git-remote:')
  })
})
