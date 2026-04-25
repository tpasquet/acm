import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { stringify, parse } from 'yaml'

import { AcmConfigSchema, SyncEngine } from '@acmjs/core'
import type { AcmConfig, Profile, ResolvedProfile, SourceConfig } from '@acmjs/core'
import { GitRemoteSource, LocalSource } from '@acmjs/sources'
import type { ContextSource } from '@acmjs/core'
import { ClaudeCodeTarget } from '@acmjs/targets'

export const CONFIG_PATH = path.join(os.homedir(), '.acm', 'config.yaml')

export function loadConfig(): AcmConfig {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
  return AcmConfigSchema.parse(parse(raw))
}

export function saveConfig(config: AcmConfig): void {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true })
  fs.writeFileSync(CONFIG_PATH, stringify(config), 'utf-8')
}

export function resolveSource(source: SourceConfig): ContextSource {
  switch (source.type) {
    case 'git-remote':
      return new GitRemoteSource(source)
    case 'local':
      return new LocalSource(source)
  }
}

export function buildEngine(profile: Profile): SyncEngine {
  const source = resolveSource(profile.source)
  const targets = profile.targets.claude?.enabled !== false ? [new ClaudeCodeTarget()] : []
  return new SyncEngine(targets, source)
}

export async function resolveProfile(
  name: string,
  profile: Profile,
): Promise<ResolvedProfile> {
  const source = resolveSource(profile.source)
  const sourcePath = await source.fetch()
  return { name, sourcePath, config: profile }
}

export function getActiveProfile(
  config: AcmConfig,
  overrideName?: string,
): { name: string; profile: Profile } {
  const name = overrideName ?? config.active_profile
  const profile = config.profiles[name]
  if (profile === undefined) throw new Error(`Profile "${name}" not found`)
  return { name, profile }
}
