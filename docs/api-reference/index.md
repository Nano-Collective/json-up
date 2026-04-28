---
title: "API Reference"
description: "Reference for createMigrations, migrate, and the async variants"
sidebar_order: 2
---

# API Reference

## createMigrations()

Creates a builder for defining a chain of migrations with full type safety.

```typescript
import { createMigrations } from "@nanocollective/json-up";

const migrations = createMigrations()
  .add({ version: 1, schema: v1Schema, up: (data) => ({ ... }) })
  .add({ version: 2, schema: v2Schema, up: (data) => ({ ... }) })
  .build();
```

### .add(migration)

Adds a migration to the chain. Returns a new builder with updated types.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `version` | `number` | Version number for this migration (must be ascending) |
| `schema` | `ZodType` | Zod schema defining the output shape |
| `up` | `(state) => output` | Function that transforms data from previous version |

The `up` function receives the output type from the previous migration. For the first migration, the input type is `unknown`.

**Example:**

```typescript
.add({
  version: 2,
  schema: z.object({ firstName: z.string(), lastName: z.string() }),
  up: (data) => {
    // data is typed based on version 1's schema
    const [firstName, lastName] = data.name.split(" ");
    return { firstName, lastName };
  },
})
```

### .build()

Finalizes the migration chain and returns an array of migrations.

```typescript
const migrations = createMigrations()
  .add({ ... })
  .add({ ... })
  .build(); // Returns the migrations array
```

---

## createAsyncMigrations()

Creates a builder for migration chains that support async `up()` functions. Use this instead of `createMigrations()` when any migration needs to perform async operations.

Each `.add()` call accepts both sync and async `up()` functions.

```typescript
import { createAsyncMigrations } from "@nanocollective/json-up";

const migrations = createAsyncMigrations()
  .add({ version: 1, schema: v1Schema, up: (data) => ({ ... }) })
  .add({ version: 2, schema: v2Schema, up: async (data) => ({ ... }) })
  .build();
```

### .add(migration)

Adds a migration to the chain. The `up` function can return a value directly or return a `Promise`.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `version` | `number` | Version number for this migration (must be ascending) |
| `schema` | `ZodType` | Zod schema defining the output shape |
| `up` | `(state) => output \| Promise<output>` | Sync or async function that transforms data from previous version |

### .build()

Finalizes the chain and returns an array of async migrations. Pass the result to `migrateAsync()`.

---

## migrate(options)

Runs migrations on a data object, upgrading it to the latest version.

```typescript
import { migrate } from "@nanocollective/json-up";

const result = migrate({
  state: { _version: 1, name: "Jane" },
  migrations,
});
```

### Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `state` | `unknown` | (required) | The data object to migrate |
| `migrations` | `Migration[]` | (required) | Array from `createMigrations().build()` |
| `key` | `string` | `"_version"` | Field name used to store the version |

### Return value

Returns the migrated data with the version field included. The return type is inferred from the last migration's schema.

```typescript
const result = migrate({ state, migrations });
// result type: { _version: number, firstName: string, lastName: string }
```

### Errors

- `VersionError` - Migrations array is empty or versions aren't sorted
- `MigrationError` - The `up()` function threw an error
- `ValidationError` - Output didn't match the schema

See [Error Handling](../error-handling/index.md) for details.

---

## migrateAsync(options)

Runs migrations on a data object, supporting async `up()` functions. Works identically to `migrate()` but awaits each `up()` call, allowing migrations to perform async operations.

Sync migrations built with `createMigrations()` can also be passed here since `Migration` is structurally compatible with `AsyncMigration`.

```typescript
import { migrateAsync } from "@nanocollective/json-up";

const result = await migrateAsync({
  state: { _version: 1, name: "Jane" },
  migrations,
});
```

### Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `state` | `unknown` | (required) | The data object to migrate |
| `migrations` | `AsyncMigration[]` | (required) | Array from `createAsyncMigrations().build()` |
| `key` | `string` | `"_version"` | Field name used to store the version |

### Return value

Returns a `Promise` resolving to the migrated data with the version field included.

```typescript
const result = await migrateAsync({ state, migrations });
// result type: { _version: number, firstName: string, lastName: string }
```

### Errors

Throws the same errors as `migrate()`:

- `VersionError` - Migrations array is empty or versions aren't sorted
- `MigrationError` - The `up()` function threw or rejected
- `ValidationError` - Output didn't match the schema

See [Error Handling](../error-handling/index.md) for details.

---

## createMigration(migration)

A helper for creating standalone migrations with proper type inference. Useful when you're building migrations dynamically or storing them separately.

```typescript
import { createMigration } from "@nanocollective/json-up";

const v1Migration = createMigration({
  version: 1,
  schema: z.object({ name: z.string() }),
  up: (data) => ({ name: data.name ?? "" }),
});
```

This is equivalent to defining the migration object directly, but provides better TypeScript inference.

---

## createAsyncMigration(migration)

A helper for creating standalone async migrations with proper type inference. The async equivalent of `createMigration()`.

```typescript
import { createAsyncMigration } from "@nanocollective/json-up";

const v2Migration = createAsyncMigration({
  version: 2,
  schema: z.object({ name: z.string(), key: z.string() }),
  up: async (data) => ({
    name: data.name,
    key: await generateKey(),
  }),
});
```

---

## Custom version key

By default, json-up uses `_version` to track the data version. You can change this using the `key` option:

```typescript
// Data uses "schemaVersion" instead of "_version"
const data = { schemaVersion: 1, name: "Jane" };

const result = migrate({
  state: data,
  migrations,
  key: "schemaVersion",
});

// result._version doesn't exist
// result.schemaVersion === 2
```

This is useful when integrating with existing data formats that already have a version field with a different name.
