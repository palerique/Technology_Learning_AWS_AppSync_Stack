#!/usr/bin/env bash
set -x
set -e

pushd cdk || exit
  cdk destroy --force
popd || exit
