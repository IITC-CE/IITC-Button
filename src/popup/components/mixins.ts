// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE
import browser from "webextension-polyfill";
import { t } from "@/i18n";
import { emitter } from "@/popup/eventBus";
import type { Plugin, PluginMeta } from "lib-iitc-manager";

export const mixin = {
  data() {
    return {
      updateChannels: {
        release: { name: t("release") },
        beta: { name: t("beta") },
        custom: { name: t("custom") },
      },
      updateChannelsIntervals: {
        release: { name: t("release") },
        beta: { name: t("beta") },
        custom: { name: t("custom") },
        external: { name: t("anyChannel") },
      },
      updateIntervals: [
        { name: t("every5seconds"), value: "5" },
        { name: t("every6hours"), value: "21600" },
        { name: t("every12hours"), value: "43200" },
        { name: t("everyDay"), value: "86400" },
        { name: t("everyWeek"), value: "604800" },
      ],
    };
  },
  methods: {
    t: t,
    __: function (key: string, item: PluginMeta): string {
      if (!(key in item)) return "";
      const lang = browser.i18n.getUILanguage();
      const val = `${key}:${lang}` in item ? item[`${key}:${lang}`] : item[key];
      return typeof val === "string" ? val : "";
    },
    objIsEmpty: function (obj: unknown): boolean {
      return (
        typeof obj !== "object" ||
        obj === null ||
        Object.keys(obj as object).length === 0
      );
    },
    openLink: async function (url: string): Promise<void> {
      await browser.tabs.create({ url: url });
      window.close();
    },
    back: function (): void {
      document.body.id = "main-menu";
    },
    sortIITCObj: function (
      obj: Record<string, Plugin> | undefined,
    ): Record<string, Plugin> {
      if (obj === undefined) {
        return {};
      }

      const arr = Object.entries(obj);
      arr.sort((a, b) => {
        const nameA = this.__("name", a[1]).toLowerCase();
        const nameB = this.__("name", b[1]).toLowerCase();
        return nameA > nameB ? 1 : -1;
      });

      return Object.fromEntries(arr);
    },
    showMessage: function (msg: string): void {
      emitter.emit("message", msg);
    },
  },
};
