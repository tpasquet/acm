import chalk from 'chalk'

import { ClaudeCodeTarget } from '@acmjs/targets'

import { getActiveProfile, loadConfig, resolveSource } from '../config-loader.js'

export async function statusCommand(): Promise<void> {
  const config = loadConfig()
  const { name, profile } = getActiveProfile(config)

  console.log(chalk.bold('Active profile:'), name)
  console.log(chalk.bold('Source:        '), resolveSource(profile.source).describe())

  const targets = [new ClaudeCodeTarget()]
  const statuses = await Promise.all(targets.map((t) => t.status()))

  console.log(chalk.bold('\nTargets:'))
  for (const s of statuses) {
    const icon = s.detected ? chalk.green('✔') : chalk.dim('·')
    const state = s.detected ? chalk.green('detected') : chalk.dim('not detected')
    console.log(`  ${icon} ${s.label.padEnd(14)} ${s.path.padEnd(20)} ${state}`)
  }
}
