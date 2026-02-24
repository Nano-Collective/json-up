import type { z } from "zod";
import type { Migration } from "./types.js";

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
