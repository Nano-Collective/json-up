---
name: Bug Report
about: Report a bug or unexpected behaviour
title: '[Bug] '
labels: bug
assignees: ''
---

## Description

Brief description of the bug.

## Environment

- **OS**: (e.g. macOS 14.0, Ubuntu 22.04, Windows 11)
- **Node version**: (run `node --version`)
- **json-up version**: (from your `package.json`)
- **Zod version**: (peer dependency — from your `package.json`)
- **TypeScript version**: (run `npx tsc --version`)

## Reproduction

Minimal code sample or steps to reproduce. A self-contained snippet is best:

```ts
import { createMigrations, migrate } from "@nanocollective/json-up";
// ...
```

## Expected Behaviour

What you expected to happen.

## Actual Behaviour

What actually happened — include the full error message and stack trace if relevant.

## Additional Context

- [ ] I have searched existing issues to ensure this is not a duplicate
- [ ] I can reproduce this issue consistently
- [ ] This issue occurs with the latest version of `@nanocollective/json-up`
