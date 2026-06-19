// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE

import browser from "webextension-polyfill";
import { checkMatching } from "lib-iitc-manager";
import type { Plugin } from "lib-iitc-manager";

// Fetch all completly loaded tabs
export async function getTabsToInject() {
  const allTabs = await browser.tabs.query({ status: "complete" });
  return allTabs.filter(function (tab) {
    return tab.status === "complete" && tab.url;
  });
}

// Filter all completly loaded Ingress Intel tabs
export async function getNiaTabsToInject(plugin: Plugin) {
  const tabs = await getTabsToInject();
  return Object.values(tabs).filter(
    (tab) => tab.url && checkMatching(plugin, tab.url),
  );
}
