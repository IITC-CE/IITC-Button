// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE
import type { Plugin } from "lib-iitc-manager";

// Mitt event map for the popup event bus
export interface PopupEvents {
  message: string;
  "tag:active": string;
  "plugin:info": Plugin;
  [key: string]: unknown;
  [key: symbol]: unknown;
}
