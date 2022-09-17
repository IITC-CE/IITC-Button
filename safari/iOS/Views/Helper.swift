//
//  Helper.swift
//  iOS
//
//  Created by Lucka on 6/10/2021.
//

import SwiftUI

struct Helper: View {
    
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            VStack(alignment: .leading) {
                step(1, content: Link("Open Settings \(Image(systemName: "chevron.forward"))", destination: .init(string: UIApplication.openSettingsURLString)!))
                step(2, content: Text("Open Safari → Extensions"))
                step(3, content: Text("Enable the IITC Button extension"))
                step(4, content: Text("Open Intel Map in Safari"))
                HStack {
                    Spacer()
                }
                Spacer()
            }
            .listStyle(.plain)
            .navigationTitle("How to use")
            .navigationViewStyle(.stack)
            .toolbar {
                Button("Dismiss") { dismiss() }
            }
        }
    }
    
    @ViewBuilder
    private func step<Content: View>(_ index: Int, content: Content) -> some View {
        HStack {
            Label("Step \(index)", systemImage: "\(index)")
                .labelStyle(.iconOnly)
                .symbolVariant(.square.fill)
                .font(.largeTitle)
                .foregroundColor(.accentColor)
            content
        }
        .padding()
    }
}

#if DEBUG
struct Helper_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
#endif
