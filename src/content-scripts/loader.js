//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import { getUID, getUniqId, parseMeta } from "../helpers";
import { GM } from "./gm-api";

const loaded_plugins = [];

document.addEventListener("DOMContentLoaded", function() {
  window.onload = function() {};
  document.body.onload = function() {};
});

function inject(code) {
  const script = document.createElement("script");
  script.appendChild(document.createTextNode(code));
  (document.body || document.head || document.documentElement).appendChild(
    script
  );
  script.parentElement.removeChild(script);
}

function preparePage() {
  inject(
    `((${GM.toString()}))()\n//# sourceURL=${browser.runtime.getURL(
      "js/GM_api.js"
    )}`
  );

  document.addEventListener("xmlHttpRequestBridge", async function(e) {
    const data = e.detail;
    await browser.runtime.sendMessage({
      type: "xmlHttpRequestHandler",
      value: data
    });
  });

  document.addEventListener("IITCButtonInitJS", function(e) {
    const tab_id = e.detail.tab_id;
    const code = e.detail.code;

    const meta = parseMeta(code);
    const uid = getUID(meta);
    meta["uid"] = uid;

    let dataKey = sessionStorage.getItem(uid);
    if (!dataKey) {
      dataKey = getUniqId("VMin");
      sessionStorage.setItem(uid, dataKey);
    }

    if (loaded_plugins.includes(uid)) {
      console.debug(`Plugin ${uid} is already loaded. Skip`);
    } else {
      loaded_plugins.push(uid);
      console.debug(`Plugin ${uid} loaded`);

      const name = encodeURIComponent(meta.name);
      const injectedCode = [
        "((GM)=>{",
        // an implementation of GM API v3 based on GM API v4
        "const GM_info = GM.info; const unsafeWindow = window;",
        "const GM_getValue = (key, value) => GM._getValueSync(key, value);",
        "const GM_setValue = (key, value) => GM._setValueSync(key, value);",
        "const GM_xmlhttpRequest = (details) => GM.xmlHttpRequest(details);",

        code,
        // adding a new line in case the code ends with a line comment
        code.endsWith("\n") ? "" : "\n",
        `})(GM("${dataKey}", ${tab_id}, ${JSON.stringify(meta)}))`,

        // Firefox lists .user.js among our own content scripts so a space at start will group them
        `\n//# sourceURL=${browser.runtime.getURL(
          "plugins/%20" + name + ".user.js"
        )}`
      ].join("");

      inject(injectedCode);
    }
  });
}

browser.storage.local.get(["IITC_is_enabled"]).then(data => {
  if (data["IITC_is_enabled"] !== false) {
    preparePage();
  }
});
