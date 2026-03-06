import { z } from "zod";
import { MigrationError, ValidationError, VersionError } from "./errors.js";
import type {
	AnyAsyncMigration,
	AnyMigration,
	LastAsyncMigrationOutput,
	LastMigrationOutput,
	WithVersion,
} from "./types.js";

/**
 * Options for the migrate function.
 */
export interface MigrateOptions<
	TMigrations extends readonly AnyMigration[],
	TKey extends string = "_version",
> {
	/** The state object to migrate */
	state: unknown;
	/** Array of migrations to apply */
	migrations: TMigrations;
	/** The key used to store the version (default: "_version") */
	key?: TKey;
}

/**
 * Migrates a state object through a series of migrations.
 *
 * @param options - Migration options
 * @returns The migrated state with the version field
 *
 * @throws {VersionError} If migrations array is empty or unsorted
 * @throws {MigrationError} If an `up()` function throws
 * @throws {ValidationError} If schema validation fails
 *
 * @example
 * ```typescript
 * const result = migrate({
 *   state: { _version: 1, name: "hello" },
 *   migrations,
 * });
 * ```
 */
export function migrate<
	TMigrations extends readonly AnyMigration[],
	TKey extends string = "_version",
>(options: MigrateOptions<TMigrations, TKey>): WithVersion<LastMigrationOutput<TMigrations>, TKey> {
	const { state, migrations, key = "_version" as TKey } = options;

	// Validate migrations array
	if (migrations.length === 0) {
		throw new VersionError("Migrations array cannot be empty");
	}

	// Check migrations are sorted by version
	for (let i = 1; i < migrations.length; i++) {
		const prev = migrations[i - 1];
		const curr = migrations[i];
		if (prev && curr && prev.version >= curr.version) {
			throw new VersionError(
				`Migrations must be sorted by version in ascending order. Found version ${prev.version} before ${curr.version}`,
			);
		}
	}

	// Get current version from state
	let currentVersion = 0;
	if (state !== null && typeof state === "object" && key in state) {
		const version = (state as Record<string, unknown>)[key];
		if (typeof version === "number") {
			currentVersion = version;
		}
	}

	// Find migrations to apply
	const migrationsToApply = migrations.filter((m) => m.version > currentVersion);

	// Run migrations sequentially
	let currentState: unknown = state;

	for (const migration of migrationsToApply) {
		// Run the up function
		let result: unknown;
		try {
			result = migration.up(currentState);
		} catch (error) {
			throw new MigrationError(migration.version, error);
		}

		// Add version to result
		if (result !== null && typeof result === "object") {
			(result as Record<string, unknown>)[key] = migration.version;
		}

		// Validate against schema with version field
		const schemaWithVersion = migration.schema.and(
			z.object({ [key]: z.literal(migration.version) }),
		);

		const parseResult = schemaWithVersion.safeParse(result);
		if (!parseResult.success) {
			throw new ValidationError(migration.version, parseResult.error.issues);
		}

		currentState = parseResult.data;
	}

	return currentState as WithVersion<LastMigrationOutput<TMigrations>, TKey>;
}

/**
 * Options for the migrateAsync function.
 */
export interface MigrateAsyncOptions<
	TMigrations extends readonly AnyAsyncMigration[],
	TKey extends string = "_version",
> {
	/** The state object to migrate */
	state: unknown;
	/** Array of migrations to apply (sync or async `up()` functions) */
	migrations: TMigrations;
	/** The key used to store the version (default: "_version") */
	key?: TKey;
}

/**
 * Migrates a state object through a series of migrations, supporting async `up()` functions.
 *
 * Works identically to `migrate()` but awaits each `up()` call, allowing migrations
 * to perform async operations (database calls, network requests, etc.).
 *
 * Sync migrations built with `createMigrations()` can also be passed here since
 * `Migration` is structurally compatible with `AsyncMigration`.
 *
 * @param options - Migration options
 * @returns A promise resolving to the migrated state with the version field
 *
 * @throws {VersionError} If migrations array is empty or unsorted
 * @throws {MigrationError} If an `up()` function throws or rejects
 * @throws {ValidationError} If schema validation fails
 *
 * @example
 * ```typescript
 * const result = await migrateAsync({
 *   state: { _version: 1, name: "hello" },
 *   migrations,
 * });
 * ```
 */
export async function migrateAsync<
	TMigrations extends readonly AnyAsyncMigration[],
	TKey extends string = "_version",
>(
	options: MigrateAsyncOptions<TMigrations, TKey>,
): Promise<WithVersion<LastAsyncMigrationOutput<TMigrations>, TKey>> {
	const { state, migrations, key = "_version" as TKey } = options;

	// Validate migrations array
	if (migrations.length === 0) {
		throw new VersionError("Migrations array cannot be empty");
	}

	// Check migrations are sorted by version
	for (let i = 1; i < migrations.length; i++) {
		const prev = migrations[i - 1];
		const curr = migrations[i];
		if (prev && curr && prev.version >= curr.version) {
			throw new VersionError(
				`Migrations must be sorted by version in ascending order. Found version ${prev.version} before ${curr.version}`,
			);
		}
	}

	// Get current version from state
	let currentVersion = 0;
	if (state !== null && typeof state === "object" && key in state) {
		const version = (state as Record<string, unknown>)[key];
		if (typeof version === "number") {
			currentVersion = version;
		}
	}

	// Find migrations to apply
	const migrationsToApply = migrations.filter((m) => m.version > currentVersion);

	// Run migrations sequentially
	let currentState: unknown = state;

	for (const migration of migrationsToApply) {
		// Run the up function (await handles both sync and async)
		let result: unknown;
		try {
			result = await migration.up(currentState);
		} catch (error) {
			throw new MigrationError(migration.version, error);
		}

		// Add version to result
		if (result !== null && typeof result === "object") {
			(result as Record<string, unknown>)[key] = migration.version;
		}

		// Validate against schema with version field
		const schemaWithVersion = migration.schema.and(
			z.object({ [key]: z.literal(migration.version) }),
		);

		const parseResult = schemaWithVersion.safeParse(result);
		if (!parseResult.success) {
			throw new ValidationError(migration.version, parseResult.error.issues);
		}

		currentState = parseResult.data;
	}

	return currentState as WithVersion<LastAsyncMigrationOutput<TMigrations>, TKey>;
}
