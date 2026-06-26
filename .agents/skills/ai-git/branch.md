# ai-git branch — Manage branches

Create, switch, rename, delete, and list branches with a single command.

## Quick reference

| Action | Command |
|---|---|
| List branches | `git branch` (local), `git branch -r` (remote), `git branch -a` (all) |
| Create new branch | `git checkout -b <name>` from current HEAD |
| Switch branch | `git checkout <name>` |
| Rename branch | `git branch -m <old> <new>` |
| Delete branch | `git branch -d <name>` (merged) / `git branch -D <name>` (force) |
| Delete remote branch | `git push origin --delete <name>` |

## Workflow

1. Ask user what they want to do (create, switch, rename, delete, list).
2. Confirm branch name. For create: confirm base branch (default = current).
3. Show the exact `git` command before running it.
4. Execute. Confirm result.
5. Never delete a branch without showing unmerged commits first.
