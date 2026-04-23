import { describe, expect, it, vi } from 'vitest'

import { SyncEngine } from '../engine.js'
import type { ContextSource, ResolvedProfile, Target } from '../interfaces.js'

const mockSource: ContextSource = {
  fetch: vi.fn().mockResolvedValue('/tmp/context'),
  validate: vi.fn().mockResolvedValue(true),
  describe: vi.fn().mockReturnValue('mock'),
}

const mockProfile: ResolvedProfile = {
  name: 'test',
  sourcePath: '/tmp/context',
  config: {
    source: { type: 'local', path: '/tmp/context' },
    targets: {},
  },
}

function makeTarget(detected: boolean): Target {
  return {
    name: 'mock',
    label: 'Mock',
    detect: vi.fn().mockReturnValue(detected),
    sync: vi.fn().mockResolvedValue({ target: 'mock', diffs: [], success: true }),
    diff: vi.fn().mockResolvedValue([]),
    status: vi.fn().mockResolvedValue({ target: 'mock', label: 'Mock', detected, path: '/mock' }),
  }
}

describe('SyncEngine', () => {
  it('sync calls only detected targets', async () => {
    const on = makeTarget(true)
    const off = makeTarget(false)
    await new SyncEngine([on, off], mockSource).sync(mockProfile)
    expect(on.sync).toHaveBeenCalledOnce()
    expect(off.sync).not.toHaveBeenCalled()
  })

  it('diff calls only detected targets', async () => {
    const on = makeTarget(true)
    const off = makeTarget(false)
    await new SyncEngine([on, off], mockSource).diff(mockProfile)
    expect(on.diff).toHaveBeenCalledOnce()
    expect(off.diff).not.toHaveBeenCalled()
  })

  it('status calls all targets regardless of detect', async () => {
    const on = makeTarget(true)
    const off = makeTarget(false)
    const results = await new SyncEngine([on, off], mockSource).status()
    expect(results).toHaveLength(2)
    expect(on.status).toHaveBeenCalledOnce()
    expect(off.status).toHaveBeenCalledOnce()
  })

  it('sync forwards options to targets', async () => {
    const target = makeTarget(true)
    await new SyncEngine([target], mockSource).sync(mockProfile, { dryRun: true })
    expect(target.sync).toHaveBeenCalledWith(mockProfile, { dryRun: true })
  })

  it('diff returns target name alongside diffs', async () => {
    const target = makeTarget(true)
    const groups = await new SyncEngine([target], mockSource).diff(mockProfile)
    expect(groups[0]?.target).toBe('mock')
  })
})
