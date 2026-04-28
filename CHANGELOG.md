# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-04-28

### Changed

- Aligned project scaffolding with the Nano Collective's [Creating a New Project](https://docs.nanocollective.org/collective/creating-a-new-project) conventions: added `CODE_OF_CONDUCT.md`, expanded `CONTRIBUTING.md` (release process, commit conventions, stack divergence note), added issue + PR templates, `dependabot.yml`, and `CODEOWNERS`.
- Restructured `docs/` into the canonical nested layout (`getting-started/`, `api-reference/`, `error-handling/`, `examples/`) with YAML frontmatter on every page, and added `docs/community.md` and `docs/getting-started/installation.md`.
- README now includes the collective mission framing and status badges (build, coverage, version, downloads, license, repo size, stars, forks).
- Bumped `engines.node` to `>=20`.
- Reworked CI: `ci.yml` replaced by parallelised `pr-checks.yml` (format, lint, types, test+coverage, build verification, knip, audit, Semgrep, CodeQL). Added `update-badges.yml` workflow.
- Added coverage reporting via `c8` with an 80% line-coverage threshold (currently 99.29%).
- New test scripts: `test:format`, `test:types`, `test:lint`, `test:knip`, `test:audit`, `test:security`, `test:ava:coverage`.
- LICENSE copyright corrected to "Nano Collective".

No runtime or API changes.

## [0.2.0] - 2026-03-06

### Added

- `createAsyncMigrations()` builder for migration chains with async `up()` functions
- `migrateAsync()` function to run async migrations on state objects
- `createAsyncMigration()` helper for standalone async migrations
- New types: `AsyncMigration`, `AnyAsyncMigration`, `InferAsyncMigrationInput`, `LastAsyncMigrationOutput`, `MigrateAsyncOptions`
- Updated docs

## [0.1.0] - 2024-01-01

### Added

- Initial release
- `createMigrations()` builder for type-safe migration chains
- `migrate()` function to run migrations on state objects
- `createMigration()` helper for standalone migrations
- Zod schema validation for each migration step
- Custom version key support
- Error classes: `MigrationError`, `ValidationError`, `VersionError`
