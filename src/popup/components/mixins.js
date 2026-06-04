//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import browser from "webextension-polyfill";
import { t } from "@/i18n";
import { emitter } from "@/popup/eventBus";

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
    __: function (key, item) {
      if (item === undefined || !(key in item)) return "";
      const lang = browser.i18n.getUILanguage();
      return `${key}:${lang}` in item ? item[`${key}:${lang}`] : item[key];
    },
    objIsEmpty: function (obj) {
      return typeof obj !== "object" || Object.keys(obj).length === 0;
    },
    openLink: async function (url) {
      await browser.tabs.create({ url: url });
      window.close();
    },
    back: function () {
      document.body.id = "main-menu";
    },
    sortIITCObj: function (obj) {
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
    showMessage: function (msg) {
      emitter.emit("message", msg);
    },
  },
};
