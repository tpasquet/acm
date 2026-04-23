import type {
  ContextSource,
  DiffEntry,
  ResolvedProfile,
  SyncOpts,
  SyncResult,
  Target,
  TargetStatus,
} from './interfaces.js'

export class SyncEngine {
  constructor(
    private readonly targets: Target[],
    private readonly source: ContextSource,
  ) {}

  async sync(profile: ResolvedProfile, opts?: SyncOpts): Promise<SyncResult[]> {
    const sourcePath = await this.source.fetch()
    const resolved: ResolvedProfile = { ...profile, sourcePath }

    return Promise.all(
      this.targets
        .filter((t) => t.detect())
        .map((t) => t.sync(resolved, opts)),
    )
  }

  async diff(profile: ResolvedProfile): Promise<{ target: string; diffs: DiffEntry[] }[]> {
    const sourcePath = await this.source.fetch()
    const resolved: ResolvedProfile = { ...profile, sourcePath }

    return Promise.all(
      this.targets
        .filter((t) => t.detect())
        .map(async (t) => ({ target: t.name, diffs: await t.diff(resolved) })),
    )
  }

  async status(): Promise<TargetStatus[]> {
    return Promise.all(this.targets.map((t) => t.status()))
  }
}
