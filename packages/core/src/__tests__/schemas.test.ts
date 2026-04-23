import { describe, expect, it } from 'vitest'

import { AcmConfigSchema, ClaudeTargetConfigSchema } from '../schemas.js'

const GIT_PROFILE = {
  source: { type: 'git-remote', url: 'https://github.com/user/repo.git', branch: 'main' },
}

const VALID_CONFIG = {
  active_profile: 'default',
  profiles: { default: GIT_PROFILE },
}

describe('AcmConfigSchema', () => {
  it('parses a valid git-remote config', () => {
    const result = AcmConfigSchema.parse(VALID_CONFIG)
    expect(result.active_profile).toBe('default')
    expect(result.profiles['default']?.source.type).toBe('git-remote')
  })

  it('applies default branch "main" when omitted', () => {
    const config = {
      active_profile: 'x',
      profiles: { x: { source: { type: 'git-remote', url: 'https://github.com/u/r.git' } } },
    }
    const result = AcmConfigSchema.parse(config)
    const source = result.profiles['x']?.source
    expect(source?.type === 'git-remote' && source.branch).toBe('main')
  })

  it('parses a local source', () => {
    const config = {
      active_profile: 'local',
      profiles: { local: { source: { type: 'local', path: '~/my-context' } } },
    }
    const result = AcmConfigSchema.parse(config)
    expect(result.profiles['local']?.source.type).toBe('local')
  })

  it('rejects an unknown source type', () => {
    const config = {
      active_profile: 'x',
      profiles: { x: { source: { type: 'unknown', url: 'http://x.com' } } },
    }
    expect(() => AcmConfigSchema.parse(config)).toThrow()
  })

  it('rejects an empty active_profile', () => {
    expect(() => AcmConfigSchema.parse({ ...VALID_CONFIG, active_profile: '' })).toThrow()
  })

  it('accepts optional description on a profile', () => {
    const config = {
      active_profile: 'x',
      profiles: { x: { ...GIT_PROFILE, description: 'my work profile' } },
    }
    const result = AcmConfigSchema.parse(config)
    expect(result.profiles['x']?.description).toBe('my work profile')
  })
})

describe('ClaudeTargetConfigSchema', () => {
  it('applies default path ~/.claude', () => {
    expect(ClaudeTargetConfigSchema.parse({}).path).toBe('~/.claude')
  })

  it('applies default merge strategies', () => {
    const { merge } = ClaudeTargetConfigSchema.parse({})
    expect(merge['CLAUDE.md']).toBe('inject')
    expect(merge['settings.json']).toBe('overwrite')
    expect(merge['commands/']).toBe('overwrite')
  })

  it('allows overriding a merge strategy', () => {
    const result = ClaudeTargetConfigSchema.parse({ merge: { 'CLAUDE.md': 'overwrite' } })
    expect(result.merge['CLAUDE.md']).toBe('overwrite')
    expect(result.merge['settings.json']).toBe('overwrite')
  })

  it('defaults enabled to true', () => {
    expect(ClaudeTargetConfigSchema.parse({}).enabled).toBe(true)
  })
})
