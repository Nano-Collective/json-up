import type { z } from "zod";
import type { AsyncMigration, Migration } from "./types.js";

/**
 * Type helper for creating standalone migrations with proper type inference.
 *
 * @example
 * ```typescript
 * const migration = createMigration({
 *   version: 1,
 *   schema: z.object({ name: z.string() }),
 *   up: () => ({ name: "" }),
 * });
 * ```
 */
export function createMigration<TInput, TOutput extends z.ZodTypeAny>(
	migration: Migration<TInput, TOutput>,
): Migration<TInput, TOutput> {
	return migration;
}

/**
 * Type helper for creating standalone async migrations with proper type inference.
 *
 * @example
 * ```typescript
 * const migration = createAsyncMigration({
 *   version: 1,
 *   schema: z.object({ name: z.string(), key: z.string() }),
 *   up: async () => ({ name: "", key: await generateKey() }),
 * });
 * ```
 */
export function createAsyncMigration<TInput, TOutput extends z.ZodTypeAny>(
	migration: AsyncMigration<TInput, TOutput>,
): AsyncMigration<TInput, TOutput> {
	return migration;
}
