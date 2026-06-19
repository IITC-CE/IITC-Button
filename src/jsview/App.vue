<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="page">
    <Header ref="header" :meta="meta" :code="code"></Header>
    <Code :code="code" :status="status" />
  </div>
</template>

<script lang="ts">
import browser from "webextension-polyfill";
import Code from "./Code.vue";
import { t } from "@/i18n";
import Header from "./Header.vue";
import { fetchData } from "lib-iitc-manager";
import { parseMeta } from "lib-iitc-manager";

export default defineComponent({
  name: "App",
  components: {
    Header,
    Code,
  },
  data() {
    return {
      meta: {},
      code: "",
      status: t("loading"),
    };
  },
  methods: {
    t: t,
    bypass: async function (tabId: number | undefined, url: string) {
      await browser.tabs.create({
        url: `${url}#pass`,
      });
      if (tabId !== undefined) await browser.tabs.remove(tabId);
    },
  },
  async mounted() {
    let url = "";
    let code = undefined;
    let tabId = undefined;

    const uniqId = new URL(window.location.href).searchParams.get("uniqId");
    if (uniqId) {
      const data = await browser.storage.local.get(uniqId);
      const entry = data[uniqId] as { url: string; code: string };
      url = entry["url"];
      code = entry["code"];
      await browser.storage.local.remove(uniqId);
    } else {
      const last_userscript_request = (await browser.storage.local
        .get("last_userscript_request")
        .then((d) => d.last_userscript_request)) as {
        tabId: number;
        url: string;
      };
      tabId = last_userscript_request["tabId"];
      url = last_userscript_request["url"];

      code = await fetchData(url);
      if (!code) {
        return await this.bypass(tabId, url);
      }
    }

    const meta = parseMeta(code as string);
    if (
      !uniqId &&
      (meta === null || !("name" in meta) || meta.name === undefined)
    ) {
      return await this.bypass(tabId, url);
    }

    if (!meta) return;

    document.title = `${meta["name"]} — ${t("jsViewTitle")} — IITC Button`;
    meta["filename"] = url.substr(url.lastIndexOf("/") + 1);
    this.meta = meta as Record<string, unknown>;
    this.code = code as string;
  },
});
</script>

<style>
body {
  background: #f0f0f0;
  margin: 0;
}
</style>

<style scoped>
.page {
  display: flex;
  flex-direction: row;
}

@media (max-width: 1600px) {
  .page {
    flex-direction: column;
  }
}
</style>
