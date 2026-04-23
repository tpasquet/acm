import chalk from 'chalk'

import type { DiffEntry, SyncResult } from '@acm/core'

function actionIcon(action: DiffEntry['action']): string {
  switch (action) {
    case 'create':
      return chalk.green('+')
    case 'update':
      return chalk.yellow('~')
    case 'skip':
      return chalk.dim('·')
  }
}

export function printSyncResults(results: SyncResult[]): void {
  for (const result of results) {
    if (!result.success) {
      console.log(chalk.red(`\n✖ ${result.target}: ${result.error?.message ?? 'unknown error'}`))
      continue
    }
    console.log(chalk.bold(`\n${result.target}:`))
    if (result.diffs.length === 0) {
      console.log(chalk.dim('  (nothing to sync)'))
    }
    for (const diff of result.diffs) {
      console.log(`  ${actionIcon(diff.action)} ${diff.file}`)
    }
  }
}

export function printDiffResults(groups: { target: string; diffs: DiffEntry[] }[]): void {
  for (const { target, diffs } of groups) {
    console.log(chalk.bold(`\n${target}:`))
    if (diffs.length === 0) {
      console.log(chalk.dim('  (nothing to sync)'))
    }
    for (const diff of diffs) {
      console.log(`  ${actionIcon(diff.action)} ${diff.file}`)
    }
  }
}
