---
trigger: always_on
---

# Git Rules

## Core Principle

Git is the source of development history.

Keep the repository clean and recoverable.

## Before Work

Check:

```bash
git status
```

## Commit Standards

- Make small, meaningful, test-verified commits.
- Never commit secrets, credentials, API keys, private tokens, or uploaded confidential documents.
- Keep commit messages concise, descriptive, and aligned with the completed phase or component.

## Git Hygiene

- Maintain a clean working directory before transitioning between development phases.
- Add `.gitignore` to prevent committing node_modules, build artifacts, temporary scratch files, or test outputs.