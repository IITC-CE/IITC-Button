//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import browser from "webextension-polyfill";
import { getTabsToInject } from "@/background/utils";
import { is_iitc_enabled } from "@/userscripts/utils";
import { IS_USERSCRIPTS_API } from "@/userscripts/env";

let lastIITCTab = null;

export async function onRequestOpenIntel() {
  if (lastIITCTab) {
    const tabInfo = await getTabInfo(lastIITCTab);
    if (tabInfo && isIngressIntelUrl(tabInfo.url)) {
      return await setTabActive(lastIITCTab);
    }
  }

  try {
    const tab = await browser.tabs.create({
      url: "https://intel.ingress.com/",
      pinned: true,
    });
    lastIITCTab = tab.id;
  } catch (error) {
    console.error(`An error occurred while open tab: ${error.message}`);
  }
}

export async function onToggleIITC(status) {
  await browser.storage.local.set({ IITC_is_enabled: status });

  if (IS_USERSCRIPTS_API) {
    if (status === false) {
      try {
        await browser.userScripts.unregister();
        // eslint-disable-next-line no-empty
      } catch {}
    }
  } else {
    // Fetch all completly loaded Ingress Intel tabs
    const tabs = await getTabsToInject();

    for (let tab of Object.values(tabs)) {
      if (isIngressIntelUrl(tab.url)) {
        await browser.tabs.reload(tab.id);
      }
    }
  }
}

// tab listeners
export async function onUpdatedListener(tabId, status, tab, manager) {
  if (status.status === "complete") {
    await initialize(manager);
    if (isIngressIntelUrl(tab.url)) {
      lastIITCTab = tabId;
    }
  }
}

export function onRemovedListener(tabId) {
  if (lastIITCTab === tabId) {
    lastIITCTab = null;
  }
}

async function initialize(manager) {
  const status = await is_iitc_enabled();
  if (status) {
    await manager.inject();
  }
}

async function setTabActive(tabId) {
  const tab = await browser.tabs.update(tabId, {
    active: true,
  });

  try {
    await browser.windows.update(tab.windowId, { focused: true });
  } catch (error) {
    lastIITCTab = null;
    await onRequestOpenIntel();
  }
}

async function getTabInfo(tabId) {
  try {
    return await browser.tabs.get(tabId);
  } catch {
    return null;
  }
}

function isIngressIntelUrl(url) {
  if (url) {
    return /^https:\/\/intel\.ingress\.com/.test(url);
  }
  return false;
}
