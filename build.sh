#!/usr/bin/env bash
set -x
set -e

find . -path "*node_modules/generic-stuff" -type d -exec rm -vr "{}" \; || true

pushd lambdas || exit
  ./scripts/build-dependency-layer.sh
  yarn install
  yarn build
popd || exit
