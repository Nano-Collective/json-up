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

See [Error Handling](./error-handling.md) for details.

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
