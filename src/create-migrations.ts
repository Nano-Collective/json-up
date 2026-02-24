import type { z } from "zod";
import type { AnyMigration, Migration } from "./types.js";

/**
 * Builder interface for creating type-safe migration chains.
 * Each `.add()` call returns a new builder with updated generics.
 */
interface MigrationBuilder<TPrevOutput, TAccumulated extends readonly AnyMigration[]> {
	/**
	 * Add a migration to the chain.
	 * The input type of `up()` is inferred from the previous migration's output.
	 */
	add<TSchema extends z.ZodTypeAny>(migration: {
		version: number;
		schema: TSchema;
		up: (state: TPrevOutput) => z.infer<TSchema>;
	}): MigrationBuilder<
		z.infer<TSchema>,
		readonly [...TAccumulated, Migration<TPrevOutput, TSchema>]
	>;

	/**
	 * Build and return the migrations array.
	 */
	build(): TAccumulated;
}

/**
 * Internal builder implementation.
 */
function createBuilder<TPrevOutput, TAccumulated extends readonly AnyMigration[]>(
	migrations: TAccumulated,
): MigrationBuilder<TPrevOutput, TAccumulated> {
	return {
		add<TSchema extends z.ZodTypeAny>(migration: {
			version: number;
			schema: TSchema;
			up: (state: TPrevOutput) => z.infer<TSchema>;
		}): MigrationBuilder<
			z.infer<TSchema>,
			readonly [...TAccumulated, Migration<TPrevOutput, TSchema>]
		> {
			const newMigrations = [...migrations, migration] as unknown as readonly [
				...TAccumulated,
				Migration<TPrevOutput, TSchema>,
			];
			return createBuilder<
				z.infer<TSchema>,
				readonly [...TAccumulated, Migration<TPrevOutput, TSchema>]
			>(newMigrations);
		},

		build(): TAccumulated {
			return migrations;
		},
	};
}

/**
 * Creates a builder for type-safe migration chains.
 *
 * @example
 * ```typescript
 * const migrations = createMigrations()
 *   .add({
 *     version: 1,
 *     schema: z.object({ name: z.string() }),
 *     up: (state) => ({ name: state.name ?? "" }),
 *   })
 *   .add({
 *     version: 2,
 *     schema: z.object({ title: z.string() }),
 *     up: (state) => ({ title: state.name }),
 *   })
 *   .build();
 * ```
 */
export function createMigrations(): MigrationBuilder<unknown, readonly []> {
	return createBuilder<unknown, readonly []>([] as const);
}
