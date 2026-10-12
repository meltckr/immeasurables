import XCTest

final class DawnUITests: XCTestCase {
    let app = XCUIApplication()
    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launch()
        resetToday()
    }
    private func resetToday() {
        let reset = app.buttons["Reset Dawn"]
        if reset.waitForExistence(timeout: 5) { reset.tap() }
        else { app.buttons["Return / reset"].tap() }
        app.buttons["Reset today"].tap()
        XCTAssertTrue(app.buttons["Seal Four Immeasurables"].waitForExistence(timeout: 5))
    }
    private func capture(_ name: String) {
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = name; attachment.lifetime = .keepAlways
        add(attachment)
    }
    func testTrilogyHoldCancellationPersistenceUndoAndReset() {
        let first = app.buttons["dawn-seal-0"]
        capture("ios-01-four-immeasurables")
        XCTAssertGreaterThan(first.frame.width, 44)
        XCTAssertGreaterThan(first.frame.height, 44)
        XCTAssertTrue(app.frame.intersects(first.frame), "Seal control is within the visible app window")
        first.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).press(forDuration: 0.35)
        XCTAssertTrue(first.exists, "Early release must not seal")
        XCTAssertFalse(app.buttons["Seal Heart Sutra"].exists)
        first.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).press(forDuration: 1.9)
        let heart = app.buttons["dawn-seal-1"]
        XCTAssertTrue(heart.waitForExistence(timeout: 5), "Full hold advances exactly one practice")
        capture("ios-02-heart-sutra")
        app.terminate(); app.launch()
        XCTAssertTrue(heart.waitForExistence(timeout: 5), "Restart resumes persisted second card")
        app.buttons["Completion options"].tap()
        app.buttons["Seal without holding"].tap()
        if app.buttons["Cancel"].waitForExistence(timeout: 1) {
            app.buttons["Cancel"].tap()
        } else {
            // Regular-width iOS confirmation popovers dismiss by tapping outside.
            app.coordinate(withNormalizedOffset: CGVector(dx: 0.1, dy: 0.1)).tap()
        }
        XCTAssertTrue(heart.exists, "Accessible completion cancellation must not seal")
        heart.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).press(forDuration: 1.9)
        let meditation = app.buttons["dawn-seal-2"]
        XCTAssertTrue(meditation.waitForExistence(timeout: 5))
        XCTAssertTrue(app.staticTexts["42-minute meditation session"].exists)
        capture("ios-03-42")
        meditation.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).press(forDuration: 1.9)
        XCTAssertTrue(app.buttons["Return / reset"].waitForExistence(timeout: 5), "Three practices alone reach rest")
        XCTAssertFalse(app.buttons["Completion options"].exists)
        capture("ios-04-rest")
        app.terminate(); app.launch()
        XCTAssertTrue(app.buttons["Return / reset"].waitForExistence(timeout: 5), "Completed rest persists")
        app.buttons["Undo last"].tap()
        XCTAssertTrue(meditation.waitForExistence(timeout: 5), "Undo restores the last practice")
        resetToday()
        XCTAssertFalse(app.buttons["Undo last"].exists)
    }
    func testAccessibleCompletionConfirmation() {
        app.buttons["Completion options"].tap()
        app.buttons["Seal without holding"].tap()
        app.sheets.buttons["Seal Four Immeasurables"].tap()
        XCTAssertTrue(app.buttons["Seal Heart Sutra"].waitForExistence(timeout: 5))
        app.buttons["Undo last"].tap()
        XCTAssertTrue(app.buttons["Seal Four Immeasurables"].waitForExistence(timeout: 5))
    }
}
