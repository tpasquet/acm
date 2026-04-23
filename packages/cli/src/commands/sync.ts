import chalk from 'chalk'
import ora from 'ora'

import { buildEngine, getActiveProfile, loadConfig, resolveProfile } from '../config-loader.js'
import { printSyncResults } from '../output.js'

export interface SyncOptions {
  profile?: string
  dryRun?: boolean
  force?: boolean
}

export async function syncCommand(opts: SyncOptions): Promise<void> {
  const config = loadConfig()
  const { name, profile } = getActiveProfile(config, opts.profile)

  const spinner = ora(`Fetching source for profile "${name}"...`).start()

  try {
    const resolved = await resolveProfile(name, profile)
    spinner.text = opts.dryRun ? 'Computing diff...' : `Syncing profile "${name}"...`

    const engine = buildEngine(profile)
    const syncOpts = {
      ...(opts.dryRun && { dryRun: true as const }),
      ...(opts.force && { force: true as const }),
    }
    const results = await engine.sync(resolved, syncOpts)

    spinner.succeed(opts.dryRun ? 'Dry run complete' : `Profile "${name}" synced`)
    printSyncResults(results)
  } catch (err) {
    spinner.fail('Sync failed')
    console.error(chalk.red(err instanceof Error ? err.message : String(err)))
    process.exit(1)
  }
}
