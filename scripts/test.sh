#!/bin/bash
set -e

echo "🔍 Checking formatting..."
npm run test:format

echo "📝 Type checking..."
npm run test:types

echo "🔎 Linting..."
npm run test:lint

echo "🧪 Running tests with coverage..."
npm run test:ava:coverage

echo "🔬 Checking for unused exports..."
npm run test:knip

echo "🔒 Auditing dependencies..."
npm run test:audit || true

echo "✅ All checks passed!"
