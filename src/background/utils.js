//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { check_matching } from "lib-iitc-manager";

const is_ingress_tab = (url) => {
  return /https:\/\/(intel|missions).ingress.com\/*/.test(url);
};

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
  return Object.values(tabs).filter(
    (tab) =>
      (is_ingress_tab(tab.url) && check_matching(plugin, "<all_ingress>")) ||
      check_matching(plugin, tab.url)
  );
}

export function getPluginMatches(plugin) {
  let matches = [];
  if (check_matching(plugin, "<all_ingress>")) {
    matches.push("https://intel.ingress.com/*");
    matches.push("https://missions.ingress.com/*");
  }
  if (plugin.match) {
    matches = matches.concat(plugin.match);
  }
  return matches;
}
