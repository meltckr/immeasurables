# Bedrock — Dawn native prototype

One SwiftUI Xcode project for iOS 17+ and macOS 14+. Working name and bundle display name are configurable in Xcode build settings. Open `Bedrock.xcodeproj`; select Bedrock and a Mac or iPhone Simulator destination. No development team is embedded. Simulator builds require no team. For a physical phone, the owner must install Xcode, select an existing authorized team in Signing & Capabilities, and use an already authorized device. This task did not create credentials, enable Developer Mode, or distribute a release.

The app follows Four Immeasurables → Heart Sutra → **42** → quiet rest. Only those three steps gate Dawn completion. Ten foundation slots exist; slots 4–10 are unassigned. No meaning is assigned to 42.

Four Immeasurables verses are copied exactly from this repository's `js/app.js` LITURGY, whose README identifies the owner-approved Daily Prayers text. Heart Sutra and 42 are honest title-based cards with no invented prayer text. Original web practice and audio remain unchanged.

Hold for 1.6 seconds, then release to complete. Early release, moving more than 30 points, leaving the active app, or crossing a daily boundary cancels. A non-hold button and VoiceOver action open a confirmation; Return invokes the button on Mac. Undo last is always available after completion (Command-Z on Mac). Reset requires confirmation, including from the resting screen. All motion is static except the functional progress indicator; completion needs no animation. Text scrolls to accommodate small screens and large type.

Progress is Codable JSON in the app's local Application Support/Bedrock/dawn.json, written atomically. A local-calendar date key is reconciled on launch, active-scene changes, and a foreground timer. A new day clears today's completion and suggests one quiet breath for previously missed items. Suggestions neither rewrite liturgy nor count as completion. Confirmation is tied to its original day and item. Disk failures are displayed. No cloud, notifications permission, feed restrictions, photos, planner, analytics, or subscriptions.

## Executed verification — October 12, 2026 UTC

- Compiled native arm64 Mac app using installed CLT Swift and macOS 26.5 SDK; actual app launched on this Mac Studio.
- 14 model assertions passed: partial/full/repeated release, duplicate/out-of-order completion, serialization/resume, three-only finish, undo, reset, local midnight, rollover suggestions, crossing-midnight hold and background cancellation.
- Actual Mac accessibility UI: cancellation kept first card; accessible completion traversed all three cards to rest; Return opened Heart Sutra confirmation; quit/relaunch resumed 42; undo from rest restored 42; confirmed reset restored first card.
- Four screenshots in `evidence/01-four-immeasurables.png` through `04-rest.png` are actual native app captures, not mockups.
- Xcode project plist syntax validated by `plutil`. Xcode build itself has not run.

Run `scripts/test-model.sh`. With this Studio's installed SDK, `scripts/build-mac.sh` creates `evidence/Bedrock.app`. With Xcode, prefer building the project.

## Remaining proof

Xcode is absent (active developer directory is `/Library/Developer/CommandLineTools`), so no iOS Simulator, Xcode multiplatform build, physical iPhone, signing-team inspection through Xcode, or iOS screenshot was possible. No provisioning-profile directory was found. Full physical pointer hold, VoiceOver spoken output, Dynamic Type on iPhone, and reduced-motion OS setting still require manual/device checks. The model hold gate is tested; the actual demonstrated Mac flow uses the accessible confirmation equivalent. Install Xcode from Apple's official route and select its developer directory before Simulator testing. Any license acceptance is an owner step.
