#!/usr/bin/env bash
set -x
set -e

#find . -name 'node_modules' -type d -prune -print -exec rm -rf '{}' \;

pushd lambdas || exit
  find . -name 'node_modules' -type d -prune -print -exec rm -rf '{}' \;
popd || exit
