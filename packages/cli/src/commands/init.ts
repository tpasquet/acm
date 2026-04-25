import chalk from 'chalk'
import prompts from 'prompts'

import type { AcmConfig, SourceConfig } from '@acmjs/core'
import { saveConfig } from '../config-loader.js'

export async function initCommand(): Promise<void> {
  const base = await prompts([
    {
      type: 'text',
      name: 'profileName',
      message: 'Profile name',
      initial: 'default',
    },
    {
      type: 'select',
      name: 'sourceType',
      message: 'Source type',
      choices: [
        { title: 'Git remote', value: 'git-remote' },
        { title: 'Local path', value: 'local' },
      ],
    },
  ])

  if (base.profileName === undefined || base.sourceType === undefined) {
    process.exit(1)
  }

  let source: SourceConfig

  if (base.sourceType === 'git-remote') {
    const git = await prompts([
      { type: 'text', name: 'url', message: 'Git remote URL' },
      { type: 'text', name: 'branch', message: 'Branch', initial: 'main' },
    ])
    if (!git.url) process.exit(1)
    source = { type: 'git-remote', url: git.url as string, branch: (git.branch as string) || 'main' }
  } else {
    const local = await prompts({ type: 'text', name: 'path', message: 'Local path' })
    if (!local.path) process.exit(1)
    source = { type: 'local', path: local.path as string }
  }

  const config: AcmConfig = {
    active_profile: base.profileName as string,
    profiles: {
      [base.profileName as string]: {
        source,
        targets: { claude: { enabled: true, path: '~/.claude', sourceDir: 'agents/claude', merge: { 'CLAUDE.md': 'inject', 'settings.json': 'overwrite', 'commands/': 'overwrite' } } },
      },
    },
  }

  saveConfig(config)
  console.log(chalk.green('\n✔ Config written. Run acm sync to deploy.'))
}
