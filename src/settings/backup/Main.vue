<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="page">
    <div class="parent">
      <h1>{{ _("import") }}</h1>
      <div class="card">
        TODO
      </div>
      <h1>{{ _("export") }}</h1>
      <div class="card">
        <label class="setting-check">
          <input type="checkbox" v-model="export_settings" />
          <span>{{ _("export_settings") }}</span>
        </label>
        <label class="setting-check">
          <input type="checkbox" v-model="export_status" />
          <span>{{ _("export_status") }}</span>
        </label>
        <label class="setting-check">
          <input type="checkbox" v-model="export_data" />
          <span>{{ _("export_data") }}</span>
        </label>
        <label class="setting-check">
          <input type="checkbox" v-model="export_external" />
          <span>{{ _("export_external") }}</span>
        </label>
        <div class="btn" @click="goExport">{{ _("exportToZip") }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { _ } from "@/i18n";
import {
  filterExternalPlugins,
  filterStorageIitcSettings,
  filterStoragePluginsSettings,
  filterStoragePluginsStatus,
  formatDate
} from "./utils";

const JSZip = require("jszip");

const saveAs = (blob, fileName) => {
  const link = document.createElement("a");
  // create a blobURI pointing to our Blob
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  // some browser needs the anchor to be in the doc
  document.body.append(link);
  link.click();
  link.remove();
  // in case the Blob uses a lot of memory
  setTimeout(() => URL.revokeObjectURL(link.href), 7000);
};

export default {
  name: "PageBackup",
  data() {
    return {
      export_settings: true,
      export_status: true,
      export_data: true,
      export_external: true
    };
  },
  methods: {
    _: _,
    async goExport() {
      const zip = new JSZip();
      const backup = await this.getBackupData();

      zip.file("iitc-button.json", JSON.stringify(backup.data));

      for (const channel in backup.external_plugins) {
        for (const external_plugin_name in backup.external_plugins[channel]) {
          zip.file(
            `${channel}/${external_plugin_name}`,
            backup.external_plugins[channel][external_plugin_name]
          );
        }
      }

      const filename = "iitc-backup_" + formatDate(new Date()) + ".zip";
      zip.generateAsync({ type: "blob" }).then(function(content) {
        saveAs(content, filename);
      });
    },
    async getBackupData() {
      const backup = {
        external_plugins: {},
        data: {
          iitc_settings: {},
          plugins_status: {},
          plugins_data: {},
          app: "IITC Button"
        }
      };
      const all_storage = await browser.storage.local.get(null);

      if (this.export_settings)
        backup.data.iitc_settings = filterStorageIitcSettings(all_storage);
      if (this.export_status)
        backup.data.plugins_status = filterStoragePluginsStatus(all_storage);
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
</style>
