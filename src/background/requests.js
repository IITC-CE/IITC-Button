//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import {
  parseMeta,
  ajaxGet,
  getUniqId,
  check_meta_match_pattern
} from "lib-iitc-manager";

const whitelist = [
  "^https://github.com/[^/]*/[^/]*/raw/[^/]*/[^/]*?\\.user\\.js([?#]|$)",
  "^https://gist.github.com/.*?/[^/]*?.user.js([?#]|$)",
  "^https://gitlab.com/[^/]*/[^/]*/(|-/)raw/[^/]*/[^/]*?\\.user\\.js([?#]|$)"
].map(re => new RegExp(re));
const blacklist = ["//(?:(?:gist.|)github.com|gitlab.com)/"].map(
  re => new RegExp(re)
);

export function onBeforeRequest(req) {
  const { method, tabId, url } = req;
  if (method !== "GET") {
    return;
  }

  browser.storage.local.get(["IITC_is_enabled"]).then(data => {
    if (data["IITC_is_enabled"] !== false) {
      if (!blacklist.some(matches, url) || whitelist.some(matches, url)) {
        maybeInstallUserJs(tabId, url).then();
        return { redirectUrl: "javascript:void 0" }; // eslint-disable-line no-script-url
      }
    }
  });
}

async function maybeInstallUserJs(tabId, url) {
  let code = undefined;
  try {
    code = await ajaxGet(url);
  } catch {
    if (tabId >= 0) browser.tabs.update(tabId, { url });
  }

  if (code) {
    const meta = parseMeta(code);

    if (meta.name && check_meta_match_pattern(meta)) {
      await confirmInstall(url, code);
      browser.tabs.remove(tabId);
    }
  }
}

async function confirmInstall(url, code) {
  const cache = {};
  const uniqId = getUniqId("tmp");
  cache[uniqId] = { url: url, code: code };
  await browser.storage.local.set(cache);

  await browser.tabs.create({
    url: await browser.runtime.getURL(`/jsview.html?uniqId=${uniqId}`)
  });
}

/** @this {string} */
function matches(re) {
  return re.test(this);
}
