# @nanocollective/json-up

Transform & migrate JSON data to new schemas, with type-safe validation using Zod.

Useful for local JSON that evolves over time, like app settings, saved documents, or cached data.

## Installation

```bash
npm install @nanocollective/json-up zod
```

[Docs](./docs/index.md) | [Getting Started](./docs/getting-started.md) | [API Reference](./docs/api-reference.md)

## What is a migration?

A migration is a step that transforms your data from one version to the next.
When your data structure changes over time, migrations let you upgrade old
data to match your current format.

## Example

Imagine you have user profiles stored as JSON, saved to a file.

Originally, you stored a single `name` field.

Now, in your latest app, you want to split it into `firstName` and `lastName`.

You could write `if` statements, but this gets risky as more changes come along.

So how can you safely update the state?

```typescript
import { createMigrations, migrate } from "@nanocollective/json-up";
import { z } from "zod";

// Define your migrations
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
      const [firstName = "", lastName = ""] = data.name.split(" ");
      return { firstName, lastName };
    },
  })
  .build();

// Migrate old data to the latest version
const old = { _version: 1, name: "Jane Doe" }

const result = migrate({
  state: old,
  migrations,
});

console.log(result);
// { _version: 2, firstName: "Jane", lastName: "Doe" }
```


## License

MIT
