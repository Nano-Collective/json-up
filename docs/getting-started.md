# Getting Started

## What is json-up?

json-up is a TypeScript library for migrating JSON data between versions. It helps you handle schema changes gracefully by defining a series of migrations that transform data from one version to the next.

## What is a migration?

A migration describes how to transform data from one version to another. Each migration has three parts:

1. **version** - A number identifying this version (e.g., 1, 2, 3)
2. **schema** - A Zod schema that defines what the data should look like once migrated
3. **up** - A function that transforms data from the previous version to match the schema

When you call `migrate()`, the library runs each migration in order, starting from your data's current version up to the latest version.

## Installation

```bash
npm install @nanocollective/json-up zod
```

## Your first migration

Let's walk through a simple example. Suppose you're storing user settings (version `1`) and you want to add a new field (version `2`).

### Step 1: Define your migrations

```typescript
import { createMigrations } from "@nanocollective/json-up";
import { z } from "zod";

const migrations = createMigrations()
  .add({
    version: 1,
    schema: z.object({
      theme: z.enum(["light", "dark"]),
    }),
    up: (data) => ({
      theme: data.theme ?? "light",
    }),
  })
  .add({
    version: 2,
    schema: z.object({
      theme: z.enum(["light", "dark"]),
      fontSize: z.number(),
    }),
    up: (data) => ({
      ...data,
      fontSize: 14, // default value for new field
    }),
  })
  .build();
```

### Step 2: Migrate your data

```typescript
import { migrate } from "@nanocollective/json-up";

// Old data from version 1
const oldData = {
  _version: 1,
  theme: "dark",
};

// Migrate to latest version
const newData = migrate({
  state: oldData,
  migrations,
});

console.log(newData);
// { _version: 2, theme: "dark", fontSize: 14 }
```

## Understanding the version field

json-up tracks which version your data is at using a version field. By default, this field is called `_version`.

- When you call `migrate()`, it reads `_version` from your data
- It runs all migrations with a version number greater than `_version`
- After each migration, it updates `_version` to the new version number

If your data doesn't have a version field (or `_version` is missing), json-up assumes it's at version 0 and runs all migrations.

### Using a custom version key

You can use a different field name for the version:

```typescript
const result = migrate({
  state: { version: 1, theme: "dark" },
  migrations,
  key: "version", // use "version" instead of "_version"
});
```

## Next steps

- [API Reference](./api-reference.md) - Learn about all available functions
- [Error Handling](./error-handling.md) - Handle migration failures gracefully
- [Examples](./examples.md) - See common migration patterns
