import SwiftUI
import Foundation
import Combine

@MainActor final class DawnStore: ObservableObject {
    @Published var state: DawnState
    @Published var error: String?
    private let url: URL
    init() {
        let folder = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("Bedrock", isDirectory: true)
        url = folder.appendingPathComponent("dawn.json")
        state = DawnState(day: DawnState.dayKey(Date()))
        do {
            try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
            if FileManager.default.fileExists(atPath: url.path) { state = try JSONDecoder().decode(DawnState.self, from: Data(contentsOf: url)) }
        } catch { self.error = "Progress could not be loaded. Please check local storage before continuing." }
        refresh()
    }
    func refresh() { let old = state.day; state.reconcile(Date()); if old != state.day { save() } }
    func save() { do { try JSONEncoder().encode(state).write(to: url, options: .atomic); error = nil } catch { self.error = "Progress could not be saved. Your changes are currently only in memory." } }
    func complete(_ i: Int, day: String) { refresh(); guard day == state.day else { return }; state.complete(i); save() }
    func undo() { refresh(); state.undo(); save() }
    func reset() { refresh(); state.reset(); save() }
}

@main struct BedrockApp: App {
    var body: some Scene { WindowGroup { DawnView() }.defaultSize(width: 580, height: 820) }
}
struct DawnView: View {
    @StateObject private var store = DawnStore()
    @Environment(\.scenePhase) private var phase
    @State private var hold = HoldGate()
    @State private var progress = 0.0
    @State private var confirm = false
    @State private var resetConfirm = false
    @State private var confirmationDay = ""
    @State private var confirmationItem = 0
    @State private var gestureCancelled = false
    let timer = Timer.publish(every: 0.04, on: .main, in: .common).autoconnect()
    let verses = "May all sentient beings enjoy happiness and the root of happiness.\n\nMay they be free from suffering and the root of suffering.\n\nMay they not be separated from the great happiness devoid of suffering.\n\nMay they dwell in the great equanimity free from passion, aggression, and prejudice."
    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(red: 0.08, green: 0.16, blue: 0.18), Color(red: 0.16, green: 0.23, blue: 0.23)], startPoint: .top, endPoint: .bottom).ignoresSafeArea()
            VStack(spacing: 24) {
                if let index = store.state.next {
                    Text("DAWN · \(index + 1) OF 3").font(.caption).tracking(4).foregroundStyle(.white.opacity(0.7))
                    Spacer(minLength: 12)
                    ScrollView {
                        VStack(spacing: 32) {
                            Text(DawnState.titles[index]).font(.system(size: index == 2 ? 92 : 42, weight: .regular, design: .serif)).multilineTextAlignment(.center).accessibilityAddTraits(.isHeader)
                            Text(DawnState.descriptions[index]).font(.system(size: 19, design: .serif)).multilineTextAlignment(.center)
                            if index == 0 { Text(verses).font(.system(size: 19, design: .serif)).lineSpacing(6).multilineTextAlignment(.center) }
                            if store.state.easier.contains(index) { Text("A gentle return: begin with one quiet breath. Complete only after your practice.").font(.callout).multilineTextAlignment(.center).foregroundStyle(.white.opacity(0.75)) }
                        }.frame(maxWidth: 470)
                    }
                    Spacer(minLength: 12)
                    Text("Your next quiet step is here when you’re ready.").font(.footnote).foregroundStyle(.white.opacity(0.7))
                    VStack(spacing: 14) {
                        Text(progress > 0 ? (progress >= 1 ? "Release to complete" : "Keep holding…") : "Hold to complete").frame(maxWidth: .infinity).padding(20)
                            .background(.white.opacity(0.1), in: Capsule())
                            .overlay(alignment: .bottom) { ProgressView(value: progress).tint(.white).padding(.horizontal, 30).padding(.bottom, 10) }
                            .contentShape(Capsule())
                            .gesture(DragGesture(minimumDistance: 0).onChanged { value in
                                if abs(value.translation.width) > 30 || abs(value.translation.height) > 30 { gestureCancelled = true; hold.cancel(); progress = 0; return }
                                guard !gestureCancelled else { return }
                                hold.begin(item: index, day: store.state.day, now: ProcessInfo.processInfo.systemUptime)
                            }.onEnded { value in
                                let valid = !gestureCancelled && abs(value.translation.width) <= 30 && abs(value.translation.height) <= 30
                                if valid && hold.release(item: index, day: store.state.day, now: ProcessInfo.processInfo.systemUptime) { store.complete(index, day: store.state.day) }
                                hold.cancel(); progress = 0; gestureCancelled = false
                            })
                            .accessibilityLabel("Complete \(DawnState.accessibleTitle(index))")
                            .accessibilityHint("Activate to confirm completion without holding")
                            .accessibilityAddTraits(.isButton)
                            .accessibilityAction { confirmationDay = store.state.day; confirmationItem = index; confirm = true }
                        Button("Complete without holding") { confirmationDay = store.state.day; confirmationItem = index; confirm = true }.font(.footnote).buttonStyle(.plain).keyboardShortcut(.return, modifiers: [])
                    }
                } else { Spacer(); Color.clear.frame(height: 1).accessibilityLabel("Dawn complete. Rest here."); Spacer() }
                if let error = store.error { Text(error).font(.caption).foregroundStyle(.yellow) }
                HStack {
                    if !store.state.completed.isEmpty { Button("Undo last") { hold.cancel(); progress = 0; store.undo() }.keyboardShortcut("z", modifiers: .command) }
                    Spacer()
                    Button(store.state.next == nil ? "Return / reset" : "Reset Dawn") { resetConfirm = true }
                }.font(.caption).buttonStyle(.plain).foregroundStyle(.white.opacity(0.7))
            }.padding(32).frame(maxWidth: 650)
        }.foregroundStyle(Color(red: 0.94, green: 0.91, blue: 0.82))
        .onReceive(timer) { _ in
            let day = store.state.day; store.refresh()
            if day != store.state.day || phase != .active { hold.cancel(); progress = 0 }
            progress = hold.progress(now: ProcessInfo.processInfo.systemUptime)
        }
        .onChange(of: phase) { _, _ in hold.cancel(); progress = 0; store.refresh() }
        .confirmationDialog("Mark this practice complete?", isPresented: $confirm, titleVisibility: .visible) {
            Button("Mark \(DawnState.accessibleTitle(confirmationItem)) complete") { store.complete(confirmationItem, day: confirmationDay) }
            Button("Cancel", role: .cancel) {}
        }
        .confirmationDialog("Reset today’s Dawn?", isPresented: $resetConfirm, titleVisibility: .visible) {
            Button("Reset today", role: .destructive) { hold.cancel(); progress = 0; store.reset() }
            Button("Cancel", role: .cancel) {}
        }
    }
}
