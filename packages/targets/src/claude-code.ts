import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import type {
  ClaudeTargetConfig,
  DiffEntry,
  MergeStrategy,
  ResolvedProfile,
  SyncOpts,
  SyncResult,
  Target,
  TargetStatus,
} from '@acm/core'

import { applyStrategy } from './strategies.js'

const SOURCE_DIR = path.join('agents', 'claude')

function resolvePath(p: string): string {
  return p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p
}

function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}

function getMergeConfig(profile: ResolvedProfile): ClaudeTargetConfig['merge'] {
  return (
    profile.config.targets.claude?.merge ?? {
      'CLAUDE.md': 'inject',
      'settings.json': 'overwrite',
      'commands/': 'overwrite',
    }
  )
}

function getTargetPath(profile: ResolvedProfile): string {
  return resolvePath(profile.config.targets.claude?.path ?? '~/.claude')
}

function computeFileDiff(
  targetFile: string,
  sourceContent: string,
  strategy: MergeStrategy,
): DiffEntry {
  const existing = readFile(targetFile)
  const fileName = path.basename(targetFile)

  if (existing === null) {
    return { file: fileName, action: 'create', strategy }
  }

  const result = applyStrategy(strategy, existing, sourceContent)
  return { file: fileName, action: result === existing ? 'skip' : 'update', strategy }
}

function computeCommandsDiffs(
  sourceCommandsDir: string,
  targetCommandsDir: string,
  strategy: MergeStrategy,
): DiffEntry[] {
  if (!fs.existsSync(sourceCommandsDir)) return []

  return fs.readdirSync(sourceCommandsDir).map((name) => {
    const sourceFile = path.join(sourceCommandsDir, name)
    const targetFile = path.join(targetCommandsDir, name)
    const sourceContent = fs.readFileSync(sourceFile, 'utf-8')
    return computeFileDiff(targetFile, sourceContent, strategy)
  })
}

function applyDiff(
  targetFile: string,
  sourceContent: string,
  strategy: MergeStrategy,
  diff: DiffEntry,
): void {
  if (diff.action === 'skip') return

  const existing = readFile(targetFile) ?? ''
  const result = applyStrategy(strategy, existing, sourceContent)
  fs.mkdirSync(path.dirname(targetFile), { recursive: true })
  fs.writeFileSync(targetFile, result, 'utf-8')
}

export class ClaudeCodeTarget implements Target {
  readonly name = 'claude-code'
  readonly label = 'Claude Code'

  detect(): boolean {
    return fs.existsSync(resolvePath('~/.claude'))
  }

  async diff(profile: ResolvedProfile): Promise<DiffEntry[]> {
    const sourceRoot = path.join(profile.sourcePath, SOURCE_DIR)
    const targetPath = getTargetPath(profile)
    const mergeConfig = getMergeConfig(profile)

    const fileDiffs: DiffEntry[] = []

    for (const [fileName, strategy] of [
      ['CLAUDE.md', mergeConfig['CLAUDE.md']],
      ['settings.json', mergeConfig['settings.json']],
    ] as const) {
      const sourceFile = path.join(sourceRoot, fileName)
      if (!fs.existsSync(sourceFile)) continue
      const sourceContent = fs.readFileSync(sourceFile, 'utf-8')
      fileDiffs.push(computeFileDiff(path.join(targetPath, fileName), sourceContent, strategy))
    }

    const commandsDiffs = computeCommandsDiffs(
      path.join(sourceRoot, 'commands'),
      path.join(targetPath, 'commands'),
      mergeConfig['commands/'],
    )

    return [...fileDiffs, ...commandsDiffs]
  }

  async sync(profile: ResolvedProfile, opts?: SyncOpts): Promise<SyncResult> {
    try {
      const sourceRoot = path.join(profile.sourcePath, SOURCE_DIR)
      const targetPath = getTargetPath(profile)
      const mergeConfig = getMergeConfig(profile)
      const diffs = await this.diff(profile)

      if (opts?.dryRun) {
        return { target: this.name, diffs, success: true }
      }

      for (const [fileName, strategy] of [
        ['CLAUDE.md', mergeConfig['CLAUDE.md']],
        ['settings.json', mergeConfig['settings.json']],
      ] as const) {
        const sourceFile = path.join(sourceRoot, fileName)
        if (!fs.existsSync(sourceFile)) continue
        const sourceContent = fs.readFileSync(sourceFile, 'utf-8')
        const diff = diffs.find((d) => d.file === fileName)
        if (diff) {
          applyDiff(path.join(targetPath, fileName), sourceContent, strategy, diff)
        }
      }

      const sourceCommandsDir = path.join(sourceRoot, 'commands')
      const targetCommandsDir = path.join(targetPath, 'commands')
      const commandsStrategy = mergeConfig['commands/']

      if (fs.existsSync(sourceCommandsDir)) {
        for (const name of fs.readdirSync(sourceCommandsDir)) {
          const sourceContent = fs.readFileSync(path.join(sourceCommandsDir, name), 'utf-8')
          const diff = diffs.find((d) => d.file === name)
          if (diff) {
            applyDiff(path.join(targetCommandsDir, name), sourceContent, commandsStrategy, diff)
          }
        }
      }

      return { target: this.name, diffs, success: true }
    } catch (error) {
      return {
        target: this.name,
        diffs: [],
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    }
  }

  async status(): Promise<TargetStatus> {
    const detected = this.detect()
    return {
      target: this.name,
      label: this.label,
      detected,
      path: resolvePath('~/.claude'),
    }
  }
}
