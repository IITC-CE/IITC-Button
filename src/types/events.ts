// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE
// Mitt event map for the popup event bus
export interface PopupEvents {
  message: string;
  "tag:active": string;
  [key: string]: unknown;
  [key: symbol]: unknown;
}
