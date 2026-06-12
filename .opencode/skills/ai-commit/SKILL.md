---
name: ai-commit
description: Stage all changes and create a conventional commit. Triggers on "@ai-commit".
---

## Workflow

1. Run `git diff --stat` and `git diff` to see changes
2. Generate a conventional commit message based on the changes
3. Run `git add . && git commit -m "<type>: <description>"
4. Confirm to the user

## Commit types

feat, fix, docs, style, refactor, perf, test, chore
