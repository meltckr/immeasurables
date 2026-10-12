#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if [ "$#" -ne 1 ]; then
  echo 'Usage: test-ios.sh DISPOSABLE_SIMULATOR_UDID (resets only that Simulator app data)' >&2
  exit 2
fi
bedrock_result_dir=$(mktemp -d /tmp/bedrock-ui-result.XXXXXX)
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild test \
  -project Bedrock.xcodeproj -scheme Bedrock \
  -destination "platform=iOS Simulator,id=$1" \
  -parallel-testing-enabled NO -collect-test-diagnostics never \
  -test-timeouts-enabled YES -maximum-test-execution-time-allowance 120 \
  -derivedDataPath DerivedData -resultBundlePath "$bedrock_result_dir/Run.xcresult" \
  CODE_SIGNING_ALLOWED=NO
