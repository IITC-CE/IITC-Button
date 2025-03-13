//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";

export const IS_CHROME = !!browser.runtime.OnInstalledReason?.CHROME_UPDATE;
export const IS_SAFARI =
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
  (navigator.vendor && navigator.vendor.indexOf("Apple") > -1);
export const MANIFEST = browser.runtime.getManifest();

export const IS_USERSCRIPTS_API = IS_CHROME && MANIFEST.manifest_version === 3;
export const IS_SCRIPTING_API = !!browser.scripting;
export const IS_LEGACY_API = !IS_USERSCRIPTS_API && !IS_SCRIPTING_API;
