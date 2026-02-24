#!/bin/bash
set -e

echo "🔍 Checking formatting..."
npx biome check --write .

echo "📝 Type checking..."
npx tsc --noEmit

echo "🔎 Linting..."
npx biome lint .

echo "🧪 Running tests..."
npx ava

echo "🔬 Checking for unused exports..."
npx knip

echo "🔒 Auditing dependencies..."
npm audit --audit-level=high || true

echo "✅ All checks passed!"
