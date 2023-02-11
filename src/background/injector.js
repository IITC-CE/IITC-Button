//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import { check_matching } from "lib-iitc-manager";

export async function inject_plugin(plugin) {
  const tabs = await getTabsToInject();

  const is_ingress_tab = url => {
    return /https:\/\/(intel|missions).ingress.com\/*/.test(url);
  };

  for (let tab of Object.values(tabs)) {
    if (
      (!is_ingress_tab(tab.url) || !check_matching(plugin, "<all_ingress>")) &&
      !check_matching(plugin, tab.url)
    ) {
      continue;
    }

    const inject = `
    document.dispatchEvent(new CustomEvent('IITCButtonInitJS', {
      detail: ${JSON.stringify({ plugin: plugin, tab_id: tab.id })}
    }));
  `;

    try {
      await browser.tabs.executeScript(tab.id, {
        code: inject,
        runAt: "document_end"
      });
    } catch (error) {
      console.error(`An error occurred while reloading tabs: ${error.message}`);
    }
  }
}

// Fetch all completly loaded Ingress Intel tabs
export async function getTabsToInject() {
  let allTabs = await browser.tabs.query({ status: "complete" });

  return allTabs.filter(function(tab) {
    return tab.status === "complete" && tab.url;
  });
}
