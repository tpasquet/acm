import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import type { ContextSource, LocalSource as LocalSourceConfig } from '@acm/core'

export class LocalSource implements ContextSource {
  private readonly resolvedPath: string

  constructor(config: LocalSourceConfig) {
    this.resolvedPath = config.path.startsWith('~')
      ? path.join(os.homedir(), config.path.slice(1))
      : config.path
  }

  async fetch(): Promise<string> {
    return this.resolvedPath
  }

  async validate(): Promise<boolean> {
    return fs.existsSync(this.resolvedPath)
  }

  describe(): string {
    return `local: ${this.resolvedPath}`
  }
}
