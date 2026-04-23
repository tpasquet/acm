import { z } from 'zod'

export const GitRemoteSourceSchema = z.object({
  type: z.literal('git-remote'),
  url: z.string().url(),
  branch: z.string().default('main'),
})

export const LocalSourceSchema = z.object({
  type: z.literal('local'),
  path: z.string().min(1),
})

export const SourceConfigSchema = z.discriminatedUnion('type', [
  GitRemoteSourceSchema,
  LocalSourceSchema,
])

export const MergeStrategySchema = z.enum(['inject', 'overwrite', 'append'])

export const ClaudeTargetConfigSchema = z.object({
  enabled: z.boolean().default(true),
  path: z.string().default('~/.claude'),
  sourceDir: z.string().default('agents/claude'),
  merge: z
    .object({
      'CLAUDE.md': MergeStrategySchema.default('inject'),
      'settings.json': MergeStrategySchema.default('overwrite'),
      'commands/': MergeStrategySchema.default('overwrite'),
    })
    .default({}),
})

export const ProfileSchema = z.object({
  source: SourceConfigSchema,
  targets: z
    .object({
      claude: ClaudeTargetConfigSchema.optional(),
    })
    .default({}),
  description: z.string().optional(),
})

export const AcmConfigSchema = z.object({
  active_profile: z.string().min(1),
  profiles: z.record(z.string(), ProfileSchema),
})

export type GitRemoteSource = z.infer<typeof GitRemoteSourceSchema>
export type LocalSource = z.infer<typeof LocalSourceSchema>
export type SourceConfig = z.infer<typeof SourceConfigSchema>
export type MergeStrategy = z.infer<typeof MergeStrategySchema>
export type ClaudeTargetConfig = z.infer<typeof ClaudeTargetConfigSchema>
export type Profile = z.infer<typeof ProfileSchema>
export type AcmConfig = z.infer<typeof AcmConfigSchema>
