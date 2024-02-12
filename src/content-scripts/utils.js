//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { getUID } from "lib-iitc-manager";
import { strToBase64 } from "@/strToBase64";

const LOADED_PLUGINS = [];

export function inject(code) {
  // const script = document.createElement("script");
  // script.appendChild(document.createTextNode(code));
  // (document.body || document.head || document.documentElement).appendChild(
  //   script
  // );
  // script.parentElement.removeChild(script);
  console.log(code[0]);
}

function getPluginHash(uid) {
  return "VMin" + strToBase64(uid);
}

export async function IITCButtonInitJS(e) {
  const tab_id = e.detail.tab_id;
  const plugin = e.detail.plugin;

  const meta = { ...plugin };
  delete meta.code;

  const uid = plugin.uid ? plugin.uid : getUID(plugin);
  let data_key = getPluginHash(uid);
  if (LOADED_PLUGINS.includes(uid)) {
    console.debug(`Plugin ${uid} is already loaded. Skip`);
  } else {
    LOADED_PLUGINS.push(uid);
    console.debug(`Plugin ${uid} loaded`);

    const name = encodeURIComponent(plugin.name);
    const injectedCode = [
      "((GM)=>{",
      // an implementation of GM API v3 based on GM API v4
      "const GM_info = GM.info; const unsafeWindow = window;",
      "const exportFunction = GM.exportFunction; const createObjectIn = GM.createObjectIn; const cloneInto = GM.cloneInto;",
      "const GM_getValue = (key, value) => GM._getValueSync(key, value);",
      "const GM_setValue = (key, value) => GM._setValueSync(key, value);",
      "const GM_xmlhttpRequest = (details) => GM.xmlHttpRequest(details);",

      plugin.code,
      // adding a new line in case the code ends with a line comment
      plugin.code.endsWith("\n") ? "" : "\n",
      `})(GM("${data_key}", ${tab_id}, ${JSON.stringify(meta)}))`,

      // Firefox lists .user.js among our own content scripts so a space at start will group them
      `\n//# sourceURL=${browser.runtime.getURL(
        "plugins/%20" + name + ".user.js"
      )}`,
    ].join("");

    inject(injectedCode);
  }
}
