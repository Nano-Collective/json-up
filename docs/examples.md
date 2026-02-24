# Examples

Common migration patterns for transforming JSON data.

## User profile evolution

Split a single `name` field into `firstName` and `lastName`:

```typescript
import { createMigrations, migrate } from "@nanocollective/json-up";
import { z } from "zod";

const migrations = createMigrations()
  .add({
    version: 1,
    schema: z.object({ name: z.string() }),
    up: (data) => ({ name: data.name ?? "Unknown" }),
  })
  .add({
    version: 2,
    schema: z.object({ firstName: z.string(), lastName: z.string() }),
    up: (data) => {
      const parts = data.name.split(" ");
      return {
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" "),
      };
    },
  })
  .build();

const result = migrate({
  state: { _version: 1, name: "Jane Doe" },
  migrations,
});
// { _version: 2, firstName: "Jane", lastName: "Doe" }
```

## Adding new fields with defaults

Add a new optional feature to existing data:

```typescript
const migrations = createMigrations()
  .add({
    version: 1,
    schema: z.object({
      email: z.string(),
    }),
    up: (data) => ({
      email: data.email ?? "",
    }),
  })
  .add({
    version: 2,
    schema: z.object({
      email: z.string(),
      notifications: z.boolean(),
    }),
    up: (data) => ({
      ...data,
      notifications: true, // default to enabled
    }),
  })
  .build();
```

## Renaming fields

Rename a field while preserving its value:

```typescript
const migrations = createMigrations()
  .add({
    version: 1,
    schema: z.object({ userName: z.string() }),
    up: (data) => ({ userName: data.userName ?? "" }),
  })
  .add({
    version: 2,
    schema: z.object({ username: z.string() }), // lowercase
    up: (data) => ({
      username: data.userName,
    }),
  })
  .build();
```

## Transforming arrays

Convert an array of strings to an array of objects:

```typescript
const migrations = createMigrations()
  .add({
    version: 1,
    schema: z.object({
      tags: z.array(z.string()),
    }),
    up: (data) => ({
      tags: Array.isArray(data.tags) ? data.tags : [],
    }),
  })
  .add({
    version: 2,
    schema: z.object({
      tags: z.array(
        z.object({
          name: z.string(),
          color: z.string(),
        })
      ),
    }),
    up: (data) => ({
      tags: data.tags.map((name) => ({
        name,
        color: "gray", // default color
      })),
    }),
  })
  .build();

const result = migrate({
  state: { _version: 1, tags: ["work", "urgent"] },
  migrations,
});
// {
//   _version: 2,
//   tags: [
//     { name: "work", color: "gray" },
//     { name: "urgent", color: "gray" }
//   ]
// }
```

## Nested object changes

Restructure nested data:

```typescript
const migrations = createMigrations()
  .add({
    version: 1,
    schema: z.object({
      street: z.string(),
      city: z.string(),
      zip: z.string(),
    }),
    up: (data) => ({
      street: data.street ?? "",
      city: data.city ?? "",
      zip: data.zip ?? "",
    }),
  })
  .add({
    version: 2,
    schema: z.object({
      address: z.object({
        street: z.string(),
        city: z.string(),
        zip: z.string(),
      }),
    }),
    up: (data) => ({
      address: {
        street: data.street,
        city: data.city,
        zip: data.zip,
      },
    }),
  })
  .build();

const result = migrate({
  state: { _version: 1, street: "123 Main St", city: "NYC", zip: "10001" },
  migrations,
});
// {
//   _version: 2,
//   address: { street: "123 Main St", city: "NYC", zip: "10001" }
// }
```

## Custom version key

If your data already uses a field like `version` or `schemaVersion`:

```typescript
const migrations = createMigrations()
  .add({
    version: 1,
    schema: z.object({ name: z.string() }),
    up: (data) => ({ name: data.name ?? "" }),
  })
  .add({
    version: 2,
    schema: z.object({ name: z.string(), active: z.boolean() }),
    up: (data) => ({ ...data, active: true }),
  })
  .build();

// Data uses "version" instead of "_version"
const data = { version: 1, name: "Jane" };

const result = migrate({
  state: data,
  migrations,
  key: "version",
});
// { version: 2, name: "Jane", active: true }
```

## Migrating from unversioned data

Handle data that doesn't have a version field yet:

```typescript
const migrations = createMigrations()
  .add({
    version: 1,
    schema: z.object({ name: z.string() }),
    up: (data) => ({
      // Handle both old unversioned format and explicit v0
      name: typeof data === "object" && data !== null && "name" in data
        ? String(data.name)
        : "Unknown",
    }),
  })
  .build();

// No _version field - treated as version 0
const legacyData = { name: "Jane" };

const result = migrate({
  state: legacyData,
  migrations,
});
// { _version: 1, name: "Jane" }
```
