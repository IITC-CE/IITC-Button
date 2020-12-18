//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import { getTabsToInject, injectUserScript } from "./injector";

let lastIITCTab = null;

export async function onRequestOpenIntel() {
  if (lastIITCTab) {
    const tabInfo = await getTabInfo(lastIITCTab);
    if (isIngressUrl(tabInfo.url)) {
      console.debug(`detected intel.ingress.com page on tab ${lastIITCTab}`);
      await setTabActive(lastIITCTab);
    }
  }

  try {
    const tab = await browser.tabs.create({
      url: "https://intel.ingress.com/",
      pinned: true
    });
    lastIITCTab = tab.id;
  } catch (error) {
    console.error(`An error occurred while open tab: ${error.message}`);
  }
}

export async function onToggleIITC(value) {
  await browser.storage.local.set({ IITC_is_enabled: value });

  // Fetch all completly loaded Ingress Intel tabs
  const tabs = await browser.tabs.query({
    url: "https://intel.ingress.com/*",
    status: "complete"
  });

  for (let tab of Object.values(tabs)) {
    await browser.tabs.reload(tab.id);
  }
}

// tab listeners
export async function onUpdatedListener(tabId, status) {
  if (status.status === "complete") {
    const tabInfo = await getTabInfo(tabId);
    if (isIngressUrl(tabInfo.url)) {
      console.debug(`detected intel.ingress.com page on tab ${tabId}`);
      await initialize();
      lastIITCTab = tabId;
    }
  }
}

export function onRemovedListener(tabId) {
  if (lastIITCTab === tabId) {
    lastIITCTab = null;
  }
}

async function initialize() {
  const data = await browser.storage.local.get([
    "IITC_is_enabled",
    "channel",
    "release_iitc_code",
    "beta_iitc_code",
    "test_iitc_code",
    "local_iitc_code",
    "release_plugins_flat",
    "beta_plugins_flat",
    "test_plugins_flat",
    "local_plugins_flat",
    "release_plugins_local",
    "beta_plugins_local",
    "test_plugins_local",
    "local_plugins_local",
    "release_plugins_user",
    "beta_plugins_user",
    "test_plugins_user",
    "local_plugins_user"
  ]);

  const channel = data.channel ? data.channel : "release";

  const status = data["IITC_is_enabled"];
  const iitc_code = data[channel + "_iitc_code"];

  const plugins_local = data[channel + "_plugins_local"];
  const plugins_user = data[channel + "_plugins_user"];

  if ((status === undefined || status === true) && iitc_code !== undefined) {
    const tabs = await getTabsToInject();
    const userscripts = [];

    const plugins_flat = data[channel + "_plugins_flat"];
    for (const uid of Object.keys(plugins_flat)) {
      if (plugins_flat[uid]["status"] === "on") {
        userscripts.push(
          plugins_flat[uid]["user"] === true
            ? plugins_user[uid]["code"]
            : plugins_local[uid]["code"]
        );
      }
    }

    userscripts.push(iitc_code);

    await Promise.all(userscripts.map(code => injectUserScript(code, tabs)));
  }
}

async function setTabActive(tabId) {
  const tab = await browser.tabs.update(tabId, {
    active: true
  });

  try {
    await browser.windows.update(tab.windowId, { focused: true });
  } catch (error) {
    lastIITCTab = null;
    await onRequestOpenIntel();
  }
}

async function getTabInfo(tabId) {
  return await browser.tabs.get(tabId);
}

function isIngressUrl(url) {
  if (url) {
    return /intel.ingress.com/.test(url);
  }
  return false;
}
