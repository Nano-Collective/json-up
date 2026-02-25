# json-up

A fast, type-safe JSON migration tool with Zod schema validation.

## Features

- **Type-safe migrations for JSON** with full TypeScript inference
- **Zod schema validation** at every step
- **Fluent builder API** for migration chains
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

## Documentation

For full documentation, see [docs/index.md](docs/index.md):

- [Getting Started](docs/getting-started.md)
- [API Reference](docs/api-reference.md)
- [Error Handling](docs/error-handling.md)
- [Examples](docs/examples.md)

## Community

We're a small community-led team building local and privacy-first AI solutions under the [Nano Collective](https://nanocollective.org).

- [Contributing Guide](CONTRIBUTING.md)
- [Discord Server](https://discord.gg/ktPDV6rekE)
- [GitHub Issues](https://github.com/nano-collective/json-up/issues)
