#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const version = process.argv[2];

if (!version) {
	console.error("Usage: extract-changelog.js <version>");
	process.exit(1);
}

const changelog = readFileSync(join(__dirname, "..", "CHANGELOG.md"), "utf8");

const versionPattern = new RegExp(`## \\[${version.replace(/\./g, "\\.")}\\][^]*?(?=## \\[|$)`);
const match = changelog.match(versionPattern);

if (match) {
	const notes = match[0].replace(/^## \[.*?\].*?\n/, "").trim();
	console.log(notes);
} else {
	console.log(`Release v${version}`);
}
