//
//  ContentView.swift
//  iOS
//
//  Created by Lucka on 6/10/2021.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationView {
            List {
                Text("TODO: Helper")
                
                Section("About") {
                    about
                }
            }
            .navigationTitle("IITC-Button")
        }
        .navigationViewStyle(.stack)
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
