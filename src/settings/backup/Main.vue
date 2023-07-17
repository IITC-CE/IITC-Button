<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="page">
    <div class="parent">
      <h1>{{ _("import") }}</h1>
      <div class="card">
        <label class="setting-check">
          <input type="checkbox" v-model="import_settings" />
          <span>{{ _("import_settings") }}</span>
        </label>
        <label class="setting-check">
          <input type="checkbox" v-model="import_data" />
          <span>{{ _("import_data") }}</span>
        </label>
        <label class="setting-check">
          <input type="checkbox" v-model="import_external" />
          <span>{{ _("import_external") }}</span>
        </label>
        <div class="btn disabled" v-if="is_wait">{{ _("pleaseWait") }}</div>
        <form v-on:click="$refs.input.click()" v-if="!is_wait">
          <div class="btn">{{ _("importFromZip") }}</div>
          <input
            type="file"
            ref="input"
            accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed"
            id="input"
            style="display: none"
            v-on:change="handleImport"
          />
        </form>
      </div>
      <h1>{{ _("export") }}</h1>
      <div class="card">
        <label class="setting-check">
          <input type="checkbox" v-model="export_settings" />
          <span>{{ _("export_settings") }}</span>
        </label>
        <label class="setting-check">
          <input type="checkbox" v-model="export_data" />
          <span>{{ _("export_data") }}</span>
        </label>
        <label class="setting-check">
          <input type="checkbox" v-model="export_external" />
          <span>{{ _("export_external") }}</span>
        </label>
        <div class="btn" @click="handleExport">{{ _("exportToZip") }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { _ } from "@/i18n";
import {
  createBackupZip,
  filterExternalPlugins,
  filterStorageIitcSettings,
  filterStoragePluginsSettings
} from "./export";
import {
  getBackupDataFromZip,
  importBackupExternalPlugins,
  importBackupIitcSettings,
  importBackupPluginsSettings
} from "@/settings/backup/import";

export default {
  name: "PageBackup",
  data() {
    return {
      is_wait: false,
      import_settings: true,
      import_status: true,
      import_data: true,
      import_external: true,
      export_settings: true,
      export_data: true,
      export_external: true
    };
  },
  methods: {
    _: _,
    async handleImport(e) {
      const target = e.target;
      const files = target.files;
      if (files.length === 0) return;

      this.is_wait = true;
      const backup = await getBackupDataFromZip(files[0]);
      const default_channel = await browser.storage.local
        .get(["channel"])
        .then(data => data.channel);

      if (this.import_settings)
        await importBackupIitcSettings(
          backup.data.iitc_settings,
          default_channel
        );
      if (this.import_data)
        await importBackupPluginsSettings(backup.data.plugins_data);
      if (this.import_external)
        await importBackupExternalPlugins(
          backup.external_plugins,
          default_channel
        );
      const message = _("backupRestored");
      alert(message);
      this.is_wait = false;
    },
    async handleExport() {
      const backup = await this.getBackupData();
      await createBackupZip(backup);
    },
    async getBackupData() {
      const backup = {
        external_plugins: {},
        data: {
          iitc_settings: {},
          plugins_data: {},
          app: "IITC Button"
        }
      };
      const all_storage = await browser.storage.local.get(null);

      if (this.export_settings)
        backup.data.iitc_settings = filterStorageIitcSettings(all_storage);
      if (this.export_data)
        backup.data.plugins_data = filterStoragePluginsSettings(all_storage);
      if (this.export_external)
        backup.external_plugins = filterExternalPlugins(all_storage);

      return backup;
    }
  }
};
</script>

<style src="../../../public/assets/roboto/roboto-font.css"></style>

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
  width: 90%;
  max-width: 800px;
  box-sizing: border-box;
}

.setting-check span {
  padding-left: 5px;
  vertical-align: middle;
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

.btn.disabled {
  background: #484848;
}
</style>
