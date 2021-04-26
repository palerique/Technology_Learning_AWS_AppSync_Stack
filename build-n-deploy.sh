#!/usr/bin/env bash
set -x
set -e

./build.sh

pushd cdk || exit
  cdk deploy --require-approval never
popd || exit
