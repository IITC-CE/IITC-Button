//
//  ContentView.swift
//  iOS
//
//  Created by Lucka on 6/10/2021.
//

import SwiftUI

struct ContentView: View {
    
    @State private var presentingHelpSheet = false
    
    var body: some View {
        NavigationView {
            List {
                Button(action: { presentingHelpSheet.toggle() }) {
                    Label("How to use", systemImage: "questionmark")
                }
                Link("Open Intel Maps", systemImage: "target", destination: .init(string: "https://intel.ingress.com")!)
                
                Section("About") {
                    about
                }
            }
            .navigationTitle("IITC Button")
        }
        .navigationViewStyle(.stack)
        .sheet(isPresented: $presentingHelpSheet) {
            Helper()
        }
    }
    
    @ViewBuilder
    private var about: some View {
        Link("Homepage", systemImage: "house", destination: .init(string: "https://iitc.app")!)
        Link("Telegram Channel", systemImage: "paperplane.circle.fill", destination: .init(string: "https://t.me/iitc_news")!)
        Link("Source Code", systemImage: "swift", destination: .init(string: "https://github.com/lucka-me/IITC-Button")!)
        Label("Version", systemImage: "info")
            .badge(version)
    }
    
    private var version: String {
        guard let infoDict = Bundle.main.infoDictionary else {
            return "Unknown"
        }
        let shortVersion = infoDict["CFBundleShortVersionString"] as? String ?? "Unknown"
        let build = infoDict["CFBundleVersion"] as? String ?? "Unknown"
        return "\(shortVersion) (\(build))"
    }
}

#if DEBUG
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
#endif

fileprivate extension Link where Label == SwiftUI.Label<Text, Image> {
    init(_ titleKey: LocalizedStringKey, systemImage name: String, destination: URL) {
        self.init(destination: destination) {
            SwiftUI.Label(titleKey, systemImage: name)
        }
    }
}
