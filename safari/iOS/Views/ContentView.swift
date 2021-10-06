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
            }
            .navigationTitle("IITC-Button")
        }
        .navigationViewStyle(.stack)
    }
}

#if DEBUG
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
#endif
