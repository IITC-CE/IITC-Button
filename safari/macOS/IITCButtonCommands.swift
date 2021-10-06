//
//  IITCButtonCommands.swift
//  macOS
//
//  Created by Lucka on 6/10/2021.
//

import SwiftUI

struct IITCButtonCommands: Commands {
    
    @Environment(\.openURL) private var openURL
    
    var body: some Commands {
        CommandGroup(after: .help) {
            Divider()
            Button("Homepage") { openURL(.init(string: "https://iitc.app")!) }
            Button("Telegram Channel") { openURL(.init(string: "https://t.me/iitc_news")!) }
            Button("Source Code") { openURL(.init(string: "https://github.com/lucka-me/IITC-Button")!) }
        }
    }
}
