#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
mkdir -p evidence/Bedrock.app/Contents/MacOS
swiftc -sdk /Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk -target arm64-apple-macosx14.0 -module-cache-path /tmp/bedrock-sdk26-cache -parse-as-library Bedrock/*.swift -o evidence/Bedrock.app/Contents/MacOS/Bedrock -framework SwiftUI -framework AppKit
cat > evidence/Bedrock.app/Contents/Info.plist <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?><plist version="1.0"><dict><key>CFBundleExecutable</key><string>Bedrock</string><key>CFBundleIdentifier</key><string>com.meltucker.bedrock.prototype</string><key>CFBundleName</key><string>Bedrock</string><key>CFBundlePackageType</key><string>APPL</string><key>LSMinimumSystemVersion</key><string>14.0</string></dict></plist>
PLIST
