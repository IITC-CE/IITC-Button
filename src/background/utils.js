//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { checkMatching } from "lib-iitc-manager";

// Fetch all completly loaded tabs
export async function getTabsToInject() {
  let allTabs = await browser.tabs.query({ status: "complete" });
  return allTabs.filter(function (tab) {
    return tab.status === "complete" && tab.url;
  });
}

// Filter all completly loaded Ingress Intel tabs
export async function getNiaTabsToInject(plugin) {
  const tabs = await getTabsToInject();
  return Object.values(tabs).filter((tab) => checkMatching(plugin, tab.url));
}
