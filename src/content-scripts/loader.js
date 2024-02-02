//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { GM } from "./gm-api";
import { inject, IITCButtonInitJS } from "./utils";
import { bridgeAction } from "@/content-scripts/bridge";

function preparePage() {
  document.addEventListener("DOMContentLoaded", function () {
    if (window.location.hostname === "intel.ingress.com") {
      window.onload = function () {};
      document.body.onload = function () {};
    }
  });

  inject(
    `((${GM.toString()}))()\n//# sourceURL=${browser.runtime.getURL(
      "js/GM_api.js"
    )}`
  );
  document.addEventListener("bridgeRequest", bridgeAction);
  document.addEventListener("IITCButtonInitJS", IITCButtonInitJS);
}

browser.storage.local.get(["IITC_is_enabled"]).then((data) => {
  if (data["IITC_is_enabled"] !== false) {
    preparePage();
  }
});
