//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";

/**
 * If the URL looks like an IITC plugin, saving the URL to the cache
 *
 * @param {Object} req - webRequest.onBeforeRequest object.
 */
export function onBeforeRequest(req) {
  const { tabId, url } = req;

  const cache = {
    last_userscript_request: {
      tabId: tabId,
      url: url,
    },
  };
  browser.storage.local.set(cache).then();
}

if (browser.webRequest) {
  browser.webRequest.onBeforeRequest.addListener(onBeforeRequest, {
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
  });
}

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
