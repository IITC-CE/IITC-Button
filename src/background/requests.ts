// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE

import browser from "webextension-polyfill";
import type WebExt from "webextension-polyfill";
import { IS_USERSCRIPTS_API } from "@/userscripts/env";
import { parseMeta, fetchResource, getUniqueId } from "lib-iitc-manager";

const IS_CHROME = !!(globalThis as Record<string, unknown>)["chrome"];
const whitelist = [
  "^https://github.com/[^/]*/[^/]*/raw/[^/]*/[^/]*?\\.user\\.js([?#]|$)",
  "^https://gist.github.com/.*?/[^/]*?.user.js([?#]|$)",
  "^https://gitlab.com/[^/]*/[^/]*/(|-/)raw/[^/]*/[^/]*?\\.user\\.js([?#]|$)",
].map((re) => new RegExp(re));
const blacklist = ["//(?:(?:gist.|)github.com|gitlab.com)/"].map(
  (re) => new RegExp(re),
);

const cache: Record<number, string> = {};

// webRequest mode: saves URL to cache; webRequestBlocking mode: cancels navigation and triggers plugin check
export function onBeforeRequest(
  req: WebExt.WebRequest.OnBeforeRequestDetailsType,
): WebExt.WebRequest.BlockingResponse | void {
  const { method, tabId, url } = req;

  if (IS_USERSCRIPTS_API) {
    const local_cache = {
      last_userscript_request: {
        tabId: tabId,
        url: url,
      },
    };
    browser.storage.local.set(local_cache).then();
  } else {
    if (tabId in cache && cache[tabId] === "bypass") {
      delete cache[tabId];
      return {};
    }
    if (method !== "GET") {
      return;
    }

    if (!blacklist.some(matches, url) || whitelist.some(matches, url)) {
      maybeInstallUserJs(tabId, url).then();
      return { cancel: true };
    }
  }
}

if (browser.webRequest) {
  const extraInfoSpec: WebExt.WebRequest.OnBeforeRequestOptions[] =
    !IS_USERSCRIPTS_API ? ["blocking"] : [];
  browser.webRequest.onBeforeRequest.addListener(
    onBeforeRequest,
    {
      urls: [
        // 1. *:// comprises only http/https
        // 2. the API ignores #hash part
        // 3. Firefox: onBeforeRequest does not work with file:// or moz-extension://
        "*://*/*.user.js",
        "*://*/*.user.js?*",
        "file://*/*.user.js",
        "file://*/*.user.js?*",
      ],
      types: ["main_frame"],
    },
    extraInfoSpec,
  );
}

if (browser.declarativeNetRequest) {
  browser.runtime.onInstalled.addListener(async function () {
    // restore the default rule if the extension is installed or updated
    const existingRules = await browser.declarativeNetRequest.getDynamicRules();

    const jsview_url = await browser.runtime.getURL(`/jsview.html`);
    browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRules.map((rule) => rule.id),
      addRules: [
        {
          id: 1,
          priority: 10,
          action: {
            type: "allow",
          },
          condition: {
            urlFilter: "|*.user.js*#pass|",
            resourceTypes: ["main_frame"],
          },
        },
        {
          id: 2,
          priority: 2,
          action: {
            type: "redirect",
            redirect: {
              url: jsview_url,
            },
          },
          condition: {
            urlFilter: "||github.com/*/*/raw/*/*.user.js",
            requestDomains: ["github.com"],
            resourceTypes: ["main_frame"],
          },
        },
        {
          id: 3,
          priority: 2,
          action: {
            type: "redirect",
            redirect: {
              url: jsview_url,
            },
          },
          condition: {
            urlFilter: "||gitlab.com/*/*/-/raw/*/*.user.js",
            requestDomains: ["gitlab.com"],
            resourceTypes: ["main_frame"],
          },
        },
        {
          id: 4,
          priority: 1,
          action: {
            type: "redirect",
            redirect: {
              url: jsview_url,
            },
          },
          condition: {
            urlFilter: "|*.user.js^",
            excludedRequestDomains: ["github.com", "gitlab.com"],
            resourceTypes: ["main_frame"],
          },
        },
      ],
    });
  });
}

// Writes the tab ID into the cache so that it does not interact with the tab later on and restarts the request
async function bypass(tabId: number, url: string): Promise<void> {
  if (tabId < 0) return;
  cache[tabId] = "bypass";
  await browser.tabs.update(tabId, { url });
}

/**
 * Checks the URL for availability of the IITC plugin.
 * Closes the tab if the URL was opened in a new tab.
 * If the URL is not an IITC plugin, causes the URL to reopen without further extension intervention.
 *
 */
async function maybeInstallUserJs(tabId: number, url: string): Promise<void> {
  const IITC_is_enabled = await browser.storage.local
    .get(["IITC_is_enabled"])
    .then((data) => data.IITC_is_enabled);
  if (IITC_is_enabled === false) {
    await bypass(tabId, url);
    return;
  }

  const { data: code } = await fetchResource(url);

  if (!code || typeof code !== "string") {
    await bypass(tabId, url);
    return;
  }

  const meta = parseMeta(code);

  if (meta && meta.name) {
    if (tabId in cache && cache[tabId] === "autoclose") {
      browser.tabs.remove(tabId).then();
    }
    await confirmInstall(url, code);
  } else {
    await bypass(tabId, url);
  }
}

// Creating a tab with plugin installation
async function confirmInstall(url: string, code: string): Promise<void> {
  const tmpCache: Record<string, { url: string; code: string }> = {};
  const uniqId = getUniqueId("tmp");
  tmpCache[uniqId] = { url: url, code: code };
  await browser.storage.local.set(tmpCache);

  await browser.tabs.create({
    url: await browser.runtime.getURL(`/jsview.html?uniqId=${uniqId}`),
  });
}

// Used with Array.prototype.some() where `this` is the URL string being tested
function matches(this: string, re: RegExp): boolean {
  return re.test(this);
}

// Set autoclose if userscript was opened in a new tab
browser.tabs.onCreated.addListener((tab) => {
  const url =
    tab.url === "about:blank" ? tab.title : tab.url || tab.pendingUrl || "";
  if (
    (/\.user\.js([?#]|$)/.test(url ?? "") || (url === "" && IS_CHROME)) &&
    (!blacklist.some(matches, url) || whitelist.some(matches, url))
  ) {
    if (tab.id !== undefined) {
      cache[tab.id] = "autoclose";
    }
  }
});

// Deleting status when closing a tab
browser.tabs.onRemoved.addListener((tabId) => {
  delete cache[tabId];
});
