<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="page">
    <Header ref="header" :meta="meta" :code="code"></Header>
    <Code :code="code" :status="status" />
  </div>
</template>

<script>
import browser from "webextension-polyfill";
import Code from "./Code";
import { _ } from "@/i18n";
import Header from "./Header";
import { ajaxGet } from "lib-iitc-manager";
import { parseMeta } from "lib-iitc-manager";

export default {
  name: "App",
  components: {
    Header,
    Code,
  },
  data() {
    return {
      meta: {},
      code: "",
      status: _("loading"),
    };
  },
  methods: {
    _: _,
    bypass: async function (tabId, url) {
      await browser.tabs.create({
        url: `${url}#pass`,
      });
      await browser.tabs.remove(tabId);
    },
  },
  async mounted() {
    const last_userscript_request = await browser.storage.local
      .get("last_userscript_request")
      .then((d) => d.last_userscript_request);
    const tabId = last_userscript_request["tabId"];
    const url = last_userscript_request["url"];

    let code = undefined;
    try {
      code = await ajaxGet(url);
    } catch {
      return await this.bypass(tabId, url);
    }

    const meta = parseMeta(code);
    if (meta === null || !("name" in meta) || meta.name === undefined) {
      return await this.bypass(tabId, url);
    }

    document.title = `${meta["name"]} — ${_("jsViewTitle")} — IITC Button`;
    meta["filename"] = url.substr(url.lastIndexOf("/") + 1);
    this.meta = meta;
    this.code = code;
  },
};
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
