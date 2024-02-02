<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="page">
    <Header ref="header" :meta="meta" :code="code"></Header>
    <Code :code="code" :status="status" />
  </div>
</template>

<script>
import Code from "./Code";
import { _ } from "@/i18n";
import Header from "./Header";
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
  },
  async mounted() {
    const uniqId = new URL(window.location.href).searchParams.get("uniqId");
    const data = await browser.storage.local.get(uniqId);
    const { url, code } = data[uniqId];
    await browser.storage.local.remove(uniqId);

    const meta = parseMeta(code);
    if (meta["name"] === undefined) return;
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
