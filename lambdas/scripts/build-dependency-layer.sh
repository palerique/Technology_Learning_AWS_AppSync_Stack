#!/usr/bin/env bash
set -x
set -e

ROOT_DIR="$(pwd)"
GENERIC_STUFF_DIR="$ROOT_DIR/layer/genericStuff"
GENERIC_STUFF_OUTPUT_DIR="$GENERIC_STUFF_DIR/packaged-dist"
GENERIC_STUFF_PKG_DIR="$GENERIC_STUFF_OUTPUT_DIR/layers/nodejs"

cd "$GENERIC_STUFF_DIR"

npm install
tsc

mkdir -p "$GENERIC_STUFF_PKG_DIR"

cp -LR "$GENERIC_STUFF_DIR/node_modules" "$GENERIC_STUFF_PKG_DIR"

mkdir -p "$GENERIC_STUFF_PKG_DIR/node_modules/generic-stuff/dist"
cp -LR "$GENERIC_STUFF_DIR/dist" "$GENERIC_STUFF_PKG_DIR/node_modules/generic-stuff"

cp -LR "$GENERIC_STUFF_DIR/package.json" "$GENERIC_STUFF_PKG_DIR/node_modules/generic-stuff"

cd "$GENERIC_STUFF_OUTPUT_DIR/layers"

zip -r "$GENERIC_STUFF_OUTPUT_DIR/layers.zip" nodejs

rm -rf "$GENERIC_STUFF_OUTPUT_DIR/layers"
