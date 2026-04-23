# Git conventions

## Commit message format

```
<type>(<scope>): <short summary>

[optional body — explain WHY, not what]
```

## Types

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Tooling, deps, config (no production code change) |
| `refactor` | Restructuring without behavior change |
| `docs` | Documentation only |
| `test` | Tests only |
| `perf` | Performance improvement |

## Rules

- Summary line: imperative mood, no period, max 72 chars
- Scope is optional but encouraged: `feat(auth):`, `fix(api):`
- Body explains motivation, not mechanics
- Never commit `.env`, secrets, or generated files
- Squash fixup commits before merging
