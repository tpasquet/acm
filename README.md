# ACM — AI Context Manager

Keep your AI coding environment consistent everywhere. Define your instructions, memory, and commands once in a Git repository — ACM deploys them to Claude Code (and soon Cursor, Copilot, and more) on every machine you work on.

---

## How it works

1. **Fork** the [`acm-starter`](./acm-starter) template into your own private repo
2. **Edit** your context: `CLAUDE.md`, `settings.json`, slash commands, shared memory
3. **Run** `acm sync` on any machine — ACM pulls the repo and deploys to `~/.claude/`

Your context repo is the single source of truth. Switch machines, onboard teammates, maintain separate work/personal profiles — all from one place.

---

## Installation

```sh
npm install -g @acm/cli
```

---

## Quick start

```sh
# 1. Initialize ACM with your context repo
acm init

# 2. Deploy to Claude Code
acm sync

# 3. Check what's installed
acm status
```

---

## Commands

| Command | Description |
|---|---|
| `acm init` | Interactive setup wizard — creates `~/.acm/config.yaml` |
| `acm sync` | Pull context and deploy to all enabled targets |
| `acm sync --dry-run` | Preview changes without writing anything |
| `acm diff` | Show what would change on next sync |
| `acm status` | Show active profile and target install status |
| `acm profile list` | List all configured profiles |
| `acm profile use <name>` | Switch active profile and sync |

---

## Profiles

Profiles let you maintain separate contexts — for example a work repo and a personal repo — and switch between them instantly.

```yaml
# ~/.acm/config.yaml
active_profile: work

profiles:
  work:
    source:
      type: git-remote
      url: git@github.com:you/acm-context-work.git
      branch: main
    targets:
      claude:
        enabled: true
        path: ~/.claude
        merge:
          CLAUDE.md: inject
          settings.json: overwrite
          commands/: overwrite

  perso:
    source:
      type: git-remote
      url: git@github.com:you/acm-context-perso.git
      branch: main
    targets:
      claude:
        enabled: true
        path: ~/.claude
```

```sh
acm profile use perso   # switches and syncs immediately
```

---

## Context repo structure

Fork [`acm-starter`](./acm-starter) and customize it:

```
acm-starter/
├── acm.yaml                    ← repo manifest
├── agents/
│   └── claude/                 ← deployed to ~/.claude/
│       ├── CLAUDE.md           ← your global AI instructions
│       ├── settings.json       ← Claude Code settings
│       └── commands/           ← slash commands
│           ├── review.md
│           └── commit.md
└── context/                    ← shared knowledge (agent-agnostic)
    ├── memory.md               ← who you are, your stack, preferences
    ├── instructions.md         ← global coding rules
    ├── conventions/            ← team standards
    └── modules/                ← internal module summaries
```

`agents/claude/CLAUDE.md` can import shared context files:

```markdown
@context/memory.md
@context/instructions.md
```

---

## Merge strategies

ACM controls how each file is deployed, per target:

| Strategy | Behavior | Default for |
|---|---|---|
| `inject` | Inserts managed content between `<!-- acm:start -->` / `<!-- acm:end -->` markers — never touches the rest of the file | `CLAUDE.md` |
| `overwrite` | Replaces the entire file | `settings.json`, `commands/` |
| `append` | Appends content at the end of the file | — |

#### `inject`

Content outside the markers belongs to you and is never touched by ACM.

```markdown
# My personal notes        ← untouched by ACM
I like short answers.

<!-- acm:start -->
@context/memory.md         ← managed by ACM
@context/instructions.md
<!-- acm:end -->

## Project-specific notes  ← untouched by ACM
See internal/README.md
```

If the markers don't exist yet, ACM appends the block at the end of the file on first sync.

#### `overwrite`

The entire file is replaced with the version from your context repo.

```diff
- { "model": "claude-sonnet-4-6", "theme": "light" }   ← previous local content
+ { "model": "claude-opus-4-7", "theme": "dark" }       ← from context repo
```

#### `append`

Content from your context repo is appended at the end of the existing file without touching what's already there.

```markdown
# Existing local content

---
[appended from context repo]
Always respond in French.
```

### Warnings

**`overwrite` is destructive.** When ACM overwrites a file (e.g. `settings.json`), the previous content is gone — there is no backup. Before enabling `overwrite`, make sure everything you want to keep is already in your context repo.

**Don't edit content inside `inject` markers.** The block between `<!-- acm:start -->` and `<!-- acm:end -->` in `CLAUDE.md` is fully managed by ACM and will be replaced on every sync. Add your personal notes outside the markers.

**ACM has no backup mechanism.** Your context repo is the source of truth. If you want to preserve local state, commit it to the repo before running `acm sync`.

> **Tip:** Always use `acm diff` or `acm sync --dry-run` before syncing on a new machine to preview what will change.

---

## Supported targets

| Target | Status |
|---|---|
| Claude Code (`~/.claude/`) | v0.1 |
| Cursor | planned |
| GitHub Copilot | planned |
| Windsurf | planned |

---

## Compatibility

### Operating systems

| OS | Runtime | Dev scripts |
|---|---|---|
| macOS | ✔ | ✔ |
| Linux | ✔ | ✔ |
| Windows | ✔ | ✔ (rimraf, no Unix-only tools) |

All runtime operations use Node.js cross-platform APIs (`os`, `path`, `fs`). The `~` prefix in paths is resolved via `os.homedir()` on all platforms.

### Node.js

Requires Node.js **18 or later** (ESM, `node:` protocol imports).

### Git

Requires Git installed and available in `PATH` for `git-remote` sources. `local` sources work without Git.

### Claude Code

Targets `~/.claude/` as installed by [Claude Code](https://claude.ai/code) on macOS, Linux, and Windows.

### Windows — symlinks

ACM uses file copies, not symlinks, so no elevated permissions or Developer Mode are required on Windows.

---

## Monorepo packages

| Package | Description |
|---|---|
| [`@acm/core`](./packages/core) | Zod schemas, interfaces, sync engine |
| [`@acm/sources`](./packages/sources) | `git-remote` and `local` source implementations |
| [`@acm/targets`](./packages/targets) | Claude Code target implementation |
| [`@acm/cli`](./packages/cli) | `acm` binary (Commander, Chalk, Ora) |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT
