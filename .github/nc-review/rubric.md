# nc-review rubric — json-up

This is the **project** half of the rubric: what json-up cares about. The
reviewing method — how to read a diff against a base checkout, how to rate
severity, what to emit — is the shared base rubric you were also given. Read
both; where they disagree, this file wins.

## What this project is, and why that changes review

json-up runs ordered, versioned migrations over JSON documents, validating each
step against a Zod schema. It is a small library with an outsized blast radius:
it is the thing other people point at **their users' data**.

Two consequences.

**Migrations are destructive by nature.** A migration that mangles a field does
not throw — it produces a document that validates, and the original is gone.
Downstream, the corruption surfaces days later as a support ticket nobody can
trace back. Weigh anything that can silently produce a wrong-but-valid document
as `blocking`.

**This is a library, so its types are its interface.** A change to the generic
signatures in `src/types.ts` is a change to every consumer's compile, and the
inference helpers — `InferMigrationInput`, `LastMigrationOutput` and their async
twins — are the part people actually rely on. Treat them as contract, not
implementation.

## Where to look hardest

### Ordering and version detection

Migrations are ordered and each is meant to run exactly once, in sequence. Ask,
for any change near the runner:

- Can a migration be **skipped** — wrong start version, an off-by-one on the
  version comparison, a document whose version field is missing or not a number?
- Can one run **twice**? Most migrations are not idempotent, and running an
  "add a field with a default" step twice is usually harmless while running a
  "split this string into two" step twice is not.
- Is the **order** stable and explicit, or does it depend on object key order or
  array position that a consumer could get wrong without being told?

### Partial failure

If migration three of five throws, what does the caller receive? A half-migrated
document that still validates against an intermediate schema is the dangerous
outcome, because it looks like a success to anything that only checks the
schema. The result should make it unambiguous which version the document is now
at, and a change that blurs that is a finding.

The async path (`migrate-async.ts`) has the same question with more ways to go
wrong: rejected promises, partial application, and whether a failure part-way
leaves anything mutated.

### Mutation

Check whether the input document is mutated in place. A consumer passing an
object they still hold a reference to should not find it changed underneath
them, and a migration that mutates its input makes retry and rollback
impossible. If a diff introduces mutation for performance, that is a trade worth
naming out loud rather than making silently.

### Zod validation is the safety net — do not widen it

Validation between steps is what stops a bad migration propagating. A change
that makes a schema more permissive, catches and swallows a `ZodError`, or skips
validation on a path for speed removes the only check standing between a wrong
transform and the caller's data. That is `blocking` unless the PR argues for it
explicitly.

### Errors

`errors.ts` is a public surface. Consumers branch on these. Changing a message
is cosmetic; changing a type, a code, or when one is thrown is a contract change.

## Public contracts

Breaking these is `blocking` without a changeset and a deliberate bump:

- Everything exported from `src/index.ts`.
- The generic signatures and inference helpers in `src/types.ts`.
- The `Migration` / `AsyncMigration` shape — this is what consumers author
  against.
- Error types and codes from `errors.ts`.
- The version-field convention (`WithVersion`) and how a document's current
  version is determined.

This package is at `0.2.x` and pre-1.0, so a break is permitted — but it must be
deliberate, in the changeset, and worth it.

## Tests

Tests are colocated as `src/**/*.spec.ts`.

Coverage here is the highest in the collective, around 99%, which sets the
expectation rather than relieving it: a change arriving without tests stands out.

For a migration-runner change, the tests that carry weight are:

- a **chain of three or more** migrations, not a single step
- the **failure part-way** case, asserting what the caller can tell afterwards
- the **already-migrated** case — running the chain against a document that is
  already at the latest version must be a no-op
- a **type-level** expectation where inference changed, since a signature
  regression will not show up in a runtime test at all

## Scope

The package is deliberately small. A PR adding surface area — new options,
new exported helpers — should say why the caller cannot compose it from what
exists. Small is a feature here, not an oversight.
