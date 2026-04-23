import { Command } from 'commander'

import { initCommand } from './commands/init.js'
import { syncCommand } from './commands/sync.js'
import { diffCommand } from './commands/diff.js'
import { statusCommand } from './commands/status.js'
import { profileListCommand, profileUseCommand } from './commands/profile.js'

const program = new Command()

program
  .name('acm')
  .description('AI Context Manager — sync your AI agent context from a Git repo')
  .version('0.1.0')

program
  .command('init')
  .description('Interactive setup wizard')
  .action(initCommand)

program
  .command('sync')
  .description('Pull context and deploy to all enabled targets')
  .option('--profile <name>', 'Profile to use')
  .option('--dry-run', 'Preview changes without writing')
  .option('--force', 'Overwrite even unchanged files')
  .action((opts: { profile?: string; dryRun?: boolean; force?: boolean }) =>
    syncCommand(opts),
  )

program
  .command('diff')
  .description('Preview what would change on next sync')
  .option('--profile <name>', 'Profile to use')
  .action((opts: { profile?: string }) => diffCommand(opts))

program
  .command('status')
  .description('Show active profile and target install status')
  .action(statusCommand)

const profileCmd = program.command('profile').description('Manage profiles')

profileCmd
  .command('list')
  .description('List all profiles')
  .action(profileListCommand)

profileCmd
  .command('use <name>')
  .description('Switch active profile and sync')
  .action((name: string) => profileUseCommand(name))

program.parseAsync()
