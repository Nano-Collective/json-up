# @nanocollective/json-up

A TypeScript JSON migration tool with Zod schema validation.

## Installation

```bash
npm install @nanocollective/json-up zod
```

## Usage

### Define Migrations

Use `createMigrations()` for type-safe migration chains:

```typescript
import { createMigrations, migrate } from "@nanocollective/json-up";
import { z } from "zod";

const migrations = createMigrations()
  .add({
    version: 1,
    schema: z.object({ name: z.string() }),
    up: (state) => ({ name: state.name ?? "" }),
    //    ^? unknown
  })
  .add({
    version: 2,
    schema: z.object({ title: z.string() }),
    up: (state) => ({ title: state.name }),
    //    ^? { name: string }
  })
  .build();
```

Each `.add()` call infers the input type from the previous migration's output schema.

### Run Migrations

```typescript
const result = migrate({
  state: { _version: 1, name: "hello" },
  migrations,
});
//    ^? { _version: 2, title: string }
```

The return type is inferred from the last migration's schema.

### Custom Version Key

```typescript
const result = migrate({
  state: { version: 1, name: "hello" },
  migrations,
  key: "version",
});
```

### Standalone Migrations

For individual migrations without chaining:

```typescript
import { createMigration } from "@nanocollective/json-up";

const migration = createMigration({
  version: 1,
  schema: z.object({ name: z.string() }),
  up: () => ({ name: "" }),
});
```

## API

### `createMigrations()`

Creates a builder for type-safe migration chains.

- `.add(migration)` - Add a migration, returns new builder with updated types
- `.build()` - Returns the migrations array

### `migrate(options)`

Runs migrations on a state object.

**Options:**
- `state` - The object to migrate
- `migrations` - Array of migrations from `createMigrations().build()`
- `key` - Version field name (default: `"_version"`)

**Returns:** Migrated state typed to the last migration's output schema, with version field included

### `createMigration(migration)`

Type helper for standalone migrations.

## Error Handling

- `MigrationError` - Thrown when `up()` function fails
- `ValidationError` - Thrown when schema validation fails
- `VersionError` - Thrown for invalid migration configuration

```typescript
import { MigrationError, ValidationError, VersionError } from "@nanocollective/json-up";

try {
  migrate({ state, migrations });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Schema validation failed:", error.issues);
  }
}
```

## License

MIT
