# ai-git pr — Create GitHub PR

Create a GitHub Pull Request from the current branch. Title and description
are auto-generated from commits. **Does NOT auto-release** — PR and release
are separate workflows. If the user wants a release, they call `@ai-git --release`.

## Requirements

- `gh` CLI installed and authenticated (`gh auth status`)
- Current branch is NOT the base branch (main/master)

## Workflow

1. Detect current branch: `git branch --show-current`
2. Determine base branch: ask user or default to `main` (check existence with `git show-ref --verify refs/heads/main`)
3. Get commits since base: `git log <base>..HEAD --oneline`
4. Generate PR title: use first commit's subject line
5. Generate PR description: bullet list of all commit subjects + body if present
6. Show preview to user:
   ```
   Branch: feature/xyz → main
   Title: <first commit subject>
   Description:
   - commit 1
   - commit 2
   ```
7. On confirm: `gh pr create --base <base> --title "<title>" --body "<description>"`
8. Confirm result: print PR URL and stop.
9. **Do NOT** call `--release`, `git tag`, or any post-PR action.
