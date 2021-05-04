#!/usr/bin/env bash
set -x
set -e

./build.sh

pushd gatling || exit
  ./gradlew clean gatlingRun
popd || exit
