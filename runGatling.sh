#!/usr/bin/env bash
set -x
set -e

pushd gatling || exit
#  ./gradlew clean gatlingRun
   ./gradlew clean gatlingRun-br.com.palerique.guestbook.AllOperationsSimulation
popd || exit
