<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="addUserScript-wrapper">
    <div id="addUserScript" v-bind:class="{ hide: !show_header }">
      <PluginInfo :meta="meta" :notice="notice" detailed dark-icon>
        <template #action>
          <button
            id="install"
            class="btn"
            :class="{ disabled: installed }"
            :disabled="installed"
            @click="install"
          >
            {{ installed ? t("installed") : button_name }}
          </button>
        </template>
      </PluginInfo>
    </div>
  </div>
</template>

<script lang="ts">
import { toRaw, type PropType } from "vue";
import browser from "webextension-polyfill";
import { t } from "@/i18n";
import { getUID, IITC_CORE_UID } from "lib-iitc-manager";
import type { PluginMeta, Plugin } from "lib-iitc-manager";
import PluginInfo from "@/components/PluginInfo.vue";
import { uuidv4 } from "@/uuid";

export default defineComponent({
  name: "Header",
  components: { PluginInfo },
  props: {
    meta: {
      type: Object as PropType<PluginMeta>,
      required: true as const,
    },
    code: String,
  },
  data() {
    return {
      show_header: false,
      button_name: t("install"),
      page_uuid: uuidv4(),
      installed: false,
      overwrite: "" as "" | "builtin" | "thirdparty",
    };
  },
  computed: {
    notice(): { level: "warning" | "info"; text: string } | null {
      if (this.overwrite === "builtin")
        return { level: "warning", text: t("overwriteBuiltinPlugin") };
      if (this.overwrite === "thirdparty")
        return { level: "info", text: t("overwriteInstalledPlugin") };
      return null;
    },
  },
  methods: {
    t: t,
    install: async function () {
      if (this.installed) return;
      const script = [{ meta: toRaw(this.meta), code: this.code }];
      await browser.runtime.sendMessage({
        type: "addUserScripts",
        id: this.page_uuid,
        scripts: script,
      });
    },
    checkIfInstalled: async function () {
      const uid = getUID(this.meta);
      if (uid === IITC_CORE_UID) {
        this.button_name = t("reinstall");
        this.overwrite = "builtin";
      }
      await browser.runtime.sendMessage({
        type: "getPluginInfo",
        uid: uid,
      });
    },
    setListeners: function () {
      browser.runtime.onMessage.addListener((request: unknown) => {
        const msg = request as {
          type: string;
          info?: Plugin | null;
          id?: string;
          scripts?: Record<string, { uid?: string; name?: string }>;
        };
        switch (msg.type) {
          case "resolveGetPluginInfo":
            if (msg.info) {
              this.button_name = t("reinstall");
              // A built-in plugin has no `user` flag; a user one does.
              this.overwrite = msg.info.user ? "thirdparty" : "builtin";
            }
            break;
          case "resolveAddUserScripts":
            if (msg.id !== this.page_uuid) return;
            if (Object.keys(msg.scripts ?? {}).length === 0) {
              alert(t("installFailed"));
              return;
            }
            this.installed = true;
        }
      });
    },
  },
  watch: {
    code: async function () {
      this.show_header = true;
      this.setListeners();
      await this.checkIfInstalled();
    },
  },
});
</script>

<style scoped>
/* The install panel is always dark, so remap the semantic tokens PluginInfo
   uses onto the sidebar palette for this subtree */
.addUserScript-wrapper {
  --surface-container: var(--sidebar-surface-container);
  --on-surface: var(--sidebar-on-surface);
  --on-surface-variant: var(--sidebar-on-surface-variant);
  --accent: var(--sidebar-accent);

  display: flex;
  width: 500px;
  flex-shrink: 0;
  background: var(--sidebar-surface);
  color: var(--sidebar-on-surface-variant);
  border-right: 1px solid var(--sidebar-outline);
}

#addUserScript {
  width: 100%;
  box-sizing: border-box;
  padding: 32px;
  transition: opacity 0.1s linear;
}
#addUserScript.hide {
  opacity: 0;
}

.btn {
  flex-shrink: 0;
  padding: 11px 22px;
  display: inline-flex;
  align-items: center;
  border: 0;
  border-radius: 10px;
  background: var(--sidebar-accent);
  color: #ffffff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.btn:hover {
  filter: brightness(1.08);
}

.btn.disabled {
  background: var(--sidebar-surface-container);
  color: var(--sidebar-on-surface-variant);
  cursor: default;
  filter: none;
}

@media (max-width: 1600px) {
  .addUserScript-wrapper {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--sidebar-outline);
  }
  #addUserScript {
    margin: auto;
    width: 80%;
    max-width: 800px;
    padding: 36px;
  }
}

@media (max-width: 600px) {
  #addUserScript {
    width: 100%;
    padding: 24px;
  }
}
</style>
