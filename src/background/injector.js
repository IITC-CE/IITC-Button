//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { check_matching } from "lib-iitc-manager";

// TODO
// https://developer.chrome.com/docs/extensions/reference/api/userScripts#developer_mode_for_extension_users

export async function inject_plugin(plugin) {
  const tabs = await getTabsToInject();

  const is_ingress_tab = (url) => {
    return /https:\/\/(intel|missions).ingress.com\/*/.test(url);
  };

  chrome.userScripts.configureWorld({
    csp: "script-src 'self' 'unsafe-inline'",
  });

  try {
    chrome.userScripts.unregister(["iitc"]);
  } catch (error) {
    console.log(error);
  }
  chrome.userScripts.register([
    {
      id: "iitc",
      matches: ["https://intel.ingress.com/*"],
      js: [{ code: plugin.code }],
    },
  ]);
  for (let tab of Object.values(tabs)) {
    if (
      (!is_ingress_tab(tab.url) || !check_matching(plugin, "<all_ingress>")) &&
      !check_matching(plugin, tab.url)
    ) {
      continue;
    }

    try {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: (pluginDetail) => {
          document.dispatchEvent(
            new CustomEvent("IITCButtonInitJS", {
              detail: pluginDetail,
            })
          );
        },
        args: [{ plugin: plugin, tab_id: tab.id }],
        injectImmediately: true,
      });
    } catch (error) {
      console.error(
        `An error occurred while injecting script: ${error.message}`
      );
    }
  }
}

// Fetch all completly loaded Ingress Intel tabs
export async function getTabsToInject() {
  let allTabs = await browser.tabs.query({ status: "complete" });

  return allTabs.filter(function (tab) {
    return tab.status === "complete" && tab.url;
  });
}
