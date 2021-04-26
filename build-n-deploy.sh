#!/usr/bin/env bash
set -x
set -e

./build.sh

pushd cdk || exit
  npm install
  cdk deploy --require-approval never
popd || exit
