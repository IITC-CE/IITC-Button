// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE

import browser from "webextension-polyfill";

export async function is_iitc_enabled(): Promise<boolean> {
  const status = await browser.storage.local
    .get(["IITC_is_enabled"])
    .then((data) => data["IITC_is_enabled"]);
  return status !== false;
}

export function is_userscripts_api_available(): boolean {
  try {
    // Property access which throws if developer mode is not enabled.
    return browser.userScripts !== undefined;
  } catch {
    // Not available.
    return false;
  }
}
