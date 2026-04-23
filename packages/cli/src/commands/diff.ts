import chalk from 'chalk'
import ora from 'ora'

import { buildEngine, getActiveProfile, loadConfig, resolveProfile } from '../config-loader.js'
import { printDiffResults } from '../output.js'

export async function diffCommand(opts: { profile?: string }): Promise<void> {
  const config = loadConfig()
  const { name, profile } = getActiveProfile(config, opts.profile)

  const spinner = ora(`Fetching source for profile "${name}"...`).start()

  try {
    const resolved = await resolveProfile(name, profile)
    spinner.text = 'Computing diff...'

    const engine = buildEngine(profile)
    const groups = await engine.diff(resolved)

    spinner.succeed('Diff ready')
    printDiffResults(groups)
  } catch (err) {
    spinner.fail('Diff failed')
    console.error(chalk.red(err instanceof Error ? err.message : String(err)))
    process.exit(1)
  }
}
