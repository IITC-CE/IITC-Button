//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";

export async function is_iitc_enabled() {
  const status = await browser.storage.local
    .get(["IITC_is_enabled"])
    .then((data) => data["IITC_is_enabled"]);
  return status !== false;
}

export function is_userscripts_api_available() {
  try {
    // Property access which throws if developer mode is not enabled.
    chrome.userScripts;
    return true;
  } catch {
    // Not available.
    return false;
  }
}
