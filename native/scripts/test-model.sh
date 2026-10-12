#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
swiftc -module-cache-path /tmp/bedrock-model-cache Bedrock/DawnState.swift Tests/main.swift -o /tmp/bedrock-model-tests
/tmp/bedrock-model-tests
