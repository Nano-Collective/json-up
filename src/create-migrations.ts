import type { z } from "zod";
import type { AnyAsyncMigration, AnyMigration, AsyncMigration, Migration } from "./types.js";

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

/**
 * Builder interface for creating migration chains that support async `up()` functions.
 * Each `.add()` call accepts both sync and async `up()` functions.
 */
interface AsyncMigrationBuilder<TPrevOutput, TAccumulated extends readonly AnyAsyncMigration[]> {
	/**
	 * Add a migration to the chain.
	 * The `up()` function can be sync or async.
	 * The input type is inferred from the previous migration's output.
	 */
	add<TSchema extends z.ZodTypeAny>(migration: {
		version: number;
		schema: TSchema;
		up: (state: TPrevOutput) => z.infer<TSchema> | Promise<z.infer<TSchema>>;
	}): AsyncMigrationBuilder<
		z.infer<TSchema>,
		readonly [...TAccumulated, AsyncMigration<TPrevOutput, TSchema>]
	>;

	/**
	 * Build and return the migrations array.
	 */
	build(): TAccumulated;
}

/**
 * Internal async builder implementation.
 */
function createAsyncBuilder<TPrevOutput, TAccumulated extends readonly AnyAsyncMigration[]>(
	migrations: TAccumulated,
): AsyncMigrationBuilder<TPrevOutput, TAccumulated> {
	return {
		add<TSchema extends z.ZodTypeAny>(migration: {
			version: number;
			schema: TSchema;
			up: (state: TPrevOutput) => z.infer<TSchema> | Promise<z.infer<TSchema>>;
		}): AsyncMigrationBuilder<
			z.infer<TSchema>,
			readonly [...TAccumulated, AsyncMigration<TPrevOutput, TSchema>]
		> {
			const newMigrations = [...migrations, migration] as unknown as readonly [
				...TAccumulated,
				AsyncMigration<TPrevOutput, TSchema>,
			];
			return createAsyncBuilder<
				z.infer<TSchema>,
				readonly [...TAccumulated, AsyncMigration<TPrevOutput, TSchema>]
			>(newMigrations);
		},

		build(): TAccumulated {
			return migrations;
		},
	};
}

/**
 * Creates a builder for migration chains that support async `up()` functions.
 *
 * Use this instead of `createMigrations()` when any migration needs to perform
 * async operations. The built migrations should be passed to `migrateAsync()`.
 *
 * @example
 * ```typescript
 * const migrations = createAsyncMigrations()
 *   .add({
 *     version: 1,
 *     schema: z.object({ name: z.string() }),
 *     up: (state) => ({ name: state.name ?? "" }),
 *   })
 *   .add({
 *     version: 2,
 *     schema: z.object({ name: z.string(), key: z.string() }),
 *     up: async (state) => ({
 *       name: state.name,
 *       key: await generateKey(),
 *     }),
 *   })
 *   .build();
 *
 * const result = await migrateAsync({ state, migrations });
 * ```
 */
export function createAsyncMigrations(): AsyncMigrationBuilder<unknown, readonly []> {
	return createAsyncBuilder<unknown, readonly []>([] as const);
}
