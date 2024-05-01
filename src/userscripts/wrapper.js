//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";
import { IS_USERSCRIPTS_API } from "@/userscripts/env";
import { manage_userscripts_api } from "@/background/injector";
import { strToBase64 } from "@/strToBase64";
import { getUID } from "lib-iitc-manager";
import { GM } from "@/userscripts/gm-api";

function getPluginHash(uid) {
  return "VMin" + strToBase64(uid);
}

function inject(code) {
  const script = document.createElement("script");
  script.appendChild(document.createTextNode(code));
  (document.body || document.head || document.documentElement).appendChild(
    script
  );
  script.parentElement.removeChild(script);
}

export function inject_gm_api() {
  const plugin = {
    uid: "gm_api",
    code: `((${GM.toString()}))()\n//# sourceURL=${browser.runtime.getURL(
      "js/GM_api.js"
    )}`,
  };

  if (IS_USERSCRIPTS_API) {
    const plugins_event = {
      event: "add",
      use_gm_api: false,
      plugins: [plugin],
    };
    manage_userscripts_api(plugins_event).then();
  } else {
    inject(plugin.code);
  }
}

export async function gm_api_for_plugin(plugin, tab_id) {
  const uid = plugin.uid ? plugin.uid : getUID(plugin);
  let data_key = getPluginHash(uid);
  const name = encodeURIComponent(plugin.name);

  const meta = { ...plugin };
  delete meta.code;

  return [
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
}
