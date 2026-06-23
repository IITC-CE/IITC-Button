<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header-inner">
        <div>
          <div class="page-crumbs">{{ t("sidebarExtension") }}</div>
          <h1 class="page-title">{{ t("backup") }}</h1>
        </div>
      </div>
    </header>
    <div class="page-scroll">
      <div class="page-inner">
        <section>
          <div class="block-head">
            <div class="block-title">{{ t("import") }}</div>
            <div class="block-sub">{{ t("import_message") }}</div>
          </div>
          <div class="panel">
            <form v-on:click="clickInput" v-if="!is_wait">
              <button type="button" class="btn-ghost">
                {{ t("importFromZip") }}
              </button>
              <input
                type="file"
                ref="input"
                accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed"
                id="input"
                style="display: none"
                v-on:change="handleImport"
              />
            </form>
            <div class="hr" v-if="show_restore || is_invalid_backup"></div>
            <label class="setting-check" v-if="show_import_settings">
              <input type="checkbox" v-model="import_settings" />
              <span>{{ t("import_settings") }}</span>
            </label>
            <label class="setting-check" v-if="show_import_data">
              <input type="checkbox" v-model="import_data" />
              <span>{{ t("import_data") }}</span>
            </label>
            <label class="setting-check" v-if="show_import_external">
              <input type="checkbox" v-model="import_external" />
              <span>{{ t("import_external") }}</span>
            </label>
            <button class="btn-primary disabled" v-if="is_wait">
              {{ t("pleaseWait") }}
            </button>
            <button
              class="btn-primary"
              v-if="show_restore"
              @click="handleRestore"
            >
              {{ t("restoreBackup") }}
            </button>
            <p class="message" v-if="is_invalid_backup">
              {{ t("invalidBackup") }}
            </p>
          </div>
        </section>

        <section>
          <div class="block-head">
            <div class="block-title">{{ t("export") }}</div>
          </div>
          <div class="panel">
            <label class="setting-check">
              <input type="checkbox" v-model="export_settings" />
              <span>{{ t("export_settings") }}</span>
            </label>
            <label class="setting-check">
              <input type="checkbox" v-model="export_data" />
              <span>{{ t("export_data") }}</span>
            </label>
            <label class="setting-check">
              <input type="checkbox" v-model="export_external" />
              <span>{{ t("export_external") }}</span>
            </label>
            <button class="btn-primary" @click="handleExport">
              {{ t("exportToZip") }}
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import browser from "webextension-polyfill";
import { t } from "@/i18n";
import { getBackupDataFromZip, createBackupZip } from "./utils";
import type { BackupData } from "lib-iitc-manager";

export default defineComponent({
  name: "PageBackup",
  data() {
    return {
      is_wait: false,
      is_invalid_backup: false,
      backup_data: null as BackupData | null,
      show_import_settings: false,
      show_import_data: false,
      show_import_external: false,
      show_restore: false,
      import_settings: true,
      import_data: true,
      import_external: true,
      export_settings: true,
      export_data: true,
      export_external: true,
    };
  },
  methods: {
    t: t,
    clickInput() {
      (this.$refs.input as HTMLInputElement).click();
    },
    async handleExport() {
      await browser.runtime.sendMessage({
        type: "getBackupData",
        params: {
          settings: this.export_settings,
          data: this.export_data,
          external: this.export_external,
        },
      });
    },
    async handleImport(e: Event) {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      this.backup_data = await getBackupDataFromZip(files[0]);

      this.show_import_settings =
        typeof this.backup_data.data.iitc_settings === "object" &&
        Object.keys(this.backup_data.data.iitc_settings).length !== 0;
      this.show_import_data =
        typeof this.backup_data.data.plugins_data === "object" &&
        Object.keys(this.backup_data.data.plugins_data).length !== 0;
      this.show_import_external =
        Object.keys(this.backup_data.external_plugins).length !== 0;

      const any_data =
        this.show_import_settings ||
        this.show_import_data ||
        this.show_import_external;
      this.show_restore = any_data;
      this.is_invalid_backup = !any_data;
    },
    async handleRestore() {
      this.is_wait = true;
      this.show_restore = false;
      this.show_import_settings = false;
      this.show_import_data = false;
      this.show_import_external = false;

      await browser.runtime.sendMessage({
        type: "setBackupData",
        params: {
          settings: this.import_settings,
          data: this.import_data,
          external: this.import_external,
        },
        backup_data: this.backup_data,
      });
    },
    setListeners: function () {
      browser.runtime.onMessage.addListener((request: unknown) => {
        const msg = request as { type: string; data?: unknown };
        switch (msg.type) {
          case "resolveGetBackupData":
            createBackupZip(
              msg.data as Parameters<typeof createBackupZip>[0],
            ).then();
            break;
          case "resolveSetBackupData":
            alert(t("backupRestored"));
            this.backup_data = null;
            this.is_wait = false;
        }
      });
    },
  },
  async mounted() {
    this.setListeners();
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

.setting-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--on-surface);
  cursor: pointer;
}

.message {
  margin: 0;
  font-size: 13px;
  color: var(--on-surface-variant);
}

.hr {
  background: var(--outline);
  height: 1px;
  width: 100%;
  margin: 4px 0;
}
</style>
