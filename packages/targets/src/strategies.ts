import type { MergeStrategy } from '@acm/core'

const ACM_START = '<!-- acm:start -->'
const ACM_END = '<!-- acm:end -->'

function applyInject(existing: string, incoming: string): string {
  const managed = `${ACM_START}\n${incoming.trim()}\n${ACM_END}`
  const startIdx = existing.indexOf(ACM_START)
  const endIdx = existing.indexOf(ACM_END)

  if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    return existing.slice(0, startIdx) + managed + existing.slice(endIdx + ACM_END.length)
  }

  const base = existing.trimEnd()
  return base ? `${base}\n\n${managed}` : managed
}

function applyOverwrite(_existing: string, incoming: string): string {
  return incoming
}

function applyAppend(existing: string, incoming: string): string {
  const base = existing.trimEnd()
  return base ? `${base}\n${incoming}` : incoming
}

export function applyStrategy(strategy: MergeStrategy, existing: string, incoming: string): string {
  switch (strategy) {
    case 'inject':
      return applyInject(existing, incoming)
    case 'overwrite':
      return applyOverwrite(existing, incoming)
    case 'append':
      return applyAppend(existing, incoming)
  }
}
