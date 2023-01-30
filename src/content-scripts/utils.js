//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import { getUID, parseMeta, check_meta_match_pattern } from "lib-iitc-manager";

const LOADED_PLUGINS = [];

export function inject(code) {
  const script = document.createElement("script");
  script.appendChild(document.createTextNode(code));
  (document.body || document.head || document.documentElement).appendChild(
    script
  );
  script.parentElement.removeChild(script);
}

function getPluginHash(uid) {
  return "VMin" + btoa(uid);
}

export async function IITCButtonInitJS(e) {
  const tab_id = e.detail.tab_id;
  const code = e.detail.code;

  const meta = parseMeta(code);
  const uid = getUID(meta);
  meta["uid"] = uid;

  let data_key = getPluginHash(uid);
  if (LOADED_PLUGINS.includes(uid)) {
    console.debug(`Plugin ${uid} is already loaded. Skip`);
  } else {
    if (!check_meta_match_pattern(meta, window.location.hostname)) {
      console.debug(`Skip ${uid}, not right domain`);
      return;
    }

    LOADED_PLUGINS.push(uid);
    console.debug(`Plugin ${uid} loaded`);

    const name = encodeURIComponent(meta.name);
    const injectedCode = [
      "((GM)=>{",
      // an implementation of GM API v3 based on GM API v4
      "const GM_info = GM.info; const unsafeWindow = window;",
      "const exportFunction = GM.exportFunction; const createObjectIn = GM.createObjectIn; const cloneInto = GM.cloneInto;",
      "const GM_getValue = (key, value) => GM._getValueSync(key, value);",
      "const GM_setValue = (key, value) => GM._setValueSync(key, value);",
      "const GM_xmlhttpRequest = (details) => GM.xmlHttpRequest(details);",

      code,
      // adding a new line in case the code ends with a line comment
      code.endsWith("\n") ? "" : "\n",
      `})(GM("${data_key}", ${tab_id}, ${JSON.stringify(meta)}))`,

      // Firefox lists .user.js among our own content scripts so a space at start will group them
      `\n//# sourceURL=${browser.runtime.getURL(
        "plugins/%20" + name + ".user.js"
      )}`
    ].join("");

    inject(injectedCode);
  }
}
