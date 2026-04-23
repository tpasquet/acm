# acm-starter

This is the template repository for [ACM](https://github.com/your-org/acm). Fork it, customize it, and point ACM at it.

## Setup

1. Fork this repo (keep it private if your context is sensitive)
2. Clone it locally or use it directly as a git remote
3. Run `acm init` and provide the URL of your fork

## What to customize

### `context/memory.md`

Fill in your identity, stack, and working style. Claude Code will use this to personalize its responses.

### `context/instructions.md`

Your global coding rules — style preferences, patterns to follow or avoid, testing philosophy.

### `context/conventions/git.md`

Your commit message format and branch naming conventions.

### `agents/claude/CLAUDE.md`

The file deployed to `~/.claude/CLAUDE.md`. By default it imports your shared context files with `@context/...`. Add or remove imports here.

### `agents/claude/settings.json`

Claude Code settings (model, theme, etc.). Deployed verbatim with `overwrite` strategy.

### `agents/claude/commands/`

Slash commands available in Claude Code. Add a `.md` file per command. Each file is the prompt that runs when you type `/<filename>` in Claude Code.

## Adding a new slash command

Create a file in `agents/claude/commands/`:

```
agents/claude/commands/standup.md
```

Content:
```markdown
Summarize what I worked on today based on git log and open files.
Format it as a bullet list suitable for a standup message.
```

Then run `acm sync` to deploy it.

## Directory structure

```
acm-starter/
├── acm.yaml                        ← repo manifest (do not delete)
├── agents/
│   └── claude/                     ← deployed to ~/.claude/
│       ├── CLAUDE.md
│       ├── settings.json
│       └── commands/
│           ├── review.md
│           └── commit.md
└── context/                        ← shared knowledge (agent-agnostic)
    ├── memory.md
    ├── instructions.md
    └── conventions/
        └── git.md
```
