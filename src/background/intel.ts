//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import browser from "webextension-polyfill";
import type WebExt from "webextension-polyfill";
import { getTabsToInject } from "@/background/utils";
import { is_iitc_enabled } from "@/userscripts/utils";
import { IS_USERSCRIPTS_API } from "@/userscripts/env";
import type { Manager } from "lib-iitc-manager";

const activeTabs: number[] = [];
let lastIITCTab: number | null = null;

export async function onRequestOpenIntel(): Promise<void> {
  if (lastIITCTab) {
    const tabInfo = await getTabInfo(lastIITCTab);
    if (tabInfo && isIngressIntelUrl(tabInfo.url)) {
      return await setTabActive(lastIITCTab);
    }
  }

  try {
    const tab = await browser.tabs.create({
      url: "https://intel.ingress.com/",
    });
    lastIITCTab = tab.id ?? null;
  } catch (error) {
    console.error(
      `An error occurred while open tab: ${(error as Error).message}`,
    );
  }
}

export async function onToggleIITC(status: boolean): Promise<void> {
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

    for (const tab of Object.values(tabs)) {
      if (isIngressIntelUrl(tab.url)) {
        await browser.tabs.reload(tab.id!);
      }
    }
  }
}

function removeTabFromActiveTabs(tabId: number): void {
  const index = activeTabs.indexOf(tabId);
  if (index !== -1) {
    activeTabs.splice(index, 1);
  }
}

// tab listeners
export async function onUpdatedListener(
  tabId: number,
  status: WebExt.Tabs.OnUpdatedChangeInfoType,
  tab: WebExt.Tabs.Tab,
  manager: Manager,
): Promise<void> {
  if (status.status !== "complete" && activeTabs.includes(tabId)) {
    removeTabFromActiveTabs(tabId);
  }
  // Prevent reinitialization on the same page
  if (status.status === "complete" && !activeTabs.includes(tabId)) {
    activeTabs.push(tabId);
    await initialize(manager);
    if (isIngressIntelUrl(tab.url)) {
      lastIITCTab = tabId;
    }
  }
}

export function onRemovedListener(tabId: number): void {
  removeTabFromActiveTabs(tabId);
  if (lastIITCTab === tabId) {
    lastIITCTab = null;
  }
}

async function initialize(manager: Manager): Promise<void> {
  const status = await is_iitc_enabled();
  if (status) {
    await manager.inject();
  }
}

async function setTabActive(tabId: number): Promise<void> {
  const tab = await browser.tabs.update(tabId, {
    active: true,
  });

  try {
    await browser.windows.update(tab.windowId!, { focused: true });
  } catch {
    lastIITCTab = null;
    await onRequestOpenIntel();
  }
}

async function getTabInfo(tabId: number): Promise<WebExt.Tabs.Tab | null> {
  try {
    return await browser.tabs.get(tabId);
  } catch {
    return null;
  }
}

function isIngressIntelUrl(url: string | undefined): boolean {
  if (url) {
    return /^https:\/\/intel\.ingress\.com/.test(url);
  }
  return false;
}
