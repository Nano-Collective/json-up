# json-up

A fast, type-safe JSON migration tool with Zod schema validation — built by the [Nano Collective](https://nanocollective.org), a community collective building AI tooling not for profit, but for the community. Everything we ship is open, transparent, and driven by the people who use it.

---

![Build Status](https://github.com/nano-collective/json-up/raw/main/badges/build.svg)
![Coverage](https://github.com/nano-collective/json-up/raw/main/badges/coverage.svg)
![Version](https://github.com/nano-collective/json-up/raw/main/badges/npm-version.svg)
![NPM Downloads](https://github.com/nano-collective/json-up/raw/main/badges/npm-downloads-monthly.svg)
![NPM License](https://github.com/nano-collective/json-up/raw/main/badges/npm-license.svg)
![Repo Size](https://github.com/nano-collective/json-up/raw/main/badges/repo-size.svg)
![Stars](https://github.com/nano-collective/json-up/raw/main/badges/stars.svg)
![Forks](https://github.com/nano-collective/json-up/raw/main/badges/forks.svg)

## Features

- **Type-safe migrations for JSON** with full TypeScript inference
- **Zod schema validation** at every step
- **Fluent builder API** for migration chains
- **Async migration support** for migrations that need async operations
- **Automatic version tracking**
- **Zero runtime dependencies** (only Zod as peer)

## Installation

```bash
npm install @nanocollective/json-up zod
```

## Quick Start

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
      const [firstName = "", lastName = ""] = data.name.split(" ");
      return { firstName, lastName };
    },
  })
  .build();

const result = migrate({
  state: { _version: 1, name: "Jane Doe" },
  migrations,
});

console.log(result);
// { _version: 2, firstName: "Jane", lastName: "Doe" }
```

### Async migrations

When your migrations need to perform async operations, use the async API:

```typescript
import { createAsyncMigrations, migrateAsync } from "@nanocollective/json-up";
import { z } from "zod";

const migrations = createAsyncMigrations()
  .add({
    version: 1,
    schema: z.object({ name: z.string() }),
    up: (data) => ({ name: data.name ?? "" }),
  })
  .add({
    version: 2,
    schema: z.object({ name: z.string(), key: z.string() }),
    up: async (data) => ({
      name: data.name,
      key: await generateKey(),
    }),
  })
  .build();

const result = await migrateAsync({ state, migrations });
```

## Documentation

For full documentation, see [docs/index.md](docs/index.md):

- [Getting Started](docs/getting-started/index.md)
- [API Reference](docs/api-reference.md)
- [Error Handling](docs/error-handling.md)
- [Examples](docs/examples.md)
- [Community](docs/community.md)

## Community

We'd love your help. The Nano Collective is a community collective building AI tooling for the community, not for profit.

- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Discord Server](https://discord.gg/ktPDV6rekE)
- [GitHub Issues](https://github.com/nano-collective/json-up/issues)
