import type { MergeStrategy, Profile } from './schemas.js'

export type SyncOpts = {
  dryRun?: boolean
  force?: boolean
}

export type DiffEntry = {
  file: string
  action: 'create' | 'update' | 'skip'
  strategy: MergeStrategy
}

export type SyncResult = {
  target: string
  diffs: DiffEntry[]
  success: boolean
  error?: Error
}

export type TargetStatus = {
  target: string
  label: string
  detected: boolean
  path: string
}

export type ResolvedProfile = {
  name: string
  sourcePath: string
  config: Profile
}

export interface ContextSource {
  fetch(): Promise<string>
  validate(): Promise<boolean>
  describe(): string
}

export interface Target {
  readonly name: string
  readonly label: string

  detect(): boolean
  sync(profile: ResolvedProfile, opts?: SyncOpts): Promise<SyncResult>
  diff(profile: ResolvedProfile): Promise<DiffEntry[]>
  status(): Promise<TargetStatus>
}
