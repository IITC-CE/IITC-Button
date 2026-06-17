<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="page">
    <div class="parent">
      <h1>{{ t("debug") }}</h1>
      <div class="card">
        <p class="message">{{ t("warningAboutLocalStoragePart1") }}</p>
        <p class="message">
          <strong>{{ t("warningAboutLocalStoragePart2") }}</strong>
        </p>
        <textarea
          v-model="local_storage_data"
          placeholder="loading"
          disabled
        ></textarea>
        <div class="btn" @click="handleExport">{{ t("saveToJson") }}</div>
      </div>

      <h1>{{ t("importLocalStorage") }}</h1>
      <div class="card">
        <p class="message">
          <strong>{{ t("warningAboutImportLocalStorage") }}</strong>
        </p>
        <form v-on:click="clickInput">
          <div class="btn">{{ t("importFromJson") }}</div>
          <input
            type="file"
            ref="input"
            id="input"
            style="display: none"
            v-on:change="handleImport"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import browser from "webextension-polyfill";
import { t } from "@/i18n";
import { readUploadedFileAsText } from "@/settings/utils";

export default defineComponent({
  name: "PageDebug",
  data() {
    return {
      local_storage_data: "",
    };
  },
  methods: {
    t: t,
    clickInput() {
      (this.$refs.input as HTMLInputElement).click();
    },
    async handleExport() {
      const saveJson = (function () {
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function (data: string, fileName: string) {
          const blob = new Blob([data], { type: "application/x-javascript" }),
            url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
        };
      })();

      saveJson(this.local_storage_data, "iitc-localstorage.json");
    },
    async handleImport(e: Event) {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      const json_data = (await readUploadedFileAsText(files[0])) as string;
      const data = JSON.parse(json_data);
      await browser.storage.local.clear();
      await browser.storage.local.set(data);
      alert(t("backupRestored"));
    },
  },
  async mounted() {
    this.local_storage_data = JSON.stringify(await browser.storage.local.get());
  },
});
</script>

<style scoped>
h1 {
  color: #fff;
}

.card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 3px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
  padding: 30px;
  width: 100%;
  box-sizing: border-box;
}

.btn {
  cursor: pointer;
  padding: 10px 22px;
  background: #0e3d4e;
  color: #fdfdfd;
  border-radius: 3px;
  display: inline-block;
  margin: 20px auto 0 0;
  box-sizing: border-box;
  height: 42px;
}

.btn:hover {
  background: #094559;
}

.message {
  margin: 5px 0;
}

textarea {
  height: 14em;
  margin: 5px 0;
}
</style>
