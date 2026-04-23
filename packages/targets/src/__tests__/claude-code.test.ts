import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { ResolvedProfile } from '@acm/core'

import { ClaudeCodeTarget } from '../claude-code.js'

function makeProfile(sourceDir: string, targetDir: string): ResolvedProfile {
  return {
    name: 'test',
    sourcePath: sourceDir,
    config: {
      source: { type: 'local', path: sourceDir },
      targets: {
        claude: {
          enabled: true,
          path: targetDir,
          sourceDir: 'agents/claude',
          merge: {
            'CLAUDE.md': 'inject',
            'settings.json': 'overwrite',
            'commands/': 'overwrite',
          },
        },
      },
    },
  }
}

describe('ClaudeCodeTarget', () => {
  let sourceDir: string
  let targetDir: string

  beforeEach(() => {
    sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'acm-src-'))
    targetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'acm-tgt-'))
    fs.mkdirSync(path.join(sourceDir, 'agents', 'claude', 'commands'), { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(sourceDir, { recursive: true, force: true })
    fs.rmSync(targetDir, { recursive: true, force: true })
  })

  it('diff returns "create" for a new CLAUDE.md', async () => {
    fs.writeFileSync(path.join(sourceDir, 'agents', 'claude', 'CLAUDE.md'), '# Hello')
    const diffs = await new ClaudeCodeTarget().diff(makeProfile(sourceDir, targetDir))
    expect(diffs.find((d) => d.file === 'CLAUDE.md')?.action).toBe('create')
  })

  it('diff returns "skip" when inject content is unchanged', async () => {
    const incoming = '# Hello'
    const existing = `<!-- acm:start -->\n${incoming}\n<!-- acm:end -->`
    fs.writeFileSync(path.join(sourceDir, 'agents', 'claude', 'CLAUDE.md'), incoming)
    fs.writeFileSync(path.join(targetDir, 'CLAUDE.md'), existing)
    const diffs = await new ClaudeCodeTarget().diff(makeProfile(sourceDir, targetDir))
    expect(diffs.find((d) => d.file === 'CLAUDE.md')?.action).toBe('skip')
  })

  it('diff returns "update" when inject content changed', async () => {
    fs.writeFileSync(path.join(sourceDir, 'agents', 'claude', 'CLAUDE.md'), 'new content')
    fs.writeFileSync(
      path.join(targetDir, 'CLAUDE.md'),
      '<!-- acm:start -->\nold content\n<!-- acm:end -->',
    )
    const diffs = await new ClaudeCodeTarget().diff(makeProfile(sourceDir, targetDir))
    expect(diffs.find((d) => d.file === 'CLAUDE.md')?.action).toBe('update')
  })

  it('sync creates CLAUDE.md with inject markers', async () => {
    fs.writeFileSync(path.join(sourceDir, 'agents', 'claude', 'CLAUDE.md'), 'managed content')
    await new ClaudeCodeTarget().sync(makeProfile(sourceDir, targetDir))
    const result = fs.readFileSync(path.join(targetDir, 'CLAUDE.md'), 'utf-8')
    expect(result).toContain('<!-- acm:start -->')
    expect(result).toContain('managed content')
    expect(result).toContain('<!-- acm:end -->')
  })

  it('sync overwrites settings.json entirely', async () => {
    const settings = JSON.stringify({ model: 'claude-opus-4-7' })
    fs.writeFileSync(path.join(sourceDir, 'agents', 'claude', 'settings.json'), settings)
    fs.writeFileSync(path.join(targetDir, 'settings.json'), '{}')
    await new ClaudeCodeTarget().sync(makeProfile(sourceDir, targetDir))
    expect(fs.readFileSync(path.join(targetDir, 'settings.json'), 'utf-8')).toBe(settings)
  })

  it('sync copies command files to target', async () => {
    fs.writeFileSync(
      path.join(sourceDir, 'agents', 'claude', 'commands', 'review.md'),
      'Review the code',
    )
    await new ClaudeCodeTarget().sync(makeProfile(sourceDir, targetDir))
    const result = fs.readFileSync(path.join(targetDir, 'commands', 'review.md'), 'utf-8')
    expect(result).toBe('Review the code')
  })

  it('sync with dryRun does not write any files', async () => {
    fs.writeFileSync(path.join(sourceDir, 'agents', 'claude', 'settings.json'), '{"new":true}')
    const result = await new ClaudeCodeTarget().sync(makeProfile(sourceDir, targetDir), {
      dryRun: true,
    })
    expect(result.success).toBe(true)
    expect(fs.existsSync(path.join(targetDir, 'settings.json'))).toBe(false)
  })
})
