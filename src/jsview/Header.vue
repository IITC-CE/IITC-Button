<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="addUserScript-wrapper">
    <div id="addUserScript" v-bind:class="{ hide: !show_header }">
      <div class="plugin-header">
        <img
          class="plugin-icon"
          :src="getIcon || '/assets/icons/userscript-no-icon.svg'"
          alt=""
        />
        <div class="header-info">
          <h3 class="plugin-name">{{ meta.name }}</h3>
          <span class="plugin-category">{{
            meta.category || t("defaultCategory")
          }}</span>
        </div>
      </div>

      <div
        v-if="overwrite"
        class="notice"
        :class="overwrite === 'builtin' ? 'notice--warning' : 'notice--info'"
      >
        <i class="material-icons notice-icon">{{
          overwrite === "builtin" ? "warning" : "info"
        }}</i>
        <span>{{
          overwrite === "builtin"
            ? t("overwriteBuiltinPlugin")
            : t("overwriteInstalledPlugin")
        }}</span>
      </div>

      <div
        class="details-card"
        v-if="meta.description || meta.version || meta.author"
      >
        <p class="detail-description" v-if="meta.description">
          {{ meta.description }}
        </p>
        <div class="detail-row" v-if="meta.version">
          <span class="detail-label">{{ t("version") }}</span>
          <span class="detail-value">{{ meta.version }}</span>
        </div>
        <div class="detail-row" v-if="meta.author">
          <span class="detail-label">{{ t("author") }}</span>
          <span class="detail-value">{{ meta.author }}</span>
        </div>
      </div>

      <div class="simple-details">
        <span class="label" v-if="domains === null">{{
          t("jsViewDetailsNoDomains")
        }}</span>
        <span class="label" v-if="domains === '<all_domains>'">{{
          t("jsViewDetailsAllDomains")
        }}</span>
        <template v-if="typeof domains === 'object'">
          <span class="label">{{ t("jsViewDetailsDomainsLabel") }}</span>
          <span class="value" v-for="(domain, i) in domains" v-bind:key="i">
            {{ domain }}</span
          >
        </template>
      </div>

      <div class="details" :class="{ opened: show_details }">
        <div
          v-for="(key, ki) in [
            'match',
            'include',
            'exclude-match',
            'exclude',
            'grant',
          ]"
          v-bind:key="ki"
        >
          <div class="item" v-if="meta[key]">
            <span class="label">@{{ key }}</span>
            <span class="value" v-for="(el, i) in meta[key]" v-bind:key="i">
              {{ el }}
            </span>
          </div>
        </div>
      </div>

      <div class="actions">
        <a href="#" class="btn-more" @click.prevent="on_show_details">
          {{
            show_details
              ? t("jsViewDetailsHideDetails")
              : t("jsViewDetailsShowDetails")
          }}
        </a>
        <button
          id="install"
          class="btn"
          :class="{ disabled: installed }"
          :disabled="installed"
          @click="install"
        >
          {{ installed ? t("installed") : button_name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { toRaw, type PropType } from "vue";
import browser from "webextension-polyfill";
import { t } from "@/i18n";
import { getUID, humanizeMatch, IITC_CORE_UID } from "lib-iitc-manager";
import type { PluginMeta, Plugin } from "lib-iitc-manager";
import { uuidv4 } from "@/uuid";

export default defineComponent({
  name: "Header",
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
      domains: null as string | string[] | null,
      show_details: false,
      page_uuid: uuidv4(),
      installed: false,
      overwrite: "" as "" | "builtin" | "thirdparty",
    };
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
    on_show_details: async function () {
      this.show_details = !this.show_details;
      await browser.storage.local.set({
        js_view_show_details: this.show_details,
      });
    },
  },
  watch: {
    meta: function () {
      this.domains = humanizeMatch(this.meta);
    },
    code: async function () {
      this.show_header = true;
      this.setListeners();
      await this.checkIfInstalled();
    },
  },
  computed: {
    getIcon: function (): string | null {
      const icon64 = this.meta["icon64"];
      const icon = this.meta["icon"];
      if (typeof icon64 === "string" && icon64) return icon64;
      if (typeof icon === "string" && icon) return icon;
      return null;
    },
  },
  async mounted() {
    browser.storage.local.get(["js_view_show_details"]).then((data) => {
      if (data["js_view_show_details"] === true) {
        this.show_details = true;
      }
    });
  },
});
</script>

<style scoped>
.addUserScript-wrapper {
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

.plugin-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.plugin-icon {
  width: 48px;
  height: 48px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.plugin-name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--sidebar-on-surface);
  overflow-wrap: anywhere;
}

.plugin-category {
  font-size: 13px;
  color: var(--sidebar-on-surface-variant);
}

.details-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  padding: 14px 16px;
  background: var(--sidebar-surface-container);
  border-radius: 12px;
}

.detail-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--sidebar-on-surface);
}

.detail-row {
  display: flex;
  gap: 12px;
  align-items: baseline;
}

.detail-label {
  width: 64px;
  flex-shrink: 0;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--sidebar-on-surface-variant);
}

.detail-value {
  font-size: 13px;
  color: var(--sidebar-on-surface);
  word-break: break-word;
}

.simple-details {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 18px;
  font-size: 12.5px;
}

.simple-details .label {
  width: 100%;
  margin-bottom: 2px;
  color: var(--sidebar-on-surface-variant);
}

.simple-details .value {
  padding: 3px 8px;
  margin: 2px 4px 2px 0;
  border-radius: 6px;
  background: var(--sidebar-surface-container);
  color: var(--sidebar-on-surface);
  font-family: var(--font-mono);
  font-size: 11.5px;
  text-decoration: none;
  overflow-wrap: anywhere;
}

/* Raw @match / @grant lists */
.details {
  display: none;
  margin-top: 12px;
}

.details.opened {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}

.details .item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.details .item .label {
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--sidebar-accent);
}

.details .value {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--sidebar-on-surface-variant);
  word-break: break-all;
}

.notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--sidebar-surface-container);
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--sidebar-on-surface);
}

.notice-icon {
  flex-shrink: 0;
  font-size: 18px;
}

.notice--warning .notice-icon {
  color: var(--state-warning);
}

.notice--info .notice-icon {
  color: var(--sidebar-accent);
}

.btn-more {
  font-size: 13px;
  font-weight: 600;
  color: var(--sidebar-accent);
  text-decoration: none;
  cursor: pointer;
}
.btn-more:hover {
  text-decoration: underline;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
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
