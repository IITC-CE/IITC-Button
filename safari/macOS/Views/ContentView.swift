//
//  ContentView.swift
//  Shared
//
//  Created by Lucka on 3/10/2021.
//

import SwiftUI
import SafariServices

struct ContentView: View {
    
    private enum ExtensionStatus {
        case unknown
        case disabled
        case enabled
    }
    
    static private let extensionId = "dev.lucka.IITC-Button.Safari-Extension"
    
    @Environment(\.scenePhase) private var scenePhase : ScenePhase
    @State private var extensionStatus = ExtensionStatus.unknown
    
    var body: some View {
        VStack {
            extensionStateIndicator
        }
        .frame(minWidth: 240)
    }
    
    @ViewBuilder
    private var extensionStateIndicator: some View {
        HStack {
            Text("Safari Extension")
            Spacer()
            Text(statusText)
                .foregroundColor(statusColor)
        }
        .padding()
        .onChange(of: scenePhase) { phase in
            if phase == .active {
                updateExtensionStatus()
            }
        }
    }
    
    private var statusText: LocalizedStringKey {
        switch extensionStatus {
            case .unknown: return "Unknown"
            case .disabled: return "Disabled"
            case .enabled: return "Enabled"
        }
    }
    
    private var statusColor: Color {
        switch extensionStatus {
            case .unknown: return .orange
            case .disabled: return .red
            case .enabled: return .green
        }
    }
    
    private func updateExtensionStatus() {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: Self.extensionId) { state, error in
            guard let solidState = state, error == nil else {
                extensionStatus = .unknown
                return
            }
            DispatchQueue.main.async {
                extensionStatus = solidState.isEnabled ? .enabled : .disabled
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
