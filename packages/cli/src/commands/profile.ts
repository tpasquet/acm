import chalk from 'chalk'

import { getActiveProfile, loadConfig, saveConfig } from '../config-loader.js'
import { syncCommand } from './sync.js'

export function profileListCommand(): void {
  const config = loadConfig()
  console.log(chalk.bold('Profiles:\n'))
  for (const [name, profile] of Object.entries(config.profiles)) {
    const active = name === config.active_profile
    const marker = active ? chalk.green('▶') : ' '
    const source = profile.source.type === 'git-remote'
      ? `${profile.source.url}@${profile.source.branch}`
      : profile.source.path
    console.log(`  ${marker} ${chalk.bold(name.padEnd(16))} ${source}`)
  }
}

export async function profileUseCommand(name: string): Promise<void> {
  const config = loadConfig()
  getActiveProfile(config, name) // validates existence

  config.active_profile = name
  saveConfig(config)

  await syncCommand({ profile: name })
  console.log(chalk.green(`\n✔ Switched to profile "${name}" and synced`))
}
