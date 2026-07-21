import test from "ava";
import { z } from "zod";
import {
	createMigrations,
	MigrationError,
	migrate,
	ValidationError,
	VersionError,
} from "./index.js";

test("single migration on empty state", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ name: z.string() }),
			up: () => ({ name: "default" }),
		})
		.build();

	const result = migrate({ state: {}, migrations });

	t.deepEqual(result, { _version: 1, name: "default" });
});

test("multiple migrations sequentially", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ name: z.string() }),
			up: () => ({ name: "initial" }),
		})
		.add({
			version: 2,
			schema: z.object({ title: z.string() }),
			up: (state) => ({ title: state.name.toUpperCase() }),
		})
		.add({
			version: 3,
			schema: z.object({ title: z.string(), count: z.number() }),
			up: (state) => ({ title: state.title, count: 0 }),
		})
		.build();

	const result = migrate({ state: {}, migrations });

	t.deepEqual(result, { _version: 3, title: "INITIAL", count: 0 });
});

test("skip already-applied migrations based on version", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ name: z.string() }),
			up: () => ({ name: "should not run" }),
		})
		.add({
			version: 2,
			schema: z.object({ title: z.string() }),
			up: (state) => ({ title: (state as { name: string }).name }),
		})
		.build();

	const result = migrate({
		state: { _version: 1, name: "existing" },
		migrations,
	});

	t.deepEqual(result, { _version: 2, title: "existing" });
});

test("custom version key", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ data: z.string() }),
			up: () => ({ data: "test" }),
		})
		.build();

	const result = migrate({
		state: {},
		migrations,
		key: "schemaVersion",
	});

	t.deepEqual(result, { schemaVersion: 1, data: "test" });
});

test("custom version key - skip applied migrations", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ data: z.string() }),
			up: () => ({ data: "v1" }),
		})
		.add({
			version: 2,
			schema: z.object({ data: z.string(), extra: z.boolean() }),
			up: (state) => ({ data: state.data, extra: true }),
		})
		.build();

	const result = migrate({
		state: { schemaVersion: 1, data: "existing" },
		migrations,
		key: "schemaVersion",
	});

	t.deepEqual(result, { schemaVersion: 2, data: "existing", extra: true });
});

test("schema validation error", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ name: z.string().min(5) }),
			up: () => ({ name: "ab" }), // Too short
		})
		.build();

	const error = t.throws(() => migrate({ state: {}, migrations }), { instanceOf: ValidationError });

	t.is(error?.version, 1);
	t.true((error?.issues?.length ?? 0) > 0);
});

test("up function error", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ name: z.string() }),
			up: () => {
				throw new Error("Migration failed");
			},
		})
		.build();

	const error = t.throws(() => migrate({ state: {}, migrations }), { instanceOf: MigrationError });

	t.is(error?.version, 1);
	t.true(error?.message.includes("Migration failed"));
});

test("empty migrations array throws VersionError", (t) => {
	const migrations = createMigrations().build();

	t.throws(() => migrate({ state: {}, migrations }), {
		instanceOf: VersionError,
		message: "Migrations array cannot be empty",
	});
});

test("unsorted migrations throw VersionError", (t) => {
	// Manually create unsorted migrations (bypassing builder type safety)
	const migrations = [
		{
			version: 2,
			schema: z.object({ name: z.string() }),
			up: () => ({ name: "" }),
		},
		{
			version: 1,
			schema: z.object({ name: z.string() }),
			up: () => ({ name: "" }),
		},
	] as const;

	t.throws(() => migrate({ state: {}, migrations }), {
		instanceOf: VersionError,
		message: /must be sorted by version/,
	});
});

test("duplicate versions throw VersionError", (t) => {
	const migrations = [
		{
			version: 1,
			schema: z.object({ name: z.string() }),
			up: () => ({ name: "" }),
		},
		{
			version: 1,
			schema: z.object({ title: z.string() }),
			up: () => ({ title: "" }),
		},
	] as const;

	t.throws(() => migrate({ state: {}, migrations }), {
		instanceOf: VersionError,
		message: /must be sorted by version/,
	});
});

test("null state handling", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ initialized: z.boolean() }),
			up: () => ({ initialized: true }),
		})
		.build();

	const result = migrate({ state: null, migrations });

	t.deepEqual(result, { _version: 1, initialized: true });
});

test("undefined state handling", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ initialized: z.boolean() }),
			up: () => ({ initialized: true }),
		})
		.build();

	const result = migrate({ state: undefined, migrations });

	t.deepEqual(result, { _version: 1, initialized: true });
});

test("primitive state handling", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ value: z.number() }),
			up: (state) => ({ value: typeof state === "number" ? state : 0 }),
		})
		.build();

	const result = migrate({ state: 42, migrations });

	t.deepEqual(result, { _version: 1, value: 42 });
});

test("state with non-numeric version is treated as version 0", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ data: z.string() }),
			up: () => ({ data: "migrated" }),
		})
		.build();

	const result = migrate({
		state: { _version: "invalid" },
		migrations,
	});

	t.deepEqual(result, { _version: 1, data: "migrated" });
});

test("preserves existing data through migrations", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({
				name: z.string(),
				email: z.string().optional(),
			}),
			up: (state) => {
				const s = state as { name?: string; email?: string };
				return {
					name: s.name ?? "unknown",
					email: s.email,
				};
			},
		})
		.build();

	const result = migrate({
		state: { name: "John", email: "john@example.com" },
		migrations,
	});

	t.deepEqual(result, {
		_version: 1,
		name: "John",
		email: "john@example.com",
	});
});

test("complex schema transformations", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({
				users: z.array(z.object({ id: z.number(), name: z.string() })),
			}),
			up: () => ({
				users: [{ id: 1, name: "Alice" }],
			}),
		})
		.add({
			version: 2,
			schema: z.object({
				users: z.array(
					z.object({
						id: z.number(),
						name: z.string(),
						createdAt: z.string(),
					}),
				),
			}),
			up: (state) => ({
				users: state.users.map((u) => ({
					...u,
					createdAt: "2024-01-01",
				})),
			}),
		})
		.build();

	const result = migrate({ state: {}, migrations });

	t.deepEqual(result, {
		_version: 2,
		users: [{ id: 1, name: "Alice", createdAt: "2024-01-01" }],
	});
});

test("schema validation error does not mutate up() return value or input state", (t) => {
	const upReturned = { name: "ab" }; // will fail .min(5)

	const migrations = [
		{
			version: 1,
			schema: z.object({ name: z.string().min(5) }),
			up: () => upReturned,
		},
	] as const;

	const originalInput = { name: "start" };

	t.false("_version" in upReturned);
	t.false("_version" in originalInput);

	const error = t.throws(
		() =>
			migrate({
				state: originalInput,
				migrations,
			}),
		{ instanceOf: ValidationError },
	);

	t.is(error?.version, 1);

	// Critical: no version key should have been written before/during failed validation
	t.false(
		"_version" in upReturned,
		"up() return value must not be mutated with version key on validation failure",
	);
	t.false(
		"_version" in originalInput,
		"input state must not be mutated when a later migration fails validation",
	);
	t.is((upReturned as Record<string, unknown>)._version, undefined);
	t.is((originalInput as Record<string, unknown>)._version, undefined);
});

test("schema validation error does not mutate when up() returns same ref as currentState", (t) => {
	const originalState = { name: "start" };

	const migrations = [
		{
			version: 1,
			schema: z.object({ name: z.string().min(5), extra: z.boolean() }), // missing extra -> fail
			up: (state: Record<string, unknown>) => {
				// simulate a mutating up that returns same reference
				(state as Record<string, unknown>).mutatedField = true;
				return state;
			},
		},
	] as const;

	t.false("_version" in originalState);

	t.throws(() => migrate({ state: originalState, migrations }), {
		instanceOf: ValidationError,
	});

	t.false(
		"_version" in originalState,
		"original state must not be dirtied with version key when up() returned same ref and validation failed",
	);
	t.is((originalState as Record<string, unknown>)._version, undefined);
	t.true((originalState as Record<string, unknown>).mutatedField); // other mutations from up() itself are user's responsibility
});
