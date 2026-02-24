# Error Handling

json-up provides three error types to help you understand what went wrong during migration.

## Error types

| Error | When it's thrown |
|-------|------------------|
| `ValidationError` | Data doesn't match the schema after migration |
| `MigrationError` | The `up()` function threw an error |
| `VersionError` | Invalid migration configuration |

## ValidationError

Thrown when the output of a migration doesn't match its schema.

**Properties:**

- `version` - The version number where validation failed
- `issues` - Array of Zod validation issues

**Example:**

```typescript
import { migrate, ValidationError } from "@nanocollective/json-up";

try {
  migrate({ state, migrations });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation failed at version ${error.version}`);

    for (const issue of error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
  }
}
```

**Common causes:**

- The `up()` function returned data that doesn't match the schema
- A required field is missing from the output
- A field has the wrong type

## MigrationError

Thrown when an `up()` function throws an error.

**Properties:**

- `version` - The version number where migration failed
- `cause` - The original error thrown by `up()`

**Example:**

```typescript
import { migrate, MigrationError } from "@nanocollective/json-up";

try {
  migrate({ state, migrations });
} catch (error) {
  if (error instanceof MigrationError) {
    console.error(`Migration to version ${error.version} failed`);
    console.error("Cause:", error.cause);
  }
}
```

**Common causes:**

- Accessing a property on `undefined` or `null`
- Invalid data format in the input
- External dependency failure

## VersionError

Thrown when the migration configuration is invalid. This usually indicates a bug in how migrations are defined.

**Example:**

```typescript
import { migrate, VersionError } from "@nanocollective/json-up";

try {
  migrate({ state, migrations });
} catch (error) {
  if (error instanceof VersionError) {
    console.error("Invalid migration config:", error.message);
  }
}
```

**Common causes:**

- Empty migrations array
- Migrations not sorted by version (e.g., version 3 before version 2)
- Duplicate version numbers

## Handling all errors

Here's a complete example handling all error types:

```typescript
import {
  migrate,
  MigrationError,
  ValidationError,
  VersionError,
} from "@nanocollective/json-up";

function safelyMigrate(state: unknown) {
  try {
    return migrate({ state, migrations });
  } catch (error) {
    if (error instanceof VersionError) {
      // Configuration error - fix your migrations
      console.error("Migration setup error:", error.message);
      throw error;
    }

    if (error instanceof MigrationError) {
      // Runtime error in up() function
      console.error(`Failed migrating to v${error.version}:`, error.cause);
      throw error;
    }

    if (error instanceof ValidationError) {
      // Schema validation failed
      console.error(`Invalid data at v${error.version}:`);
      error.issues.forEach((issue) => {
        console.error(`  ${issue.path.join(".")}: ${issue.message}`);
      });
      throw error;
    }

    // Unknown error
    throw error;
  }
}
```
