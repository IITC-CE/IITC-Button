// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE

import { getUID } from "lib-iitc-manager";
import type { Plugin } from "lib-iitc-manager";

declare global {
  interface Window {
    iitcbutton?: boolean;
  }
}

const LOADED_PLUGINS: string[] = [];

export const isRunContentScript = !window.iitcbutton;

export function inject(code: string): void {
  const script = document.createElement("script");
  script.appendChild(document.createTextNode(code));
  const parent = document.body || document.head || document.documentElement;
  parent.appendChild(script);
  parent.removeChild(script);
}

export async function IITCButtonInitJS(
  e: CustomEvent<{ plugin: Plugin }>,
): Promise<void> {
  const plugin = e.detail.plugin;

  const uid = plugin.uid ?? getUID(plugin) ?? "";
  if (LOADED_PLUGINS.includes(uid)) {
    console.debug(`Plugin ${uid} is already loaded. Skip`);
  } else {
    LOADED_PLUGINS.push(uid);
    console.debug(`Plugin ${uid} loaded`);
    inject(plugin.code ?? "");
  }
}
