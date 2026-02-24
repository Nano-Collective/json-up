import test from "ava";
import { z } from "zod";
import { createMigrations } from "./index.js";

test("empty migrations array", (t) => {
	const migrations = createMigrations().build();

	t.deepEqual(migrations, []);
	t.is(migrations.length, 0);
});

test("single migration", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ name: z.string() }),
			up: () => ({ name: "test" }),
		})
		.build();

	t.is(migrations.length, 1);
	t.is(migrations[0]?.version, 1);
});

test("multiple migrations preserve order", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ a: z.string() }),
			up: () => ({ a: "first" }),
		})
		.add({
			version: 2,
			schema: z.object({ b: z.number() }),
			up: () => ({ b: 2 }),
		})
		.add({
			version: 3,
			schema: z.object({ c: z.boolean() }),
			up: () => ({ c: true }),
		})
		.build();

	t.is(migrations.length, 3);
	t.is(migrations[0]?.version, 1);
	t.is(migrations[1]?.version, 2);
	t.is(migrations[2]?.version, 3);
});

test("type chaining - input type is previous output", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({ name: z.string() }),
			up: () => ({ name: "test" }),
		})
		.add({
			version: 2,
			schema: z.object({ title: z.string() }),
			up: (state) => {
				// state should be { name: string }
				return { title: state.name.toUpperCase() };
			},
		})
		.build();

	// Verify the migration works correctly
	const result = migrations[1]?.up({ name: "hello" });
	t.deepEqual(result, { title: "HELLO" });
});

test("complex schema transformations maintain type safety", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({
				items: z.array(z.string()),
			}),
			up: () => ({ items: ["a", "b", "c"] }),
		})
		.add({
			version: 2,
			schema: z.object({
				items: z.array(z.object({ value: z.string(), index: z.number() })),
			}),
			up: (state) => ({
				items: state.items.map((value, index) => ({ value, index })),
			}),
		})
		.build();

	const result = migrations[1]?.up({ items: ["x", "y"] });
	t.deepEqual(result, {
		items: [
			{ value: "x", index: 0 },
			{ value: "y", index: 1 },
		],
	});
});

test("builder is immutable - each add returns new builder", (t) => {
	const builder1 = createMigrations();
	const builder2 = builder1.add({
		version: 1,
		schema: z.object({ a: z.string() }),
		up: () => ({ a: "" }),
	});

	const migrations1 = builder1.build();
	const migrations2 = builder2.build();

	t.is(migrations1.length, 0);
	t.is(migrations2.length, 1);
});

test("nested object schemas", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({
				user: z.object({
					profile: z.object({
						name: z.string(),
						settings: z.object({
							theme: z.enum(["light", "dark"]),
						}),
					}),
				}),
			}),
			up: () => ({
				user: {
					profile: {
						name: "Test",
						settings: { theme: "light" as const },
					},
				},
			}),
		})
		.build();

	t.is(migrations.length, 1);
	const result = migrations[0]?.up({});
	t.deepEqual(result, {
		user: {
			profile: {
				name: "Test",
				settings: { theme: "light" },
			},
		},
	});
});

test("optional and nullable fields", (t) => {
	const migrations = createMigrations()
		.add({
			version: 1,
			schema: z.object({
				required: z.string(),
				optional: z.string().optional(),
				nullable: z.string().nullable(),
			}),
			up: () => ({
				required: "value",
				optional: undefined,
				nullable: null,
			}),
		})
		.build();

	const result = migrations[0]?.up({});
	t.deepEqual(result, {
		required: "value",
		optional: undefined,
		nullable: null,
	});
});
