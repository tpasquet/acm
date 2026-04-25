# @acmjs/cli

> Keep your AI coding environment consistent everywhere.

ACM (AI Context Manager) syncs your AI agent context — instructions, memory, slash commands — from a Git repository to your local tools on every machine you work on.

## Installation

```sh
npm install -g @acmjs/cli@alpha
```

## Quick start

```sh
# 1. Set up ACM with your context repo
acm init

# 2. Preview what will be deployed
acm diff

# 3. Deploy to Claude Code (~/.claude/)
acm sync

# 4. Check installed targets
acm status
```

## Examples

### First-time setup

```
$ acm init
✔ Profile name › work
✔ Source type › Git remote
✔ Git remote URL › git@github.com:you/acm-context.git
✔ Branch › main

✔ Config written. Run acm sync to deploy.
```

### Syncing context

```
$ acm sync

claude-code:
  + CLAUDE.md
  + settings.json
  ~ commands/review.md
  · commands/commit.md
```

### Previewing changes before sync

```
$ acm diff

claude-code:
  ~ CLAUDE.md   ⚠ existing content will be replaced
  · settings.json
```

```
$ acm sync --dry-run

claude-code:
  ~ CLAUDE.md   ⚠ existing content will be replaced
  · settings.json
```

### Switching profiles

```
$ acm profile list
  work   git-remote: git@github.com:you/acm-context-work.git@main
* perso  git-remote: git@github.com:you/acm-context-perso.git@main

$ acm use work

claude-code:
  ~ CLAUDE.md
  ~ settings.json
```

### Checking target status

```
$ acm status
Active profile:  work
Source:          git-remote: git@github.com:you/acm-context-work.git@main

Targets:
  ✔ Claude Code     ~/.claude            detected
```

## Commands

| Command | Description |
|---|---|
| `acm init` | Interactive setup — creates `~/.acm/config.yaml` |
| `acm sync` | Pull context and deploy to all enabled targets |
| `acm sync --dry-run` | Preview changes without writing |
| `acm diff` | Show what would change on next sync |
| `acm status` | Show active profile and target status |
| `acm profile list` | List configured profiles |
| `acm profile use <name>` | Switch active profile and sync |
| `acm use <name>` | Shorthand for `profile use` |

## Configuration

ACM reads `~/.acm/config.yaml`:

```yaml
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
        sourceDir: agents/claude   # subdirectory in the repo to deploy
        merge:
          CLAUDE.md: inject        # preserve your personal notes
          settings.json: overwrite
          commands/: overwrite

  perso:
    source:
      type: local
      path: ~/repos/acm-context-perso
    targets:
      claude:
        enabled: true
        path: ~/.claude
```

## Merge strategies

| Strategy | Behavior |
|---|---|
| `inject` | Inserts content between `<!-- acm:start -->` / `<!-- acm:end -->` markers — the rest of the file is never touched |
| `overwrite` | Replaces the entire file |
| `append` | Appends content at the end of the file |

`inject` is the default for `CLAUDE.md` — it lets you keep personal notes alongside managed content:

```markdown
# My personal notes        ← untouched by ACM
I like short answers.

<!-- acm:start -->
@context/memory.md         ← managed by ACM, replaced on every sync
@context/instructions.md
<!-- acm:end -->
```

## Context repo structure

```
your-context-repo/
├── agents/
│   └── claude/                 ← deployed to ~/.claude/
│       ├── CLAUDE.md
│       ├── settings.json
│       └── commands/
│           ├── review.md
│           └── commit.md
└── context/                    ← deployed to ~/.claude/context/
    ├── memory.md
    └── instructions.md
```

## Links

- [GitHub](https://github.com/your-org/acm)
- [Contributing](https://github.com/your-org/acm/blob/main/CONTRIBUTING.md)

## License

MIT
