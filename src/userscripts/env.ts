// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE

import browser from "webextension-polyfill";

// OnInstalledReason.CHROME_UPDATE exists only in Chrome's runtime implementation
export const IS_CHROME = !!(
  browser.runtime as unknown as {
    OnInstalledReason?: { CHROME_UPDATE?: string };
  }
).OnInstalledReason?.CHROME_UPDATE;
export const IS_SAFARI =
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
  (navigator.vendor && navigator.vendor.indexOf("Apple") > -1);

export const IS_USERSCRIPTS_API = IS_CHROME;
export const IS_SCRIPTING_API = !!browser.scripting;
