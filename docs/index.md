---
title: "json-up"
description: "Type-safe JSON migration tool with Zod schema validation"
sidebar_order: 1
---

# Documentation

Welcome to the `json-up` documentation.

## Why json-up?

When you store JSON locally, the structure inevitably changes over time. New fields get added, old ones renamed, formats evolve.

Without a migration system, you end up with scattered `if` statements checking for old formats, or worse, data that silently breaks. json-up gives you a structured way to handle these changes with type safety and validation.

## Documentation sections

### [Getting Started](./getting-started/index.md)

Start here. Learn what migrations are, install the library, and build your first migration step by step.

### [API Reference](./api-reference/index.md)

Complete reference for all functions: `createMigrations()`, `migrate()`, `createMigration()`, and their async counterparts `createAsyncMigrations()`, `migrateAsync()`, `createAsyncMigration()`.

### [Error Handling](./error-handling/index.md)

Understand the three error types (`ValidationError`, `MigrationError`, `VersionError`) and how to handle them in your code.

### [Examples](./examples/index.md)

Common patterns: renaming fields, adding defaults, restructuring nested objects, transforming arrays, and more.

### [Community](./community.md)

How to contribute, where to find us, and how to get help.
