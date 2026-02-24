# Documentation

Welcome to the `json-up` documentation.

## Why json-up?

When you store JSON locally, the structure inevitably changes over time. New fields get added, old ones renamed, formats evolve.

Without a migration system, you end up with scattered `if` statements checking for old formats, or worse, data that silently breaks. json-up gives you a structured way to handle these changes with type safety and validation.

## Documentation sections

### [Getting Started](./getting-started.md)

Start here. Learn what migrations are, install the library, and build your first migration step by step.

### [API Reference](./api-reference.md)

Complete reference for all functions: `createMigrations()`, `migrate()`, `createMigration()`, and their options.

### [Error Handling](./error-handling.md)

Understand the three error types (`ValidationError`, `MigrationError`, `VersionError`) and how to handle them in your code.

### [Examples](./examples.md)

Common patterns: renaming fields, adding defaults, restructuring nested objects, transforming arrays, and more.
