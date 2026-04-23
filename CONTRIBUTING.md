# Contributing to ACM

## Development setup

**Prerequisites:** Node.js 18+, pnpm 9+, Git.

```sh
git clone https://github.com/your-org/acm.git
cd acm
pnpm install
pnpm build
pnpm test
```

## Monorepo structure

```
packages/
├── core/      @acm/core     — schemas, interfaces, SyncEngine (no side effects)
├── sources/   @acm/sources  — GitRemoteSource, LocalSource
├── targets/   @acm/targets  — ClaudeCodeTarget
└── cli/       @acm/cli      — acm binary (Commander)
```

**Dependency rule:** `core` has no dependency on the other packages. `sources` and `targets` depend only on `core`. `cli` depends on all three.

## Common commands

```sh
pnpm build          # build all packages
pnpm test           # run all tests
pnpm typecheck      # typecheck all packages without emitting
pnpm clean          # delete all dist/ folders
```

Per-package:

```sh
pnpm --filter @acm/core build
pnpm --filter @acm/targets test
```

## Adding a new target

A target deploys context files to a specific AI agent (Cursor, Copilot, etc.).

1. Create `packages/targets/src/<agent>.ts` implementing the `Target` interface from `@acm/core`:

```typescript
import type { Target, ResolvedProfile, SyncOpts, SyncResult, DiffEntry, TargetStatus } from '@acm/core'

export class CursorTarget implements Target {
  readonly name = 'cursor'
  readonly label = 'Cursor'

  detect(): boolean { ... }
  async sync(profile: ResolvedProfile, opts?: SyncOpts): Promise<SyncResult> { ... }
  async diff(profile: ResolvedProfile): Promise<DiffEntry[]> { ... }
  async status(): Promise<TargetStatus> { ... }
}
```

2. Export from `packages/targets/src/index.ts`
3. Add the target config schema to `ClaudeTargetConfigSchema` in `packages/core/src/schemas.ts` (follow the `claude` pattern)
4. Register in `packages/cli/src/config-loader.ts` — add to `buildEngine()` and `resolveTargets()`
5. Add tests in `packages/targets/src/__tests__/<agent>.test.ts`

## Adding a new source

A source fetches the context repo to a local path.

1. Create `packages/sources/src/<type>.ts` implementing the `ContextSource` interface from `@acm/core`:

```typescript
import type { ContextSource } from '@acm/core'

export class GistSource implements ContextSource {
  async fetch(): Promise<string> { ... }   // returns local path
  async validate(): Promise<boolean> { ... }
  describe(): string { ... }
}
```

2. Export from `packages/sources/src/index.ts`
3. Add the source schema variant to `SourceConfigSchema` in `packages/core/src/schemas.ts`
4. Handle the new type in `resolveSource()` in `packages/cli/src/config-loader.ts`
5. Add tests in `packages/sources/src/__tests__/<type>.test.ts`

## TypeScript conventions

- `strict: true`, `exactOptionalPropertyTypes: true`, `noUncheckedIndexedAccess: true`
- ESM only — use `.js` extensions in all imports (even for `.ts` files)
- No `any` — use `unknown` at system boundaries
- No comments that restate the code — only document non-obvious constraints

## Tests

Tests live in `src/__tests__/` in each package. We use [vitest](https://vitest.dev/).

- Unit test pure functions exhaustively (strategies, schemas)
- Use real temp directories for filesystem tests — avoid mocking `fs`
- Mock only external I/O that can't run in CI (network, git remotes)

```sh
pnpm --filter @acm/targets test -- --watch   # watch mode for a package
```

## Pull requests

- One PR per logical change
- All tests must pass: `pnpm test`
- No TypeScript errors: `pnpm typecheck`
- Describe *why* the change is needed, not just what it does
