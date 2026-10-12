import Foundation

struct FoundationSlot: Codable { let id: Int; let title: String? }
struct DawnState: Codable {
    static let titles = ["Four Immeasurables", "Heart Sutra", "42"]
    static let descriptions = ["Your Four Immeasurables practice", "Read the Heart Sutra", "42-minute meditation session"]
    static let meditationDescription = descriptions[2]
    static func accessibleTitle(_ index: Int) -> String { index == 2 ? meditationDescription : titles[index] }
    static let slots = (1...10).map { FoundationSlot(id: $0, title: $0 <= 3 ? titles[$0 - 1] : nil) }
    var day: String
    var completed: [Int] = []
    var easier: [Int] = []
    static func dayKey(_ date: Date, calendar: Calendar = .current) -> String {
        let c = calendar.dateComponents([.year, .month, .day], from: date)
        return "\(c.year!)-\(c.month!)-\(c.day!)"
    }
    mutating func reconcile(_ date: Date, calendar: Calendar = .current) {
        let key = Self.dayKey(date, calendar: calendar)
        guard key != day else { return }
        easier = (0..<3).filter { !completed.contains($0) }
        completed = []; day = key
    }
    var next: Int? { (0..<3).first { !completed.contains($0) } }
    mutating func complete(_ index: Int) { guard next == index else { return }; completed.append(index) }
    mutating func undo() { if !completed.isEmpty { completed.removeLast() } }
    mutating func reset() { completed = [] }
}

struct HoldGate {
    var start: TimeInterval?
    var item: Int?
    var day: String?
    let duration: TimeInterval = 1.6
    mutating func begin(item: Int, day: String, now: TimeInterval) { guard start == nil else { return }; self.item = item; self.day = day; start = now }
    func progress(now: TimeInterval) -> Double { guard let start else { return 0 }; return min(1, max(0, (now - start) / duration)) }
    mutating func release(item: Int, day: String, now: TimeInterval) -> Bool {
        let accepted = self.item == item && self.day == day && progress(now: now) >= 1
        cancel(); return accepted
    }
    mutating func cancel() { start = nil; item = nil; day = nil }
}
