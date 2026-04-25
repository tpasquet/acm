import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { simpleGit } from 'simple-git'

import type { ContextSource, GitRemoteSource as GitRemoteSourceConfig } from '@acmjs/core'

function urlToSlug(url: string): string {
  return url
    .replace(/^(https?:\/\/|git@)/, '')
    .replace(/\.git$/, '')
    .replace(/[/:@]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export class GitRemoteSource implements ContextSource {
  private readonly cachePath: string

  constructor(private readonly config: GitRemoteSourceConfig) {
    const slug = urlToSlug(config.url)
    this.cachePath = path.join(os.homedir(), '.acm', 'cache', slug)
  }

  async fetch(): Promise<string> {
    if (fs.existsSync(path.join(this.cachePath, '.git'))) {
      await simpleGit(this.cachePath).pull()
    } else {
      fs.mkdirSync(this.cachePath, { recursive: true })
      await simpleGit().clone(this.config.url, this.cachePath, [
        '--depth',
        '1',
        '--branch',
        this.config.branch,
      ])
    }
    return this.cachePath
  }

  async validate(): Promise<boolean> {
    try {
      await simpleGit().listRemote([this.config.url])
      return true
    } catch {
      return false
    }
  }

  describe(): string {
    return `git-remote: ${this.config.url}@${this.config.branch}`
  }
}
