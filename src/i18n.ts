// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE
import browser from "webextension-polyfill";

export function t(msg: string, arg?: string | string[]): string {
  return browser.i18n.getMessage(msg, arg);
}
