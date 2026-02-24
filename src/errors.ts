import type { ZodIssue } from "zod";

/**
 * Error thrown when an `up()` function fails during migration.
 */
export class MigrationError extends Error {
	readonly version: number;
	readonly cause: unknown;

	constructor(version: number, cause: unknown) {
		const message =
			cause instanceof Error
				? `Migration to version ${version} failed: ${cause.message}`
				: `Migration to version ${version} failed`;
		super(message);
		this.name = "MigrationError";
		this.version = version;
		this.cause = cause;
	}
}

/**
 * Error thrown when schema validation fails after a migration.
 */
export class ValidationError extends Error {
	readonly version: number;
	readonly issues: ZodIssue[];

	constructor(version: number, issues: ZodIssue[]) {
		const message = `Validation failed for version ${version}: ${issues.map((i) => i.message).join(", ")}`;
		super(message);
		this.name = "ValidationError";
		this.version = version;
		this.issues = issues;
	}
}

/**
 * Error thrown for invalid migration configuration.
 */
export class VersionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "VersionError";
	}
}
