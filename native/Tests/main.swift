import Foundation
var checks = 0
func check(_ value: Bool, _ name: String) { precondition(value, name); checks += 1; print("PASS \(name)") }
var calendar = Calendar(identifier: .gregorian); calendar.timeZone = TimeZone(identifier: "America/Phoenix")!
let today = Date(timeIntervalSince1970: 1791784800)
var state = DawnState(day: DawnState.dayKey(today, calendar: calendar))
check(DawnState.slots.count == 10 && DawnState.slots[9].title == nil, "tenth slot unassigned")
var hold = HoldGate()
hold.begin(item: 0, day: state.day, now: 10)
check(!hold.release(item: 0, day: state.day, now: 10.5), "partial release cancelled")
hold.begin(item: 0, day: state.day, now: 10)
check(hold.release(item: 0, day: state.day, now: 12), "full hold accepted")
check(!hold.release(item: 0, day: state.day, now: 12), "repeat release rejected")
state.complete(1); check(state.completed.isEmpty, "out of order rejected")
state.complete(0); state.complete(0); check(state.completed == [0], "completion idempotent")
let restored = try JSONDecoder().decode(DawnState.self, from: JSONEncoder().encode(state))
check(restored.completed == [0], "restart serialization")
state.complete(1); state.complete(2); check(state.next == nil, "trilogy alone finishes")
state.undo(); check(state.next == 2, "accessible undo restores last")
state.reset(); check(state.next == 0, "reset returns first")
state.complete(0); state.reconcile(today.addingTimeInterval(86400), calendar: calendar)
check(state.next == 0 && state.easier == [1,2], "rollover suggests missed items without completing")
hold.begin(item: 0, day: "old", now: 0); check(!hold.release(item: 0, day: "new", now: 2), "midnight hold rejected")
hold.begin(item: 0, day: state.day, now: 0); hold.cancel(); check(hold.progress(now: 2) == 0, "background cancellation")
let before = calendar.date(from: DateComponents(year: 2026, month: 10, day: 12, hour: 23, minute: 59))!
check(DawnState.dayKey(before, calendar: calendar) != DawnState.dayKey(before.addingTimeInterval(120), calendar: calendar), "local midnight boundary")
print("\(checks) checks passed")
