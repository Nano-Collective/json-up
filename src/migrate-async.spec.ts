import test from "ava";
import { z } from "zod";
import {
	createAsyncMigrations,
	createMigrations,
	MigrationError,
	migrateAsync,
	ValidationError,
	VersionError,
} from "./index.js";

// -- migrateAsync with sync up functions (backward compat) --

test("migrateAsync: single sync migration on empty state", async (t) => {
	const migrations = createAsyncMigrations()
		.add({
			version: 1,
			schema: z.object({ name: z.string() }),
			up: () => ({ name: "default" }),
		})
		.build();

	const result = await migrateAsync({ state: {}, migrations });

	t.deepEqual(result, { _version: 1, name: "default" });
});

test("migrateAsync: multiple sync migrations sequentially", async (t) => {
	const migrations = createAsyncMigrations()
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
		.build();

	const result = await migrateAsync({ state: {}, migrations });

	t.deepEqual(result, { _version: 2, title: "INITIAL" });
});

// -- migrateAsync with async up functions --

test("migrateAsync: single async migration", async (t) => {
	const migrations = createAsyncMigrations()
		.add({
			version: 1,
			schema: z.object({ key: z.string() }),
			up: async () => {
				const key = await Promise.resolve("generated-key");
				return { key };
			},
		})
		.build();

	const result = await migrateAsync({ state: {}, migrations });

	t.deepEqual(result, { _version: 1, key: "generated-key" });
});

test("migrateAsync: mixed sync and async migrations", async (t) => {
	const migrations = createAsyncMigrations()
		.add({
			version: 1,
			schema: z.object({ name: z.string() }),
			up: () => ({ name: "sync" }),
		})
		.add({
			version: 2,
			schema: z.object({ name: z.string(), token: z.string() }),
			up: async (state) => {
				const token = await Promise.resolve("async-token");
				return { name: state.name, token };
			},
		})
		.add({
			version: 3,
			schema: z.object({ name: z.string(), token: z.string(), ready: z.boolean() }),
			up: (state) => ({ ...state, ready: true }),
		})
		.build();

	const result = await migrateAsync({ state: {}, migrations });

	t.deepEqual(result, { _version: 3, name: "sync", token: "async-token", ready: true });
});

test("migrateAsync: async up with delayed resolution", async (t) => {
	const migrations = createAsyncMigrations()
		.add({
			version: 1,
			schema: z.object({ data: z.string() }),
			up: async () => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				return { data: "delayed" };
			},
		})
		.build();

	const result = await migrateAsync({ state: {}, migrations });

	t.deepEqual(result, { _version: 1, data: "delayed" });
});

// -- migrateAsync skipping / version handling --

test("migrateAsync: skip already-applied migrations", async (t) => {
	const migrations = createAsyncMigrations()
		.add({
			version: 1,
			schema: z.object({ name: z.string() }),
			up: async () => ({ name: "should not run" }),
		})
		.add({
			version: 2,
			schema: z.object({ title: z.string() }),
			up: async (state) => ({ title: (state as { name: string }).name }),
		})
		.build();

	const result = await migrateAsync({
		state: { _version: 1, name: "existing" },
		migrations,
	});

	t.deepEqual(result, { _version: 2, title: "existing" });
});

test("migrateAsync: custom version key", async (t) => {
	const migrations = createAsyncMigrations()
		.add({
			version: 1,
			schema: z.object({ data: z.string() }),
			up: async () => ({ data: "test" }),
		})
		.build();

	const result = await migrateAsync({
		state: {},
		migrations,
		key: "schemaVersion",
	});

	t.deepEqual(result, { schemaVersion: 1, data: "test" });
});

// -- migrateAsync error handling --

test("migrateAsync: async up function rejection", async (t) => {
	const migrations = createAsyncMigrations()
		.add({
			version: 1,
			schema: z.object({ name: z.string() }),
			up: async () => {
				throw new Error("Async migration failed");
			},
		})
		.build();

	const error = await t.throwsAsync(() => migrateAsync({ state: {}, migrations }), {
		instanceOf: MigrationError,
	});

	t.is(error?.version, 1);
	t.true(error?.message.includes("Async migration failed"));
});

test("migrateAsync: schema validation error", async (t) => {
	const migrations = createAsyncMigrations()
		.add({
			version: 1,
			schema: z.object({ name: z.string().min(5) }),
			up: async () => ({ name: "ab" }),
		})
		.build();

	const error = await t.throwsAsync(() => migrateAsync({ state: {}, migrations }), {
		instanceOf: ValidationError,
	});

	t.is(error?.version, 1);
	t.true((error?.issues?.length ?? 0) > 0);
});

test("migrateAsync: empty migrations throws VersionError", async (t) => {
	const migrations = createAsyncMigrations().build();

	await t.throwsAsync(() => migrateAsync({ state: {}, migrations }), {
		instanceOf: VersionError,
		message: "Migrations array cannot be empty",
	});
});

test("migrateAsync: unsorted migrations throw VersionError", async (t) => {
	const migrations = [
		{
			version: 2,
			schema: z.object({ name: z.string() }),
			up: async () => ({ name: "" }),
		},
		{
			version: 1,
			schema: z.object({ name: z.string() }),
			up: async () => ({ name: "" }),
		},
	] as const;

	await t.throwsAsync(() => migrateAsync({ state: {}, migrations }), {
		instanceOf: VersionError,
		message: /must be sorted by version/,
	});
});

// -- migrateAsync accepts sync migrations from createMigrations --

test("migrateAsync: accepts sync migrations built with createMigrations()", async (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ name: z.string() }),
			up: () => ({ name: "from-sync-builder" }),
		})
		.build();

	const result = await migrateAsync({ state: {}, migrations });

	t.deepEqual(result, { _version: 1, name: "from-sync-builder" });
});

// -- createAsyncMigrations builder --

test("createAsyncMigrations: empty build", (t) => {
	const migrations = createAsyncMigrations().build();

	t.deepEqual(migrations, []);
	t.is(migrations.length, 0);
});

test("createAsyncMigrations: builder is immutable", (t) => {
	const builder1 = createAsyncMigrations();
	const builder2 = builder1.add({
		version: 1,
		schema: z.object({ a: z.string() }),
		up: async () => ({ a: "" }),
	});

	const migrations1 = builder1.build();
	const migrations2 = builder2.build();

	t.is(migrations1.length, 0);
	t.is(migrations2.length, 1);
});

test("createAsyncMigrations: type chaining with async ups", async (t) => {
	const migrations = createAsyncMigrations()
		.add({
			version: 1,
			schema: z.object({ name: z.string() }),
			up: async () => ({ name: "test" }),
		})
		.add({
			version: 2,
			schema: z.object({ title: z.string() }),
			up: async (state) => {
				// state should be { name: string }
				return { title: state.name.toUpperCase() };
			},
		})
		.build();

	const result = await migrateAsync({ state: {}, migrations });

	t.deepEqual(result, { _version: 2, title: "TEST" });
});

test("migrateAsync: null state handling", async (t) => {
	const migrations = createAsyncMigrations()
		.add({
			version: 1,
			schema: z.object({ initialized: z.boolean() }),
			up: async () => ({ initialized: true }),
		})
		.build();

	const result = await migrateAsync({ state: null, migrations });

	t.deepEqual(result, { _version: 1, initialized: true });
});

test("migrateAsync: schema validation error does not mutate up() return value or input state", async (t) => {
	const upReturned = { name: "ab" }; // will fail .min(5)

	const migrations = [
		{
			version: 1,
			schema: z.object({ name: z.string().min(5) }),
			up: async () => upReturned,
		},
	] as const;

	const originalInput = { name: "start" };

	t.false("_version" in upReturned);
	t.false("_version" in originalInput);

	const error = await t.throwsAsync(
		() =>
			migrateAsync({
				state: originalInput,
				migrations,
			}),
		{ instanceOf: ValidationError },
	);

	t.is(error?.version, 1);

	t.false(
		"_version" in upReturned,
		"up() return value must not be mutated with version key on validation failure (async)",
	);
	t.false(
		"_version" in originalInput,
		"input state must not be mutated when a migration fails validation (async)",
	);
});

test("migrateAsync: schema validation error does not mutate when up() returns same ref", async (t) => {
	const originalState = { name: "start" };

	const migrations = [
		{
			version: 1,
			schema: z.object({ name: z.string().min(5), extra: z.boolean() }),
			up: async (state: Record<string, unknown>) => {
				(state as Record<string, unknown>).mutatedField = true;
				return state;
			},
		},
	] as const;

	t.false("_version" in originalState);

	await t.throwsAsync(() => migrateAsync({ state: originalState, migrations }), {
		instanceOf: ValidationError,
	});

	t.false(
		"_version" in originalState,
		"original state must not receive version key on validation failure even if up returned same ref (async)",
	);
});
