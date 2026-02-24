import type { z } from "zod";

/**
 * A migration that transforms state from one version to another.
 */
export type Migration<TInput = unknown, TOutput extends z.ZodTypeAny = z.ZodTypeAny> = {
	version: number;
	schema: TOutput;
	up: (state: TInput) => z.infer<TOutput>;
};

/**
 * A migration with any input/output types. Used for array constraints.
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for variance in generic type constraints
export type AnyMigration = Migration<any, any>;

/**
 * Infers the input type of the first migration in a tuple.
 */
export type InferMigrationInput<T extends readonly AnyMigration[]> = T extends readonly [
	Migration<infer TInput, z.ZodTypeAny>,
	...AnyMigration[],
]
	? TInput
	: unknown;

/**
 * Infers the output type of the last migration in a tuple.
 */
export type LastMigrationOutput<T extends readonly AnyMigration[]> = T extends readonly [
	// biome-ignore lint/suspicious/noExplicitAny: Required for pattern matching with variance
	...any[],
	Migration<infer _TInput, infer TOutput>,
]
	? z.infer<TOutput>
	: unknown;

/**
 * Helper type to add version key to an object type.
 */
export type WithVersion<T, K extends string> = T & { [P in K]: number };
