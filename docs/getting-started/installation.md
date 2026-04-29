---
title: "Installation"
description: "Install json-up via your preferred package manager"
sidebar_order: 2
---

# Installation

`json-up` is published to npm under the `@nanocollective` scope. It declares `zod` as a peer dependency, so you'll install both.

## Requirements

- **Node.js** 20 or newer
- **TypeScript** 5+ (recommended — the library is written in TypeScript and ships with full type definitions)
- **Zod** 3 or 4

## npm

```bash
npm install @nanocollective/json-up zod
```

## pnpm

```bash
pnpm add @nanocollective/json-up zod
```

## Yarn

```bash
yarn add @nanocollective/json-up zod
```

## Bun

```bash
bun add @nanocollective/json-up zod
```

## Verifying your install

After installing, you should be able to import and use the library:

```typescript
import { createMigrations, migrate } from "@nanocollective/json-up";
import { z } from "zod";

const migrations = createMigrations()
  .add({
    version: 1,
    schema: z.object({ hello: z.string() }),
    up: () => ({ hello: "world" }),
  })
  .build();

console.log(migrate({ state: {}, migrations }));
// { _version: 1, hello: "world" }
```

If you hit errors, see [Error Handling](../error-handling.md) or open an [issue](https://github.com/nano-collective/json-up/issues).
