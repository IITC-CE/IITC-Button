<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header-inner">
        <div>
          <div class="page-crumbs">{{ t("sidebarExtension") }}</div>
          <h1 class="page-title">{{ t("debug") }}</h1>
        </div>
      </div>
    </header>
    <div class="page-scroll">
      <div class="page-inner">
        <section>
          <div class="block-head">
            <div class="block-title">{{ t("debug") }}</div>
            <div class="block-sub">
              {{ t("warningAboutLocalStoragePart1") }}
            </div>
          </div>
          <div class="panel">
            <p class="message warn">{{ t("warningAboutLocalStoragePart2") }}</p>
            <textarea
              v-model="local_storage_data"
              placeholder="loading"
              disabled
            ></textarea>
            <button class="btn-primary" @click="handleExport">
              {{ t("saveToJson") }}
            </button>
          </div>
        </section>

        <section>
          <div class="block-head">
            <div class="block-title">{{ t("importLocalStorage") }}</div>
            <div class="block-sub">
              {{ t("warningAboutImportLocalStorage") }}
            </div>
          </div>
          <div class="panel">
            <form v-on:click="clickInput">
              <button type="button" class="btn-ghost">
                {{ t("importFromJson") }}
              </button>
              <input
                type="file"
                ref="input"
                id="input"
                style="display: none"
                v-on:change="handleImport"
              />
            </form>
          </div>
        </section>
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
.panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  background: var(--surface-container);
  border: 1px solid var(--outline);
  border-radius: 14px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.message {
  margin: 0;
  font-size: 13px;
  color: var(--on-surface-variant);
}

.message.warn {
  color: var(--state-error);
  font-weight: 600;
}

textarea {
  width: 100%;
  box-sizing: border-box;
  height: 14em;
  resize: vertical;
  border: 1px solid var(--outline-strong);
  border-radius: 10px;
  padding: 12px;
  background: var(--surface);
  color: var(--on-surface-variant);
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.5;
}
</style>
