#!/bin/bash
set -e

echo "🔍 Checking formatting..."
pnpm run test:format

echo "📝 Type checking..."
pnpm run test:types

echo "🔎 Linting..."
pnpm run test:lint

echo "🧪 Running tests with coverage..."
pnpm run test:ava:coverage

echo "🔬 Checking for unused exports..."
pnpm run test:knip

echo "🔒 Auditing dependencies..."
pnpm run test:audit || true

echo "✅ All checks passed!"
