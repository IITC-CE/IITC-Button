//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import { getUID } from "lib-iitc-manager";

const LOADED_PLUGINS = [];

export const isRunContentScript = !window.iitcbutton;

export function inject(code) {
  const script = document.createElement("script");
  script.appendChild(document.createTextNode(code));
  (document.body || document.head || document.documentElement).appendChild(
    script
  );
  script.parentElement.removeChild(script);
}

export async function IITCButtonInitJS(e) {
  const plugin = e.detail.plugin;

  const uid = plugin.uid ? plugin.uid : getUID(plugin);
  if (LOADED_PLUGINS.includes(uid)) {
    console.debug(`Plugin ${uid} is already loaded. Skip`);
  } else {
    LOADED_PLUGINS.push(uid);
    console.debug(`Plugin ${uid} loaded`);
    inject(plugin.code);
  }
}
