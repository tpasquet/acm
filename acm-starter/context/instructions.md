# Coding instructions

## General

- Prefer explicit types over `any` or implicit inference
- Do not add comments that restate what the code already says
- Only add a comment when the *why* is non-obvious
- Delete dead code rather than commenting it out
- Keep functions short and focused on a single responsibility

## TypeScript

- Use `satisfies` over `as` when narrowing types
- Prefer `const` assertions for literal types
- Use `unknown` instead of `any` at system boundaries (API responses, user input)
- Enable `strict`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess`

## Testing

- Test behavior, not implementation
- Do not mock what you can use directly
- One assertion per test whenever possible

## Pull requests

- One PR per logical change
- Keep diffs small and reviewable
- Reference the issue or context in the PR description
