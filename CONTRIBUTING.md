# Contributing to json-up

Thanks for your interest in contributing to json-up! We welcome contributions from developers of all skill levels — code, documentation, bug reports, and feature suggestions are all valued.

json-up is part of the [Nano Collective](https://nanocollective.org). By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Table of Contents

- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Releasing a New Version](#releasing-a-new-version)
- [Stack Divergence](#stack-divergence)
- [Community](#community)

## Requirements

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/) 10+
- [Git](https://git-scm.com/)

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally.
3. Install dependencies with `npm install`.
4. Build the project with `npm run build`.
5. Run the full test gate with `npm run test:all`.

## How to Contribute

### Finding work

Browse our [open issues](https://github.com/nano-collective/json-up/issues). If you find an unassigned issue you'd like to work on, comment on it to let us know you're picking it up.

### Working on an issue

1. **Check for a spec.** Some issues include a specification or implementation details. Feel free to follow it or propose alternatives if you have a better approach.
2. **No spec? Write one.** If the issue lacks a spec, draft one and post it in the issue comments for discussion before starting work.
3. **Submit a PR.** When ready, open a pull request referencing the issue. We'll review it and work with you to get it merged.

## Development Workflow

1. Create a new branch for your work (`git checkout -b feat/my-thing`).
2. Make your changes following the existing code style.
3. Run `npm run test:all` to confirm the full gate is green.
4. Commit using the [commit message convention](#commit-messages) below.
5. Push to your fork and open a pull request against `main`.

## Testing

We use [AVA](https://github.com/avajs/ava) for testing with TypeScript support via `tsx`. All new features and bug fixes should include appropriate tests.

- Test files use the `.spec.ts` extension and live alongside the source code (e.g. `src/migrate.spec.ts`).
- Run the full suite with `npm run test:ava`.
- Run with coverage via `npm run test:ava:coverage` (line coverage threshold: 80%).
- The full local gate is `npm run test:all` — formatting check, type check, lint, tests, dead code (Knip), dependency audit.

All tests must pass before a PR can merge. Bug fixes should include a regression test wherever possible.

## Code Style

- TypeScript with `strict: true` and ESM.
- Code is auto-formatted with [Biome](https://biomejs.dev/). Run `npm run format` to apply, or `npm run lint` to check.
- Use descriptive variable and function names; avoid `any`.
- Prefer editing existing files over creating new ones.

## Commit Messages

Commits follow a lightweight convention derived from Conventional Commits:

- `feat: <description>` — new feature
- `fix: <description>` — bug fix
- `mod: <description>` — modification or update to existing behaviour
- `chore(deps): <description>` — dependency update
- `docs: <description>` — documentation-only change
- Scope is optional in parentheses, e.g. `feat(migrate): ...`.
- Lowercase, imperative mood, no trailing period.
- Release commits: `release: vX.Y.Z`.
- Automated updates can use `[skip ci]`.

## Releasing a New Version

> **Releases are handled exclusively by maintainers.** Contributors should not bump the version or edit the changelog for a release. If your PR is ready and you think a release is warranted, say so in the PR description and a maintainer will pick it up.

The release flow is three steps and runs from `main`:

1. **Verify the gate is green** — `npm run test:all` from a clean working tree.
2. **Update `CHANGELOG.md`** — add an entry at the top following the existing [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format. Focus on user-facing impact.
3. **Bump `version` in `package.json`** following [semver](https://semver.org/):
   - **Patch** (`0.2.0` → `0.2.1`) — bug fixes only.
   - **Minor** (`0.2.0` → `0.3.0`) — new features, backwards-compatible.
   - **Major** (`0.2.0` → `1.0.0`) — breaking changes.

Commit the changelog and version bump together: `git commit -m "release: vX.Y.Z"`. Pushing to `main` triggers `release.yml`, which detects the version change, runs the gate, publishes to npm, and creates a GitHub Release.

## Stack Divergence

The Nano Collective's [stack suggestions](https://docs.nanocollective.org/collective/stack-suggestions) recommend `pnpm` as the default package manager for TypeScript projects. **json-up uses `npm`** because it is a small, dependency-light library and the marginal benefit of pnpm's content-addressable store is negligible at this scale. If this repo grows or starts adopting workspaces, we'll revisit.

Everything else (Biome, AVA, Knip, ESM, strict TypeScript) follows the collective's defaults.

## Community

- **GitHub Issues:** bug reports, feature requests, and questions.
- **Discord:** [Join the Nano Collective Discord](https://discord.gg/ktPDV6rekE) for real-time discussion.
- **Code of Conduct:** see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

Thanks again — your contributions keep json-up healthy and useful for the community.
